// d3js pan //
/*
	TODO: search the solution.
*/

// d3js layout scaling //
/*
In some cases you want to handle zooming and rescale your layout.
But at all examples you can see something like this:
-------*/
var width = 640;
var height = 480;

var outer = d3.select('div')
  .append("svg:svg")
  .attr("width", width)
  .attr("height", height)
  .attr("pointer-events", "all");

var vis = outer
  .append('svg:g')
  .call(d3.behavior.zoom().on("zoom", rescale))
  .on("dblclick.zoom", null)
  .append('svg:g');

vis.append('svg:rect')
  .attr('width', width)
  .attr('height', height)
  .attr('fill', 'white');

var rescale = function() {
  vis.attr("transform", "translate(" + d3.event.translate + ")" + " scale(" + d3.event.scale + ")");
};
/*------
Problem with that way - your rectangle handles dragging and
rescaling too. So if you zoomout, rectangle zoomout too and getting
smaller and as side effect - area that handles dragging/zooming is smaller
now too. Also there is no any restriction on max and min scale.

So the more correct way - use differ scale factor for rectangle.

Here is more correct behaviour:
-------*/
var width = 640;
var height = 480;

var outer = d3.select(_el)
  .append("svg:svg")
  .attr("width", width)
  .attr("height", height)
  .attr("pointer-events", "all");

var vis = outer
  .append('svg:g')
  .call(d3.behavior.zoom().scaleExtent([0.2, 5]).on("zoom", rescale)) // here we set min=0.2 and max=5 scale
  .on("dblclick.zoom", null)
  .append('svg:g');

//here is updated rescale function
var rescale = function() {
  vis.attr("transform", "translate(" + d3.event.translate + ")" + " scale(" + d3.event.scale + ")");

	//let's rescale/reposition rectangle that using for dragging
	var scale = 1 / d3.event.scale;
	vis.selectAll('rect').attr("transform", "translate(" + [-1 * (scale * d3.event.translate[0]), -1 * (scale * d3.event.translate[1])] + ")" + " scale(" + scale + ")");
};
/*-------
So now you have min/max scale for zooming and you
dragging area (your rectangle) correctly scales and fit whole svg area all time.
*/