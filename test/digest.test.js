var test = require('tape');
var path = require('path');
var digest = path.resolve(__dirname, '..', 'bin', 'digest');
var testData = path.join(path.dirname(require.resolve('mapnik-test-data')), 'data');
var fixture = path.join(testData, 'geojson', 'DC_polygon.geo.json');
var spawn = require('child_process').spawn;

test('[bin/digest] errors if not passed valid path', function(assert) {
  var args = [digest];

  spawn(process.execPath, args)
    .on('error', function(err) {
      assert.ok(err, 'should error');
    })
    .on('close', function(code) {
      assert.equal(code, 1, 'exit 1');
      assert.end();
    })
    .stderr.pipe(process.stdout);
});

test('[bin/digest] runs on an absolute file path', function(assert) {
  var args = [digest, fixture];

  spawn(process.execPath, args)
    .on('error', function(err) {
      assert.ifError(err, 'should not error');
    })
    .on('close', function(code) {
      assert.equal(code, 0, 'exit 0');
      assert.end();
    })
    .stderr.pipe(process.stdout);
});

test('[bin/digest] runs on a relative file path', function(assert) {
  var options = {
    cwd: path.resolve(__dirname, '..', 'node_modules')
  };
  var args = [digest, path.relative(options.cwd, fixture)];

  spawn(process.execPath, args, options)
    .on('error', function(err) {
      assert.ifError(err, 'should not error');
    })
    .on('close', function(code) {
      assert.equal(code, 0, 'exit 0');
      assert.end();
    })
    .stderr.pipe(process.stdout);
});
