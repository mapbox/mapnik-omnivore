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

function digest(file, callback) {
    getMetadata(file, function(err, metadata) {
        if (err) return callback(err);
        return callback(null, metadata);
    });
};

function getMetadata(file, callback) {
    var metadata = {};
    //Get filsize from fs.stats
    fs.stat(file, function(err, stats) {
        if (err) return callback(invalid('Error getting stats from file. File might not exist.'));
        var filesize = stats['size'];
        if (filesize > 216066856) return callback(invalid('File is larger than 200MB. Too big to process.'));
        getFileType(file, function(err, filetype) {
            if (err) return callback(err);
            processDatasource.init(file, filesize, filetype, function(err, dsConfigs) {
                if (err) return callback(err);
                return callback(null, dsConfigs);
            });
        });
    });
};

function getFileType(file, callback) {
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
            else if (head.indexOf('\"type\":') !== -1) return callback(null, '.geo.json');
            else if ((head.indexOf('<?xml') !== -1) && (head.indexOf('<kml') !== -1)) return callback(null, '.kml');
            else if ((head.indexOf('<?xml') !== -1) && (head.indexOf('<gpx') !== -1)) return callback(null, '.gpx');
            else if (isCSV(file)) return callback(null, '.csv');
            else return callback(invalid('Incompatible filetype.'));
            //Close file
            fs.close(fd, function() {
                console.log('Done reading file');
            });
        });
    });
};
// Using mapnik CSV plugin to validate geocsv files, since mapnik is eventually what 
// will be digesting it to obtain fields, extent, and center point
function isCSV(file) {
    var options = {
        type: 'csv',
        file: file
    };
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