var fs = require('fs'),
    path = require('path'),
    invalid = require('./lib/invalid'),
    processDatasource = require('./lib/datasource-processor'),
    gdal = require('gdal'),
    mapnik = require('mapnik'),
    sniffer = require('mapbox-file-sniff'),
    queue = require('queue-async'),
    GeoJSON = require('./lib/geojson'),
    Raster = require('./lib/raster');

// Register datasource plugins
mapnik.register_default_input_plugins()
// silence mapnik logs
mapnik.Logger.setSeverity(mapnik.Logger.NONE);

var modules = [GeoJSON, Raster];

/**
 * Initializes the module
 * @param file (filepath)
 * @returns metadata {filesize, projection, filename, center, extent, json, minzoom, maxzoom, layers, dstype, filetype}
 */
function digest(file, callback) {
    var buffer;
    try {
        buffer = fs.readFileSync(file);
    } catch(err) {
        return callback(invalid(err));
    }
    
    sniffer.sniff(buffer, function(err, filetype) {
        if (err) return callback(err);  
        getMetadata(file, filetype, function(err, metadata) {
            if (err) return callback(err);
            console.log("returned from getMetadata");
            return callback(null, metadata);
        });
    });
};

/**
 * Validates size of file and processes the file
 * @param file (filepath)
 * @returns metadata {filesize, projection, filename, center, extent, json, minzoom, maxzoom, layers, dstype, filetype}
 */
function getMetadata(file, filetype, callback) {
    //Get filesize from fs.stats
    fs.stat(file, function(err, stats) {
        if (err) return callback(invalid(err));
        
        var filesize = stats['size'];
        var type = modules.filter(function(module) { 
            return module.validFileType === filetype; 
        });
        
        // Instantiate new object, based on datatype
        try { 
            var source = new type[0](file); 
        } catch (err) { 
            return callback(invalid('Error creating Mapnik Datasource: ' + err.message)) 
        }
        
        // Build metadata object for source asynchronously
        var q = queue(1);
        var metadata = {};
        metadata.filesize = filesize;
        metadata.filetype = '.' + filetype;

        q.defer(function(next) {
            source.getCenter(function(err, center) {
                if (err) return next(err);
                metadata.center = center;
                next();
            });
        });

        q.defer(function(next) {
            source.getExtent(function(err, extent) {
                if (err) return next(err);
                metadata.extent = extent;
                next();
            });
        });

        q.defer(function(next) {
            source.getZooms(function(err, zooms) {
                if (err) return next(err);
                metadata.minzoom = zooms[0];
                metadata.maxzoom = zooms[1];
                next();
            });
        });

        q.defer(function(next) {
            source.getProjection(function(err, projection) {
                if (err) return next(err);
                metadata.projection = projection;
                next();
            });
        });

        q.defer(function(next) {
            source.getDetails(function(err, details) {
                if (err) return next(err);
                var detailsProperty = source.details;
                metadata[detailsProperty] = details;
                next();
            });
        });

        q.defer(function(next) {
            source.getFilename(function(err, filename) {
                if (err) return next(err);
                metadata.filename = filename;
                next();
            });
        });

        q.defer(function(next) {
            source.getLayers(function(err, layers) {
                if (err) return next(err);
                metadata.layers = layers;
                next();
            })
        })

        q.await(function(err) {
            if (err) return callback(invalid(err));
            console.log("all done!");
            callback(err, metadata);
        });
    });
};



// TODOs
// - Does filesniffer verify VRT, CSV, topojson?
// -
