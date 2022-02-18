
function getPlotWidth(p) {
    return Number(p.style('width').replaceAll('px', ''));
}

function getPlotHeight(p) {
    return Number(p.style('height').replaceAll('px', ''));
}

function isDark(color) {
    const col = +("0x" + color.slice(1).replace(color.length < 5 && /./g, '$&$&'));
    const r = col >> 16;
    const g = col >> 8 & 255;
    const b = col & 255;
    const hsp = Math.sqrt(0.299 * (r * r) + 0.587 * (g * g) + 0.114 * (b * b));
    if (hsp > 127.5) {
        return false;
    }
    else {
        return true;
    }
}