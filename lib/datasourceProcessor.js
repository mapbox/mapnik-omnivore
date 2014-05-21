var fs = require('fs'),
    path = require('path'),
    sphericalMerc = new(require('sphericalmercator')),
    invalid = require('./invalid'),
    srs = require('srs'),
    mapnik = require('mapnik');
// Register datasource plugins
mapnik.register_default_input_plugins()

function init(file, filesize, filetype, callback) {
    getDatasourceConfigs(file, filesize, filetype, function(err, configs) {
        if (err) return callback(err);
        return callback(null, configs);
    });
};

function getDatasourceConfigs(file, filesize, filetype, callback) {
    getProjection(file, filetype, function(err, proj) {
        var name = path.basename(file, path.extname(file));
        // shapefile datasource
        if (filetype === '.shp') {
            processShapeDatasource(file, filesize, name, proj, function(err, info) {
                if (err) return (err);
                return callback(null, {
                    projection: proj,
                    filename: name,
                    center: info.center,
                    extent: info.extent,
                    json: info.json,
                    minzoom: info.minzoom,
                    maxzoom: info.maxzoom,
                    layers: info.layers,
                    dstype: info.dstype
                });
            });
            // else OGR datasource
        } else {
            processOgrDatasource(file, filesize, name, proj, filetype, function(err, info) {
                if (err) return callback(err);
                return callback(null, {
                    projection: proj,
                    filename: name,
                    center: info.center,
                    extent: info.extent,
                    json: info.json,
                    minzoom: info.minzoom,
                    maxzoom: info.maxzoom,
                    layers: info.layers,
                    dstype: info.dstype
                });
            });
        }
    });
};

function getProjection(file, filetype, callback) {
    if (filetype === '.geo.json') return callback(null, '+proj=longlat +ellps=WGS84 +datum=WGS84 +no_defs');
    else if (filetype === '.shp') {
        projectionFromShape(file, function(err, proj) {
            if (err) return callback(err);
            return callback(null, proj);
        });
    }
    //kml and gpx
    else return callback(null, '+init=epsg:4326');
};
/**
 * Obtains center point (lat/lng) from the extent of the shapefile
 * @param ds (Mapnik datasource)
 * @param projection
 * @param filetype
 * @returns results (results object that contains extent and center point)
 */
var getCenterAndExtent = function(ds, projection, filetype) {
    var extent;
    if (filetype === '.shp') {
        // Convert datasource extent to lon/lat when saving
        var fromProj = new mapnik.Projection(projection);
        var toProj = new mapnik.Projection('+proj=longlat +ellps=WGS84 +datum=WGS84 +no_defs');
        var trans = new mapnik.ProjTransform(fromProj, toProj);
        //Bounding box
        extent = trans.forward(ds.extent());
    } else if (filetype === '.kml' || filetype === '.geo.json' || filetype === '.gpx') {
        try {
            extent = ds.extent();
        } catch (err) {
            return invalid('Error obtaining extent of Mapnik datasource.');
        }
    }
    //Center point of bounding box (extent)
    var center = [0.5 * (extent[0] + extent[2]), 0.5 * (extent[1] + extent[3])];
    var results = {
        extent: extent,
        center: center
    }
    return results;
};
/**
 * Gets min/max zoom levels based on filesize
 * @param bytes (size of file)
 * @param extent
 * @returns callback(err, minzoom, maxzoom)
 */
var getMinMaxZoom = function(bytes, extent, callback) {
    //bytes in 1 mb = 1048576
    //bytes in 1.5 mb = 1572864
    //bytes in 2 mb = 2097152
    //Threshold for largest avg tilesize allowed
    var twoMB = 2097152;
    var minzoom = 0;
    var maxzoom = 16;
    //Calculate min/max zoom
    for (i = 16; i >= 0; i--) {
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
        if (avgTileSize > twoMB) {
            minzoom = currentzoom;
            return callback(null, minzoom, maxzoom);
        } else if (tiles === 1) {
            minzoom = 0;
            return callback(null, minzoom, maxzoom);
        }
        if (i <= 0) {
            return callback(invalid('Failed to set min/max zoom'));
        }
    };
};
/**************
 * Shape files
 **************/
function processShapeDatasource(file, filesize, name, proj, callback) {
    var info = {};
    var dstype = 'shape';
    var options = {
        type: dstype,
        file: file,
        layer: name
    }
    var ds = new mapnik.Datasource(options);
    //Center of bounding box/extent
    var results = getCenterAndExtent(ds, proj, '.shp');
    //Get shapefile fields and setup vector layers json
    var actual = ds.describe();
    var fields = actual.fields;
    var json = {
        "vector_layers": [{
            "id": name,
            "description": "",
            "minzoom": 0,
            "maxzoom": 22,
            "fields": fields
        }]
    };
    getMinMaxZoom(filesize, results.extent, function(err, min, max) {
        if (err) return callback(err);
        //Values to input into xml for Mapnik
        return callback(null, {
            extent: results.extent,
            center: results.center,
            json: json,
            minzoom: min,
            maxzoom: max,
            layers: [options.layer],
            dstype: 'shape'
        });
    });
};

function projectionFromShape(file, callback) {
    var fileDir = path.dirname(file);
    //Assumes the .prj file has the same name as the .shp file
    var projFile = fileDir + "/" + (path.basename(file, path.extname(file))) + '.prj';
    fs.readFile(projFile, function(err, data) {
        var result;
        try {
            result = srs.parse(data);
        } catch (err) {
            return callback(invalid('Invalid projection file'));
        }
        //TODO: check if the current projection is something we can deal with
        //...what are some projections we can't deal with?
        //Currently handles issues with ESRI projections
        if (result.proj4 === undefined) {
            var esriAppended = "ESRI::" + data.toString();
            projectionFromZip(esriAppended);
        } else {
            //Yay, Valid!
            return callback(null, result.proj4);
        }
    });
};
/************
 * OGR files
 ************/
function processOgrDatasource(file, filesize, name, proj, filetype, callback) {
    getDatasource(file, name, filetype, function(err, layers, json, ds) {
        if (err) return callback(err);
        var results = getCenterAndExtent(ds, proj, filetype);
        //if error returned from synchronous function, send Error to callback
        if (results instanceof Error) {
            return callback(results);
        };
        getMinMaxZoom(filesize, results.extent, function(err, min, max) {
            if (err) return callback(err);
            //Values to input into xml for Mapnik
            return callback(null, {
                extent: results.extent,
                center: results.center,
                json: json,
                minzoom: min,
                maxzoom: max,
                layers: layers,
                dstype: 'ogr'
            });
        });
    });
};

function getDatasource(file, name, filetype, callback) {
    var dstype = 'ogr';
    //Get layers for kml
    if (filetype === '.kml') {
        var options = {
            type: dstype,
            file: file
        };
        //Get KML layer names from the OGR error message...for now
        getKmlLayers(options, function(err, layers) {
            if (err) return callback(err);
            setLayerConfigs(options, layers, name, function(err, json, ds) {
                if (err) return callback(err);
                else return callback(null, layers, json, ds);
            });
        });
        //Get layer for .geo.json
    } else if (filetype === '.geo.json') {
        var options = {
            type: dstype,
            file: file,
            layer_by_index: 0
        }
        //All .geo.json files have one layer under this name
        var layers = ['OGRGeoJSON'];
        setLayerConfigs(options, layers, name, function(err, json, ds) {
            if (err) return callback(err);
            return callback(null, layers, json, ds);
        });
        //Get layers for .gpx
    } else if (filetype === '.gpx') {
        var options = {
            type: dstype,
            file: file
        };
        //GPX files always have these three layers
        var layers = ['waypoints', 'routes', 'tracks'];
        setLayerConfigs(options, layers, name, function(err, json, ds) {
            if (err) return callback(err);
            return callback(null, layers, json, ds);
        });
    }
};
//Sole purpose is to obtain layer names from OGR error message
var getKmlLayers = function(options, callback) {
    var layers_array;
    var error;
    //Expect an error in order to obtain layer names from the OGR Error string...for now
    try {
        var ds = new mapnik.Datasource(options);
    } catch (err) {
        if (err.message && err.message.indexOf('OGR Plugin: missing <layer>') != -1) {
            var layers = err.message.split("are: ")[1];
            //trim whitespaces before each layer
            layers = layers.replace(/\s*,\s*/g, ',');
            //remove quotes
            var layer_names = layers.split('\'').join('');
            //designate each index of the array by splitting by commas
            layers_array = layer_names.split(',');
        } else error = err;
    }
    if (error === undefined) return callback(null, layers_array);
    else return callback(invalid('Error obtaining KML layer names'));
};
//Iterate through all layers and create a corresponding datasource and vector_layers json
var setLayerConfigs = function(options, layers, filename, callback) {
    var json = {
        "vector_layers": []
    };
    //only .geo.json uses the layer_by_index property
    if (options.layer_by_index === 0) {
        try {
            var ds = new mapnik.Datasource(options);
            //Get shapefile fields and setup vector layers json
            var actual = ds.describe();
            var fields = actual.fields;
            json.vector_layers.push({
                "id": 'OGRGeoJSON',
                "description": "",
                "minzoom": 0,
                "maxzoom": 22,
                "fields": fields
            });
            return callback(null, json, ds);
        } catch (err) {
            return callback(invalid('Error creating Mapnik Datasource for .geo.json file'));
        }
        //else obtain layers from KML or gpx file
    } else {
        var validDatasource;
        var error;
        layers.forEach(function(layer) {
            options.layer = layer;
            try {
                var ds = new mapnik.Datasource(options);
                //Get shapefile fields and setup vector layers json
                var actual = ds.describe();
                var fields = actual.fields;
                json.vector_layers.push({
                    "id": layer.split(' ').join('_'),
                    "description": "",
                    "minzoom": 0,
                    "maxzoom": 22,
                    "fields": fields
                });
                //To avoid using an empty layer
                if (ds.extent().indexOf(0) === -1) validDatasource = ds;
            } catch (err) {
                error = invalid('Error creating Mapnik Datasource for file: ' + err.message);
            }
        });
        //TODO: think about how to best get center and extent from one of these datasources...? 
        //For now, the last ds created in this for loop is used for center and extent in setupOgrConfigs() as long as it's not empty
        if (error === undefined && validDatasource !== undefined) return callback(null, json, validDatasource);
        else return callback(error);
        //else return callback(invalid('Error: This file does not have a valid datasource/extent.'));
    }
};
module.exports = {
    init: init
};