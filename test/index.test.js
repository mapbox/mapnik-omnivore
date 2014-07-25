var assert = require('assert'),
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
/**
 * Testing mapnik-omnivore.digest
 */
describe('[SHAPE] Getting datasources', function() {
    it('should return expected metadata', function(done) {
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
            done();
        });
    });
});
describe('[CSV] Getting datasources', function() {
    it('should return expected metadata', function(done) {
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
            done();
        });
    });
});
describe('[KML] Getting datasources', function() {
    it('should return expected metadata', function(done) {
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
            done();
        });
    });
});
describe('[GeoJson] Getting datasource', function() {
    it('should return expected datasource and layer name', function(done) {
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
            done();
        });
    });
});
describe('[GPX] Getting datasource', function() {
    it('should return expected datasource and layer name', function(done) {
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
            done();
        });
    });
});
describe('Getting filetype ', function() {
    it('should return an error due to incompatible file', function(done) {
        var file = path.resolve('test/data/errors/incompatible.txt');
        mapnik_omnivore.getFileType(file, function(err, type) {
            assert.ok(err instanceof Error);
            assert.equal('EINVALID', err.code);
            assert.equal(err.message, 'Incompatible filetype.');
            done();
        });
    });
});
describe('Getting filetype ', function() {
    it('should return an error due to non-geo CSV file', function(done) {
        var file = path.resolve('test/data/errors/nongeo.csv');
        mapnik_omnivore.getFileType(file, function(err, type) {
            assert.ok(err instanceof Error);
            assert.equal('EINVALID', err.code);
            assert.equal(err.message, 'Incompatible filetype.');
            done();
        });
    });
});
describe('Getting filetype ', function() {
    it('should return an error because file does not exist.', function(done) {
        var file = 'doesnt/exist.shp';
        mapnik_omnivore.getMetadata(file, function(err, configs) {
            assert.ok(err instanceof Error);
            assert.equal('EINVALID', err.code);
            assert.equal(err.message, 'Error getting reading file. File might not exist.');
            done();
        });
    });
});
describe('Getting filetype', function() {
    it('should return postgis when given connection parameters', function(done) {
        var file = { dbname: 'test' };
        mapnik_omnivore.getFileType(file, function(err, type) {
            assert.equal(type, 'postgis');
            done();
        });
    });
});
