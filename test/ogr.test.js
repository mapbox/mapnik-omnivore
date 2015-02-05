var test = require('tape'),
    path = require('path'),
    fs = require('fs'),
    testData = path.join(path.dirname(require.resolve('mapnik-test-data')), 'data'),
    Ogr = require('../lib/ogr.js'),
    expectedMetadata_fells_loop = JSON.parse(fs.readFileSync(path.resolve('test/fixtures/metadata_fells_loop.json'))),
    expectedMetadata_1week_earthquake = JSON.parse(fs.readFileSync(path.resolve('test/fixtures/metadata_1week_earthquake.json')));

function closeEnough(assert, found, expected, message) {
  found =  Math.floor(found * Math.pow(10, 6)) / Math.pow(10, 6);
  expected =  Math.floor(expected * Math.pow(10, 6)) / Math.pow(10, 6);
  assert.equal(found, expected, message);
}

test('[OGR] Constructor error on malformed kml', function(assert) {
  var fixture = path.resolve(__dirname, 'fixtures', 'invalid.malformed.kml');
  assert.throws(function() {
    new Ogr(fixture);
  }, 'throws an error');
  assert.end();
});

test('[KML] Constructor success on valid kml', function(assert) {
  var fixture = path.join(testData, 'kml', 'TIMS.kml'),
      ogr = new Ogr(fixture);
  assert.ok(ogr instanceof Ogr, 'creates a Ogr instance');
  assert.equal(ogr.detailsName, 'json', 'expected detailsName');
  assert.equal(ogr.dstype, 'ogr', 'expected dstype');
  assert.end();
});

test('[GPX] Constructor success on valid gpx', function(assert) {
  var fixture = path.join(testData, 'gpx', 'fells_loop.gpx'),
      ogr = new Ogr(fixture);
  assert.ok(ogr instanceof Ogr, 'creates a Ogr instance');
  assert.equal(ogr.detailsName, 'json', 'expected detailsName');
  assert.equal(ogr.dstype, 'ogr', 'expected dstype');
  assert.end();
});

test('[KML] getLayers: kml file with layers', function(assert) {
  var fixture = path.join(testData, 'kml', '1week_earthquake.kml'),
      ogr = new Ogr(fixture);

  ogr.getLayers(function(err, layers) {
    assert.ifError(err, 'no error');
    assert.equal(layers.length, expectedMetadata_1week_earthquake.layers.length, 'correct number of layers');
    expectedMetadata_1week_earthquake.layers.forEach(function(layername) {
      assert.ok(layers.indexOf(layername) > -1, layername + ' found in layers');
    });
    assert.end();
  });
});

test('[GPX] getLayers: gpx file with layers', function(assert) {
  var fixture = path.join(testData, 'gpx', 'fells_loop.gpx'),
      ogr = new Ogr(fixture);

  ogr.getLayers(function(err, layers) {
    assert.ifError(err, 'no error');
    assert.equal(layers.length, expectedMetadata_fells_loop.layers.length, 'correct number of layers');
    expectedMetadata_fells_loop.layers.forEach(function(layername) {
      assert.ok(layers.indexOf(layername) > -1, layername + ' found in layers');
    });
    assert.end();
  });
});

test('[KML] getLayers: kml file with no layers', function(assert) {
  var fixture = path.join(testData, 'kml', 'TIMS.kml'),
      ogr = new Ogr(fixture);
  ogr.getLayers(function(err, layers) {
    assert.ok(err, 'expected error');
    assert.notOk(layers, 'no layers returned');
    assert.end();
  });
});

test('[KML] getExtent: kml file with layers', function(assert) {
  var fixture = path.join(testData, 'kml', '1week_earthquake.kml'),
      ogr = new Ogr(fixture),
      expected = [-179.28269999999998, -56.1221, 179.08359999999996, 68.823];

  ogr.getExtent(function(err, extent) {
    assert.ifError(err, 'no error');
    extent.forEach(function(coord, i) {
      closeEnough(assert, coord, expected[i], 'correct extent value');
    });
    assert.end();
  });
});

test('[GPX] getExtent: gpx file with layers', function(assert) {
  var fixture = path.join(testData, 'gpx', 'fells_loop.gpx'),
      ogr = new Ogr(fixture),
      expected = [-71.12660199999993, 42.40105099999996, -71.10297299999993, 42.468654999999956];

  ogr.getExtent(function(err, extent) {
    assert.ifError(err, 'no error');
    extent.forEach(function(coord, i) {
      closeEnough(assert, coord, expected[i], 'correct extent value');
    });
    assert.end();
  });
});

test('[KML] getExtent: kml file with no layers', function(assert) {
  var fixture = path.join(testData, 'kml', 'TIMS.kml'),
      kml = new Ogr(fixture);
  kml.getExtent(function(err, extent) {
    assert.ok(err, 'expected error');
    assert.notOk(extent, 'no extent returned');
    assert.end();
  });
});

test('[KML] getCenter: kml file with layers', function(assert) {
  var fixture = path.join(testData, 'kml', '1week_earthquake.kml'),
      kml = new Ogr(fixture),
      expected = [-0.0995500000000078, 6.350449999999995];

  kml.getCenter(function(err, center) {
    assert.ifError(err, 'no error');
    center.forEach(function(coord, i) {
      closeEnough(assert, coord, expected[i], 'correct center value');
    });
    assert.end();
  });
});

test('[GPX] getCenter: gpx file with layers', function(assert) {
  var fixture = path.join(testData, 'gpx', 'fells_loop.gpx'),
      ogr = new Ogr(fixture),
      expected = [-71.11478749999993, 42.43485299999996];

  ogr.getCenter(function(err, center) {
    assert.ifError(err, 'no error');
    center.forEach(function(coord, i) {
      closeEnough(assert, coord, expected[i], 'correct center value');
    });
    assert.end();
  });
});

test('[KML] getCenter: kml file with no layers', function(assert) {
  var fixture = path.join(testData, 'kml', 'TIMS.kml'),
      ogr = new Ogr(fixture);
  ogr.getCenter(function(err, center) {
    assert.ok(err, 'expected error');
    assert.notOk(center, 'no center returned');
    assert.end();
  });
});

test('[KML] getProjection: kml file with layers', function(assert) {
  var fixture = path.join(testData, 'kml', '1week_earthquake.kml'),
      ogr = new Ogr(fixture),
      expected = '+proj=longlat +ellps=WGS84 +datum=WGS84 +no_defs';

  ogr.getProjection(function(err, projection) {
    assert.ifError(err, 'no error');
    assert.equal(projection, expected, 'expected projection');
    assert.end();
  });
});

test('[GPX] getProjection: gpx file with layers', function(assert) {
  var fixture = path.join(testData, 'gpx', 'fells_loop.gpx'),
      ogr = new Ogr(fixture),
      expected = '+proj=longlat +ellps=WGS84 +datum=WGS84 +no_defs';

  ogr.getProjection(function(err, projection) {
    assert.ifError(err, 'no error');
    assert.equal(projection, expected, 'expected projection');
    assert.end();
  });
});

test('[KML] getProjection: kml file with no layers', function(assert) {
  var fixture = path.join(testData, 'kml', 'TIMS.kml'),
      ogr = new Ogr(fixture);
  ogr.getProjection(function(err, projection) {
    assert.ok(err, 'expected error');
    assert.notOk(projection, 'no projection returned');
    assert.end();
  });
});

test('[KML] getDetails: kml file with layers', function(assert) {
  var fixture = path.join(testData, 'kml', '1week_earthquake.kml'),
      ogr = new Ogr(fixture);

  ogr.getDetails(function(err, details) {
    assert.ifError(err, 'no error');
    assert.deepEqual(details, expectedMetadata_1week_earthquake.json, 'expected details');
    assert.end();
  });
});

test('[GPX] getDetails: gpx file with layers', function(assert) {
  var fixture = path.join(testData, 'gpx', 'fells_loop.gpx'),
      ogr = new Ogr(fixture);

  ogr.getDetails(function(err, details) {
    assert.ifError(err, 'no error');
    assert.deepEqual(details, expectedMetadata_fells_loop.json, 'expected details');
    assert.end();
  });
});

test('[KML] getDetails: kml file with no layers', function(assert) {
  var fixture = path.join(testData, 'kml', 'TIMS.kml'),
      ogr = new Ogr(fixture);
  ogr.getDetails(function(err, details) {
    assert.ok(err, 'expected error');
    assert.notOk(details, 'no details returned');
    assert.end();
  });
});

test('[KML] getDetails: kml file has unsupported field type', function(assert) {
  // TODO: this
  assert.end();
});
