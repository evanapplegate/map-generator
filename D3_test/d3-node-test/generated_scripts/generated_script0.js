import * as d3 from 'd3';
import * as topojson from 'topojson-client';
import * as xlsx from 'xlsx';

const width = 960, height = 600;
const projection = d3.geoNaturalEarth1().scale(167).translate([width / 2, height / 2]);
const path = d3.geoPath().projection(projection);
const legendItemSize = 10, legendSpacing = 1;

const svg = d3.select('body').append('svg').attr('width', width).attr('height', height);
const colorScale = d3.scaleSequential(d3.interpolateReds).domain([0, 100000]);

Promise.all([
    d3.json('geodata/countries.geojson'),
    d3.json('geodata/country_bounds.geojson'),
    d3.buffer('uploads/world_gdp.xlsx')
]).then(([countries, countryBounds, worldGdpBuffer]) => {
    const workbook = xlsx.read(worldGdpBuffer);
    const sheet = xlsx.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]);
    const gdpMap = new Map(sheet.map(d => [d.NAME, +d.gdp_per_capita]));

    svg.selectAll('path.country')
        .data(countries.features)
        .enter().append('path')
        .attr('class', 'country')
        .attr('d', path)
        .attr('fill', d => gdpMap.has(d.properties.NAME) ? colorScale(gdpMap.get(d.properties.NAME)) : '#eeeeee')
        .attr('stroke', '#fff')
        .attr('stroke-width', 0.5);

    svg.selectAll('path.boundary')
        .data(countryBounds.features)
        .enter().append('path')
        .attr('class', 'boundary')
        .attr('d', path)
        .attr('fill', 'none')
        .attr('stroke', '#fff')
        .attr('stroke-width', 0.5);

    const legend = svg.append('g')
        .attr('transform', `translate(${width - 50}, 30)`);

    const legendScale = d3.scaleLinear()
        .domain(colorScale.domain())
        .range([0, 10 * legendItemSize]);

    const legendAxis = d3.axisRight(legendScale).ticks(5);

    legend.selectAll('.legend-rect')
        .data(d3.range(colorScale.domain()[0], colorScale.domain()[1], (colorScale.domain()[1] - colorScale.domain()[0]) / 10))
        .enter().append('rect')
        .attr('class', 'legend-rect')
        .attr('x', 0)
        .attr('y', (d, i) => i * (legendItemSize + legendSpacing))
        .attr('width', legendItemSize)
        .attr('height', legendItemSize)
        .attr('fill', colorScale);

    legend.append('g')
        .attr('transform', `translate(${legendItemSize}, 0)`)
        .call(legendAxis);

    svg.append('text')
        .attr('x', width - 50)
        .attr('y', 20)
        .attr('text-anchor', 'end')
        .text('GDP per Capita');
});