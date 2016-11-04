var fs = require('fs');
var mapnik = require('mapnik');
var invalid = require('./invalid');
var path = require('path');
var srs = require('srs');
var utils = require('./utils');

module.exports = Shape;

function Shape(filepath) {
  this.filepath = filepath;
  this.basename = path.basename(this.filepath, path.extname(this.filepath));
  this.datasource = new mapnik.Datasource({
    type: 'shape',
    file: filepath,
    layer: this.basename
  });
}

Shape.validFileType = ['shp'];
Shape.prototype.detailsName = 'json';
Shape.prototype.dstype = 'shape';

Shape.prototype.getProjection = function(callback) {
  if (this._projection) return callback(null, this._projection);

  var fileDir = path.dirname(this.filepath);
  var projFile = fileDir + '/' + this.basename + '.prj';
  var _this = this;

  fs.readFile(projFile, function(err, data) {
    if (err) return callback(invalid('Invalid shapefile: missing projection file'));

    // srs and mapnik must be able to parse the projection file
    var result;
    try {
      result = srs.parse(data);
      new mapnik.Projection(result.proj4);
    }
    catch (error) {
      return callback(invalid('Invalid shapefile: invalid projection file'));
    }

    // handle ESRI-specific projections
    if (result.proj4 === undefined) {

      try { result = srs.parse('ESRI::' + data.toString()); }
      catch (error) {
        return callback(
          invalid('Invalid shapefile: invalid projection file')
        );
      }

      if (result.proj4 !== undefined) {
        _this._projection = result.proj4;
        return callback(null, _this._projection);
      } else return callback(invalid('Invalid shapefile: undefined proj4 string'));

    }
    else {
      _this._projection = result.proj4;
      return callback(null, _this._projection);
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
  if (this._extent) return callback(null, this._extent);

  var _this = this;
  var extent;
  try {
    extent = this.datasource.extent();
  }
  catch (err) {
    return callback(invalid('Invalid shapefile: could not read extent'));
  }

  this.getProjection(function(err, projection) {
    if (err) return callback(err);

    var current = new mapnik.Projection(projection);
    var wgs84 = new mapnik.Projection('+proj=longlat +ellps=WGS84 +datum=WGS84 +no_defs');
    var transform;

    if (current !== wgs84) {
      transform = new mapnik.ProjTransform(current, wgs84);
      extent = transform.forward(extent);
    }

    _this._extent = extent;
    return callback(null, _this._extent);
  });
};

Shape.prototype.getDetails = function(callback) {
  // Setup vector layers json
  var actual = this.datasource.describe();
  var fields = actual.fields;
  var json = {
    vector_layers: [
      {
        id: this.basename,
        description: '',
        minzoom: 0,
        maxzoom: 22,
        fields: fields
      }
    ]
  };

  return callback(null, json);
};

Shape.prototype.getLayers = function(callback) {
  return callback(null, [this.basename]);
};

Shape.prototype.getZooms = function(callback) {
  var filepath = this.filepath;
  var ds = this.datasource;

  this.getExtent(function(err, extent) {
    if (err) return callback(err);
    utils.zoomsBySize(filepath, extent, ds, callback);
  });
};
