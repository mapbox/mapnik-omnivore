var fs = require('fs');
var invalid = require('./invalid');
var SphericalMercator = require('sphericalmercator');
var sm = new SphericalMercator();

module.exports.zoomsBySize = function(filepath, extent, callback) {
  var maxSize = 500 * 1024;
  var max = 22;
  var min;

  fs.stat(filepath, function(err, stats) {
    if (err) return callback(err);

    var x;
    var y;
    var z;
    var bounds;
    var tiles;
    var avg;

    for (z = max; z >= 0; z--) {
      bounds = sm.xyz(extent, z, false, 4326);
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
