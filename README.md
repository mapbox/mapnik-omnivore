# mapnik-omnivore
Node module that returns metadata of spatial files.
Version format follows [Semantic Version](http://semver.org/)

[![Build Status](https://travis-ci.org/mapbox/mapnik-omnivore.svg?branch=master)](https://travis-ci.org/mapbox/mapnik-omnivore)
[![Build status](https://ci.appveyor.com/api/projects/status/kr1qems47ex9wp3a?svg=true)](https://ci.appveyor.com/project/Mapbox/mapnik-omnivore)
[![Coverage Status](https://coveralls.io/repos/mapbox/mapnik-omnivore/badge.svg?branch=master)](https://coveralls.io/r/mapbox/mapnik-omnivore?branch=master)

Currently supports the following file types:
- `geojson`
- `topojson`
- `kml`
- `gpx`
- `tif`
- `vrt` : raster files listed in the VRT file must be in the same directory as the VRT file
- `csv` : must be valid geo CSV, and can be in the form of `csv`, `txt`, or `tsv`
- `shp` : In order to set the projection, the `.prj` file must be in the same directory and have the same name as the `.shp` file


## Javascript Usage

```
var mapnikOmnivore = require('@mapbox/mapnik-omnivore'),
    path = require('path');

var file = path.resolve('test/data/zip/world_merc/world_merc.shp');

mapnikOmnivore.digest(file, function(err, metadata){
	if (err) return callback(err);
	else {
		console.log('Metadata returned!');
		console.log(metadata);
	}
});
```

### mapnikOmnivore.digest(filepath, callback)
- filepath `required`
- callback `(err, metadata)`


#### Example of returned `metadata`
```
{ filesize: 428328,   // size of file in bytes
  projection: '+proj=merc +a=6378137 +b=6378137 +lat_ts=0.0 +lon_0=0.0 +x_0=0.0 +y_0=0.0 +k=1.0 +units=m +nadgrids=@null +wktext +no_defs +over',
  filename: 'world_merc',
  center: [ 0, 12.048603815490733 ],
  extent: [ -180, -59.47306100000001, 180, 83.57026863098147 ],
  json: { 
  	vector_layers: [ { 
      id: 'world_merc',
      description: '',
      minzoom: 0,
      maxzoom: 22,
      fields: { 
        FIPS: 'String',
        ISO2: 'String',
        ISO3: 'String',
        UN: 'Number',
        NAME: 'String',
        AREA: 'Number',
        POP2005: 'Number',
        REGION: 'Number',
        SUBREGION: 'Number',
        LON: 'Number',
        LAT: 'Number' } 
    } ] 
  },
  minzoom: 0,    // calculates the optimal minimum and
  maxzoom: 5,   // maximum zoom levels for the file
  layers: [ 'world_merc' ],
  dstype: 'shape',
  filetype: '.shp' }
```

Raster files will include a `raster` object:
```
{ filesize: 1494,
  projection: '+proj=aea +lat_1=29.5 +lat_2=45.5 +lat_0=23 +lon_0=-96 +x_0=0 +y_0=0 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs',
  raster: 
   { pixelSize: [ 7.502071930146189, 7.502071930145942 ],
     bandCount: 1,
     bands: [ [Object] ],
     nodata: null,
     origin: [ -1134675.2952829634, 2485710.4658232867 ],
     width: 984,
     height: 804,
     units: { linear: [Object], angular: [Object] } },
  filename: 'sample',
  center: [ -110.32476292309875, 44.56502238336985 ],
  extent: 
   [ -110.3650933429331,
     44.53327824851143,
     -110.28443250326441,
     44.596766518228264 ],
  minzoom: 0,
  maxzoom: 13,
  dstype: 'gdal',
  filetype: '.vrt',
  layers: [ 'sample' ] }

```

## CLI Usage
```
$ npm install --global @mapbox/mapnik-omnivore
$ digest <filepath>
# Prints a JSON string
```

## Generating Mapnik XML

1) Install the https://github.com/mapbox/tilelive-omnivore

2) Use the command line tool it provides, called `mapnik-omnivore` to generate Mapnik XML


## Install
```
npm install @mapbox/mapnik-omnivore
```

## Tests
`npm test`
