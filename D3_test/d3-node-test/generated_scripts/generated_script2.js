const width = 960, height = 600;

const projection = d3.geoNaturalEarth1()
  .scale(160)
  .translate([width / 2, height / 2]);

const path = d3.geoPath().projection(projection);

const svg = d3.select("body").append("svg")
  .attr("width", width)
  .attr("height", height);

const color = d3.scaleLinear()
  .domain([0, 10000, 50000])
  .range(["lightpink", "red", "darkred"]);

const legendItemSize = 10, legendSpacing = 1;

const legend = svg.append("g")
  .attr("class", "legend")
  .attr("transform", `translate(${width - 100}, ${height - 100})`);

legend.append("text")
  .attr("x", -legendItemSize)
  .attr("y", -legendSpacing)
  .attr("dy", "0.32em")
  .style("text-anchor", "end")
  .text("GDP per Capita");

const keys = [0, 10000, 50000];
const range = color.range();

keys.forEach((key, i) => {
  legend.append("rect")
    .attr("x", 0)
    .attr("y", i * legendItemSize + i * legendSpacing)
    .attr("width", legendItemSize)
    .attr("height", legendItemSize)
    .style("fill", range[i]);

  legend.append("text")
    .attr("x", legendItemSize + legendSpacing)
    .attr("y", i * legendItemSize + i * legendSpacing + legendItemSize / 2)
    .attr("dy", "0.32em")
    .style("text-anchor", "start")
    .text(key);
});

Promise.all([
  d3.json('geodata/countries.geojson'),
  d3.json('geodata/country_bounds.geojson'),
  d3.xlsx('uploads/world_gdp.xlsx')
]).then(([countries, boundaries, gdpData]) => {
  const gdpMap = new Map(gdpData.map(d => [d.NAME, +d.gdp_per_capita]));

  svg.append("g")
    .selectAll("path")
    .data(countries.features)
    .enter().append("path")
    .attr("d", path)
    .attr("fill", d => gdpMap.has(d.properties.NAME) ? color(gdpMap.get(d.properties.NAME)) : "#eeeeee")
    .attr('stroke', '#ffffff')
    .attr('stroke-width', 0.5);
    
  svg.append("g")
    .selectAll("path")
    .data(boundaries.features)
    .enter().append("path")
    .attr("d", path)
    .attr('fill', 'none')
    .attr('stroke', '#ffffff')
    .attr('stroke-width', 0.5);
});