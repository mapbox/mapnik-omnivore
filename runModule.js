var mapnikOmnivore = require('./index.js'),
    path = require('path');

var file = path.resolve('test/data/geojson/DC_polygon.geo.json');

mapnikOmnivore.digest(file, function(err, metadata){
	if(err) console.log(err);
	else {
		console.log('Metadata returned!');
		console.log(metadata);
	}
});