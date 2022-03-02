let config = {
    selection: "",
    scopeFilter: "",
    includedLinks: {
        scope: false,
        hard: false,
        soft: false
    },
    groups: null
};

(function handlers() {
    document.getElementById("definitions").onclick = displayDefinitions;
    document.getElementById("instances").onclick = displayInstances;

    document.getElementById("optionScope").addEventListener('change', (e) => { 
        config.includedLinks.scope = e.target.checked;
        window.dispatchEvent(new CustomEvent('updateType', { detail: config }));
    });

    document.getElementById("optionHard").addEventListener('change', (e) => { 
        config.includedLinks.hard = e.target.checked;
        window.dispatchEvent(new CustomEvent('updateType', { detail: config }));
    });
    document.getElementById("optionSoft").addEventListener('change', (e) => { 
        config.includedLinks.soft = e.target.checked;
        window.dispatchEvent(new CustomEvent('updateType', { detail: config }));
    });
    
    document.getElementById("scopeInput").addEventListener('change', (e) => { 
        config.scopeFilter = e.target.value;
        window.dispatchEvent(new CustomEvent('updateType', { detail: config }));
    });

    new ResizeObserver(() => window.dispatchEvent(new Event('resize'))).observe(document.getElementsByClassName("jumbotron-content")[0])

    window.dispatchEvent(new CustomEvent('updateType', { detail: config })); // init
})();

function displayDefinitions() {
    config.selection = "definitions";
    config.groups = ["definitions"];
    window.dispatchEvent(new CustomEvent('updateType', { detail: config }));
}

function displayInstances() {
    config.selection = "instances";
    config.groups = ["management", "catalog", "marketplace"];
    window.dispatchEvent(new CustomEvent('updateType', { detail: config }));
}
