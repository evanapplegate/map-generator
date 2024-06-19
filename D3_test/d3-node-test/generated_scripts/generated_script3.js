const width = 960, height = 600;
const svg = d3.select("body").append("svg").attr("width", width).attr("height", height);
const projection = d3.geoNaturalEarth1().scale(160).translate([width / 2, height / 2]);
const path = d3.geoPath().projection(projection);
const legendItemSize = 10, legendSpacing = 1;
const colorScale = d3.scaleSequential(d3.interpolateReds).domain([0, 100000]);

d3.json("geodata/countries.geojson").then(countries => {
  d3.json("geodata/country_bounds.geojson").then(bounds => {
    d3.xlsx("uploads/world_gdp.xlsx").then(data => {
      const gdpData = {};
      data.forEach(d => { gdpData[d.NAME] = +d.gdp_per_capita; });

      const countryPaths = svg.append("g").selectAll("path").data(countries.features)
        .join("path").attr("d", path)
        .attr("fill", d => gdpData[d.properties.NAME] ? colorScale(gdpData[d.properties.NAME]) : "#eeeeee")
        .attr("stroke", "#ffffff").attr("stroke-width", 0.5);
  
      svg.append("g").selectAll("path").data(bounds.features)
        .join("path").attr("d", path).attr("fill", "none").attr("stroke", "white").attr("stroke-width", 0.5);
  
      const legend = svg.append("g").attr("transform", `translate(${width - 20}, 20)`);
      const legendScale = d3.scaleLinear().domain([0, 100000]).range([0, 100]);

      legend.selectAll("rect").data(d3.range(0, 100001, 10000)).enter()
        .append("rect").attr("y", d => legendScale(d))
        .attr("width", legendItemSize).attr("height", legendSpacing)
        .attr("fill", d => colorScale(d));

      legend.selectAll("text").data(d3.range(0, 100001, 10000)).enter()
        .append("text").attr("x", legendItemSize + legendSpacing)
        .attr("y", d => legendScale(d) + legendItemSize / 2)
        .attr("dy", "0.35em").attr("font-size", "10px")
        .text(d => d3.format(",")(d));

      svg.append("text")
        .attr("x", width - 20).attr("y", 10).attr("font-size", "12px").attr("text-anchor", "start")
        .text("GDP per Capita");
    });
  });
});