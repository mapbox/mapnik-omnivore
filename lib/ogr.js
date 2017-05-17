var fs = require('fs');
var gdal = require('gdal');
var invalid = require('./invalid');
var srs = require('srs');
var utils = require('./utils');
var fieldDescriptions = {};

fieldDescriptions[gdal.OFTInteger] = 'an integer';
fieldDescriptions[gdal.OFTIntegerList] = 'an array of integers';
fieldDescriptions[gdal.OFTReal] = 'a double';
fieldDescriptions[gdal.OFTRealList] = 'an array of doubles';
fieldDescriptions[gdal.OFTString] = 'a string';
fieldDescriptions[gdal.OFTStringList] = 'an array of strings';
fieldDescriptions[gdal.OFTDate] = 'a date';
fieldDescriptions[gdal.OFTTime] = 'a time';
fieldDescriptions[gdal.OFTDateTime] = 'a datetime';
fieldDescriptions[gdal.OFTBinary] = 'a binary object';

module.exports = Ogr;

//overrideGdalData only exists to make @flippmoke happy and have 100% coverage
function Ogr(filepath, overrideGdalData) {
  this.filepath = filepath;

  //Mapbox Studio Classic packaging removes node-gdal's deps directory, which
  //includes files needed for GDAL_DATA.
  //If node-gdal's GDAL_DATA directory does not exists, assume enviroment
  //variable GDAL_DATA is correctly set, e.g. by node-srs
  var gdal_data;
  if (overrideGdalData) {
    gdal_data = overrideGdalData;
  } else {
    gdal_data = gdal.config.get('GDAL_DATA');
  }

  if (!fs.existsSync(gdal_data)) {
    gdal_data = process.env.GDAL_DATA;
    if (fs.existsSync(gdal_data)) {
      gdal.config.set('GDAL_DATA', gdal_data);
    } else {
      throw invalid('GDAL_DATA not found.');
    }
  }

  try {
    this.gdalDatasource = gdal.open(filepath);
  }
  catch (err) {
    throw invalid('Invalid OGR: could not open the file.\n' + err);
  }
}

Ogr.validFileType = ['kml', 'gpx'];
Ogr.prototype.detailsName = 'json';
Ogr.prototype.dstype = 'ogr';

Ogr.prototype.gdalData = function(value) {
  if (!arguments.length) return gdal.config.get('GDAL_DATA');
  gdal.config.set('GDAL_DATA', value);
};

Ogr.prototype.getCenter = function(callback) {
  this.getExtent(function(err, extent) {
    if (err) return callback(err);
    callback(null, [(extent[2] + extent[0]) / 2, (extent[3] + extent[1]) / 2]);
  });
};

Ogr.prototype.getExtent = function(callback) {
  var _this = this;

  if (!this._layers || !this._layers.length) this.getLayers(getLayerExtents);
  else getLayerExtents();

  function getLayerExtents(err) {
    if (err) return callback(err);

    var extent = new gdal.Envelope();
    var result = _this._layers.reduce(function(result, layer) {
      try {
        extent.merge(layer.getExtent());
      } catch (err) {
        return invalid('OGR source missing extent:\n' + err);
      }

      return true;
    }, false);

    if (result instanceof Error) return callback(result);
    else callback(null, [extent.minX, extent.minY, extent.maxX, extent.maxY]);
  }
};

Ogr.prototype.getZooms = function(callback) {
  var filepath = this.filepath;

  this.getExtent(function(err, extent) {
    if (err) return callback(err);

    // no datasource object like mapnik, so don't pass it in
    utils.zoomsBySize(filepath, extent, callback);
  });
};

Ogr.prototype.getProjection = function(callback) {
  var _this = this;

  if (!this._layers || !this._layers.length) this.getLayers(pickProjection);
  else pickProjection();

  function pickProjection(err) {
    if (err) return callback(err);

    var proj4;
    try { proj4 = _this._layers[0].getProjection(); }
    catch (error) { return callback(error); }

    callback(null, proj4);
  }
};

Ogr.prototype.getDetails = function(callback) {
  var _this = this;

  if (!this._layers || !this._layers.length) this.getLayers(getLayerDetails);
  else getLayerDetails();

  function getLayerDetails(err) {
    if (err) return callback(err);

    var layers = [];
    var layer;
    var i;

    for (i = 0; i < _this._layers.length; i++) {
      layer = _this._layers[i];
      try { layers.push(layer.toJSON()); }
      catch (error) { return callback(error); }
    }

    callback(null, { vector_layers: layers });
  }
};

Ogr.prototype.getLayers = function(callback) {
  var layerCount;
  var layer;
  var i;

  if (!this._layers || !this._layers.length) {
    layerCount = this.gdalDatasource.layers.count();

    this._layers = [];

    for (i = 0; i < layerCount; i++) {
      layer = this.gdalDatasource.layers.get(i);
      if (!layer.features.count()) continue;
      this._layers.push(new OgrLayer(this.gdalDatasource, layer));
    }
  }

  if (!this._layers.length) {
    return callback(
      invalid('OGR file contains no features. If KML, NetworkLinks are not supported')
    );
  }

  callback(null, this._layers.map(function(layer) {
    return layer.name;
  }));
};

function OgrLayer(gdalDatasource, gdalLayer) {
  this.gdalDatasource = gdalDatasource;
  this.gdalLayer = gdalLayer;
  this.name = gdalLayer.name;
}

OgrLayer.prototype.toJSON = function() {
  var fieldCount = this.gdalLayer.fields.count();
  var fieldDescription;
  var fields = {};
  var field;
  var i;

  for (i = 0; i < fieldCount; i++) {
    field = this.gdalLayer.fields.get(i);
    fieldDescription = fieldDescriptions[field.type];
    if (!fieldDescription) {
      throw invalid('Field %s has unsupported type: %s', field.name, field.type);
    }

    fields[field.name] = fieldDescription;
  }

  return {
    id: this.name.replace(' ', '_'),
    description: '',
    minzoom: 0,
    maxzoom: 22,
    fields: fields
  };
};

OgrLayer.prototype.getExtent = function() {
  var extent = this.gdalLayer.getExtent(true).toPolygon();
  var tranformation = new gdal.CoordinateTransformation(
    this.gdalLayer.srs,
    gdal.SpatialReference.fromEPSG(4326)
  );

  extent.transform(tranformation);
  return extent.getEnvelope();
};

OgrLayer.prototype.getProjection = function() {
  var proj4 = this.gdalLayer.srs.toProj4();
  return srs.parse(proj4).proj4;
};
