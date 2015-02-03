var gdal = require('gdal'),
    invalid = require('./invalid'),
    path = require('path'),
    srs = require('srs'),
    utils = require('./utils'),
    fieldTypes = {};

fieldTypes[gdal.OFTInteger] = 'Integer';
fieldTypes[gdal.OFTIntegerList] = 'Integer[]';
fieldTypes[gdal.OFTReal] = 'Double';
fieldTypes[gdal.OFTRealList] = 'Double[]';
fieldTypes[gdal.OFTString] = 'String';
fieldTypes[gdal.OFTStringList] = 'String[]';
fieldTypes[gdal.OFTDate] = 'Date';
fieldTypes[gdal.OFTTime] = 'Time';
fieldTypes[gdal.OFTDateTime] = 'Datetime';
fieldTypes[gdal.OFTBinary] = 'Binary';

module.exports = Kml;

function Kml(filepath) {
  this.filepath = filepath;
  this.details = {};
  this.filename = path.basename(this.filepath, path.extname(this.filepath));

  try {
    this.gdalDatasource = gdal.open(filepath);
  }
  catch (err) {
    throw invalid('Invalid kml: could not open the file');
  }
}

Kml.validFileType = 'kml';
Kml.prototype.detailsName = 'json';
Kml.prototype.dstype = 'ogr';

Kml.prototype.getCenter = function(callback) {
  this.getExtent(function(err, extent) {
    if (err) return callback(err);
    callback(null, [(extent[2] - extent[0]) / 2, (extent[3] - extent[1]) / 2]);
  });
};

Kml.prototype.getExtent = function(callback) {
  var _this = this;

  if (!this._layers || !this._layers.length) this.getLayers(getLayerExtents);
  else getLayerExtents();

  function getLayerExtents(err) {
    if (err) return callback(err);

    var extent = new gdal.Envelope();
    _this._layers.forEach(function(layer) {
      extent.merge(layer.getExtent());
    });

    callback(null, [extent.minX, extent.minY, extent.maxX, extent.maxY]);
  }
};

Kml.prototype.getZooms = function(callback) {
  var filepath = this.filepath;

  this.getExtent(function(err, extent) {
    if (err) return callback(err);
    utils.zoomsBySize(filepath, extent, callback);
  });
};

Kml.prototype.getProjection = function(callback) {
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

Kml.prototype.getDetails = function(callback) {
  var _this = this;

  if (!this._layers || !this._layers.length) this.getLayers(getLayerDetails);
  else getLayerDetails();

  function getLayerDetails(err) {
    if (err) return callback(err);

    var layers = [], layer, i;

    for (i = 0; i < this._layers.length; i++) {
      layer = _this._layers[i];
      try { layers.push(layer.toJSON()); }
      catch (error) { return callback(error); }
    }

    callback(null, { vector_layers: layers });
  }
};

Kml.prototype.getLayers = function(callback) {
  var layerCount, i, layer;

  if (!this._layers || !this._layers.length) {
    layerCount = this.gdalDatasource.layers.count();

    this._layers = [];

    for (i = 0; i < layerCount; i++) {
      layer = this.gdalDatasource.layers.get(i);
      if (!layer.features.count()) continue;
      this._layers.push(new KmlLayer(this.gdalDatasource, layer));
    }
  }

  callback(null, this._layers.map(function(layer) {
    return layer.name;
  }));
};

function KmlLayer(gdalDatasource, gdalLayer) {
  this.gdalDatasource = gdalDatasource;
  this.gdalLayer = gdalLayer;
  this.name = gdalLayer.name;
}

KmlLayer.prototype.toJSON = function() {
  var fieldCount = this.gdalLayer.fields.count(),
      i, field, fieldType, fields = {};

  for (i = 0; i < fieldCount; i++) {
    field = this.gdalLayer.fields.get(i);
    fieldType = fieldTypes[field.type];
    if (!fieldType) throw invalid('Field %s has unsupported type: %s', field.name, field.type);
    fields[field.name] = fieldType;
  }

  return {
    id: field.name.replace(' ', '_'),
    description: '',
    minzoom: 0,
    maxzoom: 22,
    fields: fields
  };
};

KmlLayer.prototype.getExtent = function() {
  var extent = this.gdalLayer.getExtent(true).toPolygon(),
      tranformation = new gdal.CoordinateTransformation(
        this.gdalLayer.srs,
        gdal.SpatialReference.fromEPSG(4326)
      );

  extent.transform(tranformation);
  return extent.getEnvelope();
};

KmlLayer.prototype.getProjection = function() {
  var proj4 = this.gdalLayer.srs.toProj4();
  return srs.parse(proj4).proj4;
};
