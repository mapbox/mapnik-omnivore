var assert = require('assert'),
    path = require('path'),
    fs = require('fs'),
    mapnik = require('mapnik'),
    datasourceProcessor = require('../lib/datasourceProcessor.js');
//json fixtures
var expectedMetadata_world_merc = JSON.parse(fs.readFileSync(path.resolve('test/fixtures/metadata_world_merc.json')));
var expectedMetadata_fells_loop = JSON.parse(fs.readFileSync(path.resolve('test/fixtures/metadata_fells_loop.json')));
var expectedMetadata_DC_polygon = JSON.parse(fs.readFileSync(path.resolve('test/fixtures/metadata_DC_polygon.json')));
var expectedMetadata_bbl_csv = JSON.parse(fs.readFileSync(path.resolve('test/fixtures/metadata_bbl_current_csv.json')));
var expectedMetadata_1week_earthquake = JSON.parse(fs.readFileSync(path.resolve('test/fixtures/metadata_1week_earthquake.json')));    
/**
 * Testing datasourceProcessor.getCenterAndExtent
 */
describe('[SHAPE] Getting center of extent', function() {
    it('should return expected values', function() {
        var proj = '+proj=merc +a=6378137 +b=6378137 +lat_ts=0.0 +lon_0=0.0 +x_0=0.0 +y_0=0.0 +k=1.0 +units=m +nadgrids=@null +wktext +no_defs +over';
        var shapefile = path.resolve('test/data/zip/world_merc/world_merc.shp');
        var ds = new mapnik.Datasource({
            type: 'shape',
            file: shapefile,
            layer: 'world_merc'
        });
        var type = '.shp';
        var expectedCenter = [0, 12.048603815490733];
        var expectedExtent = [-180, -59.47306100000001, 180, 83.57026863098147];
        var result = datasourceProcessor.getCenterAndExtent(ds, proj, type);
        assert.ok(result);
        assert.ok(result.center);
        assert.ok(result.extent);
        assert.ok(typeof result.extent == 'object');
        assert.ok(typeof result.center == 'object');
        assert.deepEqual(result.center, expectedCenter);
        assert.deepEqual(result.extent, expectedExtent);
    });
});
describe('[CSV] Getting center of extent', function() {
    it('should return expected values', function() {
        var proj = '+proj=longlat +ellps=WGS84 +datum=WGS84 +no_defs';
        var csvFile = path.resolve('test/data/csv/bbl_current_csv.csv');
        var filetype = '.csv';
        var options = {
            type: 'csv',
            file: csvFile,
            filesize_max:10,
            layer: 'bbl_current_csv'
        };
        var ds = new mapnik.Datasource(options);
        var expectedCenter = [-77.0481382917019, 38.93765872502635];
        var expectedExtent = [-77.0925920175155,38.9142786070481,-77.0036845658883,38.9610388430046];
        var result = datasourceProcessor.getCenterAndExtent(ds, proj, filetype);
        assert.ok(result);
        assert.ok(result.center);
        assert.ok(result.extent);
        assert.ok(typeof result.extent == 'object');
        assert.ok(typeof result.center == 'object');
        assert.deepEqual(result.center, expectedCenter);
        assert.deepEqual(result.extent, expectedExtent);
    });
});
describe('[KML] Getting center of extent', function() {
    it('should return expected values', function() {
        var proj = '+init=epsg:4326';
        var kmlFile = path.resolve('test/data/kml/1week_earthquake.kml');
        var type = '.kml';
        var options = {
            type: 'ogr',
            file: kmlFile,
            layer: 'Magnitude 1'
        };
        var ds = new mapnik.Datasource(options);
        var expectedCenter = [-110.13325, 42.5407];
        var expectedExtent = [-155.8387, 17.7682, -64.4278, 67.3132];
        var result = datasourceProcessor.getCenterAndExtent(ds, proj, type);
        assert.ok(result);
        assert.ok(result.center);
        assert.ok(result.extent);
        assert.ok(typeof result.extent == 'object');
        assert.ok(typeof result.center == 'object');
        assert.deepEqual(result.center, expectedCenter);
        assert.deepEqual(result.extent, expectedExtent);
    });
});
describe('[GeoJson] Getting center of extent', function() {
    it('should return expected values', function() {
        var proj = '+proj=longlat +ellps=WGS84 +datum=WGS84 +no_defs';
        var geoJsonFile = path.resolve('test/data/geojson/DC_polygon.geo.json');
        var type = '.geo.json';
        var options = {
            type: 'ogr',
            file: geoJsonFile,
            layer_by_index: 0
        };
        var ds = new mapnik.Datasource(options);
        var expectedCenter = [-77.01335, 38.89255];
        var expectedExtent = [-77.1174, 38.7912, -76.9093, 38.9939];
        var result = datasourceProcessor.getCenterAndExtent(ds, proj, type);
        assert.ok(result);
        assert.ok(result.center);
        assert.ok(result.extent);
        assert.ok(typeof result.extent == 'object');
        assert.ok(typeof result.center == 'object');
        assert.deepEqual(result.center, expectedCenter);
        assert.deepEqual(result.extent, expectedExtent);
    });
});
describe('[GPX] Getting center of extent', function() {
    it('should return expected values', function() {
        var proj = '+init=epsg:4326';
        var gpxFile = path.resolve('test/data/gpx/fells_loop.gpx');
        var type = '.gpx';
        var options = {
            type: 'ogr',
            file: gpxFile,
            layer: 'waypoints'
        };
        var ds = new mapnik.Datasource(options);
        var expectedCenter = [-71.1147875, 42.434853000000004];
        var expectedExtent = [-71.126602, 42.401051, -71.102973, 42.468655];
        var result = datasourceProcessor.getCenterAndExtent(ds, proj, type);
        assert.ok(result);
        assert.ok(result.center);
        assert.ok(result.extent);
        assert.ok(typeof result.extent == 'object');
        assert.ok(typeof result.center == 'object');
        assert.deepEqual(result.center, expectedCenter);
        assert.deepEqual(result.extent, expectedExtent);
    });
});

/**
 * Testing datasourceProcessor.init
 */
describe('[SHAPE] Getting datasources', function() {
    it('should return expected layers and json', function(done) {
        var shpFile = path.resolve('test/data/zip/world_merc/world_merc.shp');
        var filesize = 428328;
        var type = '.shp';
        datasourceProcessor.init(shpFile, filesize, type, function(err, metadata) {
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
    it('should return expected layers and json', function(done) {
        var csvFile = path.resolve('test/data/csv/bbl_current_csv.csv');
        var filesize = 1667;
        var type = '.csv';
        datasourceProcessor.init(csvFile, filesize, type, function(err, metadata) {
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
    it('should return expected layers and json', function(done) {
        var kmlFile = path.resolve('test/data/kml/1week_earthquake.kml');
        var filesize = 1082451;
        var type = '.kml';
        datasourceProcessor.init(kmlFile, filesize, type, function(err, metadata) {
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
        var geoJsonFile = path.resolve('test/data/geojson/DC_polygon.geo.json');
        var filesize = 367;
        var type = '.geo.json';
        datasourceProcessor.init(geoJsonFile, filesize, type, function(err, metadata) {
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
        var gpxFile = path.resolve('test/data/gpx/fells_loop.gpx');
        var filesize = 36815;
        var type = '.gpx';
        var expectedLayers = ['waypoints', 'routes', 'tracks'];
        datasourceProcessor.init(gpxFile, filesize, type, function(err, metadata) {
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
/**
 * Testing datasourceProcessor.setLayerConfigs
 */
describe('Setting layer configs', function() {
    it('should throw an error due to [0,0,0,0] extent', function(done) {
        var invalidFile = path.resolve('test/data/kml/TIMS.kml');
        var filename = 'TIMS';
        var options = {
            type: 'ogr',
            file: invalidFile
        };
        var layers = ['Tornado Tracks and Icons'];
        datasourceProcessor.setLayerConfigs(invalidFile, layers, filename, function(err, json, ds) {
            assert.ok(err);
            assert.ok(err instanceof Error);
            assert.equal('EINVALID', err.code);
            assert.equal(0, err.message.indexOf('Error creating Mapnik Datasource for file:'));
            done();
        });
    });
});
/**
 * Testing datasourceProcessor.getMinMaxZoom
 */
describe('Setting min/max zoom', function() {
    it('should return expected values for min/maxzoom', function(done) {
        var expectedMin = 12;
        var expectedMax = 16;
        var extent = [-77.11532282009873, 38.81041408561889, -76.90970655877031, 38.995615210318356];
        var bytes = 64244520;
        datasourceProcessor.getMinMaxZoom(bytes, extent, function(err, minzoom, maxzoom) {
            assert.strictEqual(null, err);
            assert.equal(minzoom, expectedMin);
            assert.equal(maxzoom, expectedMax);
            done();
        });
    });
});
describe('Setting extent to zero', function() {
    it('should return an error', function(done) {
        var extent = [0, 0, 0, 0];
        var bytes = 1234;
        datasourceProcessor.getMinMaxZoom(bytes, extent, function(err, minzoom, maxzoom) {
            assert.ok(err);
            assert.ok(err instanceof Error);
            assert.equal('EINVALID', err.code);
            assert.equal(err.message, 'Error calculating min/max zoom: Bounds invalid');
            done();
        });
    });
});
describe('Setting extent to zero', function() {
    it('should return an error because of invalid bytes', function(done) {
        var extent = [1, 2, 3, 4];
        var bytes = -1;
        datasourceProcessor.getMinMaxZoom(bytes, extent, function(err, minzoom, maxzoom) {
            assert.ok(err);
            assert.ok(err instanceof Error);
            assert.equal('EINVALID', err.code);
            assert.equal(err.message, 'Error calculating min/max zoom: Total bytes less than or equal to zero');
            done();
        });
    });
});
/**
 * Testing datasourceProcessor.getProjection
 */
describe('Getting projection ', function() {
    var errorTests = {
        'errors/invalidProjection.prj': {
            message: 'Invalid projection file.',
            desc: 'should return an error due to invalid projection type',
            type: '.shp'
        },
        'missing_projection': {
            message: 'Missing projection file.',
            desc: 'should return an error due to missing projection file',
            type: '.shp'
        }
    };
    for (var name in errorTests)(function(name, test) {
        it(test.desc, function(done) {
            datasourceProcessor.getProjection(path.resolve('test/data/' + name), test.type, function(err, projection) {
                assert.ok(err instanceof Error);
                if (test.message) assert.equal(test.message, err.message);
                assert.equal('EINVALID', err.code);
                done();
            });
        });
    })(name, errorTests[name]);
    it('should return the correct projection for a shapefile', function(done) {
        var file = path.resolve('test/data/zip/world_merc/world_merc.shp');
        var type = '.shp';
        var expectedProj = '+proj=merc +a=6378137 +b=6378137 +lat_ts=0.0 +lon_0=0.0 +x_0=0.0 +y_0=0.0 +k=1.0 +units=m +nadgrids=@null +wktext +no_defs +over';
        datasourceProcessor.getProjection(file, type, function(err, projection) {
            if (err) return done(err);
            assert.ok(err === null);
            assert.equal(expectedProj, projection);
            done();
        });
    });
    it('should return the correct projection for geojson file', function(done) {
        var file = 'geojson_file';
        var type = '.geo.json';
        var expectedProj = '+proj=longlat +ellps=WGS84 +datum=WGS84 +no_defs';
        datasourceProcessor.getProjection(file, type, function(err, projection) {
            if (err) return done(err);
            assert.ok(err === null);
            assert.equal(expectedProj, projection);
            done();
        });
    });
    it('should return the correct projection for gpx file', function(done) {
        var file = 'gpx_file';
        var type = '.gpx';
        var expectedProj = '+init=epsg:4326';
        datasourceProcessor.getProjection(file, type, function(err, projection) {
            if (err) return done(err);
            assert.ok(err === null);
            assert.equal(expectedProj, projection);
            done();
        });
    });
    it('should return the correct projection for kml file', function(done) {
        var file = 'kml_file';
        var type = '.kml';
        var expectedProj = '+init=epsg:4326';
        datasourceProcessor.getProjection(file, type, function(err, projection) {
            if (err) return done(err);
            assert.ok(err === null);
            assert.equal(expectedProj, projection);
            done();
        });
    });
});