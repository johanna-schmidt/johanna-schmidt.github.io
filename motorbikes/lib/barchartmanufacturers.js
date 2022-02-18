
const BarchartPlot2 = {
    canvas: 0,
    height: 0,
    xAxis: 0,
    yAxis: 0
};

const Manufacturers = [];

function createBarPlot2() {

    // Layout
    const margin = {top: 10, right: 40, bottom: 100, left: 50};
    const width = getPlotWidth(d3.select('#barchart2'));
    const plotWidth = width - margin.left - margin.right;
    const height = getPlotHeight(d3.select('#barchart2'));
    BarchartPlot2.height = height - margin.top - margin.bottom;

    // Clear SVG content
    d3.select('#barchart2').selectAll('*').remove();

    // Create G for drawing the plot
    BarchartPlot2.canvas = d3.select('#barchart2')
        .append('g')
        .attr('transform', `translate(${margin.left}, ${margin.top})`);

    // X-Axis
    DATASET.forEach(d => {
        if (Manufacturers.indexOf(d.manufacturer) == -1) {
            Manufacturers.push(d.manufacturer);
        }
    });
    BarchartPlot2.xAxis = d3.scaleBand().domain(Manufacturers).range([0, plotWidth]).padding(0.2);
    BarchartPlot2.canvas.append('g')
        .attr('transform', `translate(0, ${BarchartPlot2.height})`)
        .call(d3.axisBottom(BarchartPlot2.xAxis))
        .selectAll('text')
        .attr('transform', 'translate(-10,4)rotate(-60)')
        .style('text-anchor', 'end');

    // Aggregation over types
    const aggregatedTotalData = [];
    Manufacturers.forEach(m => aggregatedTotalData.push({ manufacturer: m, count: 0 }));
    DATASET.forEach(d => {
        aggregatedTotalData.forEach(ad => {
            if (ad.manufacturer == d.manufacturer) {
                ad.count += 1;
            }
        });
    });

    // Y-Axis
    var maxY = d3.max(aggregatedTotalData.map(ad => ad.count)) + 2;
    BarchartPlot2.yAxis = d3.scaleLinear().domain([0, maxY]).range([BarchartPlot2.height, 0]);
    BarchartPlot2.canvas.append('g').call(d3.axisLeft(BarchartPlot2.yAxis));

    // Axis label
    const labels = d3.select('#barchart2').append('g');
    labels.append('text')
        .attr('x', -(margin.top + BarchartPlot2.height / 2))
        .attr('y', 9)
        .attr('text-anchor', 'middle')
        .attr("transform", "rotate(-90)")
        .style('fill', 'black')
        .style('font-size', '10pt')
        .text('Count (#)');

    // Bars
    BarchartPlot2.canvas.selectAll('backgroundBar')
        .data(aggregatedTotalData)
        .join('rect')
            .attr('class', 'backgroundBar')
            .attr('x', d => BarchartPlot2.xAxis(d.manufacturer))
            .attr('y', d => BarchartPlot2.yAxis(d.count))
            .attr('width', BarchartPlot2.xAxis.bandwidth())
            .attr('height', d => BarchartPlot2.height - BarchartPlot2.yAxis(d.count));

    updateBarsInPlot2();
}

function updateBarsInPlot2() {
    d3.select('#barchart2').selectAll('.foregroundBar').remove();

    const aggregatedSelectedData = [];
    Manufacturers.forEach(m => aggregatedSelectedData.push({ manufacturer: m, count: 0 }));
    DATASET.forEach(d => {
        aggregatedSelectedData.forEach(ad => {
            if (ad.manufacturer == d.manufacturer && d.seatheight <= CURRENT_POI) {
                ad.count += 1;
            }
        });
    });

    BarsTypes = BarchartPlot2.canvas.selectAll('foregroundBar')
        .data(aggregatedSelectedData)
        .join('rect')
            .attr('class', 'foregroundBar')
            .attr('x', d => BarchartPlot2.xAxis(d.manufacturer) + 3)
            .attr('y', d => BarchartPlot2.yAxis(d.count))
            .attr('width', BarchartPlot2.xAxis.bandwidth() * 0.7)
            .attr('height', d => BarchartPlot2.height - BarchartPlot2.yAxis(d.count));
}