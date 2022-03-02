//import cytoscape from 'https://cdn.jsdelivr.net/npm/cytoscape@3.20.0/dist/cytoscape.esm.min.js';
//import * as cola from 'https://cdn.jsdelivr.net/npm/cytoscape-cola@2.5.0/cytoscape-cola.js'
//import * as cola from '/node_modules/cytoscape-cola/cytoscape-cola.js';
// import * as elk from 'https://cdn.jsdelivr.net/gh/cytoscape/cytoscape.js-elk@master/dist/cytoscape-elk.js'
//import ELK from '/node_modules/elkjs/lib/elk.bundled.js';
//import * as cola from '/node_modules/cytoscape-elk/dist/cytoscape-elk.js';
import * as apiserver from "./apiserver.js";

let config = null;
let nodes = [];
let links = [];
let groups = [];

let colors = {};

function randomColor() {
    // Range between 0x20 - 0xcf for rgb.
    let r = (Math.floor(Math.random() * 0xaf)).toString(16).padStart(2, '0');
    let g = (Math.floor(Math.random() * 0xaf)).toString(16).padStart(2, '0');
    let b = (Math.floor(Math.random() * 0xaf)).toString(16).padStart(2, '0');
    return `#${r}${g}${b}`;
}

function scopeColor(kind, scope) {
    let root = scope || kind;
    if (!colors[root]) {
        colors[root] = randomColor(); 
    }

    if (scope) {
        return colors[scope];
    } else {
        return tinycolor(colors[kind]).lighten(40).toString();
    }
}

async function load() {
    if (config.selection === "definitions") {
        let res = await apiserver.getDefinitions(config.includedLinks, config.groups);
        nodes = res.nodes;
        links = res.links;

        // If there are multipe versions of the same resource then group
        let nodesClean = [];
        nodes.forEach(node => {
            let dups = nodes.filter(n => 
                node.kind === n.kind 
                && node.group === n.group
                && node.scope === n.scope);

            if (dups.length > 1) {
                // Aggregate
                let parent = nodesClean.find(n => n.id === node.group + (node.scope | "_") + node.kind);

                if (!parent) {
                    parent = {
                        id: node.group + (node.scope || "_") + node.kind,
                        scope: node.scope,
                        group: node.group,
                        kind: node.kind,
                        name: node.kind,
                        title: node.kind
                    };
                    nodesClean.push(parent);
                }
                node.parent = parent.id;
            }

            nodesClean.push(node);
        });
        nodes = nodesClean;

        // Collapse the links so they point to the parent.
        links.forEach(l => {
            let target = nodes.find(n => n.id === l.target);
            l.target = target.parent || l.target;
        })


    } else if (config.selection === "instances") {
        let res = await apiserver.getInstances(config.includedLinks, config.groups);
        nodes = res.nodes;
        links = res.links;
    } else {
        nodes = [];
        links = [];
    }
}

export async function update(cfg) {
    config = cfg;
    await load();

    var cy = cytoscape({
        container: document.getElementsByClassName('content'),
        elements: {
            nodes: nodes.map(n => ({ 
                data: {
                    ...n,
                    nodeColor: scopeColor(n.kind, n.scope),
                    shape: n.scope ? "ellipse" : "hexagon"
                },
                group: "nodes"
            })),
            edges: links.map(l => ({ 
                data: {
                    id: l.source + l.target + l.kind,
                    ...l,
                    linkColor: scopeColor(l.sourceResource.name, l.sourceResource.scope)
                }
            }))
            
        },
        style: [
            {
                selector: 'node',
                style: {
                    shape: 'data(shape)',
                    label: 'data(title)',
                    'background-color': 'data(nodeColor)',
                    'border-width': '2px',
                    'border-style': 'solid',
                    'border-color': '#000000'
                }
            },
            {
                selector: ':parent',
                style: {
                    shape: 'roundrectangle'
                }
            },
            {
                selector: 'edge',
                style: {
                    'line-color': 'data(linkColor)',
                    'target-arrow-color': 'data(linkColor)',
                    'target-arrow-shape': 'triangle',
                    'curve-style': 'bezier'
                }
            }
        ]
      });

    cy.ready(() => {
        // const bb = cy.bubbleSets({
        //     interactive: true,
        //     zIndex: 100
        // });

        // const ids = Array.from(new Set(cy.elements().map(el => el.data().scope ? el.data().scope : el.data().kind)))
        // console.log(ids);
        // ids.forEach(id => {
        // const nodes = cy.nodes(`[cluserId = "${id}"]`)
        // // const avoidNodes = cy.nodes().filter(`[cluserId != "${id}"]`)
        // const { node } = bb.addPath(nodes, null, null, {
        //     virtualEdges: true,
        //     style: {
        //         fill: 'rgba(255, 0, 0, 0)',
        //     stroke: 'red',
        //     strokeDasharray: '5, 5, 5'
        //     }
        // })(
        //     node.oncontextmenu = e => {
        //     console.log('you clicked a group')
        //     }
        // })
    });

    let layout = cy.layout({
        name: 'cola',
        infinite: true,
        fit: false,
        randomize: false,
        animate: true,
        avoidOverlap: true,
        nodeDimensionsIncludeLabels: true,
        retfresh: 20
    }).run();

    cy.on("layoutready", () => cy.fit());
    // cy.on("drag", ":parent", (event) => {
    //     console.log(event);
    // });
    //cy.on("dragfree", ":parent", () => (layout.options.anumate = true));
}