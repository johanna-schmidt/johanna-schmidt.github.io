/** Globals parameters for statistics */
const CI_LABEL = '95%';
const ACCURACY_LEVELS = [
    { max: 0.30, cls: 'ok', label: 'Binning matches Data' },
    { max: 0.60, cls: 'warn', label: 'Slight Uncertainty introduced' },
    { max: Infinity, cls: 'bad', label: 'High Uncertainty' },
];


/**
 * Computes the Wilson score.
 *
 * @param k
 * @param n
 * @param z
 *
 * @returns {number[]}
 */
const WilsonScore = (k, n, z = 1.96) => {
    if (n === 0) return [0, 0];
    const p = k / n;
    const z2 = z * z;
    const denom = 1 + z2 / n;
    const center = (p + z2 / (2 * n)) / denom;
    const half = (z / denom) * Math.sqrt((p * (1 - p)) / n + z2 / (4 * n * n));
    return [ Math.max(0, center - half) * n, Math.min(1, center + half) * n ];
}


/** Computes the overall plot uncertainty.
 *
 * @param bins
 * @param n
 *
 * @returns {number|number}
 */
const OverallUncertainty = (bins, n) => {
    let sumHalfWidths = 0;
    for (const b of bins) {
        if (b.length === 0) continue;
        const [lo, hi] = WilsonScore(b.length, n, 1.96);
        sumHalfWidths += (hi - lo) / 2;
    }
    return n ? sumHalfWidths / n : 0;
}
