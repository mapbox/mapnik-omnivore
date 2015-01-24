var tape = require('tape'),
    path = require('path'),
    fs = require('fs'),
    cp = require('child_process');
    testData = path.dirname(require.resolve('mapnik-test-data')),
    mapnik_omnivore = require('../index.js');

var expectedMetadata_world_merc = JSON.parse(fs.readFileSync(path.resolve('test/fixtures/metadata_world_merc.json')));

tape('[digest bin] should return expected metadata', function(assert) {
    var file = path.join(testData,'data/shp/world_merc/world_merc.shp');
    var command = path.join(__dirname,"../bin/digest");
    command += " " + file;
    cp.exec(command,{}, function(err,stdout,stderr) {
        if (err) return done(err);
        assert.ok(err === null);
        try {
            assert.deepEqual(JSON.parse(stdout), expectedMetadata_world_merc);
        } catch (err) {
            console.log(err);
            console.log("Expected mapnik-omnivore metadata has changed. Writing new metadata to file.");
            fs.writeFileSync(path.resolve('test/fixtures/metadata_world_merc.json'), JSON.stringify(metadata));
        }
        assert.end();
    });
});

