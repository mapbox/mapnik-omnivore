var fs = require('fs'),
    invalid = require('./lib/invalid'),
    processDatasource = require('./lib/datasourceProcessor'),
    gdal = require('gdal'),
    mapnik = require('mapnik');

// Register datasource plugins
mapnik.register_default_input_plugins();

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
}
/**
 * Validates size of file and processes the file
 * @param file (filepath)
 * @returns metadata {filesize, projection, filename, center, extent, json, minzoom, maxzoom, layers, dstype, filetype}
 */
function getMetadata(file, callback) {
    //Get filsize from fs.stats
    fs.stat(file, function(err, stats) {
        if (err) return callback(invalid('Error getting stats from file. File might not exist.'));
        var filesize = stats['size'];
        getFileType(file, function(err, filetype) {
            if (err) return callback(err);
            processDatasource.init(file, filesize, filetype, function(err, metadata) {
                if (err) return callback(err);
                return callback(null, metadata);
            });
        });
    });
}
/**
 * Validates filetype based on the file's contents
 * @param file (filepath)
 * @returns (error, filetype);
 */
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
            if (buffer.readUInt32BE(0) === 9994) closeAndReturn('.shp');
            //process as geotiff
            else if ((head.slice(0, 2).toString() === 'II' || head.slice(0, 2).toString() === 'MM') && buffer[2] === 42) closeAndReturn('.tif');
            //process as kml, gpx, topojson, geojson, or vrt
            //else if (head.indexOf('\"type\":\"Topology\"') !== -1) closeAndReturn('.topojson');
            else if (head.trim().indexOf('{') === 0) closeAndReturn('.geojson');
            else if ((head.indexOf('<?xml') !== -1) && (head.indexOf('<kml') !== -1)) closeAndReturn('.kml');
            else if ((head.indexOf('<?xml') !== -1) && (head.indexOf('<gpx') !== -1)) closeAndReturn('.gpx');
            else if (head.indexOf('<VRTDataset') !== -1){
                //verify vrt has valid source files
                verifyVRT(file, function(err, valid){
                    if(err) return callback(err);
                    else if(valid) closeAndReturn('.vrt');
                });
            }
            //should detect all geo CSV type files, regardless of file extension (e.g. '.txt' or '.tsv')
            else if (isCSV(file)) closeAndReturn('.csv');
            else return callback(invalid('Incompatible filetype.'));
            
            function closeAndReturn(type){
                //Close file
                fs.close(fd, function() {});
                return callback(null, type);
            }
        });
    });
}
function verifyVRT(file, callback){
    var ds = gdal.open(file);
    var filelist = ds.getFileList();
    if(filelist.length === 1) return callback(invalid('VRT file does not reference existing source files.'));
    else return callback(null, true);
}
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
}
module.exports = {
    digest: digest,
    getFileType: getFileType,
    getMetadata: getMetadata,
    getCenterAndExtent: processDatasource.getCenterAndExtent
};
