var gdal = require('gdal'),
    mapnik = require('mapnik'),
    srs = require('srs'),
    invalid = require('./invalid'),
    path = require('path');

mapnik.register_default_input_plugins();

module.exports = Raster;

function Raster(filepath) {
  this.filepath = filepath;
  this.details = {};
  this.basename = path.basename(this.filepath, path.extname(this.filepath));

  try {
    this.mapnikDatasource = new mapnik.Datasource({
      type: 'gdal',
      file: filepath
    });

    this.gdalDatasource = gdal.open(filepath);
    if (this.gdalDatasource.driver.description === 'VRT') {
      var filelist = this.gdalDatasource.getFileList();
      if (filelist.length === 1) throw invalid('VRT file does not reference existing source files.');
    }
  }
  catch (err) {
    throw invalid('Invalid raster: could not open the file');
  }

  try {
    this.details.width = this.gdalDatasource.rasterSize.x;
    this.details.height = this.gdalDatasource.rasterSize.y;
  }
  catch (err) {
    throw invalid('Invalid raster: could not read image dimensions');
  }

  try {
    var geotransform = this.gdalDatasource.geoTransform;
    this.details.pixelSize = [geotransform[1], geotransform[5]];
    this.details.origin = [geotransform[0], geotransform[3]];
  }
  catch (err) {
    throw invalid('Invalid raster: could not read georeferencing information');
  }

  try { this.projection = srs.parse(this.gdalDatasource.srs.toWKT()).proj4; }
  catch (err) {
    throw invalid('Invalid raster: could not read spatial reference information');
  }
}

Raster.validFileType = ['tif', 'vrt'];
Raster.prototype.detailsName = 'raster';
Raster.prototype.dstype = 'gdal';

Raster.prototype.getProjection = function(callback) {
  return callback(null, this.projection);
};

Raster.prototype.getCenter = function(callback) {
  this.getExtent(function(err, extent) {
    if (err) return callback(err);

    return callback(null, [
      0.5 * (extent[0] + extent[2]),
      0.5 * (extent[1] + extent[3])
    ]);
  });
};

Raster.prototype.getExtent = function(callback) {
  var current = new mapnik.Projection(this.projection),
      wgs84 = new mapnik.Projection('+proj=longlat +ellps=WGS84 +datum=WGS84 +no_defs'),
      extent, transform;

  try {
    extent = this.mapnikDatasource.extent();
  }
  catch (err) {
    return callback(
      invalid('Invalid raster: could not read extent')
    );
  }

  if (current !== wgs84) {
    transform = new mapnik.ProjTransform(current, wgs84);
    extent = transform.forward(extent);
  }

  return callback(null, extent);
};

Raster.prototype.getBands = function() {
  var numBands = this.gdalDatasource.bands.count(),
      i, band, bandInfo, bands = [];

  for (i = numBands; i <= numBands; i++) {
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
    catch (err) {
      throw invalid('Invalid raster: could not read band information');
    }

    bands.push(bandInfo);
  }

  return bands;
};

Raster.prototype.getLayers = function(callback) {
  return callback(null, [this.basename]);
};

/**
 * Detects unit type of the gdal source, using the srs/projection
 * @param srs
 * @returns unit type (String)
 */
function getUnitType(srs) {
  var possibleUnits = ['m', 'ft', 'mi', 'km', 'us-ft', 'us-mi'],
      i;
  for (i = 0; i < possibleUnits.length; i++) {
    if (srs.indexOf('+units=' + possibleUnits[i]) !== -1) return possibleUnits[i];
  }
  if (srs.indexOf('+units=') === -1 && srs.indexOf('+proj=longlat') !== -1) return 'decimal degrees';
  //Default to meters for now, if nothing matches
  else return 'm';
}

function convertToMeters(pixelSize, unit) {
  var circumference = 40075000,
      conversions = {
        m: function(x) { return x; },
        ft: function(x) { return x / 0.3048; },
        mi: function(x) { return x / 1609.34; },
        km: function(x) { return x / 1000; },
        'us-ft': function(x) { return x / 0.3048; },
        'us-mi': function(x) { return x / 1609.34; },
        'decimal degrees': function(x) { return x / 360 * circumference; }
      },

      x = conversions[unit](pixelSize[0]),
      y = conversions[unit](pixelSize[1]);

  return [x, y];
}

Raster.prototype.getZooms = function(callback) {
  var pixelSize = convertToMeters(this.details.pixelSize, getUnitType(this.projection)),
    circumference = 40075000,
    zoomLevels = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19],
    spatialResolutions = zoomLevels.map(function(z) {
      return circumference * Math.cos(0) / Math.pow(2, (z + 8));
    }),

    _this = this,
    validSpatialResolutions = spatialResolutions.filter(function(res) {
      return res > _this.details.pixelSize[0];
    });

  this.details.pixelSize = pixelSize;
  return callback(
    null,
    Math.max(0, validSpatialResolutions.length - 6),
    validSpatialResolutions.length
  );
};

Raster.prototype.getDetails = function(callback) {
  var details = this.details,
      ref;

  try {
    details.width = this.gdalDatasource.rasterSize.x;
    details.height = this.gdalDatasource.rasterSize.y;
  }
  catch (err) {
    return callback(
      invalid('Invalid raster: could not read image dimensions', err)
    );
  }

  try {
    details.bandCount = this.gdalDatasource.bands.count();
    details.bands = this.getBands();
    details.nodata = this.details.bands[0].nodata;
  }
  catch (err) {
    return callback(
      invalid('Invalid raster: could not get band information', err)
    );
  }

  try {
    ref = gdal.SpatialReference.fromProj4(this.projection);
    details.units = {
      linear: ref.getLinearUnits(),
      angular: ref.getAngularUnits()
    };
  }
  catch (err) {
    return callback(
      invalid('Invalid raster: could not read spatial reference information', err)
    );
  }

  return callback(null, details);
};
