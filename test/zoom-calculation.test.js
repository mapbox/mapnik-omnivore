var test = require('tape');
var path = require('path');
var mapnik = require('mapnik');
var calcZoom = require('../lib/utils.js').zoomsBySize;
var SphericalMercator = require('sphericalmercator');
var sm = new SphericalMercator();

mapnik.register_default_input_plugins();

test('geojson - single point', function(t) {

  var filepath = path.resolve(__dirname, 'fixtures', 'zoom-size-calculations', 'single-point.json');
  var original = require(filepath);
  
  var ds = new mapnik.Datasource({
    type: 'geojson',
    file: filepath,
    cache_features: false
  });

  featureComparison(t, original, filepath, ds);

});

function featureComparison(test, original, filepath, datasource) {
  calcZoom(filepath, datasource, function(err, minzoom, maxzoom) {
    if (err) throw err;

    // - get tile for each feature
    original.features.forEach(function(f, i) {
      var bbox = [f.geometry.coordinates[0], f.geometry.coordinates[1], f.geometry.coordinates[0], f.geometry.coordinates[1]];
      xyz = sm.xyz(bbox, maxzoom);

      // create new tile for this feature
      var vt = new mapnik.VectorTile(maxzoom, xyz.minX, xyz.minY);
      vt.addGeoJSON(JSON.stringify({ type: "FeatureCollection", features: [f]}), 'test-layer');
      vtgj = JSON.parse(vt.toGeoJSONSync('test-layer'));

      console.log('feature '+ i);
      console.log('longitude delta: ', vtgj.features[0].geometry.coordinates[0] - f.geometry.coordinates[0]);
      console.log('latitude delta: ', vtgj.features[0].geometry.coordinates[1] - f.geometry.coordinates[1]);
    });

    test.end();
  });
}

test('geojson - two points', function(t) {

  var filepath = path.resolve(__dirname, 'fixtures', 'zoom-size-calculations', 'two-points.json');
  var original = require(filepath);
  
  var ds = new mapnik.Datasource({
    type: 'geojson',
    file: filepath,
    cache_features: false
  });

  featureComparison(t, original, filepath, ds);

});
