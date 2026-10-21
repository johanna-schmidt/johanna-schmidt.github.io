// -------------------- UI State -------------------- //

const state = {
    summary: [],          // rows of summary.csv
    dist: null,           // selected distribution name
    n: null,              // selected sample size
    bins: 20,
    showErrors: true,
    cache: new Map(),     // dist -> { byN: Map<n, number[]>, extent: [min, max] }
    loadToken: 0,         // guards against out-of-order loads
};


// -------------------- UI Elements -------------------- //

const ui = {
    distSelect: document.getElementById('dist-select'),
    sizeButtons: document.getElementById('size-buttons'),
    binSlider: document.getElementById('bin-slider'),
    binValue: document.getElementById('bin-value'),
    errorToggle: document.getElementById('error-toggle'),
    badge: document.getElementById('accuracy-badge'),
    chart: document.getElementById('chart'),
    message: document.getElementById('message'),
    tooltip: document.getElementById('tooltip'),
};

const SPACE_BELOW_CHART = 130;

// -------------------- Plot parameters -------------------- //

const fmt = d3.format(',.4~g');
const fmtCount = d3.format(',');
const fmtCountDec = d3.format(',.1f');

const margin = { top: 10, right: 12, bottom: 40, left: 48 };
const MIN_HEIGHT = 360;

const svg = d3.select(ui.chart).append("svg");
const plot = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);
const gridG = plot.append("g").attr("class", "grid");
const barsG = plot.append("g");
const errG = plot.append("g").attr("class", "errorbars");
const xAxisG = plot.append("g").attr("class", "axis");
const yAxisG = plot.append("g").attr("class", "axis");
const xTitle = plot.append("text").attr("class", "axis-title").attr("text-anchor", "middle");
const yTitle = plot.append("text").attr("class", "axis-title").attr("text-anchor", "middle");
