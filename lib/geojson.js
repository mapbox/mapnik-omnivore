var fs = require('fs');
var mapnik = require('mapnik');
var SphericalMercator = require('sphericalmercator');
var sm = new SphericalMercator();
var invalid = require('./invalid');

mapnik.register_default_input_plugins();

module.exports = function(filepath) {
  return new GeoJSON(filepath);
};

function GeoJSON(filepath) {
  this.filepath = filepath;

  this.datasource = new mapnik.Datasource({
    type: 'geojson',
    file: filepath
  });

  this.extent = ds.extent();
  this.center = [
    0.5 * (extent[0] + extent[2]),
    0.5 * (extent[1] + extent[3])
  ];
}

GeoJSON.validFileType = 'geojson';

GeoJSON.prototype.getProjection = function(callback) {
  // TODO: check that the bounds are valid in WGS84-space
  callback(null, '+proj=longlat +ellps=WGS84 +datum=WGS84 +no_defs');
};

GeoJSON.prototype.getCenter = function(callback) {
  callback(null, this.center);
};

GeoJSON.prototype.getExtent = function(callback) {
  callback(null, this.extent);
};

GeoJSON.prototype.getZooms = function(callback) {
  var maxSize = 500 * 1024;
  var minzoom = 0;
  var maxzoom = 22;
  var min, max;

  var _this = this;

  fs.stat(this.filepath, function(err, stats) {
    if (err) return callback(err);

    var x, y, bounds, tiles, avg;

    for (var z = maxzoom; z >= 0; z--) {
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
        return callback(null, [ min, max ]);
      } else if (tiles === 1 || i === 0) {
        min = 0;
        return callback(null, [ min, max ]);
      }
    }
  });
};
