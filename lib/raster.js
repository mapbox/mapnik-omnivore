var gdal = require('gdal');
var mapnik = require('mapnik');
var srs = require('srs');
var path = require('path');

mapnik.register_default_input_plugins();

module.exports = Raster;

function Raster(filepath) {
  this.filepath = filepath;
  this.details = {};
  this.filename = path.basename(this.filepath, path.extname(this.filepath));

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
    this.details.width = this.gdalDatasource.rasterSize.x;
    this.details.height = this.gdalDatasource.rasterSize.y;
  }
  catch(err) {
    throw FriendlyError('Invalid raster: could not read image dimensions', err);
  }

  try {
    var geotransform = this.gdalDatasource.geoTransform;
    this.details.pixelSize = [ geotransform[1], geotransform[5] ];
    this.details.origin = [ geotransform[0], geotransform[3] ];
  }
  catch(err) {
    throw FriendlyError('Invalid raster: could not read georeferencing information', err);
  }

  try { this.projection = srs.parse(this.gdalDatasource.srs.toWKT()).proj4; }
  catch(err) {
    throw FriendlyError('Invalid raster: could not read spatial reference information', err);
  }


}

Raster.validFileType = 'tif';
Raster.prototype.detailsName = 'raster';
Raster.prototype.dstype = 'gdal';

Raster.prototype.getFilename = function(callback) {
  return callback(null, this.filename);
};

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
  var extent;
  try {
    extent = this.mapnikDatasource.extent();
  }
  catch(err) {
    return callback(
      FriendlyError('Invalid raster: could not read extent')
    );
  }
  
  var current = new mapnik.Projection(this.projection);
  var wgs84 = new mapnik.Projection('+proj=longlat +ellps=WGS84 +datum=WGS84 +no_defs');

  if (current !== wgs84) {
    var transform = new mapnik.ProjTransform(current, wgs84);
    extent = transform.forward(extent);
  }

  return callback(null, extent);
};

Raster.prototype.getBands = function() {
  var numBands = this.gdalDatasource.bands.count();
  var band, bandInfo, bands = [];

  for (var i = numBands; i <= numBands; i++) {
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

Raster.prototype.getLayers = function(callback) {
  return callback(null, [ this.filename ]);
};

/**
 * Detects unit type of the gdal source, using the srs/projection
 * @param srs
 * @returns unit type (String)
 */
function getUnitType(srs){
    var possibleUnits = ['m','ft','mi','km','us-ft','us-mi'];
    for(var i = 0; i < possibleUnits.length; i++){
        if(srs.indexOf("+units=" + possibleUnits[i]) !== -1) return possibleUnits[i];
    }
    if(srs.indexOf("+units=") === -1 && srs.indexOf("+proj=longlat") !== -1) return 'decimal degrees';
    //Default to meters for now, if nothing matches
    else return 'm';
}

function convertToMeters(pixelSize, unit) {
  var circumference = 40075000;
  
  var conversions = {
    'm': function(x) { return x; },
    'ft': function(x) { return x / 0.3048; },
    'mi': function(x) { return x / 1609.34; },
    'km': function(x) { return x / 1000; },
    'us-ft': function(x) { return x / 0.3048; },
    'us-mi': function(x) { return x / 1609.34; },
    'decimal degrees': function(x) { return x / 360 * circumference; }
  }
  
  var x = conversions[unit](pixelSize[0]);
  return [x, -1 * x];
}

Raster.prototype.getZooms = function(callback) {
    var circumference = 40075000;
    
    this.details.pixelSize = convertToMeters(this.details.pixelSize, getUnitType(this.projection));

    // Create lookup table to determine max zoom level for given spatial resolution
    var zoomLevels = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19];
    var spatialResolutions = zoomLevels.map(function(z) {
        return circumference * Math.cos(0) / Math.pow(2, (z + 8));
    });
    var _this = this;
    var validSpatialResolutions = spatialResolutions.filter(function(res) {
      return res > _this.details.pixelSize[0];
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

  try {
    var ref = gdal.SpatialReference.fromProj4(this.projection);
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

  return callback(null, details);
};

function FriendlyError(message, err) {
  var error = new Error(message);
  error.code = 'EINVALID';
  error.original = err;
  return error;
}
