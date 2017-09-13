var gdal = require('gdal');
var mapnik = require('mapnik');
var srs = require('srs');
var invalid = require('./invalid');
var path = require('path');
var utils = require('./utils');

module.exports = Raster;

function Raster(filepath) {
  var geotransform;
  var filelist;

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
      filelist = this.gdalDatasource.getFileList();
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
    geotransform = this.gdalDatasource.geoTransform;
  }
  catch (err) {
    throw invalid('Invalid raster: could not read georeferencing information');
  }

  if (!geotransform) throw invalid('could not read georeferencing information');

  var ratio = Math.abs(geotransform[1] / geotransform[5]);

  if (geotransform[1] <= 0 || geotransform[5] >= 0) throw invalid('Invalid raster: Invalid pixelsize in geotransform array');
  if (ratio < 0.5 || ratio > 2) throw invalid('Invalid raster: Invalid pixelsize in geotransform array');
  if (geotransform[2] !== 0 || geotransform[4] !== 0) throw invalid('Invalid raster: Invalid rotation value in geotransform array');

  this.details.pixelSize = [geotransform[1], geotransform[5]];
  this.details.origin = [geotransform[0], geotransform[3]];

  try { this.projection = srs.parse(this.gdalDatasource.srs.toWKT()).proj4; }
  catch (err) {
    throw invalid('Invalid raster: could not read spatial reference information');
  }

  if (this.projection === '') throw invalid('Invalid projection');
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
  var current = new mapnik.Projection(this.projection);
  var wgs84 = new mapnik.Projection('+proj=longlat +ellps=WGS84 +datum=WGS84 +no_defs');
  var extent;
  var transform;

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
  var numBands = this.gdalDatasource.bands.count();
  var bandInfo;
  var bands = [];
  var i;
  var band;

  for (i = 1; i <= numBands; i++) {
    band = this.gdalDatasource.bands.get(i);

    try {
      bandInfo = {
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

    try {
      bandInfo.stats = band.getStatistics(true, true);
    }
    catch (err) {
      // ignore--this is non-fatal
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

Raster.prototype.getZooms = function(callback) {
  var pixelSize = utils.convertToMeters(this.details.pixelSize, utils.getUnitType(this.projection));

  var spatialResolutions = utils.getSpatialResolutions();

  /*
  * Threshold weight = the amount to shift the break;
  * 0 = no shift (always upsamples), 1 = full shift (always downsamples)
  * 0.25 threshold means that we'll upsample 75% of the time
  */
  var thresholdWeight = 0.25;
  var _this = this;
  var validSpatialResolutions = utils.getValidSpatialResolutions(spatialResolutions, _this.details.pixelSize[0], thresholdWeight);

  this.details.pixelSize = pixelSize;
  return callback(
    null,
    0,
    validSpatialResolutions.length
  );
};

Raster.prototype.getDetails = function(callback) {
  var details = this.details;
  var ref;

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
