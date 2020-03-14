
var sidebar = new ol.control.Sidebar({ element: 'sidebar', position: 'right' });
var jsonFiles, filesLength, fileKey = 0;

var appView = new ol.View({
  center: ol.proj.fromLonLat([120.9820179, 23.9739374]),
  zoom: 5
});

var raster = new ol.layer.Tile({
  source: new ol.source.OSM()
});

var world = new ol.layer.Vector({
  source: new ol.source.Vector({
    url: 'json/world.json',
    format: new ol.format.GeoJSON()
  })
});
var map = new ol.Map({
  layers: [world],
  target: 'map',
  view: appView
});
var lastFeature = false;
map.addControl(sidebar);
map.on('singleclick', function(evt) {
  var message = '';
  map.forEachFeatureAtPixel(evt.pixel, function (feature, layer) {
    var p = feature.getProperties();
    console.log(p);
  });
  content.innerHTML = message;
  sidebar.open('home');
});


var sidebarTitle = document.getElementById('sidebarTitle');
var content = document.getElementById('sidebarContent');