import * as d3 from 'd3';
import { csvParse, autoType } from 'd3-dsv';
import * as topojson from 'topojson-client';
import XLSX from 'xlsx';

const width = 960, height = 600;

const projection = d3.geoNaturalEarth1().scale(160).translate([width / 2, height / 2]);
const path = d3.geoPath().projection(projection);

const color = d3.scaleLinear()
    .domain([0, 100000]) // Adjust domain as necessary
    .range(["lightpink", "darkred"]);

const legendItemSize = 10, legendSpacing = 1;

const svg = d3.select("body").append("svg")
    .attr("width", width)
    .attr("height", height);

const g = svg.append("g");

Promise.all([
    d3.json('geodata/countries.geojson'),
    d3.json('geodata/country_bounds.geojson'),
    d3.blob('uploads/world_gdp.xlsx').then(blob => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
                const workbook = XLSX.read(reader.result, { type: 'binary' });
                const sheet = workbook.Sheets[workbook.SheetNames[0]];
                resolve(XLSX.utils.sheet_to_json(sheet, { raw: true, header: 1 }));
            };
            reader.onerror = reject;
            reader.readAsBinaryString(blob);
        });
    })
]).then(([countriesData, boundsData, gdpData]) => {
    const headers = gdpData.shift();
    const data = {};
    gdpData.forEach(d => {
        const row = {};
        headers.forEach((header, i) => row[header] = d[i]);
        data[row['NAME']] = row['gdp_per_capita'];
    });

    svg.append("g")
        .selectAll("path")
        .data(topojson.feature(countriesData, countriesData.objects.countries).features)
        .enter().append("path")
        .attr("d", path)
        .attr("fill", d => data[d.properties.NAME] ? color(data[d.properties.NAME]) : "#eeeeee")
        .attr("stroke", "#fff")
        .attr("stroke-width", 0.5);

    svg.append("g")
        .selectAll("path")
        .data(topojson.feature(boundsData, boundsData.objects.bounds).features)
        .enter().append("path")
        .attr("d", path)
        .attr("stroke", "#fff")
        .attr("stroke-width", 0.5)
        .attr("fill", "none");

    const legend = svg.append("g")
        .attr("transform", `translate(${width - 100},${height - 200})`);

    const legendData = d3.range(0, 100000, 10000); // Adjust range as necessary

    legend.selectAll("rect")
        .data(legendData)
        .enter().append("rect")
        .attr("width", legendItemSize)
        .attr("height", legendItemSize)
        .attr("y", (d, i) => i * (legendItemSize + legendSpacing))
        .attr("fill", d => color(d));

    legend.selectAll("text")
        .data(legendData)
        .enter().append("text")
        .attr("x", legendItemSize + legendSpacing)
        .attr("y", (d, i) => i * (legendItemSize + legendSpacing) + legendItemSize / 2)
        .attr("dy", "0.32em")
        .text(d => d);

    legend.append("text")
        .attr("x", 0)
        .attr("y", -legendSpacing)
        .attr("dy", "0.32em")
        .text("GDP per Capita");
});