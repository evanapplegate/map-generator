const width = 960, height = 600;
const svg = d3.select("body").append("svg").attr("width", width).attr("height", height);
const projection = d3.geoNaturalEarth1().scale(160).translate([width / 2, height / 2]);
const path = d3.geoPath().projection(projection);
const colorScale = d3.scaleSequential(d3.interpolateReds).domain([0, 100000]);
const legendItemSize = 10, legendSpacing = 1;

Promise.all([
  d3.json("geodata/countries.geojson"),
  d3.json("geodata/country_bounds.geojson"),
  d3.xlsx("uploads/world_gdp.xlsx")
]).then(function([countries, countryBounds, gdpData]) {
  const gdpMap = {};
  gdpData.forEach(d => { gdpMap[d.NAME] = +d.gdp_per_capita; });

  svg.selectAll("path")
    .data(countries.features)
    .enter().append("path")
    .attr("d", path)
    .attr("fill", d => gdpMap[d.properties.NAME] ? colorScale(gdpMap[d.properties.NAME]) : "#eeeeee")
    .attr("stroke", "#ffffff")
    .attr("stroke-width", 0.5);

  svg.selectAll("path.boundary")
    .data(countryBounds.features)
    .enter().append("path")
    .attr("d", path)
    .attr("class", "boundary")
    .attr("fill", "none")
    .attr("stroke", "#ffffff")
    .attr("stroke-width", 0.5);

  const legend = svg.selectAll('.legendItem')
    .data(colorScale.ticks(10).slice(1).reverse())
    .enter().append('g')
    .attr("class", "legendItem")
    .attr("transform", (d, i) => `translate(20, ${(i * (legendItemSize + legendSpacing)) + 20})`);

  legend.append('rect')
    .attr("width", legendItemSize)
    .attr("height", legendItemSize)
    .attr("fill", colorScale);

  legend.append('text')
    .attr("x", legendItemSize + legendSpacing)
    .attr("y", legendItemSize - legendSpacing)
    .attr("font-size", 10)
    .attr("text-anchor", "start")
    .text(d => Math.round(d));

  svg.append("text")
    .attr("x", 20)
    .attr("y", 10)
    .attr("font-size", 12)
    .attr("text-anchor", "start")
    .text("GDP per Capita");
});