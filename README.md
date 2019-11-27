# D3 Workshop
## Introduction to D3
D3 (Data-Driven Documents or D3.js) is a javascript library for manipulating documents based on data and is used in conjunction with tools like HTML, SVG, and CSS. 
### Key Components
- HTML (HyperText Markup Language)
- CSS (Cascading Style Sheets)
- JavaScript
- SVG (Scalable Vector Graphics)
- Web Server

## Getting Started
The code we will be working with can be found at: https://github.com/caocscar/d3js-examples/tree/master/bar/sortable_timeseries

The main files we will be working with are `index.html`, `sortable.js`, and `bar.css`. 

### Getting D3
To use D3, we must load the d3.js library into our HTML file from the CDN with the following code: 

```html
<script src="https://d3js.org/d3.v5.min.js"></script>
```
We'll also use the d3-array library to do some data wrangling to get the data in the right format:
```html
<script src="https://d3js.org/d3-array.v2.min.js"></script>
```

### Graph setup
Now, we will start working with our JavaScript file. We need to first set up our graph. We start by specifying the dimension and margins of our graph. The standard D3 convention for setting up margins can be found at: https://bl.ocks.org/mbostock/3019563 

Let us follow along with our code. 

First define the `margin` object with properties for the four sides:
```javascript
margin = {top: 80, right: 90, bottom: 30+50, left: 120}
```

Next define `width` and `height`as the inner dimensions of the chart area: 

```javascript
width = 900 - margin.left - margin.right
height = 1500 - margin.top - margin.bottom
```

Lastly, define `svg` as a SVG element with three attributes (`class`, `width`, and `height`) and translate its origin to the top-left corner of the chart area with a `g` element. 

```javascript
svg = d3.select('body').append('svg')
    .attr("class", "chart")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", "translate(${margin.left},${margin.top})")
```
**Note**: There is a D3 distinction between a 2 space and 4 space indentation.

### Loading in Data
Now that the graphing area has been created, we need to load in our data. We will be looking at the 2018 baseball season and the accumulation of wins by each team.

The data resides in a Github gist. There is also a copy in our folder but I wanted to show you how to read from a url.

```javascript
const fileLocation = 'https://gist.githubusercontent.com/caocscar/8cdb75721ea4f6c8a032a00ebc73516c/raw/854bbee2faffb4f6947b6b6c2424b18ca5a8970e/mlb2018.csv'
```
Next we will parse the file, convert it into an array of objects and filter it by date (using `filterData` function). By April 4th, every team has won at least one game. 
```javascript
DATA = await d3.csv(fileLocation, type)
chartDate = new Date(2018,3,3)
data = filterData(chartDate)
```
**Note**: JavaScript starts month at index 0.

`type` is a function that takes in the data and parses the date strings into a JavaScript Date format.  
```javascript
function type(d) {
  const formatDate = d3.timeParse('%Y%m%d')
  d.date = formatDate(d.date)
  return d
}
```
**Note**: `d3.csv` reads in all columns as strings and you usually convert them to numeric in the `type` function.

Here is the `filterData` function mentioned above. 
```javascript
function filterData(chartDate) {
  const snapshot = DATA.filter(d => d.date <= chartDate)
  const wins = d3.rollup(snapshot, v => v.length, d => d.team) 
  return Array.from(wins, ([key, value]) => ({'team':key, 'value':value}))
}
```
The function does some data wrangling for us.
1. Filters the data by date.
2. Performs a groupby operation by team and counts how many times they appear (or win) in the data.
3. Returns the data in the desired format for us (an `Array` of JavaScript Objects).

## Setting up D3 scales
Besides these also need to define the FINISH THISSSS: 

```javascript
y = d3.scaleBand()
    .range([height, 0])
    .padding(0.33)
    .domain(data.map(d => d.team).reverse());

x = d3.scaleLinear()
    .range([0, width]);
    .domain([0, Math.ceil(d3.max(data, d => d.value)/5)*5])
```
## Adding axes
`.append("g")` allows us to do this by appending a group element to the already defined SVG element:

```javascript
xAxis = d3.axisTop(x)
    .ticks(6)

yAxis = d3.axisLeft(y)
    .tickFormat('')
    
svg.append("g")
    .attr("class", "x axis")
    .call(xAxis);

svg.append("g")
    .attr("class", "y axis")
    .call(yAxis);
```

![Create X-axis](img/create_x_axis.png)

In addition to the axes, we want to add gridlines to the x-axis: 

```javascript
gridlines = d3.axisTop(x)
    .ticks(6)
    .tickSize(-height)
    .tickFormat("")

svg.append("g")			
    .attr("class", "grid")
    .call(gridlines)
```

As well as labels: 

```javascript
labels = svg.append('g')
    .attr('class', 'label')

xlabel = labels.append('text')
    .attr('transform', `translate(${width},-40)`)
    .text('Wins')

ylabel = labels.append('text')
    .attr('transform', `translate(-80,${height/2} rotate(-90)') 
    .text('Teams')
```

### Individual team bar charts 
Next we will start displaying our data in the graph. Ultimately, we want to show the progression of total games won for each baseball game over a period of time. Each team will be represented by a bar. 

To set up the groups, we must first create bars to contain the collective information for each team. 

In D3, instead of telling D3 what to do, think of it as you are telling D3 what you want. The following piece of code constructs bars for each of the teams.

```javascript
let bar = svg.selectAll(".bar")
  .data(data)
  .join("g")
    .attr("class", "bar")
    .attr("transform", d => `translate(0,${y(d.team)})`)
```
Here's a breakdown of the above code block:
- `svg.selectAll(".bar)` says you want to select all element of type class bar (even if they don't exist at the start)
- `.data(data)` binds the data to the D3 selection
- `.join(g)` creates `g` elements for each data point (i.e. team)

Then for each `g` element:
- `.attr('class', 'bar')` assigns `class="bar"`
- `.attr("transform", d => 'translate(0,${y(d.team)})')` assigns a transformation (x,y)

![Create bar element](img/create_bar_element.png)

Now we will add rectangles to each bar element and set the bar width corresponding to the wins for each respective team.
`.attr("width", d => x(d.value))`:  

```javascript
rects = bar.append('rect')
    .attr("width", d => x(d.value))
    .attr("height", y.bandwidth())
    .style('fill', d => d3.interpolateRdYlBu(d.value/100))
```
![Create bar element](img/create_rect.png)

Add labels to identify each team: 
```javascript
bar.append('text')
    .attr('class', 'team')
    .attr('x', -10)
    .attr('y', y.bandwidth()/2 + 5)
    .text(d => d.team)
```

As well as each team's logo: 
```javascript
const imgsize = 40
imgs = bar.append("svg:image")
    .attr('class', 'logo')
    .attr('x', d => x(d.value) + 5)
    .attr('y', -5)
    .attr('width', imgsize)
    .attr('height', imgsize)
    .attr("xlink:href", d => `http://www.capsinfo.com/images/MLB_Team_Logos/${urls[d.team]}.png`)
```

And lastly, a label for the number of games the team has won: 
```javascript
barLabels = bar.append('text')
    .attr('class', 'barlabel')
    .attr('x', d => x(d.value) + 10 + imgsize)
    .attr('y', y.bandwidth()/2 + 5)
    .text(d => d.value)
```
![Added team, logo and games won labels](img/team_logo_games_labels.png)

### Animating the graph

Since we want to display the progression of wins over a period of time, we want the graph to change as time passes so we must first display the date: 

```javascript
const formatDate = d3.timeFormat('%b %-d, %Y')
dateLabel = labels.append('text')
    .attr('id', 'date')
    .attr('transform', `translate(0,-40)`)
    .text(formatDate(chartDate))
```

Next, we will set up a variable T, which determines the time between each sorting transition in milliseconds. Every 300 milliseconds, the date label we set up above will change and update. We will also redefine the data based on the new date so we can get the cumulative games won prior to the new date. 

```javascript
const T = 300
dailyUpdate = setInterval(function() {

  chartDate = d3.timeDay.offset(chartDate,1)
  dateLabel.transition().duration(T)
          .text(formatDate(chartDate))
  data = filterData(chartDate)

```

Based on the interval T we set up, we also need to update the graph's axes to make them responsive to the changing scores. For the x axis we are incrementing by 5s: 

```javascript
x.domain([0, Math.ceil(d3.max(data, d => d.value)/5)*5]);

svg.select('.x.axis').transition().duration(T)
    .call(xAxis);
svg.select('.grid').transition().duration(T)
    .call(gridlines);
```

For the y axis we are just rearranging the team names based on the new order:

```javascript
y.domain(data.map(d => d.team).reverse());
bar.transition().duration(T)
    .attr("transform", d => `translate(0,${y(d.team)})`)
```

Next, we must also update each team's bar graph. 

As part of the animation, we include `.style('fill', d => d3.interpolateRdYlBu(d.value/100))` which defines the number of games won by each team as a fraction between 0 and 1. We will add a chromatic scheme to visually show as teams win more games, the bar will gradually change from red to yellow to blue:

```javascript
rects.data(data)
  .transition().duration(T)
    .attr("width", d => x(d.value))
    .style('fill', d => d3.interpolateRdYlBu(d.value/100))


```
More information on chromatic schemes can be found here: 
https://observablehq.com/@d3/color-schemes?collection=@d3/d3-scale-chromatic

Update the positioning of the images: 

```javascript
imgs.data(data)
  .transition().duration(T)
    .attr('x', d => x(d.value) + 5)
```

And the label for the number of games won: 

```javascript
barLabels.data(data)
  .transition().duration(T)
    .attr('x', d => x(d.value) + 10 + imgsize)
    .attr('y', y.bandwidth()/2 + 5)
    .text(d => d.value)

```

And resort the data so it is shown in descending order: 

```javascript
data.sort((a,b) => d3.descending(a.value,b.value));
```