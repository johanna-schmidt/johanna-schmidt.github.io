/* Globals */
var COLORS = [
    "#7fc97f",
    "#beaed4",
    "#fdc086",
    "#ffff99",
    "#386cb0",
    "#f0027f",
	"#bf5b17"];


/* Fetches JSON file */
function FetchJSON(url) {
    return fetch(url)
        .then(function(response) {
            return response.json();
        });
}


/* Init map */
function InitMap() {
    BARS = L.layerGroup();
    BEERGARDENS = L.layerGroup();
    CAFES = L.layerGroup();
    FASTFOOD = L.layerGroup();
    PUBS = L.layerGroup();
    RESTAURANTS = L.layerGroup();
    GASSTATIONS = L.layerGroup();

    var mbAttr = 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, ' +
        '<a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
        'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
        mbUrl = 'https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw';

    var grayscale = L.tileLayer(mbUrl, {
        id: 'mapbox/light-v9',
        tileSize: 512,
        zoomOffset: -1,
        attribution: mbAttr
    });
    var streets = L.tileLayer(mbUrl, {
        id: 'mapbox/streets-v11',
        tileSize: 512,
        zoomOffset: -1,
        attribution: mbAttr
    });

    CORONAMAP = L.map('coronamap', {
        center: [48.208311, 16.368566],
        zoom: 13,
        layers: [grayscale, BARS, BEERGARDENS, CAFES, FASTFOOD, PUBS, RESTAURANTS, GASSTATIONS]
    });

    var baseLayers = {
        "Karte (Grau)": grayscale,
        "Karte (Farbe)": streets
    };

    var overlays = {
        "Bars": BARS,
        "Biergärten": BEERGARDENS,
        "Cafés": CAFES,
        "Imbiss": FASTFOOD,
        "Pubs": PUBS,
        "Restaurants": RESTAURANTS,
		"Tankstellen": GASSTATIONS
    };

    L.control.layers(baseLayers, overlays).addTo(CORONAMAP);
}


/* Load data */
function LoadData() {
    FetchJSON('data/bars.geojson').then(function(data) {
        data.features.forEach(function(feature) {
            var p = feature.geometry.coordinates;
            L.circle([p[1], p[0]], {
                color: COLORS[0],
                fillColor: COLORS[0],
                fillOpacity: 0.5,
                radius: 50
            }).on('click', function(e) {
                L.popup()
                    .setLatLng(e.latlng)
                    .setContent((feature.properties.name == undefined ? "Bar" : feature.properties.name))
                    .openOn(CORONAMAP);
            }).addTo(BARS);
        });
    });
    FetchJSON('data/biergarten.geojson').then(function(data) {
        data.features.forEach(function(feature) {
            var p = feature.geometry.coordinates;
            L.circle([p[1], p[0]], {
                color: COLORS[1],
                fillColor: COLORS[1],
                fillOpacity: 0.5,
                radius: 50
            }).on('click', function(e) {
                L.popup()
                    .setLatLng(e.latlng)
                    .setContent((feature.properties.name == undefined ? "Biergarten" : feature.properties.name))
                    .openOn(CORONAMAP);
            }).addTo(BEERGARDENS);
        });
    });
    FetchJSON('data/cafe.geojson').then(function(data) {
        data.features.forEach(function(feature) {
            var p = feature.geometry.coordinates;
            L.circle([p[1], p[0]], {
                color: COLORS[2],
                fillColor: COLORS[2],
                fillOpacity: 0.5,
                radius: 50
            }).on('click', function(e) {
                L.popup()
                    .setLatLng(e.latlng)
                    .setContent((feature.properties.name == undefined ? "Café" : feature.properties.name))
                    .openOn(CORONAMAP);
            }).addTo(CAFES);
        });
    });
    FetchJSON('data/fastfood.geojson').then(function(data) {
        data.features.forEach(function(feature) {
            var p = feature.geometry.coordinates;
            L.circle([p[1], p[0]], {
                color: COLORS[3],
                fillColor: COLORS[3],
                fillOpacity: 0.5,
                radius: 50
            }).on('click', function(e) {
                L.popup()
                    .setLatLng(e.latlng)
                    .setContent((feature.properties.name == undefined ? "Imbiss" : feature.properties.name))
                    .openOn(CORONAMAP);
            }).addTo(FASTFOOD);
        });
    });
    FetchJSON('data/pubs.geojson').then(function(data) {
        data.features.forEach(function(feature) {
            var p = feature.geometry.coordinates;
            L.circle([p[1], p[0]], {
                color: COLORS[4],
                fillColor: COLORS[4],
                fillOpacity: 0.5,
                radius: 50
            }).on('click', function(e) {
                L.popup()
                    .setLatLng(e.latlng)
                    .setContent((feature.properties.name == undefined ? "Pub" : feature.properties.name))
                    .openOn(CORONAMAP);
            }).addTo(PUBS);
        });
    });
    FetchJSON('data/restaurants.geojson').then(function(data) {
        data.features.forEach(function(feature) {
            var p = feature.geometry.coordinates;
            L.circle([p[1], p[0]], {
                color: COLORS[5],
                fillColor: COLORS[5],
                fillOpacity: 0.5,
                radius: 50
            }).on('click', function(e) {
                L.popup()
                    .setLatLng(e.latlng)
                    .setContent((feature.properties.name == undefined ? "Restaurant" : feature.properties.name))
                    .openOn(CORONAMAP);
            }).addTo(RESTAURANTS);
        });
    });
	FetchJSON('data/tankstellen.geojson').then(function(data) {
        data.features.forEach(function(feature) {
            var p = feature.geometry.coordinates;
            L.circle([p[1], p[0]], {
                color: COLORS[6],
                fillColor: COLORS[6],
                fillOpacity: 0.5,
                radius: 50
            }).on('click', function(e) {
                L.popup()
                    .setLatLng(e.latlng)
                    .setContent((feature.properties.name == undefined ? "Tankstelle" : feature.properties.name))
                    .openOn(CORONAMAP);
            }).addTo(GASSTATIONS);
        });
    });
}
