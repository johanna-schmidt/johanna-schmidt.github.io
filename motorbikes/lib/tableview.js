
function showTooltip(motorbike) {
    CURRENT_MBIKE = motorbike;
    if (motorbike && motorbike != '') {
        const parts = motorbike.split('|');
        DATASET.forEach(d => {
            if (d.manufacturer == parts[0] && d.motorbike == parts[1]) {
                const tColor = MBIKE_TYPES_COLORS(d.type);
                let textColor = ( isDark(tColor) ? 'white' : 'black' );
                const content = '<table style="color: ' + textColor + '">' +
                    '<tr><td colspan="2"><strong>' + d.manufacturer + ' ' + d.motorbike + '</strong></td></tr>' +
                    '<tr><td style="padding: 0px 10px 0px 0px">Type:</td><td>' + d.type + '</td></tr>' +
                    '<tr><td style="padding: 0px 10px 0px 0px">Seat height:</td><td>' + d.seatheight + ' cm</td></tr>' +
                    '<tr><td style="padding: 0px 10px 0px 0px">Displacement:</td><td>' + d.displacement + ' cm<sup>3</sup></td></tr>' +
                    '</table>';
                const posX = SCATTERPLOT.xAxis(d.seatheight) + SCATTERPLOT.margin.left * 2 + 10;
                const posY = SCATTERPLOT.yAxis(d.displacement) + SCATTERPLOT.margin.top * 2;
                TOOLTIP
                    .html(content)
                    .style('background-color', tColor)
                    .style('left', posX + 'px')
                    .style('top', posY + 'px')
                    .style('opacity', 1);
                SCATTERPLOT.dataPoints
                    .style('stroke', d => (d.manufacturer + '|' + d.motorbike) == CURRENT_MBIKE ? 'maroon' : d.seatheight >= CURRENT_POI ? 'grey' : 'black')
                    .style('stroke-width', d => ( (d.manufacturer + '|' + d.motorbike) == CURRENT_MBIKE ? 5.0 : 1.0 ))
            }
        });
    }
}

function hideTooltip() {
    TOOLTIP.style('opacity', 0);
    CURRENT_MBIKE = '';
    SCATTERPLOT.dataPoints
        .style('stroke', d => (d.manufacturer + '|' + d.motorbike) == CURRENT_MBIKE ? 'maroon' : d.seatheight >= CURRENT_POI ? 'grey' : 'black')
        .style('stroke-width', d => (d.manufacturer + '|' + d.motorbike) == CURRENT_MBIKE ? 5.0 : 1.0 )
}

function createTableview() {

    let htmlContent = '<table class="contenttable"><tr>' +
        '<th>Company</th>' +
        '<th>Bike</th>' +
        '<th>Type</th>' +
        '<th>Seat height</th>' +
        '<th>Height</th>' +
        '<th>Weight</th>' +
        '<th>Power</th></tr>';

    DATASET.forEach(d => {
        htmlContent += '<tr onmouseenter="showTooltip(\'' + d.manufacturer + '|' + d.motorbike + '\')" onmouseleave="hideTooltip()">' +
            '<td>' + d.manufacturer + '</td>' +
            '<td>' + d.motorbike + '</td>' +
            '<td>' + d.type + '</td>' +
            '<td style="text-align: right">' + Number(d.seatheight).toFixed(1) + ' cm</td>' +
            '<td style="text-align: right">' + ( d.height != '' ? Number(d.height).toFixed(1) + ' cm' : '' ) + '</td>' +
            '<td style="text-align: right">' + ( d.weight != '' ? Number(d.weight).toFixed(1) + ' kg' : '' ) + '</td>' +
            '<td style="text-align: right">' + d.displacement + ' cm<sup>3</sup></td></tr>';
    })

    d3.select('#tableview').html(htmlContent);
}
