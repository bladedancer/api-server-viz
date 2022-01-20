let config = {
    selection: "",
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
    
    window.dispatchEvent(new CustomEvent('updateType', { detail: config })); // init
})();

function displayDefinitions() {
    config.selection = "definitions";
    // config.includedLinks = {
    //     scope: true,
    //     hard: true,
    //     soft: true
    // };
    config.groups = ["definitions"];
    window.dispatchEvent(new CustomEvent('updateType', { detail: config }));
}

function displayInstances() {
    config.selection = "instances";
    // config.includedLinks = {
    //     scope: true,
    //     hard: false,
    //     soft: false
    // };
    config.groups = ["management", "catalog", "marketplace"];
    window.dispatchEvent(new CustomEvent('updateType', { detail: config }));
}
