var test = require('tape'),
    path = require('path'),
    testData = path.join(path.dirname(require.resolve('mapnik-test-data')), 'data'),
    Kml = require('../lib/kml.js');

function closeEnough(assert, found, expected, message) {
  found =  Math.floor(found * Math.pow(10, 6)) / Math.pow(10, 6);
  expected =  Math.floor(expected * Math.pow(10, 6)) / Math.pow(10, 6);
  assert.equal(found, expected, message);
}

test('[KML] Constructor error on malformed kml', function(assert) {
  var fixture = path.resolve(__dirname, 'fixtures', 'invalid.malformed.kml');
  assert.throws(function() {
    new Kml(fixture);
  }, 'throws an error');
  assert.end();
});

test('[KML] Constructor success on valid kml', function(assert) {
  var fixture = path.join(testData, 'kml', 'TIMS.kml'),
      kml = new Kml(fixture);
  assert.ok(kml instanceof Kml, 'creates a Kml instance');
  assert.equal(kml.detailsName, 'json', 'expected detailsName');
  assert.equal(kml.dstype, 'ogr', 'expected dstype');
  assert.end();
});

test('[KML] getLayers: kml file with layers', function(assert) {
  var fixture = path.join(testData, 'kml', '1week_earthquake.kml'),
      kml = new Kml(fixture),
      expected = [
        'Magnitude 6',
        'Magnitude 5',
        'Magnitude 4',
        'Magnitude 3',
        'Magnitude 2',
        'Magnitude 1'
      ];

  kml.getLayers(function(err, layers) {
    assert.ifError(err, 'no error');
    assert.equal(layers.length, expected.length, 'correct number of layers');
    expected.forEach(function(layername) {
      assert.ok(layers.indexOf(layername) > -1, layername + ' found in layers');
    });
    assert.end();
  });
});

test('[KML] getLayers: kml file with no layers', function(assert) {
  var fixture = path.join(testData, 'kml', 'TIMS.kml'),
      kml = new Kml(fixture);
  kml.getLayers(function(err, layers) {
    assert.ok(err, 'expected error');
    assert.notOk(layers, 'no layers returned');
    assert.end();
  });
});

test('[KML] getExtent: kml file with layers', function(assert) {
  var fixture = path.join(testData, 'kml', '1week_earthquake.kml'),
      kml = new Kml(fixture),
      expected = [-179.28269999999998, -56.1221, 179.08359999999996, 68.823];

  kml.getExtent(function(err, extent) {
    assert.ifError(err, 'no error');
    extent.forEach(function(coord, i) {
      closeEnough(assert, coord, expected[i], 'correct extent value');
    });
    assert.end();
  });
});

test('[KML] getExtent: kml file with no layers', function(assert) {
  var fixture = path.join(testData, 'kml', 'TIMS.kml'),
      kml = new Kml(fixture);
  kml.getExtent(function(err, extent) {
    assert.ok(err, 'expected error');
    assert.notOk(extent, 'no extent returned');
    assert.end();
  });
});

test('[KML] getCenter: kml file with layers', function(assert) {
  var fixture = path.join(testData, 'kml', '1week_earthquake.kml'),
      kml = new Kml(fixture),
      expected = [-0.0995500000000078, 6.350449999999995];

  kml.getCenter(function(err, center) {
    assert.ifError(err, 'no error');
    center.forEach(function(coord, i) {
      closeEnough(assert, coord, expected[i], 'correct center value');
    });
    assert.end();
  });
});

test('[KML] getCenter: kml file with no layers', function(assert) {
  var fixture = path.join(testData, 'kml', 'TIMS.kml'),
      kml = new Kml(fixture);
  kml.getCenter(function(err, center) {
    assert.ok(err, 'expected error');
    assert.notOk(center, 'no center returned');
    assert.end();
  });
});

test('[KML] getProjection: kml file with layers', function(assert) {
  var fixture = path.join(testData, 'kml', '1week_earthquake.kml'),
      kml = new Kml(fixture),
      expected = '+proj=longlat +ellps=WGS84 +datum=WGS84 +no_defs';

  kml.getProjection(function(err, projection) {
    assert.ifError(err, 'no error');
    assert.equal(projection, expected, 'expected projection');
    assert.end();
  });
});

test('[KML] getProjection: kml file with no layers', function(assert) {
  var fixture = path.join(testData, 'kml', 'TIMS.kml'),
      kml = new Kml(fixture);
  kml.getProjection(function(err, projection) {
    assert.ok(err, 'expected error');
    assert.notOk(projection, 'no projection returned');
    assert.end();
  });
});

test('[KML] getDetails: kml file with layers', function(assert) {
  var fixture = path.join(testData, 'kml', '1week_earthquake.kml'),
      kml = new Kml(fixture),
      expected = [
        'Magnitude 6',
        'Magnitude 5',
        'Magnitude 4',
        'Magnitude 3',
        'Magnitude 2',
        'Magnitude 1'
      ].reduce(function(memo, layername) {
        memo.vector_layers.push({
          id: layername.replace(' ', '_'),
          description: '',
          minzoom: 0,
          maxzoom: 22,
          fields: {
            Name: 'a string',
            Description: 'a string'
          }
        });
        return memo;
      }, { vector_layers: [] });

  kml.getDetails(function(err, details) {
    assert.ifError(err, 'no error');
    assert.deepEqual(details, expected, 'expected details');
    assert.end();
  });
});

test('[KML] getDetails: kml file with no layers', function(assert) {
  var fixture = path.join(testData, 'kml', 'TIMS.kml'),
      kml = new Kml(fixture);
  kml.getDetails(function(err, details) {
    assert.ok(err, 'expected error');
    assert.notOk(details, 'no details returned');
    assert.end();
  });
});

test('[KML] getDetails: kml file has unsupported field type', function(assert) {
  // TODO: this
  assert.end();
});
