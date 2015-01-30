var tape = require('tape'),
    path = require('path'),
    fs = require('fs'),
    mapnik = require('mapnik'),
    testData = path.dirname(require.resolve('mapnik-test-data')),
    Shape = require('../lib/shape.js');

var expectedMetadata_world_merc = JSON.parse(fs.readFileSync(path.resolve('test/fixtures/metadata_world_merc.json')));

/**
 * Testing Shape functions
 */
tape('[SHAPE] Setting up constructor', function(assert) {
  var file = testData + '/data/shp/world_merc/world_merc.shp';
  var expectedFilename = 'world_merc';

  var result = new Shape(file);

  assert.ok(result);
  assert.ok(result.filename);
  assert.deepEqual(result.filename, expectedFilename);
  assert.end();
});

tape('[SHAPE] Get filename', function(assert) {
  var file = testData + '/data/shp/world_merc/world_merc.shp';
  var expectedFilename = 'world_merc';
    
  var source = new Shape(file);
  source.getFilename(function(err, filename) {
    if (err) {
      assert.ifError(err, 'should not error');
      return assert.end();
    }
    assert.ok(err === null);
    assert.deepEqual(filename, expectedFilename);
    assert.end();
  });
});

tape('[SHAPE] Get center', function(assert) {
  var file = testData + '/data/shp/world_merc/world_merc.shp';
  var expectedCenter = [ 0, 12.048603815490733 ];
    
  var source = new Shape(file);
  source.getCenter(function(err, center) {
    if (err) {
      assert.ifError(err, 'should not error');
      return assert.end();
    }
    assert.ok(err === null);
    assert.ok(center[0] > (expectedCenter[0] - 0.0001) && center[0] < (expectedCenter[0] + 0.0001));
    assert.ok(center[1] > (expectedCenter[1] - 0.0001) && center[1] < (expectedCenter[1] + 0.0001));
    assert.end();
  });
});

tape('[SHAPE] Get extent', function(assert) {
  var file = testData + '/data/shp/world_merc/world_merc.shp';
  var expectedExtent = [ -180, -59.47306100000001, 180, 83.57026863098147];
    
  var source = new Shape(file);
  source.getExtent(function(err, extent) {
    if (err) {
      assert.ifError(err, 'should not error');
      return assert.end();
    }
    assert.ok(err === null);
    assert.ok(extent[0] > (expectedExtent[0] - 0.0001) && extent[0] < (expectedExtent[0] + 0.0001));
    assert.ok(extent[1] > (expectedExtent[1] - 0.0001) && extent[1] < (expectedExtent[1] + 0.0001));
    assert.ok(extent[2] > (expectedExtent[2] - 0.0001) && extent[2] < (expectedExtent[2] + 0.0001));
    assert.ok(extent[3] > (expectedExtent[3] - 0.0001) && extent[3] < (expectedExtent[3] + 0.0001));
    assert.end();
  });
});

tape('[SHAPE] Get details', function(assert) {
  var file = testData + '/data/shp/world_merc/world_merc.shp';
  var expectedDetails = expectedMetadata_world_merc.json;
    
  var source = new Shape(file);
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

tape('[SHAPE] Get layers', function(assert) {
  var file = testData + '/data/shp/world_merc/world_merc.shp';
  var expectedLayers = [ 'world_merc' ];
    
  var source = new Shape(file);
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

tape('[SHAPE] Get zooms', function(assert) {
  var file = testData + '/data/shp/world_merc/world_merc.shp';
  var expectedMinzoom = 0;
  var expectedMaxzoom = 5;
    
  var source = new Shape(file);
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