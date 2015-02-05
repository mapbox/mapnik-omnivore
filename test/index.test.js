var tape = require('tape'),
    path = require('path'),
    fs = require('fs'),
    testData = path.dirname(require.resolve('mapnik-test-data')),
    mapnik_omnivore = require('../index.js');

//json fixtures
var expectedMetadata_world_merc = JSON.parse(fs.readFileSync(path.resolve('test/fixtures/metadata_world_merc.json')));
var expectedMetadata_fells_loop = JSON.parse(fs.readFileSync(path.resolve('test/fixtures/metadata_fells_loop.json')));
var expectedMetadata_DC_polygon = JSON.parse(fs.readFileSync(path.resolve('test/fixtures/metadata_DC_polygon.json')));
var expectedMetadata_bbl_csv = JSON.parse(fs.readFileSync(path.resolve('test/fixtures/metadata_bbl_current_csv.json')));
var expectedMetadata_1week_earthquake = JSON.parse(fs.readFileSync(path.resolve('test/fixtures/metadata_1week_earthquake.json')));
var expectedMetadata_sample_tif = JSON.parse(fs.readFileSync(path.resolve('test/fixtures/metadata_sample_tif.json')));
var expectedMetadata_sample_vrt = JSON.parse(fs.readFileSync(path.resolve('test/fixtures/metadata_sample_vrt.json')));
var expectedMetadata_topo = JSON.parse(fs.readFileSync(path.resolve('test/fixtures/metadata_topo.json')));

var UPDATE = process.env.UPDATE;

/**
 * Testing mapnik-omnivore.digest
 */
    tape('[SHAPE] Getting datasources: should return expected metadata', function(assert) {
        var file = testData + '/data/shp/world_merc/world_merc.shp';
        mapnik_omnivore.digest(file, function(err, metadata) {
            if (err) {
              assert.ifError(err, 'should not error');
              return assert.end();
            }
            assert.ok(err === null);
            try {
                assert.deepEqual(metadata, expectedMetadata_world_merc);
            } catch (err) {
                console.log(err);
                console.log("Expected mapnik-omnivore metadata has changed. Writing new metadata to file.");
                fs.writeFileSync(path.resolve('test/fixtures/metadata_world_merc.json'), JSON.stringify(metadata));
            }
            assert.end();
        });
    });
    tape('[CSV] Getting datasources: should return expected metadata', function(assert) {
        var file = testData + '/data/csv/bbl_current_csv.csv';
        mapnik_omnivore.digest(file, function(err, metadata) {
            if (err) throw err;
            assert.ok(err === null);
            try {
                assert.deepEqual(metadata, expectedMetadata_bbl_csv);
            } catch (err) {
                console.log(err);
                console.log("Expected mapnik-omnivore metadata has changed. Writing new metadata to file.");
                fs.writeFileSync(path.resolve('test/fixtures/metadata_bbl_current_csv.json'), JSON.stringify(metadata));
            }
            assert.end();
        });
    });
    tape('[KML] Getting datasources: should return expected metadata', function(assert) {
        if (UPDATE) expectedMetadata_1week_earthquake = JSON.parse(fs.readFileSync(path.resolve('test/fixtures/metadata_1week_earthquake.json')));
        var file = testData + '/data/kml/1week_earthquake.kml';
        mapnik_omnivore.digest(file, function(err, metadata) {
            if (err) {
              assert.ifError(err, 'should not error');
              return assert.end();
            }
            assert.ok(err === null);
            try {
                assert.deepEqual(metadata, expectedMetadata_1week_earthquake);
            } catch (err) {
                console.log(err);
                console.log("Expected mapnik-omnivore metadata has changed. Writing new metadata to file.");
                fs.writeFileSync(path.resolve('test/fixtures/metadata_1week_earthquake.json'), JSON.stringify(metadata));
            }
            assert.end();
        });
    });
    tape('[GeoJson] digest function should return expected metadata', function(assert) {
        if (UPDATE) expectedMetadata_DC_polygon = JSON.parse(fs.readFileSync(path.resolve('test/fixtures/metadata_DC_polygon.json')));
        var file = testData + '/data/geojson/DC_polygon.geo.json';
        mapnik_omnivore.digest(file, function(err, metadata) {
            if (err) {
              assert.ifError(err, 'should not error');
              return assert.end();
            }
            assert.ok(err === null);
            try {
                assert.deepEqual(metadata, expectedMetadata_DC_polygon);
            } catch (err) {
                console.log(err);
                console.log("Expected mapnik-omnivore metadata has changed. Writing new metadata to file.");
                fs.writeFileSync(path.resolve('test/fixtures/metadata_DC_polygon.json'), JSON.stringify(metadata, null, 2));
            }
            assert.end();
        });
    });
    tape('[TopoJson] digest function should return expected metadata', function(assert) {
        if (UPDATE) expectedMetadata_topo = JSON.parse(fs.readFileSync(path.resolve('test/fixtures/metadata_topo.json')));
        var file = testData + '/data/topojson/topo.json';
        mapnik_omnivore.digest(file, function(err, metadata) {
            if (err) {
              assert.ifError(err, 'should not error');
              return assert.end();
            }
            assert.ok(err === null);
            try {
                assert.deepEqual(metadata, expectedMetadata_topo);
            } catch (err) {
                console.log(err);
                console.log("Expected mapnik-omnivore metadata has changed. Writing new metadata to file.");
                fs.writeFileSync(path.resolve('test/fixtures/metadata_topo.json'), JSON.stringify(metadata, null, 2));
            }
            assert.end();
        });
    });
    tape('[RASTER] digest function should return expected metadata', function(assert) {
        if (UPDATE) expectedMetadata_sample_tif = JSON.parse(fs.readFileSync(path.resolve('test/fixtures/metadata_sample_tif.json')));

        var file = testData + '/data/geotiff/sample.tif';

        var trunc_6 = function(val) {
            return Number(val.toFixed(6));
        };

        mapnik_omnivore.digest(file, function(err, metadata) {
            if (err) {
              assert.ifError(err, 'should not error');
              return assert.end();
            }
            assert.ok(err === null);

            //Round extent values to avoid floating point discrepancies in Travis
            metadata.center[0] = trunc_6(metadata.center[0]);
            metadata.center[1] = trunc_6(metadata.center[1]);
            metadata.extent[0] = trunc_6(metadata.extent[0]);
            metadata.extent[1] = trunc_6(metadata.extent[1]);
            metadata.extent[2] = trunc_6(metadata.extent[2]);
            metadata.extent[3] = trunc_6(metadata.extent[3]);
            expectedMetadata_sample_tif.center[0] = trunc_6(expectedMetadata_sample_tif.center[0]);
            expectedMetadata_sample_tif.center[1] = trunc_6(expectedMetadata_sample_tif.center[1]);
            expectedMetadata_sample_tif.extent[0] = trunc_6(expectedMetadata_sample_tif.extent[0]);
            expectedMetadata_sample_tif.extent[1] = trunc_6(expectedMetadata_sample_tif.extent[1]);
            expectedMetadata_sample_tif.extent[2] = trunc_6(expectedMetadata_sample_tif.extent[2]);
            expectedMetadata_sample_tif.extent[3] = trunc_6(expectedMetadata_sample_tif.extent[3]);

            //Round pixelsize and band mean/std_dev values for slight differences in Travis
            var bands_meta = metadata.raster.bands;
            bands_meta.forEach(function(b) {
              b.stats.mean = trunc_6(b.stats.mean);
              b.stats.std_dev = trunc_6(b.stats.std_dev);
            });

            var bands_expected = expectedMetadata_sample_tif.raster.bands;
            bands_expected.forEach(function(b) {
              b.stats.mean = trunc_6(b.stats.mean);
              b.stats.std_dev = trunc_6(b.stats.std_dev);
            });

            var pixelSize_meta = metadata.raster.pixelSize;
            pixelSize_meta[0] = trunc_6(pixelSize_meta[0]);
            pixelSize_meta[1] = trunc_6(pixelSize_meta[1]);

            var pixelSize_expected = expectedMetadata_sample_tif.raster.pixelSize;
            pixelSize_expected[0] = trunc_6(pixelSize_expected[0]);
            pixelSize_expected[1] = trunc_6(pixelSize_expected[1]);

            try {
                assert.deepEqual(metadata, expectedMetadata_sample_tif);
            } catch (err) {
                console.log(err);
                console.log("Expected mapnik-omnivore metadata has changed. Writing new metadata to file.");
                fs.writeFileSync(path.resolve('test/fixtures/metadata_sample_tif.json'), JSON.stringify(metadata, null, 2));
            }
            assert.end();
        });
    });
    tape('[VRT] digest function should return expected metadata', function(assert) {
        if (UPDATE) expectedMetadata_sample_vrt = JSON.parse(fs.readFileSync(path.resolve('test/fixtures/metadata_sample_vrt.json')));

        var file = testData + '/data/vrt/sample.vrt';

        var trunc_6 = function(val) {
            return Number(val.toFixed(6));
        };

        mapnik_omnivore.digest(file, function(err, metadata) {
            if (err) {
              assert.ifError(err, 'should not error');
              return assert.end();
            }
            assert.ok(err === null);

            //Round extent values to avoid floating point discrepancies in Travis
            metadata.center[0] = trunc_6(metadata.center[0]);
            metadata.center[1] = trunc_6(metadata.center[1]);
            metadata.extent[0] = trunc_6(metadata.extent[0]);
            metadata.extent[1] = trunc_6(metadata.extent[1]);
            metadata.extent[2] = trunc_6(metadata.extent[2]);
            metadata.extent[3] = trunc_6(metadata.extent[3]);
            expectedMetadata_sample_vrt.center[0] = trunc_6(expectedMetadata_sample_vrt.center[0]);
            expectedMetadata_sample_vrt.center[1] = trunc_6(expectedMetadata_sample_vrt.center[1]);
            expectedMetadata_sample_vrt.extent[0] = trunc_6(expectedMetadata_sample_vrt.extent[0]);
            expectedMetadata_sample_vrt.extent[1] = trunc_6(expectedMetadata_sample_vrt.extent[1]);
            expectedMetadata_sample_vrt.extent[2] = trunc_6(expectedMetadata_sample_vrt.extent[2]);
            expectedMetadata_sample_vrt.extent[3] = trunc_6(expectedMetadata_sample_vrt.extent[3]);

            //Round pixelsize and band mean/std_dev values for slight differences in Travis
            var bands_meta = metadata.raster.bands;
            bands_meta.forEach(function(b) {
              b.stats.mean = trunc_6(b.stats.mean);
              b.stats.std_dev = trunc_6(b.stats.std_dev);
            });

            var bands_expected = expectedMetadata_sample_vrt.raster.bands;
            bands_expected.forEach(function(b) {
              b.stats.mean = trunc_6(b.stats.mean);
              b.stats.std_dev = trunc_6(b.stats.std_dev);
            });

            var pixelSize_meta = metadata.raster.pixelSize;
            pixelSize_meta[0] = trunc_6(pixelSize_meta[0]);
            pixelSize_meta[1] = trunc_6(pixelSize_meta[1]);

            var pixelSize_expected = expectedMetadata_sample_vrt.raster.pixelSize;
            pixelSize_expected[0] = trunc_6(pixelSize_expected[0]);
            pixelSize_expected[1] = trunc_6(pixelSize_expected[1]);

            try {
                assert.deepEqual(metadata, expectedMetadata_sample_vrt);
            } catch (err) {
                console.log(err);
                console.log("Expected mapnik-omnivore metadata has changed. Writing new metadata to file.");
                fs.writeFileSync(path.resolve('test/fixtures/metadata_sample_vrt.json'), JSON.stringify(metadata, null, 2));
            }
            assert.end();
        });
    });
    tape('[GPX] Getting datasource: should return expected datasource and layer name', function(assert) {
        var file = testData + '/data/gpx/fells_loop.gpx';
        var expectedLayers = ['waypoints', 'routes', 'route_points'];
        mapnik_omnivore.digest(file, function(err, metadata) {
            if (err) {
              assert.ifError(err, 'should not error');
              return assert.end();
            }
            assert.ok(err === null);
            try {
                assert.deepEqual(metadata, expectedMetadata_fells_loop);
            } catch (err) {
                console.log(err);
                console.log("Expected mapnik-omnivore metadata has changed. Writing new metadata to file.");
                fs.writeFileSync(path.resolve('test/fixtures/metadata_fells_loop.json'), JSON.stringify(metadata));
            }
            assert.end();
        });
    });
    tape('Getting filetype: should return an error due to incompatible file', function(assert) {
        var file = path.resolve('test/data/errors/incompatible.txt');
        mapnik_omnivore.digest(file, function(err, result) {
            assert.ok(err instanceof Error);
            assert.equal('EINVALID', err.code);
            assert.equal(err.message, 'Unknown filetype');
            assert.end();
        });
    });
    tape('Getting filetype: should return an error due to non-geo CSV file', function(assert) {
        var file = path.resolve('test/data/errors/nongeo.csv');
        mapnik_omnivore.digest(file, function(err, result) {
            assert.ok(err instanceof Error);
            assert.equal('EINVALID', err.code);
            assert.equal(err.message, 'Unknown filetype');
            assert.end();
        });
    });
    tape('Getting filetype: should return an error because file does not exist.', function(assert) {
        var file = 'doesnt/exist.shp';
        mapnik_omnivore.digest(file, function(err, result) {
            assert.ok(err instanceof Error);
            assert.equal('ENOENT', err.code);
            assert.equal(err.message, 'ENOENT, open \'doesnt/exist.shp\'');
            assert.end();
        });
    });
