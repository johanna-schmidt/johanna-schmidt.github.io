/* Globals */
const COLORS = [
    "#7fc97f",
    "#beaed4",
    "#fdc086",
    "#ffff99",
    "#386cb0",
    "#f0027f",
	"#bf5b17"
];
const TERMS = [
    "Bar",
    "Biergarten",
    "Café",
    "Imbiss",
    "Pub",
    "Restaurant",
    "Tankstelle"
];


/* Init map */
function InitMap() {
    BARS = L.layerGroup();
    BEERGARDENS = L.layerGroup();
    CAFES = L.layerGroup();
    FASTFOOD = L.layerGroup();
    PUBS = L.layerGroup();
    RESTAURANTS = L.layerGroup();
    GASSTATIONS = L.layerGroup();

    const mbAttr = 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, ' +
        '<a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
        'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
        mbUrl = 'https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw';

    const grayscale = L.tileLayer(mbUrl, {
        id: 'mapbox/light-v9',
        tileSize: 512,
        zoomOffset: -1,
        attribution: mbAttr
    });
    const streets = L.tileLayer(mbUrl, {
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

    const baseLayers = {
        "Karte (Grau)": grayscale,
        "Karte (Farbe)": streets
    };

    const overlays = {
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


/* Fetches JSON file */
function FetchJSON(url) {
    return fetch(url)
        .then(function(response) {
            return response.json();
        });
}


/* Load data */
function LoadData() {
    FetchJSON('data/bars.geojson').then(function(data) {
        data.features.forEach(function(feature) {
            CreateCircle(0, feature).addTo(BARS);
        });
    });
    FetchJSON('data/biergarten.geojson').then(function(data) {
        data.features.forEach(function(feature) {
            CreateCircle(1, feature).addTo(BEERGARDENS);
        });
    });
    FetchJSON('data/cafe.geojson').then(function(data) {
        data.features.forEach(function(feature) {
            CreateCircle(2, feature).addTo(CAFES);
        });
    });
    FetchJSON('data/fastfood.geojson').then(function(data) {
        data.features.forEach(function(feature) {
            CreateCircle(3, feature).addTo(FASTFOOD);
        });
    });
    FetchJSON('data/pubs.geojson').then(function(data) {
        data.features.forEach(function(feature) {
            CreateCircle(4, feature).addTo(PUBS);
        });
    });
    FetchJSON('data/restaurants.geojson').then(function(data) {
        data.features.forEach(function(feature) {
            CreateCircle(5, feature).addTo(RESTAURANTS);
        });
    });
	FetchJSON('data/tankstellen.geojson').then(function(data) {
        data.features.forEach(function(feature) {
            CreateCircle(6, feature).addTo(GASSTATIONS);
        });
    });
}

function CreateCircle(idx, feature) {
    const p = feature.geometry.coordinates;
    const n = feature.properties.name;
    return L.circle([p[1], p[0]], {
        color: COLORS[idx],
        fillColor: COLORS[idx],
        fillOpacity: 0.5,
        radius: 50
    }).on('click', function(e) {
        L.popup()
            .setLatLng(e.latlng)
            .setContent(n === undefined ? TERMS[idx] : n)
            .openOn(CORONAMAP);
    });
}
