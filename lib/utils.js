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

module.exports.convertToMeters = function(pixelSize, unit) {
  var circumference = 40075000;
  var conversions = {
    m: function(x) { return x; },

    ft: function(x) { return x / 0.3048; },

    mi: function(x) { return x / 1609.34; },

    km: function(x) { return x / 1000; },

    'us-ft': function(x) { return x / 0.3048; },

    'us-mi': function(x) { return x / 1609.34; },

    'decimal degrees': function(x) { return x / 360 * circumference; }
  };

  var x = conversions[unit](pixelSize[0]);
  var y = conversions[unit](pixelSize[1]);

  return [x, y];
};

module.exports.getUnitType = function(srs) {
  var possibleUnits = ['m', 'ft', 'mi', 'km', 'us-ft', 'us-mi'];
  var i;

  for (i = 0; i < possibleUnits.length; i++) {
    if (srs.indexOf('+units=' + possibleUnits[i]) !== -1) return possibleUnits[i];
  }

  if (srs.indexOf('+units=') === -1 && srs.indexOf('+proj=longlat') !== -1) return 'decimal degrees';

  //Default to meters for now, if nothing matches
  else return 'm';
};

module.exports.getSpatialResolutions = function() {
  var circumference = 40075000;
  var zoomLevels = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19];

  return zoomLevels.map(function(z) {
    return circumference * Math.cos(0) / Math.pow(2, (z + 8));
  });
};

module.exports.getValidSpatialResolutions = function(spatialResolutions, pixelSize, thresholdWeight) {
  return spatialResolutions.filter(function(res, i) {
    var zBreak = res - spatialResolutions[Math.min(i + 1, spatialResolutions.length - 1)] * thresholdWeight;
    return zBreak > pixelSize;
  });
};
