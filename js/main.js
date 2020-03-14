
var sidebar = new ol.control.Sidebar({ element: 'sidebar', position: 'right' });

var appView = new ol.View({
  center: ol.proj.fromLonLat([120.9820179, 23.9739374]),
  zoom: 5
});

var worldStyle = new ol.style.Style({
  stroke: new ol.style.Stroke({
    color: 'rgba(37,67,140,0.5)',
    width: 1
  }),
  text: new ol.style.Text({
    font: 'bold 16px "Open Sans", "Arial Unicode MS", "sans-serif"',
    fill: new ol.style.Fill({
      color: 'blue'
    })
  }),
  fill: new ol.style.Fill({
    color: 'rgba(255,255,255,0.1)'
  })
});

var getWorldStyle = function(f) {
  var p = f.getProperties();
  var theStyle = worldStyle.clone();
  theStyle.getText().setText(p.admin);
  return theStyle;
}

var world = new ol.layer.Vector({
  source: new ol.source.Vector({
    url: 'json/world.json',
    format: new ol.format.GeoJSON()
  }),
  style: getWorldStyle
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