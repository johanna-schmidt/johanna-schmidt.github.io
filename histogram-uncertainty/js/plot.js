/** Global parameters */
const svg = d3.select(ui.chart).append('svg');
const defs = svg.append('defs');
const plot = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);
const gridG = plot.append('g').attr('class', 'grid');
const barsG = plot.append('g');
const gradG = plot.append('g').attr('class', 'fade-bands');
const errG = plot.append('g').attr('class', 'errorbars');
const xAxisG = plot.append('g').attr('class', 'axis');
const yAxisG = plot.append('g').attr('class', 'axis');
const xTitle = plot.append('text').attr('class', 'axis-title').attr('text-anchor', 'middle');
const yTitle = plot.append('text').attr('class', 'axis-title').attr('text-anchor', 'middle');


/**
 * Computes binning and renders the histogram.
 *
 * @static
 */
const UpdatePlot = () => {
    // Get data and compute bins
    const data = state.cache.get(state.dist);
    const values = data.byN.get(state.n);
    const bins = Binning(values, data.extent, state.bins);

    // Plot dimensions
    const width = Math.max(ui.chart.clientWidth, 320);
    const height = ComputePlotHeight(width);
    const innerW = width - margin.left - margin.right;
    const innerH = height - margin.top - margin.bottom;
    svg.attr('viewBox', `0 0 ${width} ${height}`);

    // Axes
    const x = d3.scaleLinear().domain([bins[0].x0, bins[bins.length - 1].x1]).range([0, innerW]);
    const top = (b) => Math.max(b.length, state.showErrors ? b.hi : 0, state.showGradient ? b.ghi : 0);
    const yMax = d3.max(bins, top) || 1;
    const y = d3.scaleLinear().domain([0, yMax]).nice(6).range([innerH, 0]);

    // Animated transitions
    const t = svg.transition().duration(350).ease(d3.easeCubicOut);

    // Add axes to plot
    xAxisG.attr('transform', `translate(0,${innerH})`).transition(t)
        .call(d3.axisBottom(x).ticks(Math.max(2, Math.floor(innerW / 80))).tickFormat(fmt));
    yAxisG.transition(t).call(d3.axisLeft(y).ticks(6).tickFormat(fmtCount));
    gridG.transition(t).call(d3.axisLeft(y).ticks(6).tickSize(-innerW).tickFormat(''));
    xTitle.attr('x', innerW / 2).attr('y', innerH + 35).text('Value');
    yTitle.attr('transform', `translate(${-38},${innerH / 2}) rotate(-90)`).text('Count');

    // Draw bars

    const barW = innerW / bins.length;
    const gap = barW < 4 ? 0 : 1;
    const cap = barW < 4 ? 0 : Math.min(6, barW * 0.25); // no caps when bars get thin

    barsG.selectAll('rect')
        .data(bins)
        .join(
            (enter) => enter.append('rect')
                .attr('class', 'bar')
                .attr('x', (d) => x(d.x0))
                .attr('y', innerH)
                .attr('height', 0),
            (update) => update,
            (exit) => exit.transition(t).attr('y', innerH).attr('height', 0).remove()
        )
        .on('mousemove', ShowTooltip)
        .on('mouseleave', HideTooltip)
        .transition(t)
        .attr('x', (d) => x(d.x0) + gap / 2)
        .attr('width', (d) => Math.max(0, x(d.x1) - x(d.x0) - gap))
        .attr('y', (d) => y(d.length))
        .attr('height', (d) => innerH - y(d.length));

    // In case 'Gradient' is selected, draw color gradients

    barsG.classed('faded', state.showGradient);
    const gradData = state.showGradient ? bins : [];
    const gradId = (i) => `fade-${i}`;
    defs.selectAll('linearGradient')
        .data(gradData)
        .join('linearGradient')
        .attr('id', (_, i) => gradId(i))
        .attr('x1', 0).attr('y1', 0).attr('x2', 0).attr('y2', 1)
        .each(function (d) {
            d3.select(this).selectAll('stop')
                .data(GradientStops(d, values.length))
                .join('stop')
                .attr('class', 'fade-stop')
                .attr('offset', (s) => s.offset)
                .attr('stop-opacity', (s) => s.opacity);
        });

    gradG.selectAll('rect')
        .data(gradData)
        .join(
            (enter) => enter.append('rect')
                .attr('class', 'fade-band')
                .attr('x', (d) => x(d.x0) + gap / 2)
                .attr('y', innerH)
                .attr('height', 0),
            (update) => update,
            (exit) => exit.remove()
        )
        .attr('fill', (_, i) => `url(#${gradId(i)})`)
        .transition(t)
        .attr('x', (d) => x(d.x0) + gap / 2)
        .attr('width', (d) => Math.max(0, x(d.x1) - x(d.x0) - gap))
        .attr('y', (d) => y(d.ghi))
        .attr('height', (d) => Math.max(0, innerH - y(d.ghi)));

    // Draw error bars, when selected

    errG.attr('stroke-width', Math.min(1.25, Math.max(0.5, barW * 0.4)))
        .attr('display', state.showErrors ? null : 'none')
        .transition(t)
        .attr('opacity', barW < 4 ? 0.55 : 0.9);

    const collapsed = (d) => ({ x0: d.x0, x1: d.x1, lo: 0, hi: 0 }); // start of enter animation
    errG.selectAll('path')
        .data(bins)
        .join(
            (enter) => enter.append('path').attr('class', 'errorbar').attr('d', (d) => ErrorBarPath(collapsed(d), x, y, cap)),
            (update) => update,
            (exit) => exit.remove()
        )
        .transition(t)
        .attr('d', (d) => ErrorBarPath(d, x, y, cap));

    // Compute overall uncertainty and update badge
    const overallUncertainty = OverallUncertainty(bins, values.length);
    UpdatePlotEvaluationBadge(overallUncertainty);
}


/**
 * Updates text and color of the plot evaluation badge.
 *
 * @param u     overall uncertainty
 *
 * @constructor
 */
const UpdatePlotEvaluationBadge = (u) => {
    const level = ACCURACY_LEVELS.find((l) => u <= l.max);
    ui.badge.className = `badge ${level.cls}`;
    ui.badge.textContent = level.label;
}


/**
 * Computes the plot height based on the remaining window space.
 * 
 * @param width
 * 
 * @returns {number}
 * 
 * @static
 */
const ComputePlotHeight = (width) => {
    const top = ui.chart.getBoundingClientRect().top + window.scrollY;
    const available = window.innerHeight - top - 150;
    return Math.round(Math.max(plotMinHeight, Math.min(available, width * 0.75)));
}


/**
 * Sorts data into bins.
 *
 * @param values
 * @param param1
 * @param k
 *
 * @returns {*}
 *
 * @static
 */
const Binning = (values, [x0, x1], k) => {
    if (x0 === x1) x1 = x0 + 1;
    const step = (x1 - x0) / k;
    const thresholds = d3.range(1, k).map((i) => x0 + i * step);
    const bins = d3.bin().domain([x0, x1]).thresholds(thresholds)(values);
    bins.forEach(b => {
        [b.lo, b.hi] = WilsonScore(b.length, values.length);
        [b.glo, b.ghi] = WilsonScore(b.length, values.length, 2.576);
    });
    return bins;
}


/**
 * Helper function for drawing the error bars.
 *
 * @param d
 * @param x
 * @param y
 * @param c
 *
 * @returns {`M${number},${string}V${string}M${number},${string}H${*}M${number},${string}H${*}`}
 *
 * @static
 */
const ErrorBarPath = (d, x, y, c) => {
    const cx = (x(d.x0) + x(d.x1)) / 2;
    const y1 = y(d.lo);
    const y2 = y(d.hi);
    return `M${cx},${y1}V${y2}M${cx - c},${y1}H${cx + c}M${cx - c},${y2}H${cx + c}`;
}


/**
 * Computes a normal CDF (Abramowitz & Stegun 7.1.26, abs. error < 1.5e-7).
 *
 * @param x
 *
 * @returns {number}
 */
const NormalCdf = (x) => {
    const t = 1 / (1 + (0.3275911 * Math.abs(x)) / Math.SQRT2);
    const poly = ((((1.061405429 * t - 1.453152027) * t + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t;
    const erf = 1 - poly * Math.exp((-x * x) / 2);
    return x >= 0 ? 0.5 * (1 + erf) : 0.5 * (1 - erf);
}


/**
 * Plausibility per bar to compute the gradient visualization.
 *
 * @param c
 * @param k
 * @param n
 *
 * @returns {number}
 */
const Plausibility = (c, k, n) => {
    const p0 = Math.min(Math.max(c / n, 1e-12), 1 - 1e-12);
    const z = Math.abs(k / n - p0) / Math.sqrt((p0 * (1 - p0)) / n);
    return 2 * (1 - NormalCdf(z));
}


/**
 * Gradient opacity along one bar.
 *
 * @param c
 * @param k
 * @param n
 *
 * @returns {number}
 */
const FadeOpacity = (c, k, n) => {
    const p = Plausibility(c, k, n);
    return c < k ? 1 - p / 2 : p / 2;
}


/**
 * Computes the color gradient of the histogram bars to show uncertainty.
 *
 * @param d
 * @param n
 *
 * @returns {*|*[]}
 */
const GradientStops = (d, n) => {
    const top = d.ghi;
    if (!(top > 0)) return [];
    const num_stops = 16;
    const counts = d3.range(num_stops).map((i) => d.glo + (i / (num_stops - 1)) * (top - d.glo));
    counts.push(d.length, 0); // exact midpoint at the observed count, solid baseline
    return counts
        .map((c) => ({ offset: (top - c) / top, opacity: FadeOpacity(c, d.length, n) }))
        .sort((a, b) => a.offset - b.offset);
}


/**
 * Displays the tooltip when hovering over a bar.
 *
 * @param event     mouse event
 * @param d         data attached to bar
 */
function ShowTooltip(event, d) {
    const total = state.cache.get(state.dist).byN.get(state.n).length;
    ui.tooltip.innerHTML =
        `[${fmt(d.x0)}, ${fmt(d.x1)})<br><b>${fmtCount(d.length)}</b> values ` +
        `(${d3.format(".1%")(d.length / total)})` +
        (state.showErrors || state.showGradient ? `<br>${CI_LABEL} CI: ${fmtCountDec(d.lo)} – ${fmtCountDec(d.hi)}` : "");
    ui.tooltip.hidden = false;
    ui.tooltip.style.left = `${event.clientX + 12}px`;
    ui.tooltip.style.top = `${event.clientY - 52}px`;
}


/**
 * Hide tooltip.
 */
const HideTooltip = () => ui.tooltip.hidden = true;
