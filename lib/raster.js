var gdal = require('gdal');
var mapnik = require('mapnik');

mapnik.register_default_input_plugins();

module.exports = function(filepath) {
  return new Raster(filepath);
};

function Raster(filepath) {
  this.filepath = filepath;
  this.details = {};

  try {
    this.mapnikDatasource = new mapnik.Datasource({
      type: 'gdal',
      file: filepath
    });

    this.gdalDatasource = gdal.open(filepath);
  }
  catch(err) {
    throw FriendlyError('Invalid raster: could not open the file', err);
  }

  try {
    this.details.width = ds.rasterSize.x;
    this.details.height = ds.rasterSize.y;
  }
  catch(err) {
    throw FriendlyError('Invalid raster: could not read image dimensions', err);
  }

  try {
    var geotransform = this.gdalDatasource.geoTransform;
    this.details.pixelSize = [ geotransform[1], -geotransform[5] ];
    this.details.origin = [ geotransform[0], geotransform[3] ];
  }
  catch(err) {
    return callback(
      FriendlyError('Invalid raster: could not read georeferencing information', err)
    );
  }
}

Raster.prototype.getBands = function() {
  var numBands = this.gdalDatasource.bands.count();
  var band, bandInfo, bands = [];

  for (var i; i <= numBands; i++) {
    band = this.gdalDatasource.bands.get(i);

    try {
      bandInfo = {
        stats: band.getStatistics(false, true),
        scale: band.scale,
        unitType: band.unitType,
        rasterDatatype: band.dataType,
        categoryNames: band.categoryNames,
        hasArbitraryOverviews: band.hasArbitraryOverviews,
        overviews: band.overviews,
        nodata: band.noDataValue,
        id: band.id,
        blockSize: band.blockSize,
        color: band.colorInterpretation
      };
    }
    catch(err) {
      throw FriendlyError('Invalid raster: could not read band information', err);
    }

    bands.push(bandInfo);
  }

  return bands;
};

Raster.prototype.getProjection = function(callback) {
  var proj4;
  try { proj4 = srs.parse(this.gdalDatasource.srs.toWKT()).proj4; }
  catch(err) {
    return callback(
      FriendlyError('Invalid raster: could not read spatial reference information', err)
    );
  }
  callback(null, proj4);
};

Raster.prototype.getCenter = function(callback) {
  this.getExtent(function(err, extent) {
    if (err) return callback(err);

    callback(null, [
      0.5 * (extent[0] + extent[2]),
      0.5 * (extent[1] + extent[3])
    ]);
  });
};

Raster.prototype.getExtent = function(callback) {
  var extent;
  try {
    extent = this.mapnikDatasource.extent();
  }
  catch(err) {
    return callback(
      FriendlyError('Invalid raster: could not read extent')
    );
  }

  this.getProjection(function(err, proj4) {
    if (err) return callback(err);

    var current = new mapnik.Projection(proj4);
    var wgs84 = new mapnik.Projection('+proj=longlat +ellps=WGS84 +datum=WGS84 +no_defs');

    if (current !== wgs84) {
      var transform = new mapnik.ProjTransform(current, wgs84);
      extent = transform.forward(extent);
    }

    callback(null, extent);
  });
};

Raster.prototype.getZooms = function(callback) {
  var circumference = 40075000;
  var pixelSize = this.details.pixelSize;

  // Create lookup table to determine max zoom level for given spatial resolution
  var zoomLevels = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19];
  var spatialResolutions = zoomLevels.map(function(z) {
    return circumference * Math.cos(0) / Math.pow(2, (z + 8));
  });

  var validSpatialResolutions = spatialResolutions.filter(function(res) {
    return res > pixelSize[0];
  });

  var maxzoom = validSpatialResolutions.length;
  var minzoom = Math.max(0, maxzoom - 6);

  return callback(null, minzoom, maxzoom);
};

Raster.prototype.getDetails = function(callback) {
  var details = this.details;

  try {
    details.width = this.gdalDatasource.rasterSize.x;
    details.height = this.gdalDatasource.rasterSize.y;
  }
  catch(err) {
    return callback(
      FriendlyError('Invalid raster: could not read image dimensions', err)
    );
  }

  try {
    details.bandCount = this.gdalDatasource.bands.count();
    details.bands = this.getBands();
    details.nodata = this.details.bands[0].nodata;
  }
  catch(err) {
    throw FriendlyError('Invalid raster: could not get band information', err);
  }

  this.getProjection(function(err, proj4) {
    if (err) return callback(err);

    try {
      var ref = gdal.SpatialReference.fromProj4(info.proj4);
      details.units = {
        linear: ref.getLinearUnits(),
        angular: ref.getAngularUnits()
      };
    }
    catch(error) {
      return callback(
        FriendlyError('Invalid raster: could not read spatial reference information', err)
      );
    }

    callback(null, details);
  });
};

function FriendlyError(message, err) {
  var error = new Error(message);
  error.code = 'EINVALID';
  error.original = err;
  return error;
}
