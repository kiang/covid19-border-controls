
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

var worldSource = new ol.source.Vector({
  url: 'json/world.json',
  format: new ol.format.GeoJSON()
});
var world = new ol.layer.Vector({
  source: worldSource,
  style: getWorldStyle
});
var map = new ol.Map({
  layers: [world],
  target: 'map',
  view: appView
});

var pointClicked = false;
var dataPool = false;
$.getJSON('json/data.json', {}, function(d) {
  dataPool = d;
});
map.addControl(sidebar);
map.on('singleclick', function(evt) {
  var message = '';
  pointClicked = false;
  map.forEachFeatureAtPixel(evt.pixel, function (feature, layer) {
    if(false === pointClicked) {
      pointClicked = true;
      var p = feature.getProperties();
      p.adm0_a3;
      sidebarTitle.html(p.name);
      message += '<table class="table table-dark">';
      message += '<tbody>';
      message += '<tr><th scope="row">Name</th><td>' + p.name + '</td></tr>';
      message += '<tr><th scope="row">Region</th><td>' + p.subregion + '</td></tr>';
      worldSource.forEachFeature(function(wf) {
        var wp = wf.getProperties();
        if(dataPool[p.adm0_a3][wp.adm0_a3]) {
          message += '<tr><th scope="row">' + wp.adm0_a3 + '</th><td>' + dataPool[p.adm0_a3][wp.adm0_a3] + '</td></tr>';
        }
      });
      message += '</tbody></table>';
    }
  });
  content.html(message);
  sidebar.open('home');
});


var sidebarTitle = $('#sidebarTitle');
var content = $('#sidebarContent');