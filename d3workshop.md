# D3 Workshop
## Introduction to D3
D3 is a javascript library for manipulating documents based on data and is often used in conjunction with software tools like HTML, SVG, and CSS. Essentially, it links data with what appears on the screen allowing the user to explore the information interactively. 
### Key Components
- #### HyperText Markup Language (HTML)
    - This is what web pages are made of and how you will ultimately present your information to the user. 
- #### Javascript 
    - This is the code contained inside the HTML that makes up the dynamically represented data you will create. 
- #### Cascading Style Sheets (CSS)
    -  This describes the formatting of a document and will help with the presentation of the individual components. 
- #### Web Servers
    - This will allow you to access your HTML files and provides the structure that allows it to be displayed on a web browser. You can either set up a local server or get access to a remote one.

## Getting Started
The code we will be working with can be found at: https://github.com/caocscar/d3js-examples/tree/master/bar/sortable_timeseries


### Getting D3
To use D3, we must load the d3.js library into our HTML file from the CDN with the following code: 
<br>
```
<script src="https://d3js.org/d3.v5.min.js"></script>
```
And for our specific example today, we will also load this in as well:
```
<script src="https://d3js.org/d3-array.v2.min.js"></script>
```

### Graph setup
Now, we will start working with our javascript file. We need to first set up our graph. The standard convention for setting up margins can be found at: https://bl.ocks.org/mbostock/3019563 
<br>
<br>
Let us follow along with our code. 
<br>
<br>
First define the `margin` object with properties for the four sides clockwise from the top with the following code:
```
margin = {top: 80, right: 90, bottom: 30+50, left: 120}
```

Next define `width` and `height`as the inner dimensions of the chart area: 

```
width = 900 - margin.left - margin.right
height = 1500 - margin.top - margin.bottom
```

Lastly, define `svg` as a SVG element with three attributes (class, width and height) and translate its the origin to the top-left corner of the chart area with a G element. 
```
svg = d3.select('body').append('svg')
      .attr("class", "chart")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", "translate(${margin.left},${margin.top})")

```

### Loading in Data
Now that the graph has been created, we need to load in our data. Today we will be looking at total wins of baseball teams  

We will access the csv file through a url:

```
 const fileLocation = 'https://gist.githubusercontent.com/caocscar/8cdb75721ea4f6c8a032a00ebc73516c/raw/854bbee2faffb4f6947b6b6c2424b18ca5a8970e/mlb2018.csv'
```
Next we will parse the file, convert it into an array of objects and filter it by date, only taking in data entries before 4/3/2018. By this date, every team has won at least one game. 

```
DATA = await d3.csv(fileLocation, type)
chartDate = new Date(2018,3,3)
data = filterData(chartDate)

```

## Adding Graph Details 

SVG stands for scalable vector graphics and up above, we defined and shifted our SVG graph. Now we will add axes.

`.append("g")` allows us to do this by appending a SVG group element to the already defined SVG element:

```
svg.append("g")
  .attr("class", "x axis")
  .call(xAxis);

svg.append("g")
  .attr("class", "y axis")
  .call(yAxis);

```

In conjunction to the axes we want to add gridlines: 

```
let gridlines = d3.axisTop(x)
  .ticks(6)
  .tickSize(-height)
  .tickFormat("")

svg.append("g")			
  .attr("class", "grid")
  .call(gridlines)

  ```

As well as labels: 

```
labels = svg.append('g')
  .attr('class', 'label')

xlabel = labels.append('text')
  .attr('transform', `translate(${width},-40)`)
  .text('Wins')

ylabel = labels.append('text')
  .attr('transform', `translate(-80,${height/2}) rotate(-90)`) // order matters
  .text('Teams')

```

### Individual team bar charts 
Next we will start displaying our data in the graph. Ultimately, we want to show the progression of total games won for each baseball game over a period of time. Each team will be represented by a bar. 

To set up the bar groups we must first group the data by team. In D3, instead of telling D3 what to do, think of it as you are telling D3 what you want. `svg.selectAll(".bar)` tells D3 you want bar elements to correspond to the data with one bar per datum. Then, create another SVG group element that transforms the bars to display horizontally instead of vertially: 

```
svg.selectAll(".bar")
  .data(data)
  .join("g")
    .attr("class", "bar")
    .attr("transform", d => `translate(0,${y(d.team)})`)

```
Then, we will add the bars to our blank graph: 
```
let rects = bar.append('rect')
  .attr("width", (d,i) => x(d.value))
  .attr("height", y.bandwidth())
  .style('fill', d => d3.interpolateRdYlBu(d.value/100))

```

Add labels to identify each team: 
```
bar.append('text')
  .attr('class', 'team')
  .attr('x', -10)
  .attr('y', y.bandwidth()/2 + 5)
  .text(d => d.team)

```

As well as each team's logo: 

```
const imgsize = 40
let imgs = bar.append("svg:image")
  .attr('class', 'logo')
  .attr('x', d => x(d.value) + 5)
  .attr('y', -5)
  .attr('width', imgsize)
  .attr('height', imgsize)
  .attr("xlink:href", d => `http://www.capsinfo.com/images/MLB_Team_Logos/${urls[d.team]}.png`)

```






  ```
  y = d3.scaleBand()
      .range([height, 0])
      .padding(0.33)

  x = d3.scaleLinear()
      .range([0, width]);
  
  xAxis = d3.axisTop(x)
    .ticks(6)

  yAxis = d3.axisLeft(y)
    .tickFormat('')
    
  y.domain(data.map(d => d.team).reverse());
  x.domain([0, Math.ceil(d3.max(data, d => d.value)/5)*5])
  ```