var tape = require('tape');
var path = require('path');
var fs = require('fs');
var testData = path.dirname(require.resolve('mapnik-test-data'));
var Raster = require('../lib/raster.js');
var expectedMetadata_sample_tif = JSON.parse(fs.readFileSync(path.resolve('test/fixtures/metadata_sample_tif.json')));
var expectedMetadata_sample_vrt = JSON.parse(fs.readFileSync(path.resolve('test/fixtures/metadata_sample_vrt.json')));

/**
 * Testing Raster functions
 */
tape('[TIFF] Setting up constructor', function(assert) {
  var file = testData + '/data/geotiff/sample.tif';
  var expectedBasename = 'sample';
  var expectedProjection = '+proj=aea +lat_1=29.5 +lat_2=45.5 +lat_0=23 +lon_0=-96 +x_0=0 +y_0=0 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs';
  var expectedDetails = {
    width: 984,
    height: 804,
    pixelSize: [
      7.502071930146189,
      -7.502071930145942
    ],
    origin: [
      -1134675.2952829634,
      2485710.4658232867
    ]
  };
  var result = new Raster(file);

  assert.ok(result);
  assert.ok(result.basename);
  assert.ok(result.details);
  assert.ok(result.projection);
  assert.ok(typeof result.details == 'object');
  assert.deepEqual(result.basename, expectedBasename);
  assert.deepEqual(result.projection, expectedProjection);
  assert.deepEqual(result.details, expectedDetails);
  assert.end();
});

tape('[VRT] Setting up constructor', function(assert) {
  var file = testData + '/data/vrt/sample.vrt';
  var expectedBasename = 'sample';
  var expectedProjection = '+proj=aea +lat_1=29.5 +lat_2=45.5 +lat_0=23 +lon_0=-96 +x_0=0 +y_0=0 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs';
  var expectedDetails = {
    width: 984,
    height: 804,
    pixelSize: [
      7.502071930146189,
      -7.502071930145942
    ],
    origin: [
      -1134675.2952829634,
      2485710.4658232867
    ]
  };
  var result = new Raster(file);

  assert.ok(result);
  assert.ok(result.basename);
  assert.ok(result.details);
  assert.ok(result.projection);
  assert.ok(typeof result.details == 'object');
  assert.deepEqual(result.basename, expectedBasename);
  assert.deepEqual(result.projection, expectedProjection);
  assert.deepEqual(result.details, expectedDetails);
  assert.end();
});

tape('[VRT] Invalid VRT', function(assert) {
  var fixture = path.join(__dirname, 'fixtures', 'invalid.malformed.vrt');
  assert.throws(function() {
    new Raster(fixture);
  }, 'throws an error');

  assert.end();
});

tape('[TIFF] Get projection', function(assert) {
  var file = testData + '/data/geotiff/sample.tif';
  var expectedProjection = '+proj=aea +lat_1=29.5 +lat_2=45.5 +lat_0=23 +lon_0=-96 +x_0=0 +y_0=0 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs';
  var source = new Raster(file);

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

tape('[VRT] Get projection', function(assert) {
  var file = testData + '/data/vrt/sample.vrt';
  var expectedProjection = '+proj=aea +lat_1=29.5 +lat_2=45.5 +lat_0=23 +lon_0=-96 +x_0=0 +y_0=0 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs';
  var source = new Raster(file);

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

tape('[VRT] Invalid projection', function(assert) {
  var fixture = path.join(__dirname, 'fixtures', 'invalid-projection-vrt', 'invalid.projection.vrt');
  assert.throws(function() {
    new Raster(fixture);
  }, 'throws an error');

  assert.end();
});

tape('[TIFF] Get center', function(assert) {
  var file = testData + '/data/geotiff/sample.tif';
  var expectedCenter = [-110.32476292309875, 44.56502238336985];
  var source = new Raster(file);

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

tape('[VRT] Get center', function(assert) {
  var file = testData + '/data/vrt/sample.vrt';
  var expectedCenter = [-110.32476292309875, 44.56502238336985];
  var source = new Raster(file);

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

tape('[TIFF] Get extent', function(assert) {
  var file = testData + '/data/geotiff/sample.tif';
  var expectedExtent = [-110.3650933429331, 44.53327824851143, -110.28443250326441, 44.596766518228264];
  var source = new Raster(file);

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

tape('[VRT] Get extent', function(assert) {
  var file = testData + '/data/vrt/sample.vrt';
  var expectedExtent = [-110.3650933429331, 44.53327824851143, -110.28443250326441, 44.596766518228264];
  var source = new Raster(file);

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

tape('[VRT] Invalid georeference', function(assert) {
  var fixture = path.join(__dirname, 'fixtures', 'invalid.malformed.vrt');
  assert.throws(function() {
    new Raster(fixture);
  }, 'throws an error');

  assert.end();
});

tape('[TIFF] Get details', function(assert) {
  var file = testData + '/data/geotiff/sample.tif';
  var expectedDetails = expectedMetadata_sample_tif.raster;
  var source = new Raster(file);

  function truncate(val) {
    return Number(val.toFixed(6));
  }

  source.getDetails(function(err, details) {
    if (err) {
      assert.ifError(err, 'should not error');
      return assert.end();
    }

    var bandMetadata = details.bands;
    var expectedBands = expectedDetails.bands;
    var expectedPixelSize = expectedDetails.pixelSize;
    var pixelSizeFound = details.pixelSize;

    //Round pixelsize and band mean/std_dev values for slight differences from Travis
    bandMetadata.forEach(function(b) {
      b.stats.mean = truncate(b.stats.mean);
      b.stats.std_dev = truncate(b.stats.std_dev);
    });

    expectedBands.forEach(function(b) {
      b.stats.mean = truncate(b.stats.mean);
      b.stats.std_dev = truncate(b.stats.std_dev);
    });

    expectedPixelSize[0] = truncate(expectedPixelSize[0]);
    expectedPixelSize[1] = truncate(expectedPixelSize[1]);

    pixelSizeFound[0] = truncate(pixelSizeFound[0]);
    pixelSizeFound[1] = truncate(pixelSizeFound[1]);

    assert.ok(err === null);
    assert.deepEqual(details, expectedDetails);
    assert.end();
  });
});

tape('[VRT] Get details', function(assert) {
  var file = testData + '/data/vrt/sample.vrt';
  var expectedDetails = expectedMetadata_sample_vrt.raster;
  var source = new Raster(file);

  function truncate(val) {
    return Number(val.toFixed(6));
  }

  source.getDetails(function(err, details) {
    if (err) {
      assert.ifError(err, 'should not error');
      return assert.end();
    }

    var bandMetadata = details.bands;
    var expectedBands = expectedDetails.bands;
    var expectedPixelSize = expectedDetails.pixelSize;
    var pixelSizeFound = details.pixelSize;

    //Round pixelsize and band mean/std_dev values for slight differences from Travis
    bandMetadata.forEach(function(b) {
      b.stats.mean = truncate(b.stats.mean);
      b.stats.std_dev = truncate(b.stats.std_dev);
    });

    expectedBands.forEach(function(b) {
      b.stats.mean = truncate(b.stats.mean);
      b.stats.std_dev = truncate(b.stats.std_dev);
    });

    expectedPixelSize[0] = truncate(expectedPixelSize[0]);
    expectedPixelSize[1] = truncate(expectedPixelSize[1]);

    pixelSizeFound[0] = truncate(pixelSizeFound[0]);
    pixelSizeFound[1] = truncate(pixelSizeFound[1]);

    assert.ok(err === null);
    assert.deepEqual(details, expectedDetails);
    assert.end();
  });
});

tape('[TIFF] Get layers', function(assert) {
  var file = testData + '/data/geotiff/sample.tif';
  var expectedLayers = ['sample'];
  var source = new Raster(file);

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

tape('[VRT] Get layers', function(assert) {
  var file = testData + '/data/vrt/sample.vrt';
  var expectedLayers = ['sample'];
  var source = new Raster(file);

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

tape('[TIFF] Get zooms', function(assert) {
  var file = testData + '/data/geotiff/sample.tif';
  var expectedMinzoom = 9;
  var expectedMaxzoom = 15;
  var source = new Raster(file);

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

tape('[VRT] Get zooms', function(assert) {
  var file = testData + '/data/vrt/sample.vrt';
  var expectedMinzoom = 9;
  var expectedMaxzoom = 15;
  var source = new Raster(file);

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

tape('[TIFF] Multi-band', function(assert) {
  var file = testData + '/data/geotiff/DC_rgb.tif';
  var source = new Raster(file);
  var bands = source.getBands();

  assert.equal(bands.length, 4);

  assert.end();
});
