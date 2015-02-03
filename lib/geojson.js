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
      json = {
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
  if (!featureset) return callback(invalid('GeoJSON file must be a FeatureCollection'));
  if (featureset.next() === undefined) return callback(invalid('GeoJSON file does not contain any features'));
  return callback(null, this.layers);
};

GeoJSON.prototype.getZooms = function(callback) {
  var maxSize = 500 * 1024,
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
