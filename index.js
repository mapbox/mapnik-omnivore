var fs = require('fs'),
    path = require('path'),
    invalid = require('./lib/invalid'),
    mapnik = require('mapnik'),
    sniffer = require('mapbox-file-sniff'),
    queue = require('queue-async'),
    modules = [
      require('./lib/geojson'),
      require('./lib/raster'),
      require('./lib/shape'),
      require('./lib/ogr')
    ];

// Register datasource plugins
mapnik.register_default_input_plugins();
// silence mapnik logs
mapnik.Logger.setSeverity(mapnik.Logger.NONE);

/**
 * Initializes the module
 * @param file (filepath)
 * @returns metadata {filesize, projection, filename, center, extent, json, minzoom, maxzoom, layers, dstype, filetype}
 */
module.exports.digest = function(file, callback) {
  sniffer.quaff(file, function(err, filetype) {
    if (err) return callback(err);
    getMetadata(file, filetype, function(err, metadata) {
      if (err) return callback(err);
      return callback(null, metadata);
    });
  });
};

/**
 * Validates size of file and processes the file
 * @param file (filepath)
 * @returns metadata {filesize, projection, filename, center, extent, json, minzoom, maxzoom, layers, dstype, filetype}
 */
function getMetadata(file, filetype, callback) {
  var type = modules.filter(function(module) {
        var done = module.validFileType.some(function(t) {
          return t === filetype;
        });
        if (done) return module;
      }),
      metadata = {
        filename: path.basename(file, path.extname(file))
      },
      q = queue(1),
      source;

  // Instantiate new object, based on datatype
  try {
    source = new type[0](file);
  } catch (err) {
    return callback(invalid('Error creating Mapnik Datasource: ' + err.message));
  }

  // Build metadata object for source asynchronously
  metadata.filetype = '.' + filetype;
  metadata.dstype = source.dstype;

  q.defer(function(next) {
    fs.stat(file, function(err, stats) {
      if (err) return callback(invalid(err));
      metadata.filesize = stats.size;
      next();
    });
  });

  q.defer(function(next) {
    source.getCenter(function(err, center) {
      if (err) return next(err);
      metadata.center = center;
      next();
    });
  });

  q.defer(function(next) {
    source.getExtent(function(err, extent) {
      if (err) return next(err);
      metadata.extent = extent;
      next();
    });
  });

  q.defer(function(next) {
    source.getZooms(function(err, minzoom, maxzoom) {
      if (err) return next(err);
      metadata.minzoom = minzoom;
      metadata.maxzoom = maxzoom;
      next();
    });
  });

  q.defer(function(next) {
    source.getProjection(function(err, projection) {
      if (err) return next(err);
      metadata.projection = projection;
      next();
    });
  });

  q.defer(function(next) {
    source.getDetails(function(err, details) {
      if (err) return next(err);
      var detailsName = source.detailsName;
      metadata[detailsName] = details;
      next();
    });
  });

  q.defer(function(next) {
    source.getLayers(function(err, layers) {
      if (err) return next(err);
      metadata.layers = layers;
      next();
    });
  });

  q.await(function(err) {
    if (err) return callback(invalid(err));
    console.log('all done!');
    callback(err, metadata);
  });
}

// TODOs
// - Does filesniffer verify VRT, CSV, topojson?
// -
