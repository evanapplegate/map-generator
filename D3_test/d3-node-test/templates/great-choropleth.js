const width = 960, height = 600;
const svg = d3.select("body").append("svg").attr("width", width).attr("height", height);
const projection = d3.geoNaturalEarth1();
const path = d3.geoPath().projection(projection);

Promise.all([
    d3.json("countries.geojson"),
    d3.json("country_bounds.geojson"),
    fetch("world_gdp.xlsx").then(res => res.arrayBuffer()).then(buffer => XLSX.read(buffer, {type: "buffer"}))
]).then(function([countries, boundaries, workbook]) {
    const gdpData = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]);
    const gdpMap = new Map(gdpData.map(d => [d.NAME, +d.gdp_per_capita]));

    const gdpValues = Array.from(gdpMap.values()).filter(val => !isNaN(val) && val !== undefined);
    const maxGdp = Math.max(...gdpValues);
    const minGdp = Math.min(...gdpValues);

    const colorScale = d3.scaleSequential(d3.interpolate("#83ce63", "darkgreen")).domain([minGdp, maxGdp]);

    svg.selectAll(".country")
       .data(countries.features)
       .enter().append("path")
       .attr("class", "country")
       .attr("d", path)
       .style("fill", d => {
           const gdp = gdpMap.get(d.properties.NAME);
           return gdp !== undefined && !isNaN(gdp) ? colorScale(gdp) : "#eeeeee";
       })
       .style("stroke", "white")
       .style("stroke-width", 0.5);

// Legend for the color scale
const legend = svg.append("g")
                  .attr("transform", "translate(150, 300)"); // Adjusted legend position

// Adding legend title
legend.append("text")
      .attr("x", 0)
      .attr("y", 0) // Position the title slightly above the first legend item
      .text("GDP per capita")
      .style("font-family", "Arial")
      .style("font-size", "7pt")
      .style("text-anchor", "start");

const legendItemSize = 10;
const legendSpacing = 1;
const legendItems = colorScale.ticks(6).reverse(); // Adjust the number of ticks based on your preference

const legendItem = legend.selectAll(".legend-item")
    .data(legendItems)
    .enter().append("g")
    .attr("class", "legend-item")
    .attr("transform", (d, i) => `translate(0, ${(legendItemSize + legendSpacing) * i + 5})`); // Adjust position to accommodate title

legendItem.append("rect")
    .attr("width", legendItemSize)
    .attr("height", legendItemSize)
    .style("fill", colorScale);

legendItem.append("text")
    .attr("x", legendItemSize + legendSpacing)
    .attr("y", legendItemSize - legendSpacing)
    .text(d => `$${d3.format(",")(d)}`) // Format the numbers
    .style("font-family", "Arial")
    .style("font-size", "7pt");

});