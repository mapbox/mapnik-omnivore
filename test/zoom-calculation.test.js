var tape = require('tape');
var GeoJSON = require('../lib/geojson.js');
var mapnik = require('mapnik');
mapnik.register_default_input_plugins();

tape('[zoom calculation] points', function(assert) {
  tape('[points] poi-calgary.geojson', function(assert) {
    var file = 'test/fixtures/zoom-ratio/poi-calgary.geo.json';
    var source = new GeoJSON(file);
    source.getZooms(function(err, minzoom, maxzoom) {
      if (err) {
        assert.ifError(err, 'should not error');
        return assert.end();
      }

      assert.ok(err === null);
      assert.equal(minzoom, 0);
      assert.equal(maxzoom, 14);
      assert.end();
    });
  });

  tape('[points] single-point.geojson', function(assert) {
    var file = 'test/fixtures/zoom-ratio/single-point.geojson';
    var source = new GeoJSON(file);
    source.getZooms(function(err, minzoom, maxzoom) {
      if (err) {
        assert.ifError(err, 'should not error');
        return assert.end();
      }

      assert.ok(err === null);
      assert.equal(minzoom, 0);
      assert.equal(maxzoom, 11);
      assert.end();
    });
  });

  tape('[points] two-points-close.geojson', function(assert) {
    var file = 'test/fixtures/zoom-ratio/two-points-close.geojson';
    var source = new GeoJSON(file);
    source.getZooms(function(err, minzoom, maxzoom) {
      if (err) {
        assert.ifError(err, 'should not error');
        return assert.end();
      }

      assert.ok(err === null);
      assert.equal(minzoom, 0);
      assert.equal(maxzoom, 12);
      assert.end();
    });
  });

  tape('[points] two-points-far.geojson', function(assert) {
    var file = 'test/fixtures/zoom-ratio/two-points-far.geojson';
    var source = new GeoJSON(file);
    source.getZooms(function(err, minzoom, maxzoom) {
      if (err) {
        assert.ifError(err, 'should not error');
        return assert.end();
      }

      assert.ok(err === null);
      assert.equal(minzoom, 0);
      assert.equal(maxzoom, 11);
      assert.end();
    });
  });

  tape('[points] two-points-medium.geojson', function(assert) {
    var file = 'test/fixtures/zoom-ratio/two-points-medium.geojson';
    var source = new GeoJSON(file);
    source.getZooms(function(err, minzoom, maxzoom) {
      if (err) {
        assert.ifError(err, 'should not error');
        return assert.end();
      }

      assert.ok(err === null);
      assert.equal(minzoom, 0);
      assert.equal(maxzoom, 11);
      assert.end();
    });
  });

  tape('[points] us-capitals.geojson', function(assert) {
    var file = 'test/fixtures/zoom-ratio/us-capitals.geojson';
    var source = new GeoJSON(file);
    source.getZooms(function(err, minzoom, maxzoom) {
      if (err) {
        assert.ifError(err, 'should not error');
        return assert.end();
      }

      assert.ok(err === null);
      assert.equal(minzoom, 0);
      assert.equal(maxzoom, 11);
      assert.end();
    });
  });

  assert.end();
});
