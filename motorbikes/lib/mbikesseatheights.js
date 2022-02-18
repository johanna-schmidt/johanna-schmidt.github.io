
function createScatterplot() {

    // Layout
    const width = getPlotWidth(d3.select('#scatterplot'));
    const plotWidth = width - SCATTERPLOT.margin.left - SCATTERPLOT.margin.right;
    const height = getPlotHeight(d3.select('#scatterplot'));
    const plotHeight = height - SCATTERPLOT.margin.top - SCATTERPLOT.margin.bottom;

    // Clear SVG content
    d3.select('#scatterplot').selectAll('*').remove();

    // Create G for drawing the plot
    const plot = d3.select('#scatterplot')
        .append('g')
        .attr('transform', `translate(${SCATTERPLOT.margin.left}, ${SCATTERPLOT.margin.top})`);

    // X-Axis
    const minX = d3.min(DATASET.map(d => Number(d.seatheight))) - 1;
    const maxX = d3.max(DATASET.map(d => Number(d.seatheight))) + 1;
    SCATTERPLOT.xAxis = d3.scaleLinear().domain([minX, maxX]).range([0, plotWidth]);
    plot.append('g')
        .attr('transform', `translate(0, ${(plotHeight)})`)
        .call(d3.axisBottom(SCATTERPLOT.xAxis));

    // Y-Axis
    const minY = d3.min(DATASET.map(d => Number(d.displacement))) - 100;
    const maxY = d3.max(DATASET.map(d => Number(d.displacement))) + 100;
    SCATTERPLOT.yAxis = d3.scaleLinear().domain([minY, maxY]).range([plotHeight, 0]);
    plot.append('g').call(d3.axisLeft(SCATTERPLOT.yAxis));

    // Axes labels
    const labels = d3.select('#scatterplot').append('g');
    labels.append('text')
        .attr('x', SCATTERPLOT.margin.left + plotWidth / 2)
        .attr('y', height - 4)
        .attr('text-anchor', 'middle')
        .style('fill', 'black')
        .style('font-size', '10pt')
        .text('Seat height (cm)');
    labels.append('text')
        .attr('x', -(SCATTERPLOT.margin.top + plotHeight / 2))
        .attr('y', 9)
        .attr('text-anchor', 'middle')
        .attr("transform", "rotate(-90)")
        .style('fill', 'black')
        .style('font-size', '10pt')
        .text('Displacement (ccm)');

    // Tooltip
    TOOLTIP = d3.select('#tooltip').append('div')
        .attr('class', 'tooltip')
        .style('background-color', 'White')
        .style('border', 'solid')
        .style('border-width', '2px')
        .style('border-radius', '5px')
        .style('padding', '5px')
        .style('opacity', 0);

    // Data points
    SCATTERPLOT.dataPoints = plot.append('g')
        .selectAll('datapoint')
        .data(DATASET)
        .join('circle')
            .attr('class', 'datapoint')
            .attr('cx', d => SCATTERPLOT.xAxis(d.seatheight))
            .attr('cy', d => SCATTERPLOT.yAxis(d.displacement))
            .attr('r', 5)
            .style('fill', d => d.seatheight > CURRENT_POI ? 'honeydew' : MBIKE_TYPES_COLORS(d.type))
            .style('stroke', d => d.seatheight > CURRENT_POI ? 'grey' : 'black')
            .style('stroke-width', d => ( (d.manufacturer + '|' + d.motorbike) == CURRENT_MBIKE ? 3.0 : 1.0))
            .style('opacity', 0.5)
            .on('mouseenter', function(event, d) {
                const tColor = MBIKE_TYPES_COLORS(d.type);
                let textColor = ( isDark(tColor) ? 'white' : 'black' );
                const content = '<table style="color: ' + textColor + '">' +
                    '<tr><td colspan="2"><strong>' + d.manufacturer + ' ' + d.motorbike + '</strong></td></tr>' +
                    '<tr><td style="padding: 0px 10px 0px 0px">Type:</td><td>' + d.type + '</td></tr>' +
                    '<tr><td style="padding: 0px 10px 0px 0px">Seat height:</td><td>' + d.seatheight + ' cm</td></tr>' +
                    '<tr><td style="padding: 0px 10px 0px 0px">Displacement:</td><td>' + d.displacement + ' cm<sup>3</sup></td></tr>' +
                    '</table>';
                TOOLTIP
                    .html(content)
                    .style('background-color', tColor)
                    .style('left', (event.pageX + 10) + 'px')
                    .style('top', (event.pageY + 5) + 'px')
                    .style('opacity', 1);
                CURRENT_MBIKE = d.manufacturer + '|' + d.motorbike;
                SCATTERPLOT.dataPoints
                    .style('stroke', d => (d.manufacturer + '|' + d.motorbike) == CURRENT_MBIKE ? 'maroon' : d.seatheight >= CURRENT_POI ? 'grey' : 'black')
                    .style('stroke-width', d => ( (d.manufacturer + '|' + d.motorbike) == CURRENT_MBIKE ? 5.0 : 1.0 ))
            })
            .on('mouseleave', () => {
                CURRENT_MBIKE = '';
                SCATTERPLOT.dataPoints
                    .style('stroke', d => (d.manufacturer + '|' + d.motorbike) == CURRENT_MBIKE ? 'maroon' : d.seatheight >= CURRENT_POI ? 'grey' : 'black')
                    .style('stroke-width', d => ( (d.manufacturer + '|' + d.motorbike) == CURRENT_MBIKE ? 5.0 : 1.0 ))
                TOOLTIP.style('opacity', 0);
            });

    // POI handle
    const poi = plot.append('g');
    const poiLine = poi.append('line')
        .attr('class', 'poi')
        .attr('stroke', 'dimgrey')
        .attr('stroke-width', '3px')
        .attr('x1', SCATTERPLOT.xAxis(85))
        .attr('y1', 0)
        .attr('x2', SCATTERPLOT.xAxis(85))
        .attr('y2', plotHeight + 3);
    const poiLabel = poi.append('rect')
        .attr('x', SCATTERPLOT.xAxis(85) - 20)
        .attr('y', 6)
        .attr('width', 40)
        .attr('height', 20)
        .style('fill', 'white')
        .style('stroke', 'dimgrey');
    const poiLabelText = poi.append('text')
        .attr('x', SCATTERPLOT.xAxis(85))
        .attr('y', 20)
        .attr('text-anchor', 'middle')
        .style('fill', 'dimgrey')
        .style('font-size', '9pt')
        .style('alignment-baseline', 'middle')
        .text(CURRENT_POI.toFixed(1));

    // Enable to drag POI
    var dragPoi = d3.drag()
        .on('drag', function(event, d) {
            // Get the new X position
            var newX = event.x;
            d3.select(this).attr("x1", newX).attr("x2", newX);
            CURRENT_POI = SCATTERPLOT.xAxis.invert(newX);
            // Relocate label
            poiLabel.attr('x', newX - 20);
            poiLabelText.attr('x', newX);
            poiLabelText.text(CURRENT_POI.toFixed(1));
            // Browse through all data points and select/deselect them
            SCATTERPLOT.dataPoints
                .style('fill', d => d.seatheight >= CURRENT_POI ? 'honeydew' : MBIKE_TYPES_COLORS(d.type))
                .style('stroke', d => d.seatheight >= CURRENT_POI ? 'grey' : 'black');
            // Update bar charts
            updateBarsInPlot1();
            updateBarsInPlot2();
        });
    poiLine.call(dragPoi);

    // Legend
    const legend = d3.select('#scatterplot')
        .append('g')
        .attr('transform', `translate(${SCATTERPLOT.margin.left + plotWidth + 40}, ${SCATTERPLOT.margin.top})`);
    legend.selectAll('dots').data(MBIKE_TYPES)
        .enter()
        .append('circle')
            .attr('cx', 0)
            .attr('cy', (d,i) => i*20)
            .attr('r', 6)
            .style('fill', d => MBIKE_TYPES_COLORS(d))
            .style('stroke', 'black')
            .style('opacity', 0.5);
    legend.selectAll('labels').data(MBIKE_TYPES)
        .enter()
        .append('text')
            .attr('x', 10)
            .attr('y', (d,i) => 4 + i*20)
            .attr('text-anchor', 'left')
            .style('fill', 'SlateGrey')
            .style('font-size', '9pt')
            .style('alignment-baseline', 'middle')
            .text(d => d);
}
