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
* STATISTICAL FUNCTIONS
*****************************************************************/
/**
* Runs statistical analysis on the data
* @param {String} zone - the zone to be analaysed
* @param {String} type - the type of data
* @param {Layer} laye - the layer being added to
*/
function stats(zoneInfo,typeParameter,addToLayer){
  var size = Object.keys(zoneInfo).length;
  var total = 0;
  var n = 0;
  var median;
  var mode;
  var mean;
  var variance;
  var standardDev;
  var typeParameter;
  var q1;
  var q3;
  var iqr;

  var zones = [];
  var a = [];
  var modMap = {};

  // adding count to array with unique id
  $.each(zoneInfo, function(i, item) {
    if($.isNumeric( item[0][typeParameter] )){
      n++;
      var num = parseInt(item[0][typeParameter]);
      total += num;
      a.push(num);
      zones.push({region:i, count:num});

      if(modMap[num]){
        modMap[num]++;
      } else {
        modMap[num] = 1;
      }
    }
  });

  // Sorting array
  sortedZones = zones.sort(function(a,b) { return a.count - b.count; });
  a = a.sort(function(a,b) { return a - b; });

  // Mean
  mean = total / n;

  // Median
  //if n is even
  if( n%2 == 0 ){
    median = a[n/2];
  } else {
    median = ( ( a[ (n/2) + 0.5] + a[ (n/2) - 0.5 ]) / 2 );
  }


  var nPlusOne = n + 1;
  var tempC;
  if (nPlusOne % 2 == 0) {
    median = a[(nPlusOne / 2)];
  } else {
    tempC = Math.floor(nPlusOne / 2);
    median = (a[tempC] + a[tempC + 1]) / 2;
  }
  if (nPlusOne % 4 == 0) {
    q1 = a[nPlusOne / 3];
    q3 = a[3 * (nPlusOne / 3)];
  } else {
    tempC = Math.floor(nPlusOne / 4);
    q1 = (a[tempC] + a[tempC + 1]) / 2;
    q3 = (3 * (a[tempC] + a[tempC + 1])) / 2;
  }
  iqr = q3 - q1;

  // IQR-outliers > median + (1.5 * iqr)  || median - (1.5 * iqr)
  for(zone in sortedZones){
    // poitive outliers
    if(sortedZones[zone].count > (1.5*iqr) + q3){
      if (addToLayer &&  !m.hasLayer(sortedZones[zone].region)) {
        loadGeoJSON(sortedZones[zone].region,"#006400",10);
      }
      else {
        unloadGeoJSON(sortedZones[zone].region);
      }
    }

    // negative outliers
    if(sortedZones[zone].count < q1 - (1.5*iqr)){
      if (addToLayer &&  !m.hasLayer(sortedZones[zone].region)) {
        loadGeoJSON(sortedZones[zone].region,"#FF0000",10);
      }
      else {
        unloadGeoJSON(sortedZones[zone].region);
      }
    }
  }

  var varCount = 0;
  $.each(zoneInfo, function(i, item) {
    if($.isNumeric( item[0][typeParameter] )){
      var num = parseInt(item[0][typeParameter]);
      varCount += Math.pow((num - mean),2);
    }
  });

  variance = varCount / n;
  standardDev = Math.sqrt(variance);

  // Finding Mode
  var highestIndex = 0;
  var highestValue = 0;
  $.each( modMap, function( index, value ){
    if(value > highestValue){
      highestIndex = index;
      highestValue = value;
    }
  });

  var xcount = 0;
  var ycount = 0;
  $.each(zoneInfo, function(i, item) {
    if($.isNumeric( item[0][typeParameter] )){
      var num = parseInt(item[0][typeParameter]);
      if(num < (mean - (1.5)*standardDev)) {
        xcount++;
      }
      if (num > (mean + (1.5)*standardDev)){
        ycount++;
      }
    }
  });
}

/**
* Runs top and bottom statistical analysis on the data
* @param {String} zone - the zone to be analaysed
* @param {String} type - the type of data
* @param {Layer} laye - the layer being added to
*/

function topAndBottom(zoneInfo,typeParameter,addToLayer) {
  var zones = [];
  var modMap = [];
  var num;
  var total;
  $.each(zoneInfo, function(i, item) {
    if($.isNumeric( item[0][typeParameter] )){
      var num = parseInt(item[0][typeParameter]);
      total += num;
      zones.push({region:i, count:num});

      if(modMap[num]){
        modMap[num]++;
      } else {
        modMap[num] = 1;
      }
    }
  });

  // Sorting array
  sortedZones = zones.sort(function(a,b) { return a.count - b.count; });

  var topFive = sortedZones.slice(-5);
  var bottomFive = sortedZones.slice(0,5);

  for (var i in topFive) {
    if(addToLayer && !m.hasLayer(sortedZones[i].region)) {
      loadGeoJSON(topFive[i].region,"#006400", 10);
    }
    else {
      unloadGeoJSON(topFive[i].region);
    }
  }
  for (var i in bottomFive) {
    if(addToLayer && !m.hasLayer(sortedZones[i].region)){
      loadGeoJSON(bottomFive[i].region,"#FF0000", 10);
    }
    else {
      unloadGeoJSON(bottomFive[i].region);
    }
  }
}

/**
* Finds mean of given parameter
* @param {String} type - the type of data
*/
function giveMeanMedian(typeParameter,operation){
  var size = Object.keys(zoneInfo).length;
  var total = 0;
  var n = 0;
  var mean;
  var median;
  var typeParameter;

  var zones = [];
  var a = [];
  var modMap = {};

  // adding count to array with unique id
  $.each(zoneInfo, function(i, item) {
    if($.isNumeric( item[0][typeParameter] )){
      n++;
      var num = parseInt(item[0][typeParameter]);
      total += num;
      a.push(num);
      zones.push({region:i, count:num});

      if(modMap[num]){
        modMap[num]++;
      } else {
        modMap[num] = 1;
      }
    }
  });

  // Sorting array
  sortedZones = zones.sort(function(a,b) { return a.count - b.count; });
  a = a.sort(function(a,b) { return a - b; });

  // Mean
  mean = total / n;

  // Median
  //if n is even
  if( n%2 == 0 ){
    median = a[n/2];
  } else {
    median = ( ( a[ (n/2) + 0.5] + a[ (n/2) - 0.5 ]) / 2 );
  }

  if(operation == "mean") return Math.round(mean * 10)/10;
  else return Math.round(median * 10)/10;

  return null;
}
