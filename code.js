// Fake data
var data = [
    {
        date: "2020-01-01",
        popularity: 50
    },
    {
        date: "2020-02-01",
        popularity: 150
    },
    {
        date: "2020-03-01",
        popularity: 200
    },
    {
        date: "2020-03-01",
        popularity: 250
    },
    {
        date: "2020-04-01",
        popularity: 200
    },
    {
        date: "2020-05-01",
        popularity: 250
    },
    {
        date: "2020-06-01",
        popularity: 350
    }
  ];
  
  // Create SVG and padding for the chart
  const svg = d3
    .select("#chart")
    .append("svg")
    .attr("height", 300)
    .attr("width", 600);
  const margin = { top: 0, bottom: 20, left: 30, right: 20 };
  const chart = svg.append("g").attr("transform", `translate(${margin.left},0)`);
  const width = +svg.attr("width") - margin.left - margin.right;
  const height = +svg.attr("height") - margin.top - margin.bottom;
  const grp = chart
    .append("g")
    .attr("transform", `translate(-${margin.left},-${margin.top})`);
  
  // Add empty scales group for the scales to be attatched to on update 
  chart.append("g").attr("class", "x-axis");
  chart.append("g").attr("class", "y-axis");
  
  // Add empty path
  const path = grp
    .append("path")
    .attr("transform", `translate(${margin.left},0)`)
    .attr("fill", "none")
    .attr("stroke", "steelblue")
    .attr("stroke-linejoin", "round")
    .attr("stroke-linecap", "round")
    .attr("stroke-width", 1.5);
  
  function updateScales(data) {
    // Create scales
    const yScale = d3
      .scaleLinear()
      .range([height, 0])
      .domain([0, d3.max(data, dataPoint => dataPoint.popularity)]);


    // Set Date Range
    var earliestDate = new Date(data[0].date);
    var lastDate = new Date(data[data.length-1].date);

    console.log(earliestDate);
    console.log(lastDate);

    // Setting up date on the X axis
    const xScale = d3
      .scaleLinear()
      .range([0, width])
      .domain([earliestDate, lastDate]);

    return { yScale, xScale };
  }
  
  function createLine(xScale, yScale) {
    console.log("Create Line");
    console.log(xScale);

    return line = d3
    .line()
    .x(dataPoint => xScale(new Date(dataPoint.date)))
    .y(dataPoint => yScale(dataPoint.popularity));
  }
  
  function updateAxes(data, chart, xScale, yScale) {

    chart
      .select(".x-axis")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(xScale).ticks(data.length).tickFormat(d3.timeFormat("%y-%m")));

    chart
      .select(".y-axis")
      .attr("transform", `translate(0, 0)`)
      .call(d3.axisLeft(yScale));
  }
  
  function updatePath(data, line) {

    console.log(data);
    console.log(line);

    const updatedPath = d3
      .select("path")
      .interrupt()
      .datum(data)
      .attr("d", line);

    console.log("HEre");
  
    const pathLength = updatedPath.node().getTotalLength();
    // D3 provides lots of transition options, have a play around here:
    // https://github.com/d3/d3-transition
    const transitionPath = d3
      .transition()
      .ease(d3.easeSin)
      .duration(2500);
    updatedPath
      .attr("stroke-dashoffset", pathLength)
      .attr("stroke-dasharray", pathLength)
      .transition(transitionPath)
      .attr("stroke-dashoffset", 0);
  }
  
  function updateChart(data) {
      const { yScale, xScale } = updateScales(data);
      const line = createLine(xScale, yScale);
      updateAxes(data, chart, xScale, yScale);
      updatePath(data, line);
  }
  
  updateChart(data);
//   // Update chart when button is clicked
//   d3.select("button").on("click", () => {
//     // Create new fake data
//     const newData = data.map(row => {
//       return { ...row, popularity: row.popularity * Math.random() };
//     });
//     updateChart(newData);
//   });