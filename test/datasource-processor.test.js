var tape = require('tape'),
    path = require('path'),
    fs = require('fs'),
    mapnik = require('mapnik'),
    testData = path.dirname(require.resolve('mapnik-test-data')),
    datasourceProcessor = require('../lib/datasource-processor.js');

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
 * Testing datasourceProcessor.getCenterAndExtent
 */
    tape('[SHAPE] Getting center of extent', function(assert) {
        var proj = '+proj=merc +a=6378137 +b=6378137 +lat_ts=0.0 +lon_0=0.0 +x_0=0.0 +y_0=0.0 +k=1.0 +units=m +nadgrids=@null +wktext +no_defs +over';
        var shapefile = testData + '/data/shp/world_merc/world_merc.shp';
        var ds = new mapnik.Datasource({
            type: 'shape',
            file: shapefile,
            layer: 'world_merc'
        });
        var expectedCenter = [0, 12.048603815490733];
        var expectedExtent = [-180, -59.47306100000001, 180, 83.57026863098147];
        var result = datasourceProcessor.getCenterAndExtent(ds, proj);
        assert.ok(result);
        assert.ok(result.center);
        assert.ok(result.extent);
        assert.ok(typeof result.extent == 'object');
        assert.ok(typeof result.center == 'object');
        assert.deepEqual(result.center, expectedCenter);
        assert.deepEqual(result.extent, expectedExtent);
        assert.end();
    });
    tape('[TIF] Getting center of extent', function(assert) {
        var proj = '+proj=aea +lat_1=29.5 +lat_2=45.5 +lat_0=23 +lon_0=-96 +x_0=0 +y_0=0 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs';
        var tifFile = testData + '/data/geotiff/sample.tif';
        var ds = new mapnik.Datasource({
            type: 'gdal',
            file: tifFile,
            layer: 'sample'
        });
        var expectedCenter = [-110.32476292309875,44.56502238336985];
        var expectedExtent = [-110.3650933429331,44.53327824851143,-110.28443250326441,44.596766518228264];
        var result = datasourceProcessor.getCenterAndExtent(ds, proj);
        assert.ok(result);
        assert.ok(result.center);
        assert.ok(result.extent);
        assert.ok(typeof result.extent == 'object');
        assert.ok(typeof result.center == 'object');
        assert.ok(result.center[0] > (expectedCenter[0] - 0.0001) && result.center[0] < (expectedCenter[0] + 0.0001));
        assert.ok(result.center[1] > (expectedCenter[1] - 0.0001) && result.center[1] < (expectedCenter[1] + 0.0001));
        assert.ok(result.extent[0] > (expectedExtent[0] - 0.0001) && result.extent[0] < (expectedExtent[0] + 0.0001));
        assert.ok(result.extent[1] > (expectedExtent[1] - 0.0001) && result.extent[1] < (expectedExtent[1] + 0.0001));
        assert.ok(result.extent[2] > (expectedExtent[2] - 0.0001) && result.extent[2] < (expectedExtent[2] + 0.0001));
        assert.ok(result.extent[3] > (expectedExtent[3] - 0.0001) && result.extent[3] < (expectedExtent[3] + 0.0001));
        assert.end();
    });
    tape('[VRT] Getting center of extent', function(assert) {
        var proj = '+proj=aea +lat_1=29.5 +lat_2=45.5 +lat_0=23 +lon_0=-96 +x_0=0 +y_0=0 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs';
        var vrtFile = testData + '/data/vrt/sample.vrt';
        var ds = new mapnik.Datasource({
            type: 'gdal',
            file: vrtFile,
            layer: 'sample'
        });
        var type = '.vrt';
        var expectedCenter = [-110.32476292309875,44.56502238336985];
        var expectedExtent = [-110.3650933429331,44.53327824851143,-110.28443250326441,44.596766518228264];
        var result = datasourceProcessor.getCenterAndExtent(ds, proj, type);
        assert.ok(result);
        assert.ok(result.center);
        assert.ok(result.extent);
        assert.ok(typeof result.extent == 'object');
        assert.ok(typeof result.center == 'object');
        assert.ok(result.center[0] > (expectedCenter[0] - 0.0001) && result.center[0] < (expectedCenter[0] + 0.0001));
        assert.ok(result.center[1] > (expectedCenter[1] - 0.0001) && result.center[1] < (expectedCenter[1] + 0.0001));
        assert.ok(result.extent[0] > (expectedExtent[0] - 0.0001) && result.extent[0] < (expectedExtent[0] + 0.0001));
        assert.ok(result.extent[1] > (expectedExtent[1] - 0.0001) && result.extent[1] < (expectedExtent[1] + 0.0001));
        assert.ok(result.extent[2] > (expectedExtent[2] - 0.0001) && result.extent[2] < (expectedExtent[2] + 0.0001));
        assert.ok(result.extent[3] > (expectedExtent[3] - 0.0001) && result.extent[3] < (expectedExtent[3] + 0.0001));
        assert.end();
    });
    tape('[CSV] Getting center of extent', function(assert) {
        var proj = '+proj=longlat +ellps=WGS84 +datum=WGS84 +no_defs';
        var csvFile = testData + '/data/csv/bbl_current_csv.csv';
        var options = {
            type: 'csv',
            file: csvFile,
            filesize_max:10,
            layer: 'bbl_current_csv'
        };
        var ds = new mapnik.Datasource(options);
        var expectedCenter = [-77.0481382917019, 38.93765872502635];
        var expectedExtent = [-77.0925920175155,38.9142786070481,-77.0036845658883,38.9610388430046];
        var result = datasourceProcessor.getCenterAndExtent(ds, proj);
        assert.ok(result);
        assert.ok(result.center);
        assert.ok(result.extent);
        assert.ok(typeof result.extent == 'object');
        assert.ok(typeof result.center == 'object');
        assert.deepEqual(result.center, expectedCenter);
        assert.deepEqual(result.extent, expectedExtent);
        assert.end();
    });
    tape('[KML] Getting center of extent', function(assert) {
        var proj = '+init=epsg:4326';
        var kmlFile = testData + '/data/kml/1week_earthquake.kml';
        var options = {
            type: 'ogr',
            file: kmlFile,
            layer: 'Magnitude 1'
        };
        var ds = new mapnik.Datasource(options);
        var expectedCenter = [-110.13325, 42.5407];
        var expectedExtent = [-155.8387, 17.7682, -64.4278, 67.3132];
        var result = datasourceProcessor.getCenterAndExtent(ds, proj);
        assert.ok(result);
        assert.ok(result.center);
        assert.ok(result.extent);
        assert.ok(typeof result.extent == 'object');
        assert.ok(typeof result.center == 'object');
        assert.deepEqual(result.center, expectedCenter);
        assert.deepEqual(result.extent, expectedExtent);
        assert.end();
    });
    tape('[GeoJson] Getting center of extent', function(assert) {
        var proj = '+proj=longlat +ellps=WGS84 +datum=WGS84 +no_defs';
        var geoJsonFile = testData + '/data/geojson/DC_polygon.geo.json';
        var options = {
            type: 'ogr',
            file: geoJsonFile,
            layer_by_index: 0
        };
        var ds = new mapnik.Datasource(options);
        var expectedCenter = [-77.01335, 38.89255];
        var expectedExtent = [-77.1174, 38.7912, -76.9093, 38.9939];
        var result = datasourceProcessor.getCenterAndExtent(ds, proj);
        assert.ok(result);
        assert.ok(result.center);
        assert.ok(result.extent);
        assert.ok(typeof result.extent == 'object');
        assert.ok(typeof result.center == 'object');
        assert.deepEqual(result.center, expectedCenter);
        assert.deepEqual(result.extent, expectedExtent);
        assert.end();
    });
// describe('[TopoJson] Getting center of extent', function() {
//     tape('should return expected values', function() {
//         var proj = '+proj=longlat +ellps=WGS84 +datum=WGS84 +no_defs';
//         var topoJsonFile = testData + '/data/topojson/topo.json';
//         var type = '.topojson';
//         var options = {
//             type: 'ogr',
//             file: topoJsonFile,
//             layer_by_index: 0
//         };
//         var ds = new mapnik.Datasource(options);
//         var expectedCenter = [-81.705583, 41.480573];
//         var expectedExtent = [-81.705583,41.480573,-81.705583,41.480573];
//         var result = datasourceProcessor.getCenterAndExtent(ds, proj, type);
//         assert.ok(result);
//         assert.ok(result.center);
//         assert.ok(result.extent);
//         assert.ok(typeof result.extent == 'object');
//         assert.ok(typeof result.center == 'object');
//         assert.deepEqual(result.center, expectedCenter);
//         assert.deepEqual(result.extent, expectedExtent);
//     });
// });
    tape('[GPX] Getting center of extent', function(assert) {
        var proj = '+init=epsg:4326';
        var gpxFile = testData + '/data/gpx/fells_loop.gpx';
        var options = {
            type: 'ogr',
            file: gpxFile,
            layer: 'waypoints'
        };
        var ds = new mapnik.Datasource(options);
        var expectedCenter = [-71.1147875, 42.434853000000004];
        var expectedExtent = [-71.126602, 42.401051, -71.102973, 42.468655];
        var result = datasourceProcessor.getCenterAndExtent(ds, proj);
        assert.ok(result);
        assert.ok(result.center);
        assert.ok(result.extent);
        assert.ok(typeof result.extent == 'object');
        assert.ok(typeof result.center == 'object');
        assert.deepEqual(result.center, expectedCenter);
        assert.deepEqual(result.extent, expectedExtent);
        assert.end();
    });

/**
 * Testing datasourceProcessor.init
 */
    tape('[SHAPE] Setup', function(assert) {
        var shpFile = testData + '/data/shp/world_merc/world_merc.shp';
        var filesize = 428328;
        var type = '.shp';
        //Overwrites metadata json file if output does not match
        datasourceProcessor.init(shpFile, filesize, type, function(err, metadata) {
            if (err) {
                assert.ifError(err, 'should not error');
                return assert.end();
            }
            if (UPDATE) fs.writeFileSync(path.resolve('test/fixtures/metadata_world_merc.json'), JSON.stringify(metadata, null, 2));
            assert.deepEqual(metadata, expectedMetadata_world_merc);

            assert.end();
        });
    });
    tape('[SHAPE] Getting datasources: should return expected layers and json', function(assert) {
        if (UPDATE) expectedMetadata_world_merc = JSON.parse(fs.readFileSync(path.resolve('test/fixtures/metadata_world_merc.json')));
        var shpFile = testData + '/data/shp/world_merc/world_merc.shp';
        var filesize = 428328;
        var type = '.shp';
        datasourceProcessor.init(shpFile, filesize, type, function(err, metadata) {
            if (err) {
                assert.ifError(err, 'should not error');
                return assert.end();
            }
            assert.ok(err === null);
            assert.deepEqual(metadata, expectedMetadata_world_merc);
            assert.end();
        });
    });
    tape('[TIF] Setup', function(assert) {
        var tifFile = testData + '/data/geotiff/sample.tif';
        var filesize = 794079;
        var type = '.tif';
        //Overwrites metadata json file if output does not match
        datasourceProcessor.init(tifFile, filesize, type, function(err, metadata) {
            if (err) {
                assert.ifError(err, 'should not error');
                return assert.end();
            }
            if (UPDATE) fs.writeFileSync(path.resolve('test/fixtures/metadata_sample_tif.json'), JSON.stringify(metadata, null, 2));
            if (UPDATE) assert.deepEqual(metadata, expectedMetadata_sample_tif);
            assert.end();
        });
    });
    tape('[TIF] Getting datasources: should return expected layers and json', function(assert) {
        if (UPDATE) expectedMetadata_sample_tif = JSON.parse(fs.readFileSync(path.resolve('test/fixtures/metadata_sample_tif.json')));
        var tifFile = testData + '/data/geotiff/sample.tif';
        var filesize = 794079;
        var type = '.tif';
        var trunc_6 = function(val) {
            return Number(val.toFixed(6));
        };

        datasourceProcessor.init(tifFile, filesize, type, function(err, metadata) {
            if (err) {
                assert.ifError(err, 'should not error');
                return assert.end();
            }

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

            //Round band mean/std_dev values
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
            assert.deepEqual(metadata, expectedMetadata_sample_tif);
            assert.deepEqual(err, null);
            assert.end();
        });
    });
    tape('[VRT] Setup', function(assert) {
        var vrtFile = testData + '/data/vrt/sample.vrt';
        var filesize = 1293;
        var type = '.vrt';
        //Overwrites metadata json file if output does not match
        datasourceProcessor.init(vrtFile, filesize, type, function(err, metadata) {
            if (err) {
                assert.ifError(err, 'should not error');
                return assert.end();
            }
            if (UPDATE) fs.writeFileSync(path.resolve('test/fixtures/metadata_sample_vrt.json'), JSON.stringify(metadata, null, 2));
            if (UPDATE) assert.deepEqual(metadata, expectedMetadata_sample_vrt);
            assert.end();
        });
    });
    tape('[VRT] Getting datasources: should return expected layers and json', function(assert) {
        if (UPDATE) expectedMetadata_sample_vrt = JSON.parse(fs.readFileSync(path.resolve('test/fixtures/metadata_sample_vrt.json')));
        var vrtFile = testData + '/data/vrt/sample.vrt';
        var filesize = 1293;
        var type = '.vrt';
        var trunc_6 = function(val) {
            return Number(val.toFixed(6));
        }

        datasourceProcessor.init(vrtFile, filesize, type, function(err, metadata) {
            if (err) {
                assert.ifError(err, 'should not error');
                return assert.end();
            }

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

            //Round band mean/std_dev values
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

            assert.deepEqual(metadata, expectedMetadata_sample_vrt);
            assert.deepEqual(err, null);
            assert.end();
        });
    });
    tape('[CSV] Setup', function(assert) {
        var csvFile = testData + '/data/csv/bbl_current_csv.csv';
        var filesize = 1667;
        var type = '.csv';
        //Overwrites metadata json file if output does not match
        datasourceProcessor.init(csvFile, filesize, type, function(err, metadata) {
            if (err) {
                assert.ifError(err, 'should not error');
                return assert.end();
            }
            if (UPDATE) fs.writeFileSync(path.resolve('test/fixtures/metadata_bbl_current_csv.json'), JSON.stringify(metadata, null, 2));
            assert.deepEqual(metadata, expectedMetadata_bbl_csv);

            assert.end();
        });
    });
    tape('[CSV] Getting datasources: should return expected layers and json', function(assert) {
        if (UPDATE) expectedMetadata_bbl_csv = JSON.parse(fs.readFileSync(path.resolve('test/fixtures/metadata_bbl_current_csv.json')));
        var csvFile = testData + '/data/csv/bbl_current_csv.csv';
        var filesize = 1667;
        var type = '.csv';
        datasourceProcessor.init(csvFile, filesize, type, function(err, metadata) {
            if (err) {
                assert.ifError(err, 'should not error');
                return assert.end();
            }
            assert.ok(err === null);
            assert.deepEqual(metadata, expectedMetadata_bbl_csv);
            assert.end();
        });
    });
    tape('[KML] Setup', function(assert) {
        var kmlFile = testData + '/data/kml/1week_earthquake.kml';
        var filesize = 1082451;
        var type = '.kml';
        //Overwrites metadata json file if output does not match
        datasourceProcessor.init(kmlFile, filesize, type, function(err, metadata) {
            if (err) {
                assert.ifError(err, 'should not error');
                return assert.end();
            }
            if (UPDATE) fs.writeFileSync(path.resolve('test/fixtures/metadata_1week_earthquake.json'), JSON.stringify(metadata, null, 2));
            assert.deepEqual(metadata, expectedMetadata_1week_earthquake);

            assert.end();
        });
    });
    tape('[KML] Getting datasources: should return expected layers and json', function(assert) {
        if (UPDATE) expectedMetadata_1week_earthquake = JSON.parse(fs.readFileSync(path.resolve('test/fixtures/metadata_1week_earthquake.json')));
        var kmlFile = testData + '/data/kml/1week_earthquake.kml';
        var filesize = 1082451;
        var type = '.kml';
        datasourceProcessor.init(kmlFile, filesize, type, function(err, metadata) {
            if (err) {
                assert.ifError(err, 'should not error');
                return assert.end();
            }
            assert.ok(err === null);
            assert.deepEqual(metadata, expectedMetadata_1week_earthquake);
            assert.end();
        });
    });
    tape('[GeoJson] Setup', function(assert) {
        var geoJsonFile = testData + '/data/geojson/DC_polygon.geo.json';
        var filesize = 367;
        var type = '.geojson';
        //Overwrites metadata json file if output does not match
        datasourceProcessor.init(geoJsonFile, filesize, type, function(err, metadata) {
            if (err) {
                assert.ifError(err, 'should not error');
                return assert.end();
            }
            if (UPDATE) fs.writeFileSync(path.resolve('test/fixtures/metadata_DC_polygon.json'), JSON.stringify(metadata, null, 2));
            assert.deepEqual(metadata, expectedMetadata_DC_polygon);

            assert.end();
        });
    });
    tape('[GeoJson] Getting datasource: should return expected datasource and layer name', function(assert) {
        if (UPDATE) expectedMetadata_DC_polygon = JSON.parse(fs.readFileSync(path.resolve('test/fixtures/metadata_DC_polygon.json')));
        var geoJsonFile = testData + '/data/geojson/DC_polygon.geo.json';
        var filesize = 367;
        var type = '.geojson';
        datasourceProcessor.init(geoJsonFile, filesize, type, function(err, metadata) {
            if (err) {
                assert.ifError(err, 'should not error');
                return assert.end();
            }
            assert.ok(err === null);
            assert.deepEqual(metadata, expectedMetadata_DC_polygon);
            assert.end();
        });
    });
    tape('[TopoJson] Getting datasource: should return expected datasource and layer name', function(assert) {
        var topoJsonFile = testData + '/data/topojson/topo.json';
        var filesize = 332;
        var type = '.geojson';
        datasourceProcessor.init(topoJsonFile, filesize, type, function(err, metadata) {
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
    tape('[GPX] Getting datasource', function(assert) {
        var gpxFile = testData + '/data/gpx/fells_loop.gpx';
        var filesize = 36815;
        var type = '.gpx';
        //Overwrites metadata json file if output does not match
        datasourceProcessor.init(gpxFile, filesize, type, function(err, metadata) {
            if (err) {
                assert.ifError(err, 'should not error');
                return assert.end();
            }
            if (UPDATE) fs.writeFileSync(path.resolve('test/fixtures/metadata_fells_loop.json'), JSON.stringify(metadata, null, 2));
            assert.deepEqual(metadata, expectedMetadata_fells_loop);

            assert.end();
        });
    });
    tape('[GPX] Getting datasource: should return expected datasource and layer name', function(assert) {
        if (UPDATE) expectedMetadata_fells_loop = JSON.parse(fs.readFileSync(path.resolve('test/fixtures/metadata_fells_loop.json')));
        var gpxFile = testData + '/data/gpx/fells_loop.gpx';
        var filesize = 36815;
        var type = '.gpx';
        datasourceProcessor.init(gpxFile, filesize, type, function(err, metadata) {
            if (err) {
                assert.ifError(err, 'should not error');
                return assert.end();
            }
            assert.ok(err === null);
            assert.deepEqual(metadata, expectedMetadata_fells_loop);
            assert.end();
        });
    });
/**
 * Testing datasourceProcessor.getDatasource
 */
    tape('Setting layer configs: should throw an error due to [0,0,0,0] extent', function(assert) {
        var invalidFile = testData + '/data/kml/TIMS.kml';
        var filename = 'TIMS';
        var options = {
            type: 'ogr',
            file: invalidFile
        };
        var layers = ['Tornado Tracks and Icons'];
        datasourceProcessor.getDatasource(options, layers, function(err, ds) {
            assert.ok(err);
            assert.ok(err instanceof Error);
            assert.equal('EINVALID', err.code);
            assert.equal(0, err.message.indexOf('Source appears to have no features data.'));
            assert.end();
        });
    });
/**
 * Testing datasourceProcessor.getMinMaxZoom
 */
    tape('Setting min/max zoom: should return expected values for min/maxzoom', function(assert) {
        var expectedMin = 14;
        var expectedMax = 19;
        var extent = [-77.11532282009873, 38.81041408561889, -76.90970655877031, 38.995615210318356];
        var bytes = 64244520;
        datasourceProcessor.getMinMaxZoom(bytes, extent, function(err, minzoom, maxzoom) {
            assert.strictEqual(null, err);
            assert.equal(minzoom, expectedMin);
            assert.equal(maxzoom, expectedMax);
            assert.end();
        });
    });
    tape('Setting min/max zoom for GDAL sources: should return expected values for min/maxzoom', function(assert) {
        var expectedMin = 9;
        var expectedMax = 15;
        var proj = "+proj=aea +lat_1=29.5 +lat_2=45.5 +lat_0=23 +lon_0=-96 +x_0=0 +y_0=0 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs";
        var center = [-110.32476292309875,44.56502238336985];
        var pixelSize = [ 7.502071930146189, 7.502071930145942 ];
        datasourceProcessor.getMinMaxZoomGDAL(pixelSize, center, proj, function(err, minzoom, maxzoom) {
            assert.strictEqual(null, err);
            assert.equal(minzoom, expectedMin);
            assert.equal(maxzoom, expectedMax);
            assert.end();
        });
    });

    tape('Setting min/max zoom for Landsat 8 source: should not exceed z12', function(assert) {

      var expectedMin = 7;
      var expectedMax = 13;

      var proj = "+proj=merc +a=6378137 +b=6378137 +lat_ts=0.0 +lon_0=0.0 +x_0=0.0 +y_0=0 +k=1.0 +units=m +nadgrids=@null +wktext  +no_defs";

      var center = [-98.78906931331828, 49.15195306095049]; // 115-175-9
      var pixelSize = [30.000000000000000,-30.000000000000000];

      datasourceProcessor.getMinMaxZoomGDAL(pixelSize, center, proj, function(err, minzoom, maxzoom) {
        assert.strictEqual(null, err);
        assert.equal(minzoom, expectedMin);
        assert.equal(maxzoom, expectedMax);
        assert.end();
      });

    });
    
    tape('Setting min/max zoom for a WSG84 source: should give reasonable zoom levels', function(assert) {
      
      var expectedMin = 1;
      var expectedMax = 7;
      
      var proj = "+proj=longlat +ellps=WGS84 +datum=WGS84 +no_defs";
      
      var center = [75.937499999962156,36.597889133105191];
      var pixelSize = [0.012824370005926,-0.012824370005926];
      
      datasourceProcessor.getMinMaxZoomGDAL(pixelSize, center, proj, function(err, minzoom, maxzoom) {
        assert.strictEqual(null, err);
        assert.equal(minzoom, expectedMin);
        assert.equal(maxzoom, expectedMax);
        assert.end();
      });
      
    });

    tape('Setting extent to zero: should return an error', function(assert) {
        var extent = [0, 0, 0, 0];
        var bytes = 1234;
        datasourceProcessor.getMinMaxZoom(bytes, extent, function(err, minzoom, maxzoom) {
            assert.ok(err);
            assert.ok(err instanceof Error);
            assert.equal('EINVALID', err.code);
            assert.equal(err.message, 'Error calculating min/max zoom: Bounds invalid');
            assert.end();
        });
    });
    tape('Setting extent to zero: should return an error because of invalid bytes', function(assert) {
        var extent = [1, 2, 3, 4];
        var bytes = -1;
        datasourceProcessor.getMinMaxZoom(bytes, extent, function(err, minzoom, maxzoom) {
            assert.ok(err);
            assert.ok(err instanceof Error);
            assert.equal('EINVALID', err.code);
            assert.equal(err.message, 'Error calculating min/max zoom: Total bytes less than or equal to zero');
            assert.end();
        });
    });
/**
 * Testing datasourceProcessor.getProjection
 */
(function() {
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
        tape(test.desc, function(assert) {
            datasourceProcessor.getProjection(path.resolve('test/data/' + name), test.type, function(err, projection) {
                assert.ok(err instanceof Error);
                if (test.message) assert.equal(test.message, err.message);
                assert.equal('EINVALID', err.code);
                assert.end();
            });
        });
    })(name, errorTests[name]);
    tape('should return an error due to invalid tif file', function(assert) {
        var file = path.resolve('test/data/errors/sampleError.tif');
        var expectedMessage = 'Invalid GeoTIFF: could not open the file';
        datasourceProcessor.projectionFromRaster(file, function(err, projection) {
            assert.ok(err instanceof Error);
            assert.equal(expectedMessage, err.message);
            assert.equal('EINVALID', err.code);
            assert.end();
        });
    });
    tape('should return the correct projection for a shapefile', function(assert) {
        var file = testData + '/data/shp/world_merc/world_merc.shp';
        var type = '.shp';
        var expectedProj = '+proj=merc +a=6378137 +b=6378137 +lat_ts=0.0 +lon_0=0.0 +x_0=0.0 +y_0=0.0 +k=1.0 +units=m +nadgrids=@null +wktext +no_defs +over';
        datasourceProcessor.getProjection(file, type, function(err, projection) {
            if (err) {
                assert.ifError(err, 'should not error');
                return assert.end();
            }
            assert.ok(err === null);
            assert.equal(expectedProj, projection);
            assert.end();
        });
    });
    tape('should return the correct projection for geojson file', function(assert) {
        var file = 'geojson_file';
        var type = '.geojson';
        var expectedProj = '+proj=longlat +ellps=WGS84 +datum=WGS84 +no_defs';
        datasourceProcessor.getProjection(file, type, function(err, projection) {
            if (err) {
                assert.ifError(err, 'should not error');
                return assert.end();
            }
            assert.ok(err === null);
            assert.equal(expectedProj, projection);
            assert.end();
        });
    });
    tape('should return the correct projection for gpx file', function(assert) {
        var file = 'gpx_file';
        var type = '.gpx';
        var expectedProj = '+init=epsg:4326';
        datasourceProcessor.getProjection(file, type, function(err, projection) {
            if (err) {
                assert.ifError(err, 'should not error');
                return assert.end();
            }
            assert.ok(err === null);
            assert.equal(expectedProj, projection);
            assert.end();
        });
    });
    tape('should return the correct projection for kml file', function(assert) {
        var file = 'kml_file';
        var type = '.kml';
        var expectedProj = '+init=epsg:4326';
        datasourceProcessor.getProjection(file, type, function(err, projection) {
            if (err) {
                assert.ifError(err, 'should not error');
                return assert.end();
            }
            assert.ok(err === null);
            assert.equal(expectedProj, projection);
            assert.end();
        });
    });
    tape('should return an error for invalid VRT file due to nonexistent source files', function(assert) {
        var file = path.resolve('test/data/errors/sampleError.vrt');
        var expectedMessage = 'Error getting statistics of band. 1 or more of the VRT file\'s relative sources may be missing';
        datasourceProcessor.projectionFromRaster(file, function(err, projection) {
            assert.ok(err instanceof Error);
            assert.ok(err.message.indexOf(expectedMessage) !== -1);
            assert.equal('EINVALID', err.code);
            assert.end();
        });
    });
    tape('should handle undefined proj4 property', function(assert) {
        var file = path.resolve('test/data/errors/undefinedproj4.prj');
        var expectedMessage = 'Undefined proj4 string';
        datasourceProcessor.projectionFromShape(file, function(err, proj) {
            assert.ok(err instanceof Error);
            assert.ok(err.message.indexOf(expectedMessage) !== -1);
            assert.equal('EINVALID', err.code);
            assert.end();
        });
    });
})();
