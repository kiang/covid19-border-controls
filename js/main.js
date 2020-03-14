
var sidebar = new ol.control.Sidebar({ element: 'sidebar', position: 'right' });

var appView = new ol.View({
  center: ol.proj.fromLonLat([120.9820179, 23.9739374]),
  zoom: 4
});

var worldStyle = new ol.style.Style({
  text: new ol.style.Text({
    font: 'bold 16px "Open Sans", "Arial Unicode MS", "sans-serif"',
    fill: new ol.style.Fill({
      color: 'blue'
    })
  }),
  fill: new ol.style.Fill({
    color: 'rgba(255,255,255,1)'
  })
});
var worldColors = {
  'restricted': new ol.style.Fill({
    color: 'rgba(255,0,0,1)'
  }), //red
  'quarantine': new ol.style.Fill({
    color: 'rgba(255,192,203,1)'
  }), //pink
  'advisory': new ol.style.Fill({
    color: 'rgba(255,255,0,1)'
  }), //yellow
  'selected': new ol.style.Fill({
    color: 'rgba(0,255,0,1)'
  }), //yellow
};
var worldStrokes = {
  'default': new ol.style.Stroke({
    color: 'rgba(37,67,140,0.5)',
    width: 1
  }),
  'selected': new ol.style.Stroke({
    color: 'rgba(0,0,255,1)',
    width: 3
  }),
}

var getWorldStyle = function(f) {
  var p = f.getProperties();
  var theStyle = worldStyle.clone();
  if(clickedCountry === p.adm0_a3) {
    theStyle.setFill(worldColors['selected']);
    theStyle.setStroke(worldStrokes['selected']);
  } else if(dataPool[clickedCountry] && dataPool[clickedCountry][p.adm0_a3]) {
    theStyle.setFill(worldColors[dataPool[clickedCountry][p.adm0_a3]]);
    theStyle.setStroke(worldStrokes['default']);
  } else {
    theStyle.setStroke(worldStrokes['default']);
  }
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
var country = {};
var clickedCountry = '';
var findTerms = [];
$.getJSON('json/data.json', {}, function(d) {
  dataPool = d;
});
map.addControl(sidebar);
map.on('singleclick', function(evt) {
  pointClicked = false;
  map.forEachFeatureAtPixel(evt.pixel, function (feature, layer) {
    if(false === pointClicked) {
      pointClicked = true;
      selectFeature(feature);
    }
  });
});
map.once('rendercomplete', function(event) {
  worldSource.forEachFeature(function(wf) {
    var wp = wf.getProperties();
    country[wp.adm0_a3] = wp;
    countryFeatures[wp.adm0_a3] = wf;
    findTerms.push({
      value: wp.adm0_a3,
      label: '[' + wp.adm0_a3 + '] ' + wp.name
    });
  });
  $('#findPoint').autocomplete({
    source: findTerms,
    select: function(event, ui) {
      selectFeature(countryFeatures[ui.item.value]);
    }
  });
});

var countryFeatures = {};
var selectFeature = function(feature) {
  var p = feature.getProperties();
  var message = '';
  clickedCountry = p.adm0_a3;
  sidebarTitle.html(p.name);
  message += '<table class="table table-dark">';
  message += '<tbody>';
  message += '<tr><th scope="row">Name</th><td>' + p.name + '</td></tr>';
  message += '<tr><th scope="row">Region</th><td>' + p.subregion + '</td></tr>';
  worldSource.forEachFeature(function(wf) {
    var wp = wf.getProperties();
    if(dataPool[p.adm0_a3][wp.adm0_a3]) {
      message += '<tr><th scope="row">' + country[wp.adm0_a3].name + '</th><td>' + dataPool[p.adm0_a3][wp.adm0_a3] + '</td></tr>';
    }
  });
  message += '</tbody></table>';
  worldSource.refresh();
  content.html(message);
  sidebar.open('home');
}

var sidebarTitle = $('#sidebarTitle');
var content = $('#sidebarContent');