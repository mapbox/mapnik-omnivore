var fs = require('fs'),
    path = require('path'),
    SphericalMercator = require('sphericalmercator'),
    sphericalMerc = new SphericalMercator(),
    invalid = require('./invalid'),
    srs = require('srs'),
    gdal = require('gdal'),
    mapnik = require('mapnik');

// Register datasource plugins
mapnik.register_default_input_plugins();

/**
 * Initializes the module
 * @param file (filepath)
 * @param filesize
 * @param filetype
 * @returns metadata {filesize, projection, filename, center, extent, json, minzoom, maxzoom, layers, dstype, filetype}
 */
function init(file, filesize, filetype, callback) {
    getDatasourceConfigs(file, filesize, filetype, function(err, configs) {
        if (err) return callback(err);
        return callback(null, configs);
    });
}
/**
 * Obtains metadata depending on file type
 * @param file (filepath)
 * @param filesize
 * @param filetype
 * @returns metadata {filesize, projection, filename, center, extent, json, minzoom, maxzoom, layers, dstype, filetype}
 */
function getDatasourceConfigs(file, filesize, filetype, callback) {
    getProjection(file, filetype, function(err, proj) {
        if(err) return callback(err);
        var name = path.basename(file, path.extname(file));
        if(filetype === '.geojson') name = name.replace('.geo', '');

        if(filetype === '.tif' || filetype === '.vrt') {
            processRasterDatasource(file, filesize, name, proj, filetype, function(err, info) {
                if(err) return callback(err);
                return callback(null, {
                    filesize: filesize,
                    projection: info.proj,
                    raster: info.raster,
                    filename: name,
                    center: info.center,
                    extent: info.extent,
                    minzoom: info.minzoom,
                    maxzoom: info.maxzoom,
                    dstype: info.dstype,
                    filetype: filetype,
                    layers: [name]
                });
            });
        // shapefile datasource
        } else if (filetype === '.shp' || filetype === '.csv') {
            processDatasource(file, filesize, name, proj, filetype, function(err, info) {
                if (err) return callback(err);
                return callback(null, {
                    filesize: filesize,
                    projection: proj,
                    filename: name,
                    center: info.center,
                    extent: info.extent,
                    json: info.json,
                    minzoom: info.minzoom,
                    maxzoom: info.maxzoom,
                    layers: info.layers,
                    dstype: info.dstype,
                    filetype: filetype
                });
            });
        // else OGR datasource
        } else {
            processOgrDatasource(file, filesize, proj, filetype, function(err, info) {
                if (err) return callback(err);
                return callback(null, {
                    filesize: filesize,
                    projection: proj,
                    filename: name,
                    center: info.center,
                    extent: info.extent,
                    json: info.json,
                    minzoom: info.minzoom,
                    maxzoom: info.maxzoom,
                    layers: info.layers,
                    dstype: info.dstype,
                    filetype: filetype
                });
            });
        }
    });
}
/**
 * Obtains projection based on filetype
 * @param file (filepath)
 * @param filetype
 * @returns projection String
 */
function getProjection(file, filetype, callback) {
    if (filetype === '.geojson' || filetype === '.csv') return callback(null, '+proj=longlat +ellps=WGS84 +datum=WGS84 +no_defs');
    //else if shape
    else if (filetype === '.shp') {
        projectionFromShape(file, function(err, proj) {
            if (err) return callback(err);
            return callback(null, proj);
        });
    //else if raster
    }
    else if(filetype === '.tif' || filetype === '.vrt') {
        projectionFromRaster(file, function(err, proj) {
            if (err) return callback(err);
            return callback(null, proj);
        });
    } else if(filetype === '.gdb') {
        projectionViaOGR(file, function(err, proj) {
            if (err) return callback(err);
            return callback(null, proj);
        });
    //else kml, gpx, geojson, and csv we assume is WGS84 (aka +init=epsg:4326 or +proj=longlat +ellps=WGS84 +datum=WGS84 +no_defs)
    }
    else return callback(null, '+init=epsg:4326');
}
/**
 * Obtains extent from the datasource and the center point (lat/lng)
 * @param ds (Mapnik datasource)
 * @param projection
 * @param filetype
 * @returns results (results object that contains extent and center point)
 */
function getCenterAndExtent(ds, projection) {
    var extent;
    // Convert datasource extent to lon/lat when saving
    var fromProj = new mapnik.Projection(projection);
    var toProj = new mapnik.Projection('+proj=longlat +ellps=WGS84 +datum=WGS84 +no_defs');

    if (fromProj === toProj) {
        try {
            extent = ds.extent();
        } catch (err) {
            return invalid('Error obtaining extent of Mapnik datasource.');
        }
    } else {
        try {
            var trans = new mapnik.ProjTransform(fromProj, toProj);
            //Bounding box
            extent = trans.forward(ds.extent());
        } catch (err) {
            return invalid('Error obtaining extent of Mapnik datasource.');
        }
    }

    //Center point of bounding box (extent)
    var center = [0.5 * (extent[0] + extent[2]), 0.5 * (extent[1] + extent[3])];
    var results = {
        extent: extent,
        center: center
    };
    return results;
}
/**
 * Gets min/max zoom levels based on filesize
 * @param bytes (size of file)
 * @param extent
 * @returns callback(err, minzoom, maxzoom)
 */
function getMinMaxZoom(bytes, extent, callback) {
    //Threshold for largest avg tilesize allowed
    var maxSize = 500 * 1024;
    var minzoom = 0;
    var maxzoom = 22;
    //Calculate min/max zoom
    for (i = maxzoom; i >= 0; i--) {
        var currentzoom = i;
        //Defaulting srs to WGS84 based on how the extent is set in mapnikSetup.getCenterAndExtent() function
        var bounds = sphericalMerc.xyz(extent, currentzoom, false, 4326);
        var x = (bounds.maxX - bounds.minX) + 1;
        var y = (bounds.maxY - bounds.minY) + 1;

        //Number of tiles within current zoom level
        var tiles = x * y;

        if (tiles <= 0) {
            return callback(invalid('Error calculating min/max zoom: Bounds invalid'));
        }
        if (bytes <= 0) {
            return callback(invalid('Error calculating min/max zoom: Total bytes less than or equal to zero'));
        }
        //Average tilesize within current zoom level
        var avgTileSize = bytes / tiles;

        //The idea is that tilesize of ~1000 bytes is usually the most detail needed, and no need to process tiles with higher zoom
        if (avgTileSize < 1000) {
            maxzoom = currentzoom;
        }
        //If avg tile size is small enough to get to one remaining tile, just set minzoom to zero.
        if (avgTileSize > maxSize) {
            minzoom = currentzoom;
            return callback(null, minzoom, maxzoom);
        } else if (tiles === 1 || i === 0) {
            minzoom = 0;
            return callback(null, minzoom, maxzoom);
        }
    }
}
/**********************
 * Shape and CSV files
 **********************/
 /**
 * Creates a mapnik Datasource and uses that to obtain the file's spatial properties
 * @param file (filepath)
 * @param filesize
 * @param name
 * @param proj
 * @param filetype
 * @returns object that contains spatial properties of the file {extent, center, json, minzoom, maxzoom, layers, dstype}
 */
function processDatasource(file, filesize, name, proj, filetype, callback) {
    var options = {};
    var dstype;
    //setup shape datasource options
    if(filetype === '.shp'){
        dstype = 'shape';
        options = {
            type: dstype,
            file: file,
            layer: name
        };
    //else setup csv datasource options
    } else {
        dstype = 'csv';
        options = {
            type: dstype,
            file: file,
            filesize_max:10,
            layer: name
        };
    }
    var ds = new mapnik.Datasource(options);
    //Center of bounding box/extent
    var results = getCenterAndExtent(ds, proj, filetype);
    //Get fields and setup vector layers json
    var actual = ds.describe();
    var fields = actual.fields;

    getMinMaxZoom(filesize, results.extent, function(err, min, max) {
        if (err) return callback(err);
        var json = {
            "vector_layers": [{
                "id": name,
                "description": "",
                "minzoom": 0,
                "maxzoom": 22,
                "fields": fields
            }]
        };
        //Values to input into xml for Mapnik
        return callback(null, {
            extent: results.extent,
            center: results.center,
            json: json,
            minzoom: min,
            maxzoom: max,
            layers: [options.layer],
            dstype: dstype
        });
    });
}
 /**
 * Obtains projection from a shapefile by reading the .prj file in the same directory
 * @param file (filepath)
 * @returns result.proj4
 */
function projectionFromShape(file, callback) {
    var fileDir = path.dirname(file);
    //Assumes the .prj file has the same name as the .shp file
    var projFile = fileDir + "/" + (path.basename(file, path.extname(file))) + '.prj';
    fs.readFile(projFile, function(err, data) {
        if (err) return callback(invalid('Missing projection file.'));

        var result;
        try { result = srs.parse(data); }
        catch(error) {
            return callback(invalid('Invalid projection file.'));
        }
        //TODO: check if the current projection is something we can deal with
        //...what are some projections we can't deal with?
        //Currently handles issues with ESRI projections
        if (result.proj4 === undefined) {
            // Prepend ESRI:: and try parse again.
            try { result = srs.parse('ESRI::' + data.toString()); }
            catch(error) {
                return callback(invalid('Still...Invalid projection file.'));
            }
            // handle undefined proj4 string case
            if (result.proj4 !== undefined) return callback(null, result.proj4);
            else return callback(invalid('Undefined proj4 string'));
        } else {
            //Yay, Valid!
            return callback(null, result.proj4);
        }
    });
}


/********************
 * Raster/gdal files
 ********************/
/**
 * Obtains the Raster/GDAL file's spatial properties
 * @param file (filepath)
 * @param filesize
 * @param name
 * @param info Object
 * @param filetype
 * @returns object that contains spatial properties of the file {extent, center, raster properties, projection, minzoom, maxzoom, dstype}
*/
function processRasterDatasource(file, filesize, name, info, filetype, callback) {
    var options = {
        type: 'gdal',
        file: file
    };
    var results;
    try{
        var ds = new mapnik.Datasource(options);
        var ref = gdal.SpatialReference.fromProj4(info.proj4);
        results = getCenterAndExtent(ds, info.proj4, filetype);
    } catch(err){
        return callback(invalid(err));
    }
    //calculate source's min/max zoom
    getMinMaxZoomGDAL(info.raster.pixelSize, results.center, info.proj4, function(err, min, max) {
        if (err) return callback(err);
        //Values to input into xml for Mapnik
        return callback(null, {
            extent: results.extent,
            center: results.center,
            raster: info.raster,
            proj: info.proj4,
            minzoom: min,
            maxzoom: max,
            dstype: 'gdal'
        });
    });
}
/**
 * Calculates a GDAL source's min and max zoom level using native pixel size and converting to google mercator (meters)
 * @param pixelSize (source's pixel size Array)
 * @param center (source's center point Array)
 * @param proj (source's srs String)
 * @returns callback(err, minzoom, maxzoom)
 */
function getMinMaxZoomGDAL(pixelSize, center, proj, callback) {
    var circumference = 40075000;

    // Create lookup table to determine max zoom level for given spatial resolution
    var zoomLevels = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19];
    var spatialResolutions = zoomLevels.map(function(z) {
        return circumference * Math.cos(0) / Math.pow(2, (z + 8));
    });

    var validSpatialResolutions = spatialResolutions.filter(function(res) {
      return res > pixelSize[0];
    });

    var maxzoom = validSpatialResolutions.length;
    var minzoom = Math.max(0, maxzoom - 6);

    return callback(null, minzoom, maxzoom);
}
/**
 * Detects unit type of the gdal source, using the srs/projection
 * @param srs
 * @returns unit type (String)
 */
function getUnitType(srs){
    var possibleUnits = ['m','ft','mi','km','us-ft','us-mi'];
    for(var i = 0; i < possibleUnits.length; i++){
        if(srs.indexOf("+units=" + possibleUnits[i]) !== -1) return possibleUnits[i];
    }
    if(srs.indexOf("+units=") === -1 && srs.indexOf("+proj=longlat") !== -1) return 'decimal degrees';
    //Default to meters for now, if nothing matches
    else return 'm';
}

/**
 * Obtains projection from a raster by using node-gdal lib
 * @param file (filepath)
 * @returns result.proj4 and raster properties object
 */
function projectionFromRaster(filepath, callback) {
    var info = { raster: {} };

    var ds;
    try { ds = gdal.open(filepath); }
    catch(err) {
        return callback(invalid('Invalid GeoTIFF: could not open the file'));
    }

    try {
        info.raster.width = ds.rasterSize.x;
        info.raster.height = ds.rasterSize.y;
    }
    catch(err) {
        return callback(invalid('Invalid GeoTIFF: could not read image dimensions'));
    }

    try {
        info.raster.bandCount = ds.bands.count();
        info.raster.bands = getBands(ds, ds.bands.count());
        info.raster.nodata = info.raster.bands[0].nodata;
    }
    catch(err) {
        if (err.code == 'EINVALID') return callback(err);
        return callback(invalid('Invalid GeoTIFF: could not get band information'));
    }

    if (info.raster.bands.length === 0) return callback(invalid('Invalid GeoTIFF: file has no bands'));

    try {
        // TODO: check if the current projection is something we can deal with
        // ...what are some projections we can't deal with?
        info.proj4 = srs.parse(ds.srs.toWKT()).proj4;
        var ref = gdal.SpatialReference.fromProj4(info.proj4);
        info.raster.units = {
            linear: ref.getLinearUnits(),
            angular: ref.getAngularUnits()
        };
    }
    catch(err) {
        return callback(invalid('Invalid GeoTIFF: could not read spatial reference information'));
    }

    try {
        var geotransform = ds.geoTransform;
        info.raster.pixelSize = [ geotransform[1], -geotransform[5] ];
        info.raster.origin = [ geotransform[0], geotransform[3] ];
    }
    catch(err) {
        return callback(invalid('Invalid GeoTIFF: could not read georeferencing information'));
    }

    callback(null, info);
}

/**
 * Obtains projection from any ogr vector format by using node-gdal lib
 * @param file (filepath)
 * @returns result.proj4
 */
function projectionViaOGR(filepath, callback) {

    var ds;
    try { ds = gdal.open(filepath); }
    catch(err) {
        return callback(invalid('could not open the file ' + filepath));
    }

    if (!ds || !ds.layers || ds.layers.count() < 1) {
        return callback(invalid('file has no valid layers: ' + filepath));
    }
    // FIXME: https://github.com/mapbox/mapnik-omnivore/issues/72
    if (ds.layers.count() > 1) {
        return callback(invalid('No support yet for multilayer files inside ' + filepath));
    } else {
        try {
            var proj4 = srs.parse(ds.layers.get(0).srs.toWKT()).proj4;
            if (proj4) return callback(null,proj4);
        } catch(err) {
            console.error(err.stack);
        }
    }
    return callback(invalid('could not read spatial reference information for ' + filepath));
}

/**
 * Iterates through source's bands and obtains band properties
 * @param ds (Datasource)
 * @param bandcount
 * @returns bands Array
 */
function getBands(ds, bandCount){
    var bands = [];
    var band;
    var unitType;
    var bandStats;
    var nodata;
    for(var i = 1; i <= bandCount; i++){
        band = ds.bands.get(i);
        nodata = band.noDataValue;
        unitType = ds.bands.get(i).unitType;
        //Error check file sources
        try {
            bandStats = band.getStatistics(false, true);
        } catch(err){
            throw invalid("Error getting statistics of band. 1 or more of the VRT file's relative sources may be missing: " + err.message);
        }
        //add to bands array
        bands.push({
            //commenting out band for now, seems to be erroring out when trying to stringify C++ object
            //'band':band,
            'stats':bandStats,
            'scale':band.scale,
            'unitType':unitType,
            'rasterDatatype':band.dataType,
            'categoryNames':band.categoryNames,
            'hasArbitraryOverviews':band.hasArbitraryOverviews,
            'overviews':band.overviews,
            'nodata':nodata,
            'id':band.id,
            'blockSize':band.blockSize,
            'color':band.colorInterpretation
        });
    }
    return bands;
}

/************
 * OGR files
 ************/
/**
 * Obtains the OGR file's spatial properties
 * @param file (filepath)
 * @param filesize
 * @param name
 * @param proj
 * @param filetype
 * @returns object that contains spatial properties of the file {extent, center, json, minzoom, maxzoom, layers, dstype}
 */
function processOgrDatasource(file, filesize, proj, filetype, callback) {
    getDatasourceProperties(file, filetype, function(err, layers, ds) {
        if (err) return callback(err);
        var results = getCenterAndExtent(ds, proj, filetype);
        //if error returned from synchronous function, send Error to callback
        if (results instanceof Error) {
            return callback(results);
        }
        getMinMaxZoom(filesize, results.extent, function(err, min, max) {
            if (err) return callback(err);
            //object to hold layer attributes
            var json = { "vector_layers": [] };
            var actual = ds.describe();
            var fields = actual.fields;
            layers.forEach(function(layer) {
                //setup vector layers json
                json.vector_layers.push({
                    "id": layer.split(' ').join('_'),
                    "description": "",
                    "minzoom": 0,
                    "maxzoom": 22,
                    "fields": fields
                });
            });

            return callback(null, {
                extent: results.extent,
                center: results.center,
                json: json,
                minzoom: min,
                maxzoom: max,
                layers: layers,
                dstype: ds.dstype
            });
        });
    });
}
 /**
 * Creates a mapnik Datasource and uses that to obtain the file's spatial properties
 * @param file (filepath)
 * @param name
 * @param filetype
 * @returns layers (file's layer names)
 *          json (vector_layers array)
 *          ds (mapnik Datasource)
 */
function getDatasourceProperties(file, filetype, callback) {
    var options = {
        type: filetype === '.geojson' ? 'geojson' : 'ogr',
        file: file
    };

    if (filetype === '.geojson') {
        var ds;
        try { ds = new mapnik.Datasource(options); }
        catch(err) {
            if (/Failed parse GeoJSON file/.test(err))
                // If it couldn't be parsed, try again as topojson
                return getDatasourceProperties(file, '.topojson', callback);
            }

            var features = [];
            var featureset = ds.featureset();
            var feature = featureset.next();
            if (feature === undefined) {
                return callback(invalid('Source appears to have no features data.'));
            }

        ds.dstype = 'geojson';
        return callback(null, [ 'OGRGeoJSON' ], ds);
    }

    // Get layers for kml or topojson
    else if (filetype === '.kml' || filetype === '.topojson' || filetype === '.gdb') {
        // Get KML layer names from the OGR error message...for now
        getLayers(options, function(err, layers) {
            if (err) return callback(err);
            getDatasource(options, layers, function(err, ds) {
                if (err) return callback(err);
                else {
                    ds.dstype = 'ogr';
                    return callback(null, layers, ds);
                }
            });
        });
    }

    // Get layers for .gpx
    else if (filetype === '.gpx') {
        // GPX files can only have these layers
        var layers = ['waypoints', 'routes', 'tracks', 'route_points', 'track_points'];
        getDatasource(options, layers, function(err, ds) {
            if (err) return callback(err);
            ds.dstype = 'ogr';
            return callback(null, layers, ds);
        });
    }

    else return callback(new Error('Unexpected filetype passed to getDatasourceProperties'));
}

// Sole purpose is to obtain layer names from OGR error message
function getLayers(options, callback) {
    var layers_array;
    var error;

    // Expect an error in order to obtain layer names from the OGR Error string...for now
    var ds;
    try {
        ds = new mapnik.Datasource(options);
    } catch (err) {
        if (err.message && err.message.indexOf('OGR Plugin: missing <layer>') != -1) {
            var layers = err.message.split("are: ")[1];
            //trim whitespaces before each layer
            layers = layers.replace(/\s*,\s*/g, ',');
            //remove quotes
            var layer_names = layers.split('\'').join('');
            //designate each index of the array by splitting by commas
            layers_array = layer_names.split(',');
        }

        else error = err;
    }
    if (error === undefined)  {
        // console.log(ds.layers.count());
        return callback(null, layers_array);
    }
    else return callback(invalid('Error obtaining layer names'));
}

//Create a datasource, which is later used to obtain extent and center of the source
function getDatasource(options, layers, callback) {
    var validDatasource;
    var error;
    layers.forEach(function(layer) {
        options.layer = layer;
        try {
            var ds = new mapnik.Datasource(options);
            //Check to see that layer actually exists
            var features = [];
            var featureset = ds.featureset();
            var feature = featureset.next();
            if(feature === undefined) {
                var index = layers.indexOf(layer);
                if (index > -1) {
                    layers.splice(index, 1);
                }
            } else validDatasource = ds;
        } catch (err) {
            error = invalid('Error creating Mapnik Datasource: ' + err.message);
        }
    });

    if (error === undefined && validDatasource !== undefined) return callback(null, validDatasource);
    else if (validDatasource === undefined) return callback(invalid('Source appears to have no features data.'));
    else return callback(error);
}
module.exports = {
    init: init,
    getCenterAndExtent: getCenterAndExtent,
    getDatasource: getDatasource,
    getMinMaxZoom: getMinMaxZoom,
    getMinMaxZoomGDAL: getMinMaxZoomGDAL,
    getProjection: getProjection,
    projectionFromRaster: projectionFromRaster,
    projectionFromShape: projectionFromShape,
    projectionViaOGR: projectionViaOGR
};
