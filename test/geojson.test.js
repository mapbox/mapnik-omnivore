var tape = require('tape'),
    path = require('path'),
    fs = require('fs'),
    mapnik = require('mapnik'),
    testData = path.dirname(require.resolve('mapnik-test-data')),
    GeoJSON = require('../lib/geojson.js');

/**
 * Testing GeoJSON functions
 */
tape('[GeoJson] Setting up constructor', function(assert) {
  var file = testData + '/data/geojson/DC_polygon.geo.json',
      expectedCenter = [-77.01335, 38.89255],
      expectedExtent = [-77.1174, 38.7912, -76.9093, 38.9939],
      expectedLayers = ['DC_polygon.geo'],
      result = new GeoJSON(file);

  assert.ok(result);
  assert.ok(result.center);
  assert.ok(result.extent);
  assert.ok(typeof result.extent == 'object');
  assert.ok(typeof result.center == 'object');
  assert.deepEqual(result.center, expectedCenter);
  assert.deepEqual(result.extent, expectedExtent);
  assert.deepEqual(result.layers, expectedLayers);
  assert.end();
});

tape('[GeoJson] Get projection', function(assert) {
  var file = testData + '/data/geojson/DC_polygon.geo.json',
      expectedProjection = '+proj=longlat +ellps=WGS84 +datum=WGS84 +no_defs',
      source = new GeoJSON(file);

  source.getProjection(function(err, projection) {
    if (err) {
      assert.ifError(err, 'should not error');
      return assert.end();
    }
    assert.ok(err === null);
    assert.deepEqual(projection, expectedProjection);
    assert.end();
  });
});

tape('[GeoJson] Get center', function(assert) {
  var file = testData + '/data/geojson/DC_polygon.geo.json',
      expectedCenter = [-77.01335, 38.89255],
      source = new GeoJSON(file);

  source.getCenter(function(err, center) {
    if (err) {
      assert.ifError(err, 'should not error');
      return assert.end();
    }
    assert.ok(err === null);
    assert.deepEqual(center, expectedCenter);
    assert.end();
  });
});

tape('[GeoJson] Get extent', function(assert) {
  var file = testData + '/data/geojson/DC_polygon.geo.json',
      expectedExtent = [-77.1174, 38.7912, -76.9093, 38.9939],
      source = new GeoJSON(file);

  source.getExtent(function(err, extent) {
    if (err) {
      assert.ifError(err, 'should not error');
      return assert.end();
    }
    assert.ok(err === null);
    assert.deepEqual(extent, expectedExtent);
    assert.end();
  });
});

tape('[GeoJson] Get details', function(assert) {
  var file = testData + '/data/geojson/DC_polygon.geo.json',
      expectedDetails = {
        vector_layers: [
          {
            id: 'DC_polygon.geo',
            description: '',
            minzoom: 0,
            maxzoom: 22,
            fields: {
              kind: 'String',
              name: 'String',
              state: 'String'
            }
          }
        ]
      },
      source = new GeoJSON(file);

  source.getDetails(function(err, details) {
    if (err) {
      assert.ifError(err, 'should not error');
      return assert.end();
    }
    assert.ok(err === null);
    assert.deepEqual(details, expectedDetails);
    assert.end();
  });
});

tape('[GeoJson] Get layers', function(assert) {
  var file = testData + '/data/geojson/DC_polygon.geo.json',
      expectedLayers = ['DC_polygon.geo'],
      source = new GeoJSON(file);

  source.getLayers(function(err, layers) {
    if (err) {
      assert.ifError(err, 'should not error');
      return assert.end();
    }
    assert.ok(err === null);
    assert.ok(typeof layers === 'object');
    assert.deepEqual(layers, expectedLayers);
    assert.end();
  });
});

tape('[GeoJson] Get zooms', function(assert) {
  var file = testData + '/data/geojson/DC_polygon.geo.json',
      expectedMinzoom = 0,
      expectedMaxzoom = 6,
      source = new GeoJSON(file);

  source.getZooms(function(err, minzoom, maxzoom) {
    if (err) {
      assert.ifError(err, 'should not error');
      return assert.end();
    }
    assert.ok(err === null);
    assert.deepEqual(minzoom, expectedMinzoom);
    assert.deepEqual(maxzoom, expectedMaxzoom);
    assert.end();
  });
});
