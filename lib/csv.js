var path = require('path');
var mapnik = require('mapnik');
var invalid = require('./invalid');
var utils = require('./utils');

module.exports = Csv;

function Csv(filepath) {
  this.filepath = filepath;
  this.basename = path.basename(filepath, path.extname(filepath));
  try{
    this.datasource = new mapnik.Datasource({
      type: 'csv',
      file: filepath,
      filesize_max: 10,
      layer: this.basename
    });

    this.extent = this.datasource.extent();
    this.center = [
      0.5 * (this.extent[0] + this.extent[2]),
      0.5 * (this.extent[1] + this.extent[3])
    ];
  }
  catch(err) {
    throw invalid('Invalid CSV - malformed header');
  }
}


Csv.validFileType = ['csv'];
Csv.prototype.detailsName = 'json';
Csv.prototype.dstype = 'csv';

Csv.prototype.getProjection = function(callback) {
  callback(null, '+proj=longlat +ellps=WGS84 +datum=WGS84 +no_defs');
};

Csv.prototype.getCenter = function(callback) {
  callback(null, this.center);
};

Csv.prototype.getExtent = function(callback) {
  callback(null, this.extent);
};

Csv.prototype.getDetails = function(callback) {
  var actual = this.datasource.describe();
  var fields = actual.fields;
//  console.log(fields);
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

Csv.prototype.getLayers = function(callback) {
  var featureset = this.datasource.featureset();
  if (!featureset) return callback(invalid('CSV file does not contain any features'));
  if (featureset.next() === undefined) return callback(invalid('CSV file does not contain any features'));
  return callback(null, [this.basename]);
};

Csv.prototype.getZooms = function(callback) {
  utils.zoomsBySize(this.filepath, this.extent, callback);
};
