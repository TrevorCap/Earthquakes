// Store our API endpoint inside queryUrl
var queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";
var secondURL = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json"

// Perform a GET request to the query URL
d3.json(queryUrl, function(data) {
  // Once we get a response, send the data.features object to the createFeatures function
  createFeatures(data.features);
});

d3.json(secondURL, function(data) {
  createLines(data.features);
});

function createFeatures(earthquakeData) {

  // Define a function we want to run once for each feature in the features array
  // Give each feature a popup describing the place and time of the earthquake
  function onEachFeature(feature, layer) {
    layer.bindPopup("<h3>" + feature.properties.place +
      "</h3><hr><h4>Recorded Magnitude: " + feature.properties.mag + "</h4>"
      + "<p>" + new Date(feature.properties.time) + "</p>");
  }

  // Create a GeoJSON layer containing the features array on the earthquakeData object
  // Run the onEachFeature function once for each piece of data in the array
var earthquakes = L.geoJSON(earthquakeData, {
  onEachFeature: onEachFeature,
  pointToLayer: function(feature, latlng) {
      return new L.CircleMarker(latlng, {
          radius: (feature.properties.mag * 3.5),
          fillColor: fillColor(feature.properties.mag),
          fillOpacity: 0.5,
          weight: 1,
          color: '#000000'
      });
  },
});
  // Sending our earthquakes layer to the createMap function
  createMap(earthquakes);
}

function createLines(plateData) {

  // Create a GeoJSON layer containing the features array on the earthquakeData object
  // Run the onEachFeature function once for each piece of data in the array
var plates = L.geoJSON(plateData, {
  pointToLayer: function(feature, latlng) {
      return new L.polyline(latlng, {
          color: '#000000'
      });
  },
});
  // Sending our plates layer to the createMap function
  createMap(plates);
}


function createMap(earthquakes) {

  // Define streetmap and darkmap layers
  var piratemap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 14,
    minZoom: 2,
    id: "mapbox.pirates",
    accessToken: API_KEY
  });

  var comicmap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 14,
    minZoom: 2,
    id: "mapbox.comic",
    accessToken: API_KEY
  });

  var streetmap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 14,
    minZoom: 2,
    id: "mapbox.streets",
    accessToken: API_KEY
  });


  // Define a baseMaps object to hold our base layers
  var baseMaps = {
    "Pirate Map": piratemap,
    "Comic Map": comicmap,
    "Steet Map": streetmap
  };

  // Create overlay object to hold our overlay layer
  var overlayMaps = {
    "Earthquakes": earthquakes,
    "Plates": plates
  };

  // Create our map, giving it the streetmap and earthquakes layers to display on load
  var myMap = L.map("map", {
    center: [
      0, 0
    ],
    zoom: 3,
    layers: [streetmap, earthquakes]
  });

  // Create a layer control
  // Pass in our baseMaps and overlayMaps
  // Add the layer control to the map
  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
  }).addTo(myMap);

  var legend = L.control({position: 'bottomleft'});

  legend.onAdd = function () {

    //Adding a legend to the map using magnitude
    var div = L.DomUtil.create('div', 'info legend');
      var magnitude = [0,1,2,3,4,5,6];
      var colors = magnitude.map(
         m => fillColor(m) 
      );
      var labels = [];
      var legendInfo = "<h1>Magnitude</h1>" +
          "<div class=\"labels\">" +
              "<div class=\"min\">" + magnitude[0] + "</div>" +
              "<div class=\"max\">" + magnitude[magnitude.length - 1] + "</div>" +
          "</div>";
          div.innerHTML = legendInfo;

          magnitude.forEach(function(limit, index) {
              labels.push("<li style=\"background-color: " + fillColor(magnitude[index]) + "\"></li>");
            });
            div.innerHTML += "<ul>" + labels.join("") + "</ul>";   
            return div;
  };
  legend.addTo(myMap);
}
  
  // Create colors for magnitude
  function fillColor(magnituge) {

    switch (true) {
      case magnituge >= 6.0:
        return 'red';
        break;
      
      case magnituge >= 5.0:
        return 'orangered';
        break;
  
      case magnituge >= 4.0:
        return 'darkorange';
        break;
      
      case magnituge >= 3.0:
        return 'orange';
        break;
  
      case magnituge >= 2.0:
        return 'gold';
        break;
  
      case magnituge >= 1.0:
        return 'yellow';
        break;
  
      default:
        return 'greenyellow';
    };
  };