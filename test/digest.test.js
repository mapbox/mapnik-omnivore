var test = require('tape'),
    path = require('path'),
    digest = path.resolve(__dirname, '..', 'bin', 'digest'),
    testData = path.join(path.dirname(require.resolve('mapnik-test-data')), 'data'),
    fixture = path.join(testData, 'geojson', 'DC_polygon.geo.json'),
    spawn = require('child_process').spawn;

test('[bin/digest] runs on an absolute file path', function(assert) {
  var args = [fixture];
  spawn(digest, args)
    .on('error', function(err) {
      assert.ifError(err, 'should not error');
    })
    .on('exit', function(code) {
      assert.equal(code, 0, 'exit 0');
      assert.end();
    });
});

test('[bin/digest] runs on a relative file path', function(assert) {
  var options = {
        cwd: path.resolve(__dirname, '..', 'node_modules')
      },
      args = [path.relative(options.cwd, fixture)];

  spawn(digest, args, options)
    .on('error', function(err) {
      assert.ifError(err, 'should not error');
    })
    .on('exit', function(code) {
      assert.equal(code, 0, 'exit 0');
      assert.end();
    });
});
