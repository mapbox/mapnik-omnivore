var mapnik = require('mapnik');
var invalid = require('./invalid');
var utils = require('./utils');
var path = require('path');

mapnik.register_default_input_plugins();

module.exports = GeoJSON;

function GeoJSON(filepath) {
  this.filepath = filepath;
  this.datasource = new mapnik.Datasource({
    type: 'geojson',
    file: filepath,
    cache_features: false
  });
  this.extent = this.datasource.extent();
  this.center = [
    0.5 * (this.extent[0] + this.extent[2]),
    0.5 * (this.extent[1] + this.extent[3])
  ];
  this.layers = [path.basename(this.filepath, path.extname(this.filepath))];
}

GeoJSON.validFileType = ['geojson'];
GeoJSON.prototype.detailsName = 'json';
GeoJSON.prototype.dstype = 'geojson';

GeoJSON.prototype.getProjection = function(callback) {
  // TODO: check that the bounds are valid in WGS84-space
  return callback(null, '+proj=longlat +ellps=WGS84 +datum=WGS84 +no_defs');
};

GeoJSON.prototype.getCenter = function(callback) {
  return callback(null, this.center);
};

GeoJSON.prototype.getExtent = function(callback) {
  return callback(null, this.extent);
};

GeoJSON.prototype.getDetails = function(callback) {
  // Setup vector layers json
  var actual = this.datasource.describe();
  var fields = actual.fields;
  var json = {
    vector_layers: [
      {
        id: this.layers[0],
        description: '',
        minzoom: 0,
        maxzoom: 22,
        fields: fields
      }
    ]
  };

  return callback(null, json);
};

GeoJSON.prototype.getLayers = function(callback) {
  // Validate layer
  var featureset = this.datasource.featureset();
  if (!featureset) return callback(invalid('Invalid geojson: GeoJSON file must be a FeatureCollection'));
  if (featureset.next() === undefined) return callback(invalid('Invalid geojson: does not contain any features'));
  return callback(null, this.layers);
};

GeoJSON.prototype.getZooms = function(callback) {
  utils.zoomsBySize(this.filepath, this.extent, callback);
};
