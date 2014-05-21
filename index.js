var fs = require('fs'),
    path = require('path'),
    invalid = require('./lib/invalid'),
    processDatasource = require('./lib/datasourceProcessor');
var _options = {
    encoding: 'utf8'
}
module.exports.digest = function(file, callback) {
    getMetadata(file, function(err, metadata) {
        if (err) return callback(err);
        return callback(null, metadata);
    });
};

function getMetadata(file, callback) {
    var metadata = {};
    //Get filsize from fs.stats
    fs.stat(file, function(err, stats) {
        if (err) return callback(invalid('Error getting stats from file.'));
        var filesize = stats['size'];
        if (filesize > 216066856) return callback(invalid('File is larger than 200MB. Too big to process.'));
        getFileType(file, function(err, filetype) {
            if (err) return callback(invalid('Error getting filetype.'));
            processDatasource.init(file, filesize, filetype, function(err, dsConfigs) {
                if (err) return callback(err);
                metadata.filesize = filesize;
                metadata.fileType = filetype;
                metadata.projection = dsConfigs.projection;
                metadata.extent = dsConfigs.extent;
                metadata.center = dsConfigs.center;
                metadata.minzoom = dsConfigs.minzoom;
                metadata.maxzoom = dsConfigs.maxzoom;
                metadata.json = dsConfigs.json;
                metadata.layers = dsConfigs.layers;
                metadata.dstype = dsConfigs.dstype;
                return callback(null, metadata);
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
            else return callback(invalid('Incompatible filetype.'));
            //Close file
            fs.close(fd, function() {
                console.log('Done reading file');
            });
        });
    });
};