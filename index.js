var fs = require('fs'),
    path = require('path'),
    invalid = require('./lib/invalid'),
    processDatasource = require('./lib/datasourceProcessor'),
    mapnik = require('mapnik');
// Register datasource plugins
mapnik.register_default_input_plugins()
var _options = {
    encoding: 'utf8'
};
/**
 * Initializes the module
 * @param file (filepath)
 * @returns metadata {filesize, projection, filename, center, extent, json, minzoom, maxzoom, layers, dstype, filetype}
 */
function digest(file, callback) {
    getMetadata(file, function(err, metadata) {
        if (err) return callback(err);
        return callback(null, metadata);
    });
};
/**
 * Validates size of file and processes the file
 * @param file (filepath)
 * @returns metadata {filesize, projection, filename, center, extent, json, minzoom, maxzoom, layers, dstype, filetype}
 */
function getMetadata(file, callback) {
    var metadata = {};
    getFileType(file, function(err, filetype) {
        if (err && err.code === 'ENOENT')
            return callback(invalid('Error getting reading file. File might not exist.'));
        if (err) return callback(err);
        if (filetype === 'postgis')
            return processDatasource.init(file, null, filetype, metadataReady);
        fs.stat(file, function(err, stats) {
            if (err) return callback(err);
            processDatasource.init(file, stats.size, filetype, metadataReady);
        });
    });

    function metadataReady(err, metadata) {
        if (err) return callback(err);
        callback(null, metadata);
    }
}
/**
 * Validates filetype based on the file's contents
 * @param file (filepath or postgis connection parameters)
 * @returns (error, filetype);
 */
function getFileType(file, callback) {
    if (typeof file === 'object') return callback(null, 'postgis');

    //get file contents
    fs.open(file, 'r', function(err, fd) {
        if (err) return callback(err);
        var buf = new Buffer(50);
        //Read file
        fs.read(fd, buf, 0, 50, null, function(err, bytesRead, buffer) {
            if (err) return callback(err);
            var head = buffer.slice(0, 50).toString();
            //process as shapefile
            if (buffer.readUInt32BE(0) === 9994) return callback(null, '.shp');
            // check for file type kml, gpx or geojson
            else if (head.trim().indexOf('{') == 0) return callback(null, '.geojson');
            else if ((head.indexOf('<?xml') !== -1) && (head.indexOf('<kml') !== -1)) return callback(null, '.kml');
            else if ((head.indexOf('<?xml') !== -1) && (head.indexOf('<gpx') !== -1)) return callback(null, '.gpx');
            //should detect all geo CSV type files, regardless of file extension (e.g. '.txt' or '.tsv')
            else if (isCSV(file)) return callback(null, '.csv');
            else return callback(invalid('Incompatible filetype.'));
            //Close file
            fs.close(fd, function() {
                console.log('Done reading file');
            });
        });
    });
};
/**
 * Checks if tile is valid geoCSV
 * @param file (filepath)
 * @returns boolean;
 */
function isCSV(file) {
    var options = {
        type: 'csv',
        file: file
    };
    // Using mapnik CSV plugin to validate geocsv files, since mapnik is eventually what
    // will be digesting it to obtain fields, extent, and center point
    try {
        var ds = new mapnik.Datasource(options);
        return true;
    } catch (err) {
        return false;
    }
};
module.exports = {
    digest: digest,
    getFileType: getFileType,
    getMetadata: getMetadata
};
