import * as canvas from "./canvas.js";
import * as controls from "./controls.js";

window.addEventListener('updateType', function (e) {
    canvas.update(e.detail);
}, false);
