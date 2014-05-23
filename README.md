# mapnik-omnivore
Node module that returns metadata of spatial files.

[![Build Status](https://travis-ci.org/mapbox/mapnik-omnivore.svg?branch=master)](https://travis-ci.org/mapbox/mapnik-omnivore)

Currently supports the following file types:
- `.kml`
- `.gpx`
- `.geo.json`
- `.shp`  (In order to set the projection, the `.prj` file must be in the same directory and have the same name as the `.shp` file)

# How to Use

```
var mapnikOmnivore = require('mapnik-omnivore'),
    path = require('path');

var file = path.resolve('test/data/zip/world_merc/world_merc.shp');

mapnikOmnivore.digest(file, function(err, metadata){
	if(err) return callback(err);
	else {
		console.log('Metadata returned!');
		console.log(metadata);
	}
});
```

### mapnikOmnivore.digest(filepath, callback)
- filepath `required`
- callback

#### Example of returned `metadata`
```
 metadata: 
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

Run `node runModule.js` from the root to try it out.


## Tests
`npm test`