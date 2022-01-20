let config = {
    selection: "instances",
    includedLinks: {
        scope: true,
        hard: true,
        soft: true
    },
    groups: null
};

(function handlers() {
    document.getElementById("definitions").onclick = displayDefinitions;
    document.getElementById("instances").onclick = displayInstances;
    window.dispatchEvent(new CustomEvent('updateType', { detail: config })); // init
})();

function displayDefinitions() {
    config.selection = "definitions";
    config.includedLinks = {
        scope: true,
        hard: false,
        soft: false
    };
    config.groups = ["definitions"];
    window.dispatchEvent(new CustomEvent('updateType', { detail: config }));
}

function displayInstances() {
    config.selection = "instances";
    config.includedLinks = {
        scope: true,
        hard: true,
        soft: true
    };
    config.groups = ["management", "catalog", "marketplace"];
    window.dispatchEvent(new CustomEvent('updateType', { detail: config }));
}
