var spawn = require('child_process').spawn,
    path = require('path'),
    fs = require('fs'),
    jshint = path.resolve(__dirname, '..', 'node_modules', '.bin', 'jshint'),
    jscs = path.resolve(__dirname, '..', 'node_modules', '.bin', 'jscs'),
    root = path.resolve(__dirname, '..'),

    folders = [
      path.resolve(__dirname, '..', 'lib'),
      path.resolve(__dirname, '..', 'test'),
      path.resolve(__dirname, '..', 'bin')
    ],

    files = folders
      .reduce(function(files, folder) {
        return files.concat(fs.readdirSync(folder)
          .filter(function(filename) {
            return path.extname(filename) === '.js';
          })
          .map(function(filename) {
            return path.join(folder, filename);
          }));
      }, [])
      .concat([path.join(root, 'index.js')]);

runJsHint();

function runJsHint() {
  var p = spawn(jshint, files, { cwd: root })
    .on('error', function(err) { throw err; })
    .on('exit', function(code) { if (code === 0) runJsCs(); });

  p.stdout.pipe(process.stdout);
  p.stderr.pipe(process.stderr);
}

function runJsCs() {
  var p = spawn(jscs, files, { cwd: root })
  .on('error', function(err) { throw err; })
  .on('exit', function(code) { if (code === 0) runTests(); });

  p.stdout.pipe(process.stdout);
  p.stderr.pipe(process.stderr);
}

function runTests() {
  fs.readdirSync(__dirname)
    .filter(function(filename) {
      return /\.test\.js$/.test(filename);
    })
    .forEach(function(filename) {
      require(path.join(__dirname, filename));
    });
}
