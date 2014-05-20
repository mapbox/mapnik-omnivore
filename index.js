var fs = require('fs'),
    path = require('path'),
    sphericalMerc = new(require('sphericalmercator')),
    invalid = require('./lib/invalid'),
    processDatasource = require('./lib/datasourceProcessor'),
    mapnik = require('mapnik');
// Register datasource plugins
mapnik.register_default_input_plugins()
var _options = {
	encoding: 'utf8'
}
module.exports.digest = function(file, callback) {
    getMetadata(file, function(err, metadata) {
    	if(err) return callback(err);
    	return callback(null, metadata);
    });
};

function getMetadata(file, callback) {
    var metadata = {};
    //Get filsize from fs.stats
    fs.stat(file, function(err, stats) {
        if(err) return callback(invalid('Error getting stats from file.'));
        var filesize = stats['size'];
        console.log("filesize: " + filesize);
        if (filesize > 216066856) return callback(invalid('File is larger than 200MB. Too big to process.'));
        
        getFileType(file, function(err, filetype){
        	console.log("filetype: " + filetype);
        	if(err) return callback(invalid('Error getting filetype.'));
            processDatasource.init(file, filesize, filetype, function(err, dsConfigs){
            	if(err) return callback(err);
           		metadata.filesize = filesize;
        		metadata.fileType = filetype;	
        		metadata.projection = dsConfigs.projection;
        		metadata.extent = dsConfigs.extent;
        		metadata.center = dsConfigs.center;
        		metadata.minzoom = dsConfigs.minzoom;
        		metadata.maxzoom = dsConfigs.maxzoom;
        		metadata.json = dsConfigs.json;
				metadata.layers = dsConfigs.layers;        		
        		return callback(null, metadata);
            });
        });
    });
};

function getFileType(file, callback) {
	console.log("in getFileType");
    //get file contents
    fs.readFile(file, function(err, data) {
    	//console.log(data.toString('utf8', 0, 1));
    	var json = JSON.stringify(data);
        //console.log(json);
        if(err) return callback('Error reading file.');
        var head = data.slice(0, 50).toString();
        
        //process as shapefile
        if (data.readUInt32BE(0) === 9994) return callback(null, '.shp');
        // check for file type kml, gpx or geojson
        else if (head.indexOf('\"type\":') !== -1) return callback(null, '.geo.json');
        else if ((head.indexOf('<?xml') !== -1) && (head.indexOf('<kml') !== -1)) return callback(null, '.kml');
		else if ((head.indexOf('<?xml') !== -1) && (head.indexOf('<gpx') !== -1)) return callback(null, '.gpx');
		else return callback(invalid('Incompatible filetype.'));
    });
};

