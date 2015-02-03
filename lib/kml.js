var fs = require('fs');
var mapnik = require('mapnik');
var invalid = require('./invalid');
var path = require('path');
var srs = require('srs');
var SphericalMercator = require('sphericalmercator');
var sm = new SphericalMercator();

mapnik.register_default_input_plugins();

module.exports = Kml;

function Kml(filepath) {
  this.filepath = filepath;
  this.details = {};
  this.filename = path.basename(this.filepath, path.extname(this.filepath));

  try {
    this.gdalDatasource = gdal.open(filepath);
  }
  catch(err) {
    throw FriendlyError('Invalid kml: could not open the file', err);
  }

}

Kml.validFileType = 'kml';
Kml.prototype.detailsName = 'json';
Kml.prototype.dstype = 'ogr';

Kml.prototype.getDetails = function(callback) {
	// get layer metadata
	var extent = new gdal.Envelope();
	var layernames = [];
	var layers_meta = [];
	var layer_extent;
	var layer_count = ds.layers.count();

	for (var i = 0; i < layer_count; i++) {
		layer = ds.layers.get(i);

		if (!layer.features.count()) {
			continue; // skip layers with no features (ie. empty gpx waypoints layer)
		}

		if(!srs && layer.srs) {
			//use first layer that has a SRS set as the dataset srs 
			//(this should probably change in the future because there is no guarantee that the SRS will match for all layers)
			srs = layer.srs;
			try {
				proj4 = srs.toProj4();
			} catch (err) {
				return callback(invalid('Error converting srs to proj4'));
			}
		}

		layernames.push(layer.name);
		fields = {};

		// get field metadata
		var field_count = layer.fields.count();
		for (var j = 0; j < field_count; j++) {
			var field = layer.fields.get(j);
			var type = OFT2Mapnik(field.type);
			if (!type) {
				return callback(invalid('Field "' + field.name + '" has unsupported type: ' + field.type));
			}
			fields[field.name] = type;
		}

		// get layer extent
		try {
			layer_extent = layer.getExtent(true).toPolygon();
			layer_extent.transform(new gdal.CoordinateTransformation(srs, WGS84));
			layer_extent = layer_extent.getEnvelope();
			extent.merge(layer_extent);
		} catch (err) {
			return callback(invalid('Error getting extent'));
		}

		layers_meta.push({
			'id': layer.name.split(' ').join('_'),
			'description': '',
			'minzoom': 0,
			'maxzoom': 22,
			'fields': fields
		});
	}

	extent = [extent.minX, extent.minY, extent.maxX, extent.maxY];
	_.extend(metadata, {
		'dstype': drivername === 'ESRI Shapefile' ? 'shape' : 'ogr',
		'driver': drivername,
		'projection': proj4,
		'extent': extent,
		'center': [(extent[0]+extent[2])/2, (extent[1]+extent[3])/2],
		'json': {
			'vector_layers': layers_meta
		},
		'layers': layernames
	});

}


/*

Ryan's wisdom:

function KML() {}
KML.prototype.getProjection = function(){}
// and also starring!
function KMLLayer() {}
KMLLayer.prototype.getProjection = function() {}
KML.prototype.getLayers = function that makes an array of new KMLLayer() objects

*/

function FriendlyError(message, err) {
  var error = new Error(message);
  error.code = 'EINVALID';
  error.original = err;
  return error;
}


