var assert = require('assert'),
    path = require('path'),
    fs = require('fs'),
    mapnik = require('mapnik'),
    datasourceProcessor = require('../lib/datasourceProcessor.js');
/**
 * Testing datasourceProcessor.getCenterAndExtent
 */
describe('[SHAPE] Getting center of extent', function() {
    it('should return expected values', function() {
        var proj = '+proj=merc +a=6378137 +b=6378137 +lat_ts=0.0 +lon_0=0.0 +x_0=0.0 +y_0=0.0 +k=1.0 +units=m +nadgrids=@null +wktext +no_defs +over';
        var shapefile = path.resolve('test/data/zip/world_merc/world_merc.shp');
        var ds = new mapnik.Datasource({
            type: 'shape',
            file: shapefile
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
        var proj = '+init=epsg:4326';
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
        var expectedMetadata = {
            filesize: 428328,
            fileType: '.shp',
            projection: '+proj=merc +a=6378137 +b=6378137 +lat_ts=0.0 +lon_0=0.0 +x_0=0.0 +y_0=0.0 +k=1.0 +units=m +nadgrids=@null +wktext +no_defs +over',
            extent: [-180, -59.47306100000001, 180, 83.57026863098147],
            center: [0, 12.048603815490733],
            minzoom: 0,
            maxzoom: 5,
            json: {
                vector_layers: [{
                    id: 'world_merc',
                    description: '',
                    minzoom: 0,
                    maxzoom: 22,
                    fields: {
                        FIPS: 'String',
                        ISO2: 'String',
                        ISO3: 'String',
                        UN: 'Number',
                        NAME: 'String',
                        AREA: 'Number',
                        POP2005: 'Number',
                        REGION: 'Number',
                        SUBREGION: 'Number',
                        LON: 'Number',
                        LAT: 'Number'
                    }
                }]
            },
            layers: ['world_merc'],
            dstype: 'shape',
            filename: 'world_merc'
        };
        datasourceProcessor.init(shpFile, filesize, type, function(err, metadata) {
            if (err) return done(err);
            assert.ok(err === null);
            assert.deepEqual(expectedMetadata.toString(), metadata.toString());
            done();
        });
    });
});
describe('[KML] Getting datasources', function() {
    it('should return expected layers and json', function(done) {
        var kmlFile = path.resolve('test/data/kml/1week_earthquake.kml');
        var filesize = 1082451;
        var type = '.kml';
        var expectedMetadata = {
            filesize: 1082451,
            fileType: '.kml',
            projection: '+init=epsg:4326',
            extent: [-155.8387, 17.7682, -64.4278, 67.3132],
            center: [-110.13325, 42.5407],
            minzoom: 0,
            maxzoom: 8,
            json: {
                vector_layers: [{
                    id: 'Magnitude_6',
                    description: '',
                    minzoom: 0,
                    maxzoom: 22,
                    fields: {
                        Name: 'String',
                        Description: 'String'
                    }
                }, {
                    id: 'Magnitude_5',
                    description: '',
                    minzoom: 0,
                    maxzoom: 22,
                    fields: {
                        Name: 'String',
                        Description: 'String'
                    }
                }, {
                    id: 'Magnitude_4',
                    description: '',
                    minzoom: 0,
                    maxzoom: 22,
                    fields: {
                        Name: 'String',
                        Description: 'String'
                    }
                }, {
                    id: 'Magnitude_3',
                    description: '',
                    minzoom: 0,
                    maxzoom: 22,
                    fields: {
                        Name: 'String',
                        Description: 'String'
                    }
                }, {
                    id: 'Magnitude_2',
                    description: '',
                    minzoom: 0,
                    maxzoom: 22,
                    fields: {
                        Name: 'String',
                        Description: 'String'
                    }
                }, {
                    id: 'Magnitude_1',
                    description: '',
                    minzoom: 0,
                    maxzoom: 22,
                    fields: {
                        Name: 'String',
                        Description: 'String'
                    }
                }]
            },
            layers: ['Magnitude 6', 'Magnitude 5', 'Magnitude 4', 'Magnitude 3', 'Magnitude 2', 'Magnitude 1'],
            dstype: 'ogr',
            filename: '1week_earthquake'
        };
        datasourceProcessor.init(kmlFile, filesize, type, function(err, metadata) {
            if (err) return done(err);
            assert.ok(err === null);
            assert.deepEqual(expectedMetadata.toString(), metadata.toString());
            done();
        });
    });
});
describe('[GeoJson] Getting datasource', function() {
    it('should return expected datasource and layer name', function(done) {
        var geoJsonFile = path.resolve('test/data/geojson/DC_polygon.geo.json');
        var filesize = 367;
        var type = '.geo.json';
        var expectedMetadata = {
            filesize: 367,
            fileType: '.geo.json',
            projection: '+proj=longlat +ellps=WGS84 +datum=WGS84 +no_defs',
            extent: [-77.1174, 38.7912, -76.9093, 38.9939],
            center: [-77.01335, 38.89255],
            minzoom: 0,
            maxzoom: 6,
            json: {
                vector_layers: [{
                    id: 'OGRGeoJSON',
                    description: '',
                    minzoom: 0,
                    maxzoom: 22,
                    fields: {
                        kind: 'String',
                        name: 'String',
                        state: 'String'
                    }
                }]
            },
            layers: ['OGRGeoJSON'],
            dstype: 'ogr',
            filename: 'DC_polygon'
        };
        datasourceProcessor.init(geoJsonFile, filesize, type, function(err, metadata) {
            if (err) return done(err);
            assert.ok(err === null);
            assert.deepEqual(expectedMetadata.toString(), metadata.toString());
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
        var expectedMetadata = {
            filesize: 36815,
            fileType: '.gpx',
            projection: '+init=epsg:4326',
            extent: [-71.122845, 42.43095, -71.105116, 42.46711],
            center: [-71.1139805, 42.44903],
            minzoom: 0,
            maxzoom: 16,
            json: {
                vector_layers: [{
                    id: 'waypoints',
                    description: '',
                    minzoom: 0,
                    maxzoom: 22,
                    fields: {
                        ele: 'Number',
                        time: 'Object',
                        magvar: 'Number',
                        geoidheight: 'Number',
                        name: 'String',
                        cmt: 'String',
                        desc: 'String',
                        src: 'String',
                        url: 'String',
                        urlname: 'String',
                        sym: 'String',
                        type: 'String',
                        fix: 'String',
                        sat: 'Number',
                        hdop: 'Number',
                        vdop: 'Number',
                        pdop: 'Number',
                        ageofdgpsdata: 'Number',
                        dgpsid: 'Number'
                    }
                }, {
                    id: 'routes',
                    description: '',
                    minzoom: 0,
                    maxzoom: 22,
                    fields: {
                        name: 'String',
                        cmt: 'String',
                        desc: 'String',
                        src: 'String',
                        link1_href: 'String',
                        link1_text: 'String',
                        link1_type: 'String',
                        link2_href: 'String',
                        link2_text: 'String',
                        link2_type: 'String',
                        number: 'Number',
                        type: 'String'
                    }
                }, {
                    id: 'tracks',
                    description: '',
                    minzoom: 0,
                    maxzoom: 22,
                    fields: {
                        name: 'String',
                        cmt: 'String',
                        desc: 'String',
                        src: 'String',
                        link1_href: 'String',
                        link1_text: 'String',
                        link1_type: 'String',
                        link2_href: 'String',
                        link2_text: 'String',
                        link2_type: 'String',
                        number: 'Number',
                        type: 'String'
                    }
                }]
            },
            layers: ['waypoints', 'routes', 'tracks'],
            dstype: 'ogr',
            filename: 'fells_loop'
        };
        datasourceProcessor.init(gpxFile, filesize, type, function(err, metadata) {
            if (err) return done(err);
            assert.ok(err === null);
            assert.deepEqual(expectedMetadata.toString(), metadata.toString());
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