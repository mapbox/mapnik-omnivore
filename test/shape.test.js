var tape = require('tape');
var path = require('path');
var fs = require('fs');
var testData = path.dirname(require.resolve('mapnik-test-data'));
var Shape = require('../lib/shape.js');
var expectedMetadata_world_merc = JSON.parse(fs.readFileSync(path.resolve('test/fixtures/metadata_world_merc.json')));

/**
 * Testing Shape functions
 */
tape('[SHAPE] Setting up constructor', function(assert) {
  var file = testData + '/data/shp/world_merc/world_merc.shp';
  var expectedBasename = 'world_merc';
  var result = new Shape(file);

  assert.ok(result);
  assert.ok(result.basename);
  assert.deepEqual(result.basename, expectedBasename);
  assert.end();
});

tape('[SHAPE] Get center', function(assert) {
  var file = testData + '/data/shp/world_merc/world_merc.shp';
  var expectedCenter = [0, 12.048603815490733];
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
  var expectedExtent = [-180, -59.47306100000001, 180, 83.57026863098147];
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
  var expectedLayers = ['world_merc'];
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
  var expectedMaxzoom = 6;
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

tape('[SHAPE] Get projection', function(assert) {
  var file = testData + '/data/shp/world_merc/world_merc.shp';
  var expectedProjection = '+proj=merc +a=6378137 +b=6378137 +lat_ts=0.0 +lon_0=0.0 +x_0=0.0 +y_0=0.0 +k=1.0 +units=m +nadgrids=@null +wktext +no_defs +over';
  var source = new Shape(file);

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

tape('[SHAPE] shp with projection mapnik cannot parse', function(assert) {
  var file = path.resolve(__dirname, 'fixtures', 'invalid-proj-mapnik-shp', 'invalidProjection.shp');
  var source = new Shape(file);
  source.getProjection(function(err) {
    assert.ok(err, 'expected error');
    assert.equal(err.code, 'EINVALID', 'expected error code');
    assert.end();
  });
});

tape('[SHAPE] getProjection: shp with invalid projection', function(assert) {
  var file = path.join(__dirname, 'fixtures', 'invalid-proj-shp', 'invalidProjection.shp');
  var source = new Shape(file);
  source.getProjection(function(err, projection) {
    assert.ok(err, 'expected error');
    assert.notOk(projection, 'no projection returned');
    assert.end();
  });
});

tape('[SHAPE] getProjection: shp with missing projection', function(assert) {
  var file = path.join(__dirname, 'fixtures', 'missing-proj-shp', 'missingProjection.shp');
  var source = new Shape(file);
  source.getProjection(function(err, projection) {
    assert.ok(err, 'expected error');
    assert.notOk(projection, 'no projection returned');
    assert.end();
  });
});

tape('[SHAPE] getProjection: shp with undefined proj4 string', function(assert) {
  var file = path.join(__dirname, 'fixtures', 'undefined-proj-shp', 'undefinedProjection.shp');
  var source = new Shape(file);
  source.getProjection(function(err, projection) {
    assert.ok(err, 'expected error');
    assert.notOk(projection, 'no projection returned');
    assert.end();
  });
});
