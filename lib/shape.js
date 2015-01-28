var fs = require('fs');
var mapnik = require('mapnik');
var invalid = require('./invalid');
var path = require('path');
var srs = require('srs');
var SphericalMercator = require('sphericalmercator');
var sm = new SphericalMercator();

mapnik.register_default_input_plugins();

module.exports = Shape;

function Shape(filepath) { 
  this.filepath = filepath;
  this.filename = path.basename(this.filepath, path.extname(this.filepath));
  this.datasource = new mapnik.Datasource({
    type: 'shape',
    file: filepath,
    layer: this.filename
  });
};

Shape.validFileType = 'shp';
Shape.prototype.detailsName = 'json';
Shape.prototype.dstype = 'shape';

Shape.prototype.getFilename = function(callback) {
	return callback(null, this.filename);
};

Shape.prototype.getProjection = function(callback) {
  var fileDir = path.dirname(this.filepatch);
  //Assumes the .prj file has the same name as the .shp file
  var projFile = fileDir + "/" + (path.basename(this.filepath, path.extname(this.filepath))) + '.prj';

  fs.readFile(projFile, function(err, data) {
    if (err) return callback(invalid('Invalid shape: missing projection file'));

    var result;
    try { result = srs.parse(data); }
    catch(error) {
      return callback(invalid('Invalid shape: invalid projection file'));
    }

    // handle ESRI-specific projections
    if (result.proj4 === undefined) {
      // Prepend ESRI:: and try parse again.
      try { result = srs.parse('ESRI::' + data.toString()); }
      catch(error) {
        return callback(invalid('Invalid shape: invalid projection file'));
      }
      // handle undefined proj4 string case
      if (result.proj4 !== undefined) return callback(null, result.proj4);
        else return callback(invalid('Invalid shape: undefined proj4 string'));
    } else {
      //Yay, Valid!
      return callback(null, result.proj4);
    }
  });
};

Shape.prototype.getCenter = function(callback) {
  this.getExtent(function(err, extent) {
    if (err) return callback(err);

    return callback(null, [
      0.5 * (extent[0] + extent[2]),
      0.5 * (extent[1] + extent[3])
    ]);
  });
};

Shape.prototype.getExtent = function(callback) {
  var extent;
  try {
    extent = this.datasource.extent();
  }
  catch(err) {
    return callback(invalid('Invalid shape: could not read extent'));
  }

  this.getProjection(function(err, projection) {
    var current = new mapnik.Projection(projection);
    var wgs84 = new mapnik.Projection('+proj=longlat +ellps=WGS84 +datum=WGS84 +no_defs');

    if (current !== wgs84) {
      var transform = new mapnik.ProjTransform(current, wgs84);
      extent = transform.forward(extent);
    }

    return callback(null, extent);
  });
};

Shape.prototype.getLayers = function(callback) {
  return callback(null, [ this.filename ]);
};

Shape.prototype.getZooms = function(callback) {
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
        return callback(null, min, max );
      } else if (tiles === 1 || z === 0) {
        min = 0;
        return callback(null, min, max );
      }
    }
  });
};
