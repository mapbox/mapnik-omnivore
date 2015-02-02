var fs = require('fs'),
    mapnik = require('mapnik'),
    SphericalMercator = require('sphericalmercator'),
    sm = new SphericalMercator(),
    invalid = require('./invalid'),
    path = require('path');

mapnik.register_default_input_plugins();

module.exports = GeoJSON;

function GeoJSON(filepath) {
  this.filepath = filepath;
  this.datasource = new mapnik.Datasource({
    type: 'geojson',
    file: filepath
  });

  this.extent = this.datasource.extent();
  this.center = [
    0.5 * (this.extent[0] + this.extent[2]),
    0.5 * (this.extent[1] + this.extent[3])
  ];
  this.layers = ['OGRGeoJSON'];
}

GeoJSON.validFileType = 'geojson';
GeoJSON.prototype.detailsName = 'json';
GeoJSON.prototype.dstype = 'geojson';

GeoJSON.prototype.getFilename = function(callback) {
  this.filename = (path.basename(this.filepath, path.extname(this.filepath))).replace('.geo', '');
  return callback(null, this.filename);
};

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
  var actual = this.datasource.describe(),
      fields = actual.fields,
      json = { vector_layers: [] };

  json.vector_layers.push({
    id: this.layers[0],
    description: '',
    minzoom: 0,
    maxzoom: 22,
    fields: fields
  });

  this.json = json;
  return callback(null, this.json);
};

GeoJSON.prototype.getLayers = function(callback) {
  // Validate layer
  var features = [],
      featureset = this.datasource.featureset(),
      feature = featureset.next();
  if (feature === undefined) return callback(invalid('Source appears to have no features data.'));
  return callback(null, this.layers);
};

GeoJSON.prototype.getZooms = function(callback) {
  var maxSize = 500 * 1024,
      minzoom = 0,
      maxzoom = 22,
      min, max,
      _this = this;

  fs.stat(this.filepath, function(err, stats) {
    if (err) return callback(err);

    var x, y, z, bounds, tiles, avg;

    for (z = maxzoom; z >= 0; z--) {
      bounds = sm.xyz(_this.extent, z, false, 4326);
      x = (bounds.maxX - bounds.minX) + 1;
      y = (bounds.maxY - bounds.minY) + 1;
      tiles = x * y;

      if (tiles <= 0) {
        return callback(invalid('Error calculating min/max zoom: Bounds invalid'));
      }

      if (stats.size <= 0) {
        return callback(invalid('Error calculating min/max zoom: Total bytes less than or equal to zero'));
      }

      avg = stats.size / tiles;

      if (avg < 1000) max = z;

      if (avg > maxSize) {
        min = z;
        return callback(null, min, max);
      } else if (tiles === 1 || z === 0) {
        min = 0;
        return callback(null, min, max);
      }
    }
  });
};
