/**
 * Initializes the application frontend.
 *
 * @returns {Promise<void>}
 *
 * @static
 */
const Init = async () => {
    // Init bin slider
    ui.binSlider.value = state.bins;
    ui.binValue.textContent = state.bins;
    ui.binSlider.addEventListener('input', () => {
        state.bins = +ui.binSlider.value;
        ui.binValue.textContent = state.bins;
        UpdatePlot();
    });

    // Init uncertainty toggle and switch
    const typeButtons = d3.select(ui.uncertaintyType).selectAll('button');
    const SyncUncertaintyControls = () => {
        ui.uncertaintyToggle.checked = state.showUncertainty;
        typeButtons
            .attr('aria-checked', function () {
                return String(this.dataset.type === state.uncertaintyType);
            })
            .property('disabled', !state.showUncertainty);
    };
    ui.uncertaintyToggle.addEventListener('change', () => {
        state.showUncertainty = ui.uncertaintyToggle.checked;
        SyncUncertaintyControls();
        UpdatePlot();
    });
    typeButtons.on('click', function () {
        state.uncertaintyType = this.dataset.type;
        SyncUncertaintyControls();
        UpdatePlot();
    });
    SyncUncertaintyControls();

    // Init interaction for changing the distribution
    ui.distSelect.addEventListener('change', () => SelectDistribution(ui.distSelect.value));

    // Load the data summary
    state.summary = await d3.csv('data/summary.csv', d3.autoType);

    // Update the distribution selection and select the first available distribution
    const distributions = [...new Set(state.summary.map((r) => r.distribution))];
    UpdateDistributionSelectBox(distributions);
    await SelectDistribution(distributions[0]);
}


/**
 * Loads all available distributions from the data.
 *
 * @param dist
 *
 * @returns {Promise<{byN: Map<unknown, unknown>, extent: *}|any>}
 */
const LoadDataForDistribution = async (dist) => {
    if (state.cache.has(dist)) return state.cache.get(dist);
    const rows = state.summary.filter((r) => r.distribution === dist);
    const entries = await Promise.all(
        rows.map(async (r) => {
            const values = await d3.csv(`data/${r.file}`, (d) => +d.value);
            return [r.n, values.filter(Number.isFinite)];
        })
    );
    const byN = new Map(entries.sort((a, b) => a[0] - b[0]));
    // Shared x-domain across sample sizes keeps histograms comparable.
    const extent = d3.extent(entries.flatMap(([, v]) => d3.extent(v)));
    const result = { byN, extent };
    state.cache.set(dist, result);
    return result;
}
