
import * as d3 from "https://cdn.skypack.dev/d3@7";
import {scaleOrdinal} from "https://cdn.skypack.dev/d3-scale@4";
import {schemeCategory10} from "https://cdn.skypack.dev/d3-scale-chromatic@3";
import * as apiserver from "./apiserver.js";

let svgcontainer = document.querySelector('.svg-container');
let width = svgcontainer.offsetWidth;
let height = svgcontainer.offsetHeight;

let nodes = [];
let links = [];
let nodeColors = () => "black";

var svg = d3.select('.svg-container svg')
svg.attr('preserveAspectRatio', 'xMinYMin meet');
svg.attr('width', width).attr('height', height)

window.onresize = () => {
    width = svgcontainer.offsetWidth;
    height = svgcontainer.offsetHeight;
    svg.attr('width', width).attr('height', height);
}

export async function update(config) {
    document.querySelector('.svg-container svg').replaceChildren();
    if (config.selection === "definitions") {
        let res = await apiserver.getDefinitions(config.includedLinks, config.groups);
        nodes = res.nodes;
        links = res.links;
    } else if (config.selection === "instances") {
        let res = await apiserver.getInstances(config.includedLinks, config.groups);
        nodes = res.nodes;
        links = res.links;
    } else {
        nodes = [];
        links = [];
    }

    nodeColors = scaleOrdinal(schemeCategory10).domain(nodes.filter(n => n.scope).map(n => n.scope))
    simulate();
    initZoom();
}

function simulate() {
    let linkForce = d3.forceLink()
        .id((link) => link.id )
        .distance((link) => {
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
        .iterations(1000)
        .strength((link) => { 
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
        });

    let simulation = d3.forceSimulation()
        .force('link', linkForce)
        .force('collision', d3.forceCollide().radius(20))
        .force('charge', d3.forceManyBody().distanceMax(500).strength(-100))
        .force('center', d3.forceCenter(width / 2, height / 2));
        
    renderSimulation(simulation);
}

function renderSimulation(simulation) {
    let dragDrop = d3.drag()
        .on('start', (event, node) => {
            node.fx = node.x;
            node.fy = node.y;
        })
        .on('drag', (event, node) => {
            simulation.alphaTarget(0.7).restart();
            node.fx = event.x;
            node.fy = event.y;
        })
        .on('end', (event, node) => {
            if (!event.active) {
                simulation.alphaTarget(0);
            }
            node.fx = null;
            node.fy = null;
        });

    let linkElements = svg.append("g")
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

    let nodeElements = svg.append("g")
        .attr("class", "nodes")
        .selectAll("circle")
        .data(nodes)
        .enter().append("circle")
        .attr("r", function(d) { return d.scope ? 10 : 30; })
        .attr("fill", getNodeColor)
        .attr("data-toggle", "modal")
        .attr("data-target", "#exampleModal")
        .call(dragDrop)
        .on('click', (event, selectedNode) => selectNode(event, selectedNode, links))

    let textElements = svg.append("g")
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
}


function getNeighbors(node, links) {
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

function selectNode(event, selectedNode, links) {
    var neighbors = getNeighbors(selectedNode, links)

    // we modify the styles to highlight selected nodes
    nodeElements.attr('fill', function (node) { return getNodeColor(node, neighbors) })
    textElements.attr('fill', function (node) { return getTextColor(node, neighbors) })
    linkElements.attr('stroke', function (link) { return getLinkColor(link, selectedNode) })
}

// Zoom functionality
let zoom = d3.zoom().on('zoom', handleZoom);

function initZoom() {
    d3.select('svg').call(zoom);
}

function handleZoom(e) {
    d3.selectAll('svg g').attr('transform', e.transform);
}


