// set the dimensions and margins of the graph
var outerWidth = 600;
var outerHeight = 300;

var margin = {top: 20, right: 20, bottom: 70, left: 40},
    width = outerWidth - margin.left - margin.right,
    height = outerHeight - margin.top - margin.bottom;

// set the ranges
var x = d3.scaleLinear()
    .range([0, width]);
      
var y = d3.scaleBand()
    .range([height, 0])
    .padding(0.33);

var xAxis = d3.axisTop(x)
    .ticks(5)

var yAxis = d3.axisLeft(y)
    .tickFormat('')

// append the svg object to the body of the page
// append a 'group' element to 'svg'
// moves the 'group' element to the top left margin
var svg = d3.select('body').append('svg')
    .attr("class", "chart")
    .attr("width", outerWidth)
    .attr("height", outerHeight)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);
 
// data 
var data = [{'team':'Boston','value':100},
        {'team':'Detroit','value':85},
        {'team':'New York','value':80}, 
        {'team':'Chicago','value':75}, 
        {'team':'Atlanta','value':30}]

// format the data 
data.forEach(function(d) {
        d.value = +d.value;
});

// scale the range of the data in the domains 
x.domain([0, d3.max(data, function(d){ return d.value; })])
y.domain(data.map(function(d) { return d.team; }));

// append the rectangles for the bar chart
svg.selectAll(".bar")
    .data(data)
  .enter().append("rect")
    .attr("class", "bar")
    .attr("width", function(d) {return x(d.value);})
    .attr("y", function(d) { return y(d.team);})
    .attr("height", y.bandwidth());

// add the x Axis
svg.append("g")
    .attr("transform", "translate(0," + height + ")") 
    .call(d3.axisBottom(x));

// add the y Axis
svg.append("g")
    .call(d3.axisLeft(y));
