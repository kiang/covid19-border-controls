
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
  }), //green
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
  if(clickedCountry === p.ISO_A2) {
    theStyle.setFill(worldColors['selected']);
    theStyle.setStroke(worldStrokes['selected']);
  } else if(dataPool[clickedCountry] && dataPool[clickedCountry][p.ISO_A2]) {
    theStyle.setFill(worldColors[dataPool[clickedCountry][p.ISO_A2].type]);
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
    country[wp.ISO_A2] = wp;
    countryFeatures[wp.ISO_A2] = wf;
    findTerms.push({
      value: wp.ISO_A2,
      label: '[' + wp.ISO_A2 + '] ' + wp.name
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
  clickedCountry = p.ISO_A2;
  sidebarTitle.html(p.NAME);
  message += '<table class="table table-dark">';
  message += '<tbody>';
  message += '<tr><th scope="row">Name</th><td>' + p.NAME + '</td></tr>';
  message += '<tr><th scope="row">Region</th><td>' + p.SUBREGION + '</td></tr>';
  message += '</tbody></table><p>&nbsp;</p>';
  message += '<table class="table">';
  message += '<tbody>';
  message += '<tr><th scope="row" colspan="2">Border Status</th></tr>';
  worldSource.forEachFeature(function(wf) {
    var wp = wf.getProperties();
    if(dataPool[p.ISO_A2] && dataPool[p.ISO_A2][wp.ISO_A2]) {
      message += '<tr><th scope="row"><a href="#" class="country-border" data-code="' + wp.ISO_A2 + '">' + country[wp.ISO_A2].NAME + '</a></th>'
      message += '<td><a href="#" class="country-border" data-code="' + wp.ISO_A2 + '">' + dataPool[p.ISO_A2][wp.ISO_A2].type + '</a></td></tr>';
    }
  });
  message += '</tbody></table>';
  worldSource.refresh();
  content.html(message);
  $('a.country-border', content).click(function(e) {
    var clickedCode = $(this).attr('data-code');
    var message = '';
    if(dataPool[clickedCountry] && dataPool[clickedCountry][clickedCode]) {
      message += '<table class="table table-dark">';
      message += '<tbody>';
      for(k in dataPool[clickedCountry][clickedCode]) {
        message += '<tr><th scope="row">' + k + '</th><td>' + dataPool[clickedCountry][clickedCode][k] + '</td></tr>';
      }
      message += '</tbody></table>';
    }
    $('#countryDetails').html(message);
    sidebar.open('book');
    e.preventDefault();
  });
  sidebar.open('home');
}

var sidebarTitle = $('#sidebarTitle');
var content = $('#sidebarContent');