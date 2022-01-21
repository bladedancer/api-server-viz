import {JSONPath} from 'https://cdn.jsdelivr.net/gh/JSONPath-Plus/JSONPath@v6.0.1/dist/index-browser-esm.min.js';

export async function getDefinitions(includedLinks = { scope: true, hard: true, soft: true}) {
    let resourceVersionResponse = await fetch('/api/endpoints/resource/query?sel={"name":1,"metadata.selfLink":1,"spec":1}&where={"kind": "ResourceDefinitionVersion"}&limit=1000');
    let resourceDefinitionResponse = await fetch('/api/endpoints/resource/query?sel={"metadata.scope.name":1,"metadata.selfLink":1,"spec.kind":1,"spec.scope.kind":1,"name":1}&where={"kind": "ResourceDefinition"}&limit=1000');

    let resourceVersions = await resourceVersionResponse.json();
    let resourceDefinitions = await resourceDefinitionResponse.json();

    let nodes = resourceVersions.map(ver => {
        let resDef = resourceDefinitions.find(def => def.name === ver.spec.resourceDefinition);
        return {
            id: ver.id,
            scope: resDef.spec.scope ? resDef.spec.scope.kind : null,
            group: resDef.metadata.scope.name,
            kind: resDef.spec.kind,
            name: resDef.spec.kind,
            title: resDef.spec.kind,
            apiVersion: ver.spec.name,
            selfLink: ver.metadata.selfLink
        };
    });

    let links = [];

    resourceVersions.forEach(ver => {        
        let srcDef = resourceDefinitions.find(def => def.name === ver.spec.resourceDefinition);
        let srcScope = srcDef.spec.scope ? srcDef.spec.scope.kind : null;
        let srcGroup = srcDef.metadata.scope.name;

        if (includedLinks.scope) {
            // Add a link to the scope
            links = links.concat(scopeLink(resourceDefinitions, resourceVersions, ver.id, srcGroup, srcScope));
        }

        // For each version spec find the refs and create links
        let refs = JSONPath({
            path: "$..'x-amplify-kind-ref'", 
            json: ver,
            resultType: "parent"
        });

        if (!refs || refs.length === 0) {
            return;
        }

        let refLinks = [];

        // Add reference links
        refs.forEach(ref => {
            let targetRef = ref['x-amplify-kind-ref'];
            let refType = ref['x-amplify-kind-ref-type'] || 'hard';

            if ((refType === 'hard' && !includedLinks.hard)
                || (refType === 'soft' && !includedLinks.soft)) {
                return;
            }

            let targetRefParts = targetRef.split("/");
            let group = srcGroup;
            let scope = null
            let targetName = targetRefParts[0];
            
            if (targetRefParts.length === 2) {
                if (targetRefParts[0] === targetRefParts[0].toLowerCase()) {
                    group = targetRefParts[0];
                    scope = null;
                    targetName = targetRefParts[1];
                } else {
                    scope = targetRefParts[0];
                    targetName = targetRefParts[1];
                }
            } else if (targetRefParts.length === 3) {
                group = targetRefParts[0];
                scope = targetRefParts[1];
                targetName = targetRefParts[2];
            }

            let targetResDef = resourceDefinitions.find(def => 
                def.spec.kind === targetName && 
                def.metadata.scope.name === group &&
                ((def.spec.scope && def.spec.scope.kind && def.spec.scope.kind === (scope || srcScope)) || (!def.spec.scope && !scope)));
            
            // For each targeted resource definition, add a link to ever version of it.
            let targetResDefVers = resourceVersions.filter(ver => ver.spec.resourceDefinition === targetResDef.name);

            targetResDefVers.forEach(targetResDefVer => {
                links.push({
                    source: ver.id,
                    target: targetResDefVer.id,
                    kind: refType,
                    sourceResource: {
                        scope: srcScope,
                        group: srcGroup
                    },
                    targetResource: {
                        scope: targetResDef.spec.scope && targetResDef.spec.scope.kind,
                        group: targetResDef.metadata.scope.name
                    }
                });
            });
        });
        links = links.concat(refLinks);
    });

    return {
        nodes,
        links
    };
}


function scopeLink(resourceDefinitions, resourceVersions, srcId, srcGroup, srcScope) {
    if (!srcScope) {
        return [];
    }

    let scopeDef = resourceDefinitions.find(def => def.spec.kind === srcScope && !def.spec.scope);

    // For each targeted scope definition, add a link to every version of it.
    let links = [];
    let scopeDefVers = resourceVersions.filter(ver => ver.spec.resourceDefinition === scopeDef.name);
    scopeDefVers.forEach(scopeDefVer => {
        links.push({
            source: srcId,
            target: scopeDefVer.id,
            kind: "scope",
            sourceResource: {
                scope: srcScope,
                group: srcGroup
            },
            targetResource: {
                scope: null, // Target is a scope
                group: srcGroup
            }
        });
    });

    return links;
}

export async function getInstances(includedLinks = { scope: true, hard: true, soft: true}, groups = null) {
    let links = [];

    let resourcesResponse = await fetch('/api/endpoints/resource/query?sel={"metadata.id":1,"metadata.scope.id":1,"metadata.scope.name":1,"metadata.references":1,"metadata.selfLink":1,"group":1,"kind":1,"title":1, "name":1,"apiVersion":1}&limit=1000');
    let resources = await resourcesResponse.json();
     
    let nodes = resources
        .filter(resource => !groups || groups.indexOf(resource.group) !== -1)
        .map(resource => {
            return {
                id: resource.metadata.id,
                scope: resource.metadata.scope ? resource.metadata.scope.name : null,
                group: resource.group,
                kind: resource.kind,
                name: resource.name,
                title: `${resource.title || resource.name} (${resource.kind})`,
                apiVersion: resource.apiVersion,
                selfLink: resource.metadata.selfLink
            };
        });

    // Scope links
    if (includedLinks.scope) {
        nodes.map(node => resources.find(resource => resource.id === node.id))
            .filter(resource => resource.metadata.scope && resource.metadata.scope.id)
            .forEach(source => {
                let target = resources.find(target => target.metadata.id === source.metadata.scope.id);

                links.push({
                    source: source.metadata.id,
                    target: target.metadata.id,
                    kind: "scope",
                    sourceResource: {
                        scope: source.name,
                        group: source.group
                    },
                    targetResource: {
                        scope: null, // Target is a scope
                        group: target.group
                    }
                });
            
            });
        }

    // Reference links
    nodes.map(node => resources.find(resource => resource.id === node.id)) 
        .filter(resource => resource.metadata.references && resource.metadata.references.length > 0)
        .forEach(source => {
            let refLinks = [];
            source.metadata.references.forEach(ref => {
                let target = resources.find(target => target.metadata.id === ref.id);
                if (!target) {
                    return; // if target is not visible
                }
                let refType = ref.type || "hard";

                if ((refType === "hard" && !includedLinks.hard) || (refType === "soft" && !includedLinks.soft)) {
                    return;
                }

                refLinks.push({
                    source: source.id,
                    target: target.id,
                    kind: refType,
                    sourceResource: {
                        scope: source.scope,
                        group: source.group
                    },
                    targetResource: {
                        scope: target.scope,
                        group: target.group
                    }
                });
            });
            links = links.concat(refLinks)        
        });

    return {
        nodes,
        links
    };
}

