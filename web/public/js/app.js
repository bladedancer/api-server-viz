import * as d3 from "https://cdn.skypack.dev/d3@7";
import {scaleOrdinal} from "https://cdn.skypack.dev/d3-scale@4";
import {schemeCategory10} from "https://cdn.skypack.dev/d3-scale-chromatic@3";
import * as apiserver from "./apiserver.js";


var svgcontainer = document.querySelector('.svg-container');
var width = svgcontainer.offsetWidth;
var height = svgcontainer.offsetHeight;


var svg = d3.select('.svg-container svg')
svg.attr('preserveAspectRatio', 'xMinYMin meet');
//svg.attr('viewBox', `0 0 ${width} ${height}`)
svg.attr('width', width).attr('height', height)

// TODO 
// var { nodes, links } = await apiserver.getDefinitions({ scope: true, hard: true, soft: true });

var { nodes, links } = await apiserver.getInstances({ scope: true, hard: true, soft: true }, ["management","category","marketplace"]);

var nodeColors = scaleOrdinal(schemeCategory10).domain(nodes.filter(n => n.scope).map(n => n.scope))

function getNeighbors(node) {
    return links.reduce(function (neighbors, link) {
        if (link.target.id === node.id) {
            neighbors.push(link.source.id)
        } else if (link.source.id === node.id) {
            neighbors.push(link.target.id)
        }
        return neighbors
    },
        [node.id]
    )
}

function isNeighborLink(node, link) {
    return link.target.id === node.id || link.source.id === node.id
}


function getNodeColor(node, neighbors) {
    // TODO selection
    // if (Array.isArray(neighbors) && neighbors.indexOf(node.id) > -1) {
    //     return neighbors.indexOf(node.id) > 1 ? 'blue' : 'green'
    // }
    
    return nodeColors(node.scope || node.kind);
}


function getLinkColor(link, activeNode) {
    if (activeNode && isNeighborLink(activeNode, link)) {
        return 'green';
    } else {
        if (link.kind === "scope") {
            return "rgba(50, 50, 50, 0.2)";
        } else {
            return "rgba(20,20,20,1)";
        }
    }
}

function getTextColor(node, neighbors) {
    //return Array.isArray(neighbors) && neighbors.indexOf(node.id) > -1 ? 'green' : 'black'
    return "black";
}


// simulation setup with all forces
var linkForce = d3
    .forceLink()
    .id(function (link) { return link.id })
    .distance(function (link) {
        let distance = 100;

        if (link.kind === "scope") {
            distance = 150;
        } else {
            if (link.sourceResource.scope !== link.targetResource.scope) {
                distance *= 2;
            }

            if (link.sourceResource.group !== link.targetResource.group) {
                distance *= 2;
            }
        }

        return distance;
    })
    .iterations(10)
    .strength(function (link) { 
        let strength = 0;
        // Adjust for same group, same scope, hard|soft
        if (link.kind === "scope") {
            return 0.03; // till we can figure out nesting, very weak scope link will do.
        } else if (link.kind === 'hard') {
            strength += 0.2;
        } else if (link.kind === 'soft') {
            strength += 0.1;
        }

        if (link.sourceResource.scope === link.targetResource.scope) {
            strength += 0.1;
        }

        if (link.sourceResource.group === link.targetResource.group) {
            strength += 0.1;
        }

        return strength;
    })

var simulation = d3
    .forceSimulation()
    .force('link', linkForce)
    .force('collision', d3.forceCollide().radius(40))
    .force('charge', d3.forceManyBody().distanceMax(500).strength(-100))       
    .force('center', d3.forceCenter(width / 2, height / 2));

var dragDrop = d3.drag().on('start', function (event, node) {
    node.fx = node.x
    node.fy = node.y
}).on('drag', function (event, node) {
    simulation.alphaTarget(0.7).restart()
    node.fx = event.x
    node.fy = event.y
}).on('end', function (event, node) {
    if (!event.active) {
        simulation.alphaTarget(0)
    }
    node.fx = null
    node.fy = null
})

function selectNode(event, selectedNode) {
    var neighbors = getNeighbors(selectedNode)

    // we modify the styles to highlight selected nodes
    nodeElements.attr('fill', function (node) { return getNodeColor(node, neighbors) })
    textElements.attr('fill', function (node) { return getTextColor(node, neighbors) })
    linkElements.attr('stroke', function (link) { return getLinkColor(link, selectedNode) })
}

let zoom = d3.zoom().on('zoom', handleZoom);

function initZoom() {
    d3.select('svg').call(zoom);
}

function handleZoom(e) {
    d3.selectAll('svg g').attr('transform', e.transform);
}

var linkElements = svg.append("g")
    .attr("class", "links")
    .selectAll("line")
    .data(links)
    .enter().append("line")
    .attr("stroke-width", function(link) { 
        if (link.kind === "scope") {
            return 1;
        } else {
            return 2;
        }
    })
    .attr("stroke-dasharray", function(link) {
        if (link.kind === "scope") {
            return "5,5";
        } else if (link.kind === "soft") {
            return "2, 2";
        }
    })
    .attr("stroke", function(link) { return getLinkColor(link);});

var nodeElements = svg.append("g")
    .attr("class", "nodes")
    .selectAll("circle")
    .data(nodes)
    .enter().append("circle")
    .attr("r", function(d) { return d.scope ? 10 : 30; })
    .attr("fill", getNodeColor)
    .attr("data-toggle", "modal")
    .attr("data-target", "#exampleModal")
    .call(dragDrop)
    .on('click', selectNode)

var textElements = svg.append("g")
    .attr("class", "texts")
    .selectAll("text")
    .data(nodes)
    .enter().append("text")
    .text(function (node) { return node.name })
    .attr("font-size", 15)
    .attr("dx", 15)
    .attr("data-toggle", "modal")
    .attr("data-target", "#exampleModal")
    .attr("dy", 4)
    .on('click', selectNode)


simulation.nodes(nodes).on('tick', () => {
    nodeElements
        //.attr('cx', function (node) { return node.x = Math.max(radius, Math.min(width - radius, node.x)); })
        //.attr('cy', function (node) { return node.y = Math.max(radius, Math.min(height - radius, node.y)); })
        .attr('cx', function (node) { return node.x; })
        .attr('cy', function (node) { return node.y; })
    textElements
        .attr('x', function (node) { return node.x; })
        .attr('y', function (node) { return node.y; })
    linkElements
        .attr('x1', function (link) { return link.source.x })
        .attr('y1', function (link) { return link.source.y })
        .attr('x2', function (link) { return link.target.x })
        .attr('y2', function (link) { return link.target.y })
})

simulation.force("link").links(links)
initZoom();