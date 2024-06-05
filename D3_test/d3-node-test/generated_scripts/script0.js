import * as d3 from 'd3';
import * as topojson from 'topojson-client';
import { csv, json } from 'd3-fetch';
import 'exceljs';
import * as XLSX from 'xlsx';

async function drawMap() {
    const width = 960, height = 500;
    const projection = d3.geoNaturalEarth1();
    const path = d3.geoPath().projection(projection);

    const svg = d3.select("body").append("svg")
        .attr("width", width)
        .attr("height", height);

    const gdpData = XLSX.readFile('uploads/world_gdp.xlsx').Sheets['Sheet1'];
    const countries = XLSX.utils.sheet_to_json(gdpData, { header: 1 }).slice(1);
    const gdpMap = {};
    countries.forEach(c => gdpMap[c[0]] = +c[1]);

    const colorScale = d3.scaleSequential(d3.interpolateReds)
        .domain(d3.extent(countries, c => +c[1]));

    const countryData = await d3.json('geodata/countries.geojson');
    const boundaryData = await d3.json('geodata/country_bounds.geojson');

    svg.append("g")
        .selectAll("path")
        .data(countryData.features)
        .enter().append("path")
        .attr("fill", d => gdpMap[d.properties.NAME] ? colorScale(gdpMap[d.properties.NAME]) : "#eeeeee")
        .attr("d", path)
        .attr("stroke", "white")
        .attr("stroke-width", 0.5);

    svg.append("g")
        .selectAll("path")
        .data(boundaryData.features)
        .enter().append("path")
        .attr("fill", "none")
        .attr("d", path)
        .attr("stroke", "white")
        .attr("stroke-width", 0.5);

    const legend = svg.append("g")
        .attr("transform", `translate(${width - 140},30)`);

    const legendItemSize = 10, legendSpacing = 1;
    const legendItems = d3.range(d3.extent(countries, c => +c[1])[0], d3.extent(countries, c => +c[1])[1], (d3.extent(countries, c => +c[1])[1] - d3.extent(countries, c => +c[1])[0]) / 10).reverse();

    legendItems.forEach((d, i) => {
        legend.append('rect')
            .attr('x', 0)
            .attr('y', i * (legendItemSize + legendSpacing))
            .attr('width', legendItemSize)
            .attr('height', legendItemSize)
            .style('fill', colorScale(d))
            .style('stroke', 'black')
            .style('stroke-width', 0.5);

        legend.append('text')
            .attr('x', legendItemSize + 5)
            .attr('y', i * (legendItemSize + legendSpacing) + (legendItemSize / 2))
            .attr('dy', '0.35em')
            .text(Math.round(d));
    });

    legend.append('text')
        .attr('x', 0)
        .attr('y', -10)
        .attr('class', 'legend-title')
        .text('GDP per Capita');
}

drawMap();