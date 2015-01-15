//console.log("You must first edit \'runModule.js\' for it to complete: add your filepath and uncomment.");
var mapnikOmnivore = require('./index.js'),
    path = require('path');

var file = path.resolve('./5GB.tif');

mapnikOmnivore.digest(file, function(err, metadata){
	if(err) console.log(err);
	else {
		console.log('Metadata returned!');
		console.log(metadata);
	}
});
