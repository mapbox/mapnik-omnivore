var test = require('tape');
var path = require('path');
var Csv = require('../lib/csv');
var testData = path.join(path.dirname(require.resolve('mapnik-test-data')), 'data');
var valid = path.join(testData, 'csv', 'bbl_current_csv.csv');
var mapnik = require('mapnik');
var validDatasource;

mapnik.register_default_input_plugins();
mapnik.Logger.setSeverity(mapnik.Logger.NONE);

validDatasource = new mapnik.Datasource({
  type: 'csv',
  file: valid,
  filesize_max: 10,
  layer: 'bbl_current_csv'
});

test('[CSV] constructor: invalid file', function(assert) {
  var fixture = path.join(__dirname, 'fixtures', 'invalid.malformed.csv');
  assert.throws(function() {
    new Csv(fixture);
  }, 'throws an error');

  assert.end();
});

test('[CSV] constructor: valid file', function(assert) {
  var csv;
  assert.doesNotThrow(function() {
    csv = new Csv(valid);
  }, 'no error');

  assert.equal(csv.detailsName, 'json', 'exposes details name');
  assert.equal(csv.dstype, 'csv', 'exposes dstype');
  assert.end();
});

test('[CSV] getProjection', function(assert) {
  var csv = new Csv(valid);
  csv.getProjection(function(err, projection) {
    assert.ifError(err, 'no error');
    assert.equal(projection, '+proj=longlat +ellps=WGS84 +datum=WGS84 +no_defs', 'always returns epsg:4326');
    assert.end();
  });
});

test('[CSV] getExtent', function(assert) {
  var csv = new Csv(valid);
  csv.getExtent(function(err, extent) {
    assert.ifError(err, 'no error');
    assert.deepEqual(extent, validDatasource.extent());
    assert.end();
  });
});

test('[CSV] getCenter', function(assert) {
  var csv = new Csv(valid);
  csv.getCenter(function(err, center) {
    assert.ifError(err, 'no error');
    var extent = validDatasource.extent();
    var expected = [
      0.5 * (extent[0] + extent[2]),
      0.5 * (extent[1] + extent[3])
    ];
    assert.deepEqual(center, expected, 'expected center');
    assert.end();
  });
});

test('[CSV] getDetails', function(assert) {
  var csv = new Csv(valid);
  var expected = {
    vector_layers: [
      {
        id: 'bbl_current_csv',
        description: '',
        minzoom: 0,
        maxzoom: 22,
        fields: validDatasource.describe().fields
      }
    ]
  };

  csv.getDetails(function(err, details) {
    assert.ifError(err, 'no error');
    assert.deepEqual(details, expected, 'expected details');
    assert.end();
  });
});

test('[CSV] getLayers: no features', function(assert) {
  var csv = new Csv(path.join(__dirname, 'fixtures', 'invalid.nofeatures.csv'));
  csv.getLayers(function(err, layers) {
    assert.ok(err, 'expected error');
    assert.notOk(layers, 'no layers returned');
    assert.end();
  });
});

test('[CSV] getLayers: has features', function(assert) {
  var csv = new Csv(valid);
  csv.getLayers(function(err, layers) {
    assert.ifError(err, 'no error');
    assert.deepEqual(layers, ['bbl_current_csv']);
    assert.end();
  });
});

test('[CSV] getZooms', function(assert) {
  var csv = new Csv(valid);
  csv.getZooms(function(err, min, max) {
    assert.ifError(err, 'no error');
    assert.equal(min, 0, 'expected min zoom');
    assert.equal(max, 11, 'expected max zoom');
    assert.end();
  });
});
