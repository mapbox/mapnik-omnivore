var tape = require('tape');
var GeoJSON = require('../lib/geojson.js');
var mapnik = require('mapnik');
mapnik.register_default_input_plugins();

tape('[zoom calculation] poi-calgary.geojson', function(assert) {
  var file = 'test/fixtures/zoom-ratio/poi-calgary.geo.json';
  var source = new GeoJSON(file);
  source.getZooms(function(err, minzoom, maxzoom) {
    if (err) {
      assert.ifError(err, 'should not error');
      return assert.end();
    }

    assert.ok(err === null);
    console.log(file);
    console.log(minzoom, maxzoom);
    assert.end();
  });
});

tape('[zoom calculation] single-point.geojson', function(assert) {
  var file = 'test/fixtures/zoom-ratio/single-point.geojson';
  var source = new GeoJSON(file);
  source.getZooms(function(err, minzoom, maxzoom) {
    if (err) {
      assert.ifError(err, 'should not error');
      return assert.end();
    }

    assert.ok(err === null);
    console.log(file);
    console.log(minzoom, maxzoom);
    assert.end();
  });
});

tape('[zoom calculation] two-points-close.geojson', function(assert) {
  var file = 'test/fixtures/zoom-ratio/two-points-close.geojson';
  var source = new GeoJSON(file);
  source.getZooms(function(err, minzoom, maxzoom) {
    if (err) {
      assert.ifError(err, 'should not error');
      return assert.end();
    }

    assert.ok(err === null);
    console.log(file);
    console.log(minzoom, maxzoom);
    assert.end();
  });
});

tape('[zoom calculation] two-points-far.geojson', function(assert) {
  var file = 'test/fixtures/zoom-ratio/two-points-far.geojson';
  var source = new GeoJSON(file);
  source.getZooms(function(err, minzoom, maxzoom) {
    if (err) {
      assert.ifError(err, 'should not error');
      return assert.end();
    }

    assert.ok(err === null);
    console.log(file);
    console.log(minzoom, maxzoom);
    assert.end();
  });
});

tape('[zoom calculation] two-points-medium.geojson', function(assert) {
  var file = 'test/fixtures/zoom-ratio/two-points-medium.geojson';
  var source = new GeoJSON(file);
  source.getZooms(function(err, minzoom, maxzoom) {
    if (err) {
      assert.ifError(err, 'should not error');
      return assert.end();
    }

    assert.ok(err === null);
    console.log(file);
    console.log(minzoom, maxzoom);
    assert.end();
  });
});

tape('[zoom calculation] us-capitals.geojson', function(assert) {
  var file = 'test/fixtures/zoom-ratio/us-capitals.geojson';
  var source = new GeoJSON(file);
  source.getZooms(function(err, minzoom, maxzoom) {
    if (err) {
      assert.ifError(err, 'should not error');
      return assert.end();
    }

    assert.ok(err === null);
    console.log(file);
    console.log(minzoom, maxzoom);
    assert.end();
  });
});
