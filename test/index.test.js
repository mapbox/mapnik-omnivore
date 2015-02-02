var tape = require('tape'),
    path = require('path'),
    fs = require('fs'),
    testData = path.dirname(require.resolve('mapnik-test-data')),
    mapnik_omnivore = require('../index.js'),
    queue = require('queue-async');
//json fixtures
var expectedMetadata_world_merc = JSON.parse(fs.readFileSync(path.resolve('test/fixtures/metadata_world_merc.json')));
var expectedMetadata_fells_loop = JSON.parse(fs.readFileSync(path.resolve('test/fixtures/metadata_fells_loop.json')));
var expectedMetadata_DC_polygon = JSON.parse(fs.readFileSync(path.resolve('test/fixtures/metadata_DC_polygon.json')));
var expectedMetadata_bbl_csv = JSON.parse(fs.readFileSync(path.resolve('test/fixtures/metadata_bbl_current_csv.json')));
var expectedMetadata_1week_earthquake = JSON.parse(fs.readFileSync(path.resolve('test/fixtures/metadata_1week_earthquake.json')));
/**
 * Testing mapnik-omnivore.digest
 */
    tape('[SHAPE] Getting datasources: should return expected metadata', function(assert) {
        var file = testData + '/data/shp/world_merc/world_merc.shp';
        mapnik_omnivore.digest(file, function(err, metadata) {
            if (err) return done(err);
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
            if (err) return done(err);
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
        var file = testData + '/data/kml/1week_earthquake.kml';
        mapnik_omnivore.digest(file, function(err, metadata) {
            if (err) return done(err);
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
    tape('[GeoJson] Getting datasource: should return expected datasource and layer name', function(assert) {
        var file = testData + '/data/geojson/DC_polygon.geo.json';
        mapnik_omnivore.digest(file, function(err, metadata) {
            if (err) return done(err);
            assert.ok(err === null);
            try {
                assert.deepEqual(metadata, expectedMetadata_DC_polygon);
            } catch (err) {
                console.log(err);
                console.log("Expected mapnik-omnivore metadata has changed. Writing new metadata to file.");
                fs.writeFileSync(path.resolve('test/fixtures/metadata_DC_polygon.json'), JSON.stringify(metadata));
            }
            assert.end();
        });
    });
    tape('[GPX] Getting datasource: should return expected datasource and layer name', function(assert) {
        var file = testData + '/data/gpx/fells_loop.gpx';
        var expectedLayers = ['waypoints', 'routes', 'tracks'];
        mapnik_omnivore.digest(file, function(err, metadata) {
            if (err) return done(err);
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
        mapnik_omnivore.getFileType(file, function(err, type) {
            assert.ok(err instanceof Error);
            assert.equal('EINVALID', err.code);
            assert.equal(err.message, 'Incompatible filetype.');
            assert.end();
        });
    });
    tape('Getting filetype: should return an error due to non-geo CSV file', function(assert) {
        var file = path.resolve('test/data/errors/nongeo.csv');
        mapnik_omnivore.getFileType(file, function(err, type) {
            assert.ok(err instanceof Error);
            assert.equal('EINVALID', err.code);
            assert.equal(err.message, 'Incompatible filetype.');
            assert.end();
        });
    });
    tape('Getting filetype: should return an error because file does not exist.', function(assert) {
        var file = 'doesnt/exist.shp';
        mapnik_omnivore.getMetadata(file, function(err, configs) {
            assert.ok(err instanceof Error);
            assert.equal('EINVALID', err.code);
            assert.equal(err.message, 'Error getting stats from file. File might not exist.');
            assert.end();
        });
    });

    tape('should mark geojson invalid unless it is a FeatureCollection', function(assert) {
        var invalidGeojsonFiles = path.resolve(__dirname, 'fixtures', 'invalid-geojson');
        fs.readdir(invalidGeojsonFiles, function(err, files) {
            if (err) throw err;

            var q = queue();

            files.forEach(function(filename) {
                filename = path.join(invalidGeojsonFiles, filename);
                q.defer(function(next) {
                    mapnik_omnivore.getMetadata(filename, function(err, metadata) {
                        assert.ok(err instanceof Error, 'expected error');
                        assert.equal(err.code, 'EINVALID', 'expected error code');
                        next();
                    });
                });
            });

            q.await(function() {
                assert.end();
            });
        });
    });
