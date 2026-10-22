// -------------------- Application State -------------------- //

const state = {
    summary: [],
    dist: null,
    n: null,
    bins: 20,
    showUncertainty: true,
    uncertaintyType: 'errorbars',
    get showErrors() { return this.showUncertainty && this.uncertaintyType === 'errorbars'; },
    get showGradient() { return this.showUncertainty && this.uncertaintyType === 'gradient'; },
    cache: new Map(),
    loadToken: 0
};


// -------------------- UI Elements -------------------- //

const ui = {
    distSelect: document.getElementById('dist-select'),
    sizeButtons: document.getElementById('size-buttons'),
    binSlider: document.getElementById('bin-slider'),
    binValue: document.getElementById('bin-value'),
    uncertaintyToggle: document.getElementById('uncertainty-toggle'),
    uncertaintyType: document.getElementById('uncertainty-type'),
    badge: document.getElementById('accuracy-badge'),
    chart: document.getElementById('chart'),
    message: document.getElementById('message'),
    tooltip: document.getElementById('tooltip')
};


// -------------------- Plot parameters -------------------- //

const fmt = d3.format(',.4~g');
const fmtCount = d3.format(',');
const fmtCountDec = d3.format(',.1f');

const margin = { top: 10, right: 12, bottom: 40, left: 48 };
const plotMinHeight = 360;
