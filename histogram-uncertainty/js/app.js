// -------------------- DATA -------------------- //

/**
 * Loads the summary.
 *
 * @returns {Promise<*>}
 */
async function loadSummary() {
  return d3.csv(`data/summary.csv`, d3.autoType);
}


/**
 * Loads all datasets for a certain distribution.
 *
 * @param dist    distribution
 * @returns {Promise<{byN: Map<unknown, unknown>, extent: *}|any>}
 */
async function loadDistribution(dist) {
  if (state.cache.has(dist)) return state.cache.get(dist);
  const rows = state.summary.filter((r) => r.distribution === dist);
  const entries = await Promise.all(
    rows.map(async (r) => {
      const values = await d3.csv(`data/${r.file}`, (d) => +d.value);
      return [r.n, values.filter(Number.isFinite)];
    })
  );
  const byN = new Map(entries.sort((a, b) => a[0] - b[0]));
  const extent = d3.extent(entries.flatMap(([, v]) => d3.extent(v)));
  const result = { byN, extent };
  state.cache.set(dist, result);
  return result;
}


/**
 * Gets all loaded distributions from the summary.
 *
 * @returns {*[]}
 */
function populateDistributions() {
  const dists = [...new Set(state.summary.map((r) => r.distribution))];
  d3.select(ui.distSelect)
    .selectAll("option")
    .data(dists)
    .join("option")
    .attr("value", (d) => d)
    .text((d) => d[0].toUpperCase() + d.slice(1));
  ui.distSelect.disabled = false;
  return dists;
}


// -------------------- UI Elements -------------------- //

/**
 * Renders the UI elements for selecting the sample size.
 *
 * @param sizes   which sample sizes exist
 */
function renderSizeButtons(sizes) {
  d3.select(ui.sizeButtons)
    .selectAll("button")
    .data(sizes, (d) => d)
    .join("button")
    .attr("type", "button")
    .attr("role", "radio")
    .attr("aria-checked", (d) => String(d === state.n))
    .text((d) => fmtCount(d))
    .on("click", (_, d) => {
      state.n = d;
      renderSizeButtons(sizes);
      render();
    });
}


/**
 * UI interaction when the user selects a distribution.
 *
 * @param dist    selected distribution
 * @returns {Promise<void>}
 */
async function selectDistribution(dist) {
  const token = ++state.loadToken;
  state.dist = dist;
  const data = await loadDistribution(dist);
  if (token !== state.loadToken) return;
  const sizes = [...data.byN.keys()];
  if (!sizes.includes(state.n)) state.n = sizes[0];
  renderSizeButtons(sizes);
  RenderPlot();
}


// -------------------- PLOT -------------------- //

/**
 * Computes the height of the plot.
 *
 * @param width
 * @returns {number}
 */
function chartHeight(width) {
  const top = ui.chart.getBoundingClientRect().top + window.scrollY;
  const available = window.innerHeight - top - SPACE_BELOW_CHART;
  return Math.round(Math.max(MIN_HEIGHT, Math.min(available, width * 0.75)));
}


/**
 * Creates the histogram bins.
 *
 * @param values
 * @param param1
 * @param k
 * @returns {*}
 */
function makeBins(values, [x0, x1], k) {
  if (x0 === x1) x1 = x0 + 1; // degenerate data
  const step = (x1 - x0) / k;
  const thresholds = d3.range(1, k).map((i) => x0 + i * step);
  const bins = d3.bin().domain([x0, x1]).thresholds(thresholds)(values);
  for (const b of bins) [b.lo, b.hi] = wilson(b.length, values.length);
  return bins;
}


/**
 * Creates the error bars.
 *
 * @param d
 * @param x
 * @param y
 * @param c
 * @returns {string}
 */
function errorPath(d, x, y, c) {
  const cx = (x(d.x0) + x(d.x1)) / 2;
  const y1 = y(d.lo);
  const y2 = y(d.hi);
  return `M${cx},${y1}V${y2}M${cx - c},${y1}H${cx + c}M${cx - c},${y2}H${cx + c}`;
}


/**
 * Renders the histogram plot.
 */
function RenderPlot() {
  const data = state.cache.get(state.dist);
  if (!data || state.n == null) return;

  const values = data.byN.get(state.n);
  const bins = makeBins(values, data.extent, state.bins);

  const width = Math.max(ui.chart.clientWidth, 320);
  const height = chartHeight(width);
  const innerW = width - margin.left - margin.right;
  const innerH = height - margin.top - margin.bottom;
  svg.attr("viewBox", `0 0 ${width} ${height}`);

  const x = d3.scaleLinear().domain([bins[0].x0, bins[bins.length - 1].x1]).range([0, innerW]);
  // With error bars on, include their upper ends so they are never clipped.
  const yMax = d3.max(bins, (b) => (state.showErrors ? b.hi : b.length)) || 1;
  const y = d3.scaleLinear().domain([0, yMax]).nice(6).range([innerH, 0]);

  const t = svg.transition().duration(350).ease(d3.easeCubicOut);

  xAxisG.attr("transform", `translate(0,${innerH})`).transition(t)
    .call(d3.axisBottom(x).ticks(Math.max(2, Math.floor(innerW / 80))).tickFormat(fmt));
  yAxisG.transition(t).call(d3.axisLeft(y).ticks(6).tickFormat(fmtCount));
  gridG.transition(t).call(d3.axisLeft(y).ticks(6).tickSize(-innerW).tickFormat(""));

  xTitle.attr("x", innerW / 2).attr("y", innerH + 35).text("Value");
  yTitle.attr("transform", `translate(${-38},${innerH / 2}) rotate(-90)`).text("Count");

  const barW = innerW / bins.length;
  const gap = barW < 4 ? 0 : 1;
  const cap = barW < 4 ? 0 : Math.min(6, barW * 0.25); // no caps when bars get thin

  barsG.selectAll("rect")
    .data(bins)
    .join(
      (enter) => enter.append("rect")
        .attr("class", "bar")
        .attr("x", (d) => x(d.x0))
        .attr("y", innerH)
        .attr("height", 0),
      (update) => update,
      (exit) => exit.transition(t).attr("y", innerH).attr("height", 0).remove()
    )
    .on("mousemove", showTooltip)
    .on("mouseleave", hideTooltip)
    .transition(t)
    .attr("x", (d) => x(d.x0) + gap / 2)
    .attr("width", (d) => Math.max(0, x(d.x1) - x(d.x0) - gap))
    .attr("y", (d) => y(d.length))
    .attr("height", (d) => innerH - y(d.length));

  // Thinner, lighter whiskers when bins are narrow so the histogram stays readable.
  errG.attr("stroke-width", Math.min(1.25, Math.max(0.5, barW * 0.4)))
    .attr("display", state.showErrors ? null : "none")
    .transition(t)
    .attr("opacity", barW < 4 ? 0.55 : 0.9);

  const collapsed = (d) => ({ x0: d.x0, x1: d.x1, lo: 0, hi: 0 }); // start of enter animation
  errG.selectAll("path")
    .data(bins)
    .join(
      (enter) => enter.append("path").attr("class", "errorbar").attr("d", (d) => errorPath(collapsed(d), x, y, cap)),
      (update) => update,
      (exit) => exit.remove()
    )
    .transition(t)
    .attr("d", (d) => errorPath(d, x, y, cap));

  renderBadge(overallUncertainty(bins, values.length));
}


/**
 * Renders the accuracy badge.
 *
 * @param u
 */
function renderBadge(u) {
  const level = ACCURACY_LEVELS.find((l) => u <= l.max);
  ui.badge.className = `badge ${level.cls}`;
  ui.badge.textContent = level.label;
  ui.badge.title =
    `Bar heights are accurate to about ±${d3.format(".0%")(u)} on average.\n` +
    "Fewer bins or more data make the bars more accurate.";
}


/**
 * Show the plot tooltip.
 *
 * @param event
 * @param d
 */
function showTooltip(event, d) {
  const total = state.cache.get(state.dist).byN.get(state.n).length;
  ui.tooltip.innerHTML =
    `[${fmt(d.x0)}, ${fmt(d.x1)})<br><b>${fmtCount(d.length)}</b> values ` +
    `(${d3.format(".1%")(d.length / total)})` +
    (state.showErrors ? `<br>${CI_LABEL} CI: ${fmtCountDec(d.lo)} – ${fmtCountDec(d.hi)}` : "");
  ui.tooltip.hidden = false;
  ui.tooltip.style.left = `${event.clientX + 12}px`;
  ui.tooltip.style.top = `${event.clientY - 52}px`;
}


/**
 * Hides the plot tooltip.
 */
function hideTooltip() {
  ui.tooltip.hidden = true;
}
