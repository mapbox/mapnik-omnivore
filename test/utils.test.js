var tape = require('tape');
var fs = require('fs');
var utils = require('../lib/utils.js');


tape('[CONVERT TO METERS] Should not convert cell sizes in m', function(assert) {
  var cellSize = [10, 10];
  var unitType = 'm';
  assert.deepEqual(utils.convertToMeters(cellSize, unitType), cellSize, 'Should not convert meter input');
  assert.end();
});

tape('[CONVERT TO METERS] Should accurately convert cell sizes from ft', function(assert) {
  var cellSize = [0.5, 0.5];
  var unitType = 'ft';
  var cellSizeM = utils.convertToMeters(cellSize, unitType);
  var expectedM = [0.1524, 0.1524];
  assert.deepEqual(cellSizeM, expectedM, 'Should convert ft to m accurately');
  assert.end();
});

tape('[CONVERT TO METERS] Should accurately convert cell sizes from miles', function(assert) {
  var cellSize = [500, 500];
  var unitType = 'mi';
  var cellSizeM = utils.convertToMeters(cellSize, unitType);
  var expectedM = [804670, 804670];
  assert.deepEqual(cellSizeM, expectedM, 'Should convert mi to m accurately');
  assert.end();
});

tape('[CONVERT TO METERS] Should accurately convert cell sizes from km', function(assert) {
  var cellSize = [1, 1];
  var unitType = 'km';
  var cellSizeM = utils.convertToMeters(cellSize, unitType);
  var expectedM =  [1000, 1000];
  assert.deepEqual(cellSizeM, expectedM, 'Should convert km to m accurately');
  assert.end();
});

tape('[CONVERT TO METERS] Should accurately convert cell sizes from us-ft', function(assert) {
  var cellSize = [0.5, 0.5];
  var unitType = 'us-ft';
  var cellSizeM = utils.convertToMeters(cellSize, unitType);
  var expectedM = [0.1524, 0.1524];
  assert.deepEqual(cellSizeM, expectedM, 'Should convert us-ft to m accurately');
  assert.end();
});

tape('[CONVERT TO METERS] Should accurately convert cell sizes from us miles', function(assert) {
  var cellSize = [500, 500];
  var unitType = 'us-mi';
  var cellSizeM = utils.convertToMeters(cellSize, unitType);
  var expectedM = [804670, 804670];
  assert.deepEqual(cellSizeM, expectedM, 'Should convert us-mi to m accurately');
  assert.end();
});

tape('[CONVERT TO METERS] Should throw with invalid unit type', function(assert) {
  var cellSize = [500, 500];
  var unitType = 'cubits';
  assert.throws(function() { utils.convertToMeters(cellSize, unitType); })
  assert.end();
});

tape('[SPATIAL RESOLUTIONS] Get spatial resolutions / valid spatial resolutions', function(assert) {
  var spatialResolutions = utils.getSpatialResolutions();
  var expectedResolutions = JSON.parse('[156542.96875,78271.484375,39135.7421875,19567.87109375,9783.935546875,4891.9677734375,2445.98388671875,1222.991943359375,611.4959716796875,305.74798583984375,152.87399291992188,76.43699645996094,38.21849822998047,19.109249114990234,9.554624557495117,4.777312278747559,2.3886561393737793,1.1943280696868896,0.5971640348434448,0.2985820174217224,0.1492910087108612,0.0746455043554306 ]');
  assert.deepLooseEqual(spatialResolutions, expectedResolutions);

  var validSpatialResolutions = utils.getValidSpatialResolutions(spatialResolutions, 30.20012, 0);
  var expectedValidResolutions = JSON.parse('[156542.96875,78271.484375,39135.7421875,19567.87109375,9783.935546875,4891.9677734375,2445.98388671875,1222.991943359375,611.4959716796875,305.74798583984375,152.87399291992188,76.43699645996094,38.21849822998047]');
  assert.deepLooseEqual(validSpatialResolutions, expectedValidResolutions);

  assert.end();
});

tape('[SPATIAL RESOLUTIONS] Get spatial resolutions / valid spatial resolutions with weight 0.1 (over)', function(assert) {
  var spatialResolutions = utils.getSpatialResolutions();
  var expectedResolutions = JSON.parse('[156542.96875,78271.484375,39135.7421875,19567.87109375,9783.935546875,4891.9677734375,2445.98388671875,1222.991943359375,611.4959716796875,305.74798583984375,152.87399291992188,76.43699645996094,38.21849822998047,19.109249114990234,9.554624557495117,4.777312278747559,2.3886561393737793,1.1943280696868896,0.5971640348434448,0.2985820174217224,0.1492910087108612,0.0746455043554306 ]');
  assert.deepLooseEqual(spatialResolutions, expectedResolutions);

  var validSpatialResolutions = utils.getValidSpatialResolutions(spatialResolutions, 0.1492910087108612, 0.1);
  var expectedValidResolutions = JSON.parse('[156542.96875,78271.484375,39135.7421875,19567.87109375,9783.935546875,4891.9677734375,2445.98388671875,1222.991943359375,611.4959716796875,305.74798583984375,152.87399291992188,76.43699645996094,38.21849822998047,19.109249114990234,9.554624557495117,4.777312278747559,2.3886561393737793,1.1943280696868896,0.5971640348434448,0.2985820174217224]');
  assert.deepLooseEqual(validSpatialResolutions, expectedValidResolutions);

  assert.end();
});

tape('[SPATIAL RESOLUTIONS] Get spatial resolutions / valid spatial resolutions with weight 0.1 (under)', function(assert) {
  var spatialResolutions = utils.getSpatialResolutions();
  var expectedResolutions = JSON.parse('[156542.96875,78271.484375,39135.7421875,19567.87109375,9783.935546875,4891.9677734375,2445.98388671875,1222.991943359375,611.4959716796875,305.74798583984375,152.87399291992188,76.43699645996094,38.21849822998047,19.109249114990234,9.554624557495117,4.777312278747559,2.3886561393737793,1.1943280696868896,0.5971640348434448,0.2985820174217224, 0.1492910087108612, 0.0746455043554306 ]');
  assert.deepLooseEqual(spatialResolutions, expectedResolutions);

  var validSpatialResolutions = utils.getValidSpatialResolutions(spatialResolutions, 0.1392910087108612, 0.1);
  var expectedValidResolutions = JSON.parse('[156542.96875,78271.484375,39135.7421875,19567.87109375,9783.935546875,4891.9677734375,2445.98388671875,1222.991943359375,611.4959716796875,305.74798583984375,152.87399291992188,76.43699645996094,38.21849822998047,19.109249114990234,9.554624557495117,4.777312278747559,2.3886561393737793,1.1943280696868896,0.5971640348434448,0.2985820174217224,0.1492910087108612]');
  assert.deepLooseEqual(validSpatialResolutions, expectedValidResolutions);

  assert.end();
});

tape('[SPATIAL RESOLUTIONS] Get spatial resolutions / valid spatial resolutions with weight 0.25', function(assert) {
  var spatialResolutions = utils.getSpatialResolutions();
  var expectedResolutions = JSON.parse('[156542.96875,78271.484375,39135.7421875,19567.87109375,9783.935546875,4891.9677734375,2445.98388671875,1222.991943359375,611.4959716796875,305.74798583984375,152.87399291992188,76.43699645996094,38.21849822998047,19.109249114990234,9.554624557495117,4.777312278747559,2.3886561393737793,1.1943280696868896,0.5971640348434448,0.2985820174217224, 0.1492910087108612, 0.0746455043554306 ]');
  assert.deepLooseEqual(spatialResolutions, expectedResolutions);

  var validSpatialResolutions = utils.getValidSpatialResolutions(spatialResolutions, 40.20012, 0.25);
  var expectedValidResolutions = JSON.parse('[156542.96875,78271.484375,39135.7421875,19567.87109375,9783.935546875,4891.9677734375,2445.98388671875,1222.991943359375,611.4959716796875,305.74798583984375,152.87399291992188,76.43699645996094]');
  assert.deepLooseEqual(validSpatialResolutions, expectedValidResolutions);

  assert.end();
});

tape('[SPATIAL RESOLUTIONS] Get spatial resolutions / valid spatial resolutions with weight 1', function(assert) {
  var spatialResolutions = utils.getSpatialResolutions();
  var expectedResolutions = JSON.parse('[156542.96875,78271.484375,39135.7421875,19567.87109375,9783.935546875,4891.9677734375,2445.98388671875,1222.991943359375,611.4959716796875,305.74798583984375,152.87399291992188,76.43699645996094,38.21849822998047,19.109249114990234,9.554624557495117,4.777312278747559,2.3886561393737793,1.1943280696868896,0.5971640348434448,0.2985820174217224, 0.1492910087108612, 0.0746455043554306 ]');
  assert.deepLooseEqual(spatialResolutions, expectedResolutions);

  var validSpatialResolutions = utils.getValidSpatialResolutions(spatialResolutions, 39, 1);
  var expectedValidResolutions = JSON.parse('[156542.96875,78271.484375,39135.7421875,19567.87109375,9783.935546875,4891.9677734375,2445.98388671875,1222.991943359375,611.4959716796875,305.74798583984375,152.87399291992188]');
  assert.deepLooseEqual(validSpatialResolutions, expectedValidResolutions);

  assert.end();
});