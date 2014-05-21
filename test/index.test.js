var assert = require('assert'),
    path = require('path'),
    fs = require('fs'),
    mapnik_omnivore = require('../index.js');
/**
 * Testing mapnik-omnivore.digest
 */
describe('[SHAPE] Getting datasources', function() {
    it('should return expected metadata', function(done) {
        var file = path.resolve('test/data/zip/world_merc/world_merc.shp');
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
        mapnik_omnivore.digest(file, function(err, metadata) {
            if (err) return done(err);
            assert.ok(err === null);
            assert.deepEqual(expectedMetadata.toString(), metadata.toString());
            done();
        });
    });
});
describe('[KML] Getting datasources', function() {
    it('should return expected metadata', function(done) {
        var file = path.resolve('test/data/kml/1week_earthquake.kml');
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
        mapnik_omnivore.digest(file, function(err, metadata) {
            if (err) return done(err);
            assert.ok(err === null);
            assert.deepEqual(expectedMetadata.toString(), metadata.toString());
            done();
        });
    });
});
describe('[GeoJson] Getting datasource', function() {
    it('should return expected datasource and layer name', function(done) {
        var file = path.resolve('test/data/geojson/DC_polygon.geo.json');
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
        mapnik_omnivore.digest(file, function(err, metadata) {
            if (err) return done(err);
            assert.ok(err === null);
            assert.deepEqual(expectedMetadata.toString(), metadata.toString());
            done();
        });
    });
});
describe('[GPX] Getting datasource', function() {
    it('should return expected datasource and layer name', function(done) {
        var file = path.resolve('test/data/gpx/fells_loop.gpx');
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
        mapnik_omnivore.digest(file, function(err, metadata) {
            if (err) return done(err);
            assert.ok(err === null);
            assert.deepEqual(expectedMetadata.toString(), metadata.toString());
            done();
        });
    });
});
describe('Getting filetype ', function() {
    it('should return an error due to incompatible file', function(done) {
        var file = path.resolve('test/data/errors/incompatible.txt');
        mapnik_omnivore.getFileType(file, function(err, type){
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
        mapnik_omnivore.getMetadata(file, function(err, configs){
            assert.ok(err instanceof Error);
            assert.equal('EINVALID', err.code);
            assert.equal(err.message, 'Error getting stats from file. File might not exist.');
            done();
        });
    });
});