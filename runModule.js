var mapnikOmnivore = require('./index.js'),
    path = require('path');

var file = path.resolve('test/data/topojson/topo.json');

mapnikOmnivore.digest(file, function(err, metadata){
	if(err) console.log(err);
	else {
		console.log('Metadata returned!');
		console.log(metadata);
	}
});