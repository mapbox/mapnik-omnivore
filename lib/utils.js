var fs = require('fs');
var invalid = require('./invalid');
var SphericalMercator = require('@mapbox/sphericalmercator');
var sm = new SphericalMercator();

var SMALLEST_MAX_ZOOM_FILE_SIZE = 1000000; // 1mb
var DEFAULT_SMALLEST_MAX_ZOOM = 6;
var SMALLEST_MIN_ZOOM_FILE_SIZE = process.env.SMALLEST_MIN_ZOOM_FILE_SIZE ? +process.env.SMALLEST_MIN_ZOOM_FILE_SIZE : 10000000; // 10mb

/**
 * Calculate the min and maximum zoom of a geographic file derived
 * on the bounds of the dataset and the size of the file.
 * Attempts to keep the average tile size small (under 500KB) 
 * and keep maxzoom large enough for small datasets to avoid
 * imprecise zooms.
 * 
 * @param {String} filepath - file path of the data source
 * @param {*} extent - [nsew] bounding box
 * @param {*} [datasource] - an optional mapnik datasource
 * @param {*} callback 
 */
module.exports.zoomsBySize = function(filepath, extent, datasource, callback) {

  // currently the ogr plugin doesn't pass in a datasource,
  // so we need to redefine the callback
  if (typeof datasource === 'function') callback = datasource;

  var maxSize = 500 * 1024;
  var max = 16;
  var min;

  fs.stat(filepath, function(err, stats) {
    if (err) return callback(err);
    // if the size of the file is zero, return early
    if (stats.size <= 0) {
      return callback(invalid('Error calculating min/max zoom: Total bytes less than or equal to zero'));
    }

    var x;
    var y;
    var z;
    var bounds;
    var tiles;
    var avg;

    // set a "smallest max zoom" for different data types
    var smallestMaxZoom = stats.size < SMALLEST_MAX_ZOOM_FILE_SIZE ? dataTypeMaxZoom(datasource) : DEFAULT_SMALLEST_MAX_ZOOM;

    // set z0 for files under 10 mb
    var clamp_to_z0 = stats.size < SMALLEST_MIN_ZOOM_FILE_SIZE;

    for (z = max; z >= 0; z--) {
      // get total possible tiles at zoom for the bounding box
      bounds = sm.xyz(extent, z, false, 4326);
      x = (bounds.maxX - bounds.minX) + 1;
      y = (bounds.maxY - bounds.minY) + 1;
      tiles = x * y;

      // if no tiles for this bounding box, the bounds are invalid
      if (tiles <= 0) {
        return callback(invalid('Error calculating min/max zoom: Bounds invalid'));
      }

      // get the "average" size of a tile at zoom by dividing total size of file
      // by the total tiles at this zoom. This is a very rough heuristic for average
      // tile size, as it does not take the density of data into account.
      avg = stats.size / tiles;

      // if the average tile size is smaller than 1000 bytes 
      // set the maxzoom to the current zoom level in the loop
      if (avg < 1000) max = z;

      // if the average tile size for this zoom is larger than
      // the maximum allowed tile size...
      if (avg > maxSize) {

        // and if the size of the dataset is small enough,
        // set minzoom to 0
        if (clamp_to_z0) {
          min = 0;
        
        // otherwise set the minzoom to the current zoom level loop, becuase
        // it's likely if we reduce the minzoom further average tile size
        // will only increase.
        } else {
          min = z;
        }

        // return the current "min" value and the largest between "max" or smallestMaxZoom
        return callback(null, min, Math.max(max, smallestMaxZoom));

      // if the average tile size is smaller than the maximum allowed size
      // of a tile AND there is only one tile OR the current zoom is 0,
      // set the minzoom to 0 and set maxzoom to the largest of the current "max" 
      // value or the smallestMaxZoom variable 
      } else if (tiles === 1 || z === 0) {
        min = 0;
        return callback(null, min, Math.max(max, smallestMaxZoom));
      }
    }
  });
};

/**
 * Calculates the smallest max zoom a datasource should be tiled to. This is used for small datasources
 * where precision can be lost due to large tile extents. https://github.com/mapbox/mapnik-omnivore/issues/151
 *
 * @param {object} datasource A Node Mapnik datasource object
 * @returns {number} zoom The smallest max zoom to use for the datasource
 */
module.exports.dataTypeMaxZoom = dataTypeMaxZoom;
var dataTypeMaxZoom = function(ds) {

  // try describing the datasource (this catches the ogr hole)
  var info;
  try {
    info = ds.describe();
  } catch (err) {
    return DEFAULT_SMALLEST_MAX_ZOOM;
  }

  // for point features, tile down to z10
  if (info.geometry_type === 'point') {
    return 10;
  }

  // return 6 for all other data types for now
  return DEFAULT_SMALLEST_MAX_ZOOM;
};

module.exports.convertToMeters = function(pixelSize, unit) {
  var circumference = 40075000;
  var conversions = {
    m: function(x) { return x; },

    ft: function(x) { return x * 0.3048; },

    mi: function(x) { return x * 1609.34; },

    km: function(x) { return x * 1000; },

    'us-ft': function(x) { return x * 0.3048; },

    'us-mi': function(x) { return x * 1609.34; },

    'decimal degrees': function(x) { return x / 360 * circumference; }
  };

  if (!conversions[unit]) throw new Error('Invalid unit type, must be one of: [m, ft, mi, km, us-ft, us-mi]');

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
  var zoomLevels = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24];

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
