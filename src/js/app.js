/*
The MIT License (MIT)

Copyright (c) [2016] [DUMFRIES AND GALLOWAY EMERGENCY PLANNING GIS - UNIVERSITY OF GLASGOW]

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/


/*****************************************************************
* SETUP VARIABLES
*****************************************************************/
var m;
var geoLayers = {};
var zoneInfo = {};
var sortedZones = [];
var mopt;
var mq;
var started = false;
var slideout;
var mapTypes = {};
var accessibilityMode = false;
var DATA_ZONES_START = 1000897;
var DATA_ZONES_END = 1001089;

/*****************************************************************
* MAP TYPES
*****************************************************************/

mapTypes["basic"] = "http://a.tile.openstreetmap.org/{z}/{x}/{y}.png";
mapTypes["wikipedia"] = "https://maps.wikimedia.org/osm-intl/{z}/{x}/{y}.png";
mapTypes["mapquest"] = "http://otile1.mqcdn.com/tiles/1.0.0/osm/{z}/{x}/{y}.png";
mapTypes["openCycleMap"] = "http://a.tile.opencyclemap.org/cycle/{z}/{x}/{y}.png";
mapTypes["hike"] = "http://toolserver.org/tiles/hikebike/{z}/{x}/{y}.png";
mapTypes["hill"] = "http://c.tiles.wmflabs.org/hillshading/{z}/{x}/{y}.png";
mapTypes["bw"] = "http://a.tile.stamen.com/toner/{z}/{x}/{y}.png";
mapTypes["transport"] = "http://a.tile2.opencyclemap.org/transport/{z}/{x}/{y}.png";
mapTypes["landscape"] = "http://a.tile.thunderforest.com/landscape/{z}/{x}/{y}.png";
mapTypes["outdoors"] = "http://a.tile.thunderforest.com/outdoors/{z}/{x}/{y}.png";


/*****************************************************************
* SETUP APP
*****************************************************************/

$(document).foundation();

$(document).ready(function() {
  $.getJSON('data/information.json', function(data) {
    zoneInfo = data;
  });

  // Load slideout menu
  setupMenu();

  // Setup the colour selectors
  addColourSelectors();

  // If map has not been loaded, then load the map
  if (started == false) startMap();

  // Setup slider
  $(function() {
    $('#slides').slidesjs({
      preload: true,
      width: 940,
      height: 528
    });
  });

  // checks for either showing or hiding the tutorial at the start
  if(localStorage['tutorial'] != 'hide'){
    $('#siteTutorial').foundation('open');
  } else {
    $('#tutorial-checkbox').prop( "checked", true );
  }

  /*****************************************************************
  * LISTENERS
  *****************************************************************/

  /**
  * Listens for checkbox clicks to either show or hide tutorial at start
  * @name Checkbox Listener
  */
  $('#tutorial-checkbox').click(function(event) {
    if(this.checked){
      localStorage['tutorial'] = 'hide';
    }else{
      localStorage['tutorial'] = 'show';
    }
  });

  /**
  * Listens for click on tutorial button
  * @name Checkbox Listener
  */
  $('.header-tutorial').click(function() {
    $('#siteTutorial').foundation('open');

    $('#siteTutorial').css('top', '0');

    $('.slidesjs-container').css('width', '566px');
    $('.slidesjs-container').css('height', '317px');

    $('.slidesjs-control').css('width', '566px');
    $('.slidesjs-control').css('height', '317px');
  });

  /**
  * Listens for checkbox values being changed and updates the map depending on the value chosenn
  * @name Checkbox Listener
  */
  $(".area_setting").click(function(event) {
    // id of the checkbox that has been clicked
    var id = event.target.id;
    if ($("#" + id).prop('checked') == true) {
      // load relevant GeoJSON
      if(id == "datazones01") {
        loadDataZones();
      } else {
        loadGeoJSON(id);
      }
    } else {
      // unload relevant GeoJSON
      if(id == "datazones01") {
        unloadDataZones();
      } else {
        unloadGeoJSON(id);
      }
    }
  });

  /**
  * Listens for the dataset values being changed and updates the map accordingly
  * @name Checkbox Listener
  */
  $(".dataset").click(function(event) {
    refreshDataZones();
  });

  /**
  * Listens for the selecting all the filters
  * @name Checkbox Listener
  */
  $(".select-all").click(function(event) {
    $('.dataset').prop('checked', $(this).prop("checked"));
  });

  /**
  * Checks for any boxes that are already ticked by default or if the page has been reloaded
  * @name Map Reloader Listener
  */
  $('input:checkbox:checked').map(function() {
    // load relevant GeoJSON
    if(this.id == "datazones01") {
      loadDataZones();
    } else {
      loadGeoJSON(this.id);
    }
  });

  /**
  * Waits for the update button to be pressed and then updates the map styles
  * @name Map Style Listener
  */
  $('#update').click(function() {
    $('input[type=checkbox]:checked').each(function() {
      styleLayer(this.id, $("#" + this.id + "_colour").val());
    });
  });


  /**
  * Listens for the settings button to be selected
  * @name Settings Menu Listener
  */
  $('.header-dropbtn').click(function() {
    document.getElementById("header-dropdown").classList.toggle("header-show");
  });

  /**
  * Listens for the user clicking off the settings menu and then closes the menu when deselected
  * @name Settings Menu Door
  */
  window.onclick = function(event) {
    if (!event.target.matches('.header-dropbtn-option') && !event.target.matches('i.fa.fa-cog')) {
      var dropdowns = document.getElementsByClassName("header-dropdown-content");
      var i;
      for (i = 0; i < dropdowns.length; i++) {
        var openDropdown = dropdowns[i];
        if (openDropdown.classList.contains('header-show')) {
          openDropdown.classList.remove('header-show');
        }
      }
    }
  }

  /**
  * Listens for the tile changer select to be changed and then calls the update map function
  * @name Map Tile Changer Listener
  */
  $('.header-dropbtn-map-styler').on('change', function() {
    changeMapTileSet(this.value);
  });

  /**
  * Listen for the accessibility toggle to be changed
  * @name Accessibility Toggle Listener
  */
  $('#header-accessibility-btn').on('change', function(){ // on change of state
    if(this.checked) {
      toggleAccessibilityMode();
    } else {
      toggleAccessibilityMode();
    }
  });

  /**
  * Checks if accessibility mode is enabled by default on page load
  */
  if($('#header-accessibility-btn').is(':checked') == true) {
    toggleAccessibilityMode();
  }

  /**
  * Listens for the tile changer select to be changed and then calls the update map function
  * @name Map Tile Changer Listener
  */
  $('.header-dropbtn-map-styler').on('change', function() {
    changeMapTileSet(this.value);
  });

  /**
  * Listens for changes to the stats layers
  * @name Stats Listener
  */
  $( "input[class='dataset-stat']" ).click(function(event) {
    if(this.checked){
      if($(".dataset[id='"+this.id+"']").is(':checked')){
        stats(zoneInfo, this.id, true);
      } else {
        $(".dataset[id='"+this.id+"']").click();
        stats(zoneInfo, this.id, true);
      }
    } else if (!this.checked) {
      if($(".dataset[id='"+this.id+"']").is(':checked')){
        $(".dataset[id='"+this.id+"']").click();
        stats(zoneInfo, this.id, false);
      } else {
        stats(zoneInfo, this.id, false);
      }
    }
  });

  $( "input[class='dataset-top-bottom']" ).click(function(event) {
    if(this.checked){
      if($(".dataset[id='"+this.id+"']").is(':checked')){
        topAndBottom(zoneInfo, this.id, true);
      } else {
        $(".dataset[id='"+this.id+"']").click();
        topAndBottom(zoneInfo, this.id, true);
      }
    } else if (!this.checked){
      if($(".dataset[id='"+this.id+"']").is(':checked')){
        $(".dataset[id='"+this.id+"']").click();
        topAndBottom(zoneInfo, this.id, false);
      } else {
        topAndBottom(zoneInfo, this.id, false);
      }
    }
  });
});


/**
* Hides the datasets when datazones is not selected
* @name Datasets Toggle Listener
*/
$('#datazones01').click(function() {
  $("#dataset_toggle").slideToggle();
});
if($('#datazones01').is(':checked') == true) {
  $("#dataset_toggle").show();
} else {
  $("#dataset_toggle").hide();
}

/*****************************************************************
* MENU FUNCTIONS
*****************************************************************/

/**
* Sets up a new sidebar menu
* @constructor
* @returns {Boolean} Returns true if the menu has been created and opened correctly
*/
function setupMenu(menuSize) {
  if (!menuSize) menuSize = 350;
  slideout = new Slideout({
    'panel': document.getElementById('panel'),
    'menu': document.getElementById('menu'),
    'padding': menuSize,
    'tolerance': 70,

  });

  // Toggle button
  document.querySelector('.toggle-button').addEventListener('click', function() {
    slideout.toggle();
  });
  slideout.open();

  // construct fast live filters on the four search menus
  $('#search_input_4').fastLiveFilter('#search_list_4');
  $('#search_input_3').fastLiveFilter('#search_list_3');
  $('#search_input_2').fastLiveFilter('#search_list_2');
  $('#search_input_1').fastLiveFilter('#search_list_1');

  return slideout.isOpen();
}

/**
* Filters out the search results for the fast live menus
* @param {string} element - the search box the user enters text in which will be filtered
* @param {string} what - the list which will be modified to show results
*/
function filter(element, what) {
  var value = $(element).val();
  value = value.toLowerCase().replace(/\b[a-z]/g, function(letter) {
    return letter.toUpperCase();
  });
  if (value == '')
  $(what + ' > a > li').show();
  else {
    $(what + ' > a > li:not(:contains(' + value + '))').hide();
    $(what + ' > a > li:contains(' + value + ')').show();
  }
};

/**
* Add colour picker to each element
*/

function addColourSelectors()
{
  var lis = document.getElementById("search_list_1").getElementsByTagName("input");
  //console.log(lis);

  for (i = 0; i < lis.length; i++)
  {
    //console.log("#" + lis[i].id + "_colour");
    $("#" + lis[i].id + "_colour").spectrum({
      color: '#'+Math.floor(Math.random()*16777215).toString(16),
      preferredFormat: "hex"
    });
  }
}

/**
*  Disable all the keyboard shortcuts provided by foundation.
*  This fixes the bug where searching a space colapses the menu.
*/
Foundation.Keyboard.handleKey = function(){};


/*****************************************************************
* ACCESSIBILITY FUNCTIONS
*****************************************************************/

/**
* Toggles accessibility mode
*/
function toggleAccessibilityMode() {
  accessibilityMode = !accessibilityMode;
  $('body').toggleClass('accessibility-mode');

  if (getAccessibilityModeStatus() == true) {
    $(".slideout_m-menu").width( 550 );
    slideout._translateTo = 500;
    $(".slideout-panel").css({"transform": "translateX(500px)", "-ms-transform": "translateX(500px)", "webkit-transform": "translateX(500px)" });

  } else {
    $(".slideout_m-menu").width( 350 );
    slideout._translateTo = 350;
    $(".slideout-panel").css({"transform": "translateX(350px)", "-ms-transform": "translateX(350px)", "webkit-transform": "translateX(350px)" });
  }

}

/*
* Checks whether or not the site is in accessibility mode
* @return {Boolean}
*/
function getAccessibilityModeStatus() {
  return accessibilityMode;
}

/**
* Inverts the value of accessibility mode
*/
function changeAccessibilityMode() {
  accessibilityMode = !accessibilityMode;
}

/*****************************************************************
* MAP FUNCTIONS
*****************************************************************/

/**
* Sets up the Open Street Map
* @return {Boolean} - returns true if the map has been successfully created
*/
function startMap() {
  // Create map and set default view to Dumfires & Galloway
  m = L.map('map', {
    zoomControl: true
  }).setView([54.8842612523, -3.70063719199], 9);
  // Map of GeoJSON layers
  geoLayers = {};

  m.zoomControl.setPosition('topleft');
  // Map Settings
  mopt = {
    url: mapTypes["basic"],
    options: {
      subdomains: '1234',
    }

  };


  mq = L.tileLayer(mopt.url, mopt.options);

  // Add tiles to map
  mq.addTo(m);

  loadGeoJSON("boundry", "#003300", 1, 5, -1);

  started = true;
  //console.log(mq);
}

/**
* When datazones are loaded they are called from a seperate file so we need to load them individually
*/
function loadDataZones() {
  for(var i = DATA_ZONES_START; i <= DATA_ZONES_END; i++) {
    loadGeoJSON("datazones01/S0"+i, $("#datazones01_colour").spectrum('get').toHexString());
  }
}

/**
* When datazones are loaded they are called from a seperate file so we need to UNload them individually
*/
function unloadDataZones() {
  for(var i = DATA_ZONES_START; i <= DATA_ZONES_END; i++) {
    unloadGeoJSON("datazones01/S0"+i, $("#datazones01_colour").spectrum('get').toHexString());
  }
}

/**
* Reload the datazones file to update the statistical data shown
*/
function refreshDataZones() {
  if($("#datazones01").is(":checked")) {
    unloadDataZones();
    loadDataZones();
  }
}

/**
* Unloads the datazones and then reloads them with the proper colour
*/
function styleDataZone() {
  unloadDataZones()
  loadDataZones();
}

/**
* Displays more information on the map when area is clicked
* @param {String} f - the parameter in the GeoJson document
* @param {String} l - the popup menu element that will be created and the content added to
*/
function popUp(f, l) {
  // ADDED STATS IN POP UP - NEW CHANGE
  var val;
  var out = [];
  var dataset = $("");
  if (f.properties){
    // only if layer is datazone1
    if(f.properties["DZ_CODE"]){
      val = f.properties["DZ_CODE"];
      out.push("<h6 style='margin-bottom: 0.1px; color: #4e914d'>"+zoneInfo[val][0]["Intermediate Zone"]+"</h6>");
      $( "input[class='dataset']" ).each(function( index ) {
        if(this.checked){
          out.push(this.id+ ": " + zoneInfo[val][0][this.id]);
          out.push("<i><b>Mean:</b> "+ giveMeanMedian(this.id,"mean") + "</i>");
          out.push("<i><b>Median:</b> "+ giveMeanMedian(this.id,"median") +"</i><br/>");
        }
      });
    } else {
      for (var key in f.properties) {
        out.push(key + ": " + f.properties[key]);
      }
    }
    l.bindPopup(out.join("<br />"));
  }
}

/**
* Loads relevant GeoJSON file to map in a new layer
* @param id - name of GeoJSON file
*/
function loadGeoJSON(id, colour, opacity, weight, fill) {
  // To prevent loading layer if its already loaded
  if(m.hasLayer(geoLayers[id])) unloadGeoJSON(id);
  if (!fill) fill = 0.5;
  if (!weight) weight = 2;
  if (!opacity) opacity = 0.5;
  if (!colour && $("#" + id + "_colour").length != 0) {
    colour = $("#" + id + "_colour").spectrum('get').toHexString();
  }
  geoLayers[id] = new L.GeoJSON.AJAX(["data/" + id + ".json"], {
    onEachFeature: popUp,
    style: {
      "color": colour,
      "weight": weight,
      "opacity": opacity,
      "fillOpacity": fill,

    }
  }).addTo(m);

}


/**
* Unloads relevant GeoJSON file to map
* @param {Number} id - id of data set
*/
function unloadGeoJSON(id) {
  m.removeLayer(geoLayers[id]);
}

/**
* Modifies the style of the chosen layer
* @param {Number} id - the id of the element that is to be modified
* @param {String} colour - the colour the element is to be
*/
function styleLayer(id, colour) {

  if (id == "datazones01") {
    styleDataZone()
  } else {
    // unload layer
    unloadGeoJSON(id);
    // load with new settings
    geoLayers[id] = new L.GeoJSON.AJAX(["./data/" + id + ".json"], {
      onEachFeature: popUp,
      style: {
        "color": colour,
        "weight": 2,
        "opacity": 0.5
      }
    }).addTo(m);
  }

}


/**
* Changes the tile set of the map
* @param {String} tileSet - the tileset that the map will use
*/
function changeMapTileSet(tileSet) {
  m.removeLayer(mq);
  mq = L.tileLayer(mapTypes[tileSet], mopt.options);
  mq.addTo(m);
}

/**
* Checks whether or not the map has been constructed
* @returns {Boolean} true = map has been setup false = failure to setup
*/
function getMapStatus() {
  return mq._map._loaded;
}

/**
* Returns the colour of a layer
* @param {String} layer - the ID of the layer
* @returns {Hex} colour - hex value of the layer colour
*/
function getLayerColour(layer) {
  return geoLayers[layer].options.style.color;
}

/**
* Returns the URL of the data file for a chosen layer
* @param {String} layer - the ID of the layer
* @returns {URL} url - the url of the data file
*/
function getLayerURL(layer) {
  return geoLayers[layer].urls[0];
}

/**
* Returns the URL of the map tile set
* @returns {URL} url - the url of the data file
*/
function getMapTileURL() {
  return mq._url;
}

/**
* Returns the current zoom value
* @returns {Number} zoom - how far the map is zoomed in (default is 9)
*/
function getMapZoomAmount() {
  return mq._map._zoom;
}

/**
* Checks if the selected layer exists
* @param {String} layer - the layer to be checked
* @returns {Boolean} true - layer exits false - layer does not exist
*/
function checkLayerExists(layer) {
  return m.hasLayer(geoLayers[layer]);
}
/**
* Changes the tile set of the map
* @param {String} tileSet - the tileset that the map will use
*/
function changeMapTileSet(tileSet) {
  m.removeLayer(mq);
  mq = L.tileLayer(mapTypes[tileSet], mopt.options);
  mq.addTo(m);
}
