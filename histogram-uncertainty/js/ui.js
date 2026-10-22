/**
 * Creates a select box for selecting a distribution.
 *
 * @param dists   distributions
 *
 * @static
 */
const UpdateDistributionSelectBox = (dists) => {
  d3.select(ui.distSelect)
      .selectAll('option')
      .data(dists)
      .join('option')
      .attr('value', (d) => d)
      .text((d) => d[0].toUpperCase() + d.slice(1));
  ui.distSelect.disabled = false;
}


/**
 * Updates the buttons to select a sample size.
 *
 * @param sizes   available sample sizes
 *
 * @static
 */
const UpdateSampleSizeSelection = (sizes) => {
  d3.select(ui.sizeButtons)
      .selectAll('button')
      .data(sizes, (d) => d)
      .join('button')
      .attr('type', 'button')
      .attr('role', 'radio')
      .attr('aria-checked', (d) => String(d === state.n))
      .text((d) => fmtCount(d))
      .on('click', (_, d) => {
        state.n = d;
        UpdateSampleSizeSelection(sizes);
        UpdatePlot();
      });
}


/**
 * UI interaction when a distribution is selected.
 * 
 * @param dist    selected distribution
 * 
 * @returns {Promise<void>}
 * 
 * @static
 */
const SelectDistribution = async (dist) => {
  const token = ++state.loadToken;
  state.dist = dist;
  const data = await LoadDataForDistribution(dist);
  if (token !== state.loadToken) return;
  const sizes = [...data.byN.keys()];
  if (!sizes.includes(state.n)) state.n = sizes[0];
  UpdateSampleSizeSelection(sizes);
  UpdatePlot();
}
