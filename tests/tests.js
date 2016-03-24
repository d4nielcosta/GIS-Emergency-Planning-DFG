/**
 * Test the initial setup of the project
 */
 QUnit.module("Initialisation");
 QUnit.test( "Check map loaded", function( assert ) {
  assert.ok(getMapStatus(), 'Map successfully loaded');
});

 QUnit.test( "Check side menu loaded", function( assert ) {
  assert.ok(slideout.isOpen(), 'Menu has been successfully loaded and opened');
});

 QUnit.test("Check default map zoom", function(assert) {
  assert.equal(9, getMapZoomAmount(), 'Default zoom value loaded');
});

 QUnit.test("Check default tileset", function(assert) {
  assert.equal(mapTypes["basic"], getMapTileURL(), 'Default tileset loaded');
});

 QUnit.test("Check default view centre", function(assert){
  assert.equal(m.getCenter().toString(), "LatLng(54.88426, -3.70064)", "Default view centre");
 });

/**
 * Test the user interface
 */

 QUnit.module("User Interface");

 QUnit.test("Change the tileset", function(assert){
  changeMapTileSet("wikipedia");
  assert.equal(mapTypes["wikipedia"], getMapTileURL(), 'Tileset changed to wikipedia');
  changeMapTileSet("mapquest");
  assert.equal(mapTypes["mapquest"], getMapTileURL(), 'Tileset changed to mapquest');
  changeMapTileSet("hike");
  assert.equal(mapTypes["hike"], getMapTileURL(), 'Tileset changed to hike');
  changeMapTileSet("hill");
  assert.equal(mapTypes["hill"], getMapTileURL(), 'Tileset changed to hill');
});

QUnit.test("Destroy menu then restart it", function(assert) {
  slideout.destroy();
  assert.equal(setupMenu(350), 1, "Menu reloaded");
});

QUnit.test("Check colour selectors are generated", function(assert) {
  addColourSelectors();
  assert.equal($("#datazones01_colour").length, 1, "Menu exists")
});

QUnit.test("Accessibility mode status", function(assert){
  assert.equal(getAccessibilityModeStatus(),accessibilityMode,"Accessibility mode status reported");
});

QUnit.test("Accessibility mode change", function(assert){
  start = getAccessibilityModeStatus();
  changeAccessibilityMode()
  assert.notEqual(getAccessibilityModeStatus(),start,"Accessibility status changed");
});

QUnit.test("Accessibility mode toggle", function(assert){
  
  toggleAccessibilityMode(); //Turn it on
  assert.ok($("body").hasClass('accessibility-mode'), "Accessibility class applied");

  toggleAccessibilityMode(); //Turn it off again
  assert.notOk($("body").hasClass('accessibility-mode'), "Accessibility class removed");
 });

/**
 * Test the loading and unloading of layers on the map
 */

 QUnit.module("Layer loading & unloading", {
  beforeEach: function(){
    //Load the layer in the app
    loadGeoJSON('datazones01');
  }
});
 QUnit.test("Layer loading", function(assert){
  assert.ok('datazones01' in geoLayers, 'Layer loaded');
  });

 QUnit.test("Layer unloading", function(assert){
  unloadGeoJSON('datazones01');

  assert.notOk(m.hasLayer('datazones01'), 'Layer removed from map');
});

/**
 * Test the display of the map
 */
 QUnit.module("Map Display", {
  beforeEach: function(){
    loadDataZones();
  }
});

 QUnit.test("Layer styling", function(assert){
  loadGeoJSON('RECYCLING_SITES52727');
  styleLayer('RECYCLING_SITES52727', '#FF0000');
  assert.equal(getLayerColour('RECYCLING_SITES52727'), '#FF0000', 'Styling applied');
});