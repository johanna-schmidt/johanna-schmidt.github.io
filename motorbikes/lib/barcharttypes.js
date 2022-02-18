
const BarchartPlot1 = {
    canvas: 0,
    height: 0,
    xAxis: 0,
    yAxis: 0
};

function createBarPlot1() {

    // Layout
    const margin = {top: 10, right: 40, bottom: 60, left: 50};
    const width = getPlotWidth(d3.select('#barchart1'));
    const plotWidth = width - margin.left - margin.right;
    const height = getPlotHeight(d3.select('#barchart1'));
    BarchartPlot1.height = height - margin.top - margin.bottom;

    // Clear SVG content
    d3.select('#barchart1').selectAll('*').remove();

    // Create G for drawing the plot
    BarchartPlot1.canvas = d3.select('#barchart1')
        .append('g')
        .attr('transform', `translate(${margin.left}, ${margin.top})`);

    // X-Axis
    BarchartPlot1.xAxis = d3.scaleBand().domain(MBIKE_TYPES).range([0, plotWidth]).padding(0.3);
    BarchartPlot1.canvas.append('g')
        .attr('transform', `translate(0, ${BarchartPlot1.height})`)
        .call(d3.axisBottom(BarchartPlot1.xAxis))
        .selectAll('text')
            .attr('transform', 'translate(-10,4)rotate(-60)')
            .style('text-anchor', 'end');

    // Aggregation over types
    const aggregatedTotalData = [];
    MBIKE_TYPES.forEach(t => aggregatedTotalData.push({ type: t, count: 0 }));
    DATASET.forEach(d => {
        aggregatedTotalData.forEach(ad => {
            if (ad.type == d.type) {
                ad.count += 1;
            }
        });
    });

    // Y-Axis
    var maxY = d3.max(aggregatedTotalData.map(ad => ad.count)) + 5;
    BarchartPlot1.yAxis = d3.scaleLinear().domain([0, maxY]).range([BarchartPlot1.height, 0]);
    BarchartPlot1.canvas.append('g').call(d3.axisLeft(BarchartPlot1.yAxis));

    // Axis label
    const labels = d3.select('#barchart1').append('g');
    labels.append('text')
        .attr('x', -(margin.top + BarchartPlot1.height / 2))
        .attr('y', 9)
        .attr('text-anchor', 'middle')
        .attr("transform", "rotate(-90)")
        .style('fill', 'black')
        .style('font-size', '10pt')
        .text('Count (#)');

    // Bars
    BarchartPlot1.canvas.selectAll('backgroundBar')
        .data(aggregatedTotalData)
        .join('rect')
            .attr('class', 'backgroundBar')
            .attr('x', d => BarchartPlot1.xAxis(d.type))
            .attr('y', d => BarchartPlot1.yAxis(d.count))
            .attr('width', BarchartPlot1.xAxis.bandwidth())
            .attr('height', d => BarchartPlot1.height - BarchartPlot1.yAxis(d.count));

    updateBarsInPlot1();
}

function updateBarsInPlot1() {
    d3.select('#barchart1').selectAll('.foregroundColoredBar').remove();

    const aggregatedSelectedData = [];
    MBIKE_TYPES.forEach(t => aggregatedSelectedData.push({ type: t, count: 0 }));
    DATASET.forEach(d => {
        aggregatedSelectedData.forEach(ad => {
            if (ad.type == d.type && d.seatheight <= CURRENT_POI) {
                ad.count += 1;
            }
        });
    });

    BarsTypes = BarchartPlot1.canvas.selectAll('foregroundColoredBar')
        .data(aggregatedSelectedData)
        .join('rect')
            .attr('class', 'foregroundColoredBar')
            .attr('x', d => BarchartPlot1.xAxis(d.type) + 7)
            .attr('y', d => BarchartPlot1.yAxis(d.count))
            .attr('width', BarchartPlot1.xAxis.bandwidth() * 0.8)
            .attr('height', d => BarchartPlot1.height - BarchartPlot1.yAxis(d.count))
            .attr('fill', d => MBIKE_TYPES_COLORS(d.type))
}