var tape = require('tape'),
    path = require('path'),
    fs = require('fs'),
    mapnik = require('mapnik'),
    testData = path.dirname(require.resolve('mapnik-test-data')),
    Raster = require('../lib/raster.js');

/**
 * Testing Raster functions
 */
tape('[Raster] Setting up constructor', function(assert) {
    var file = testData + '/data/geotiff/sample.tif';

    var expectedFilename = 'sample';
    var expectedProjection = '+proj=aea +lat_1=29.5 +lat_2=45.5 +lat_0=23 +lon_0=-96 +x_0=0 +y_0=0 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs';
    var expectedDetails = {
      "width": 984,
      "height": 804,
      "pixelSize": [
        7.502071930146189,
        7.502071930145942
      ],
      "origin": [
        -1134675.2952829634,
        2485710.4658232867
      ]
    };

    var result = new Raster(file);

    assert.ok(result);
    assert.ok(result.filename);
    assert.ok(result.details);
    assert.ok(result.projection);
    assert.ok(typeof result.details == 'object');
    assert.deepEqual(result.filename, expectedFilename);
    assert.deepEqual(result.projection, expectedProjection);
    assert.deepEqual(result.details, expectedDetails);
    assert.end();
});

tape('[Raster] Get filename', function(assert) {
    var file = testData + '/data/geotiff/sample.tif';
    var expectedFilename = 'sample';
    
    var source = new Raster(file);
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


tape('[Raster] Get projection', function(assert) {
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

tape('[Raster] Get center', function(assert) {
    var file = testData + '/data/geotiff/sample.tif';
    var expectedCenter = [ -110.32476292309875, 44.56502238336985 ];
    
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

tape('[Raster] Get extent', function(assert) {
    var file = testData + '/data/geotiff/sample.tif';
    var expectedExtent = [ -110.3650933429331, 44.53327824851143, -110.28443250326441, 44.596766518228264];
    
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

tape('[Raster] Get details', function(assert) {
    var file = testData + '/data/geotiff/sample.tif';
    var trunc_6 = function(val) {
        return Number(val.toFixed(6));
    };

    var expectedDetails = {
      "pixelSize": [
        7.502071930146189,
        7.502071930145942
      ],
      "bandCount": 1,
      "bands": [
        {
          "stats": {
            "min": 0,
            "max": 100,
            "mean": 29.725628716175223,
            "std_dev": 36.98885954363488
          },
          "scale": 1,
          "unitType": "",
          "rasterDatatype": "Byte",
          "categoryNames": [],
          "hasArbitraryOverviews": false,
          "overviews": {},
          "nodata": null,
          "id": 1,
          "blockSize": {
            "x": 984,
            "y": 8
          },
          "color": "Gray"
        }
      ],
      "nodata": null,
      "origin": [
        -1134675.2952829634,
        2485710.4658232867
      ],
      "width": 984,
      "height": 804,
      "units": {
        "linear": {
          "value": 1,
          "units": "Meter"
        },
        "angular": {
          "value": 0.0174532925199433,
          "units": "degree"
        }
      }
    };
    
    var source = new Raster(file);
    source.getDetails(function(err, details) {
      if (err) {
        assert.ifError(err, 'should not error');
        return assert.end();
      }

      assert.ok(err === null);

      //Round band mean/std_dev values for slight differences from Travis
      var bands_meta = details.bands;
      bands_meta.forEach(function(b) {
        b.stats.mean = trunc_6(b.stats.mean);
        b.stats.std_dev = trunc_6(b.stats.std_dev);
      });
      var bands_expected = expectedDetails.bands;
      bands_expected.forEach(function(b) {
        b.stats.mean = trunc_6(b.stats.mean);
        b.stats.std_dev = trunc_6(b.stats.std_dev);
      });

      assert.deepEqual(details, expectedDetails);
      assert.end();
    });
});

tape('[Raster] Get layers', function(assert) {
    var file = testData + '/data/geotiff/sample.tif';
    var expectedLayers = [ 'sample' ];
    
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

tape('[Raster] Get zooms', function(assert) {
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





