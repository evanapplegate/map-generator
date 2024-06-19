const width = 960, height = 600;
const svg = d3.select("body").append("svg").attr("width", width).attr("height", height);
const projection = d3.geoNaturalEarth1().scale(150).translate([width / 2, height / 2]);
const path = d3.geoPath().projection(projection);
const legendItemSize = 10, legendSpacing = 1;

const colorScale = d3.scaleLinear().domain([0, 100]).range(["pink", "darkred"]);
const colorNoData = "#eeeeee";
const legend = svg.append("g").attr("transform", "translate(20, 20)");

Promise.all([
    d3.json("../geodata/countries.geojson"),
    d3.json("../geodata/country_bounds.geojson"),
    d3.csv("../uploads/world_gdp.csv")
]).then(function([countries, boundaries, gdpData]) {
    const gdpMap = d3.map();
    gdpData.forEach(d => gdpMap.set(d.NAME, +d.gdp_per_capita));

    // Calculate min/max GDP per capita
    const gdpValues = gdpData.map(d => +d.gdp_per_capita);
    const minGdp = d3.min(gdpValues);
    const maxGdp = d3.max(gdpValues);

    // Update colorScale domain with min/max values
    colorScale.domain([minGdp, maxGdp]);

    svg.append("g")
        .selectAll("path")
        .data(countries.features)
        .enter().append("path")
        .attr("d", path)
        .attr("fill", d => gdpMap.has(d.properties.NAME) ? colorScale(gdpMap.get(d.properties.NAME)) : colorNoData)
        .attr("stroke", "white")
        .attr("stroke-width", 0.5);

    svg.append("g")
        .selectAll("path")
        .data(boundaries.features)
        .enter().append("path")
        .attr("d", path)
        .attr("fill", "none")
        .attr("stroke", "white")
        .attr("stroke-width", 0.5);

    const legendData = colorScale.ticks(6).map(d => ({ color: colorScale(d), value: d }));
    
    const legendItems = legend.selectAll("g").data(legendData).enter().append("g")
        .attr("transform", (d, i) => `translate(0, ${i * (legendItemSize + legendSpacing)})`);
    
    legendItems.append("rect")
        .attr("width", legendItemSize)
        .attr("height", legendItemSize)
        .attr("fill", d => d.color);

    legendItems.append("text")
        .attr("x", legendItemSize + 5)
        .attr("y", legendItemSize / 1.5)
        .text(d => d.value);
}).catch(function(error) {
    console.error(error);
});