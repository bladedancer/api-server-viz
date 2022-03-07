import * as canvas from "./d3-canvas.js";
import * as controls from "./controls.js";

window.addEventListener('updateType', function (e) {
    canvas.update(e.detail);
}, false);


window.addEventListener('updateForce', function (e) {
    canvas.updateForce(e.detail);
}, false);

window.addEventListener('updateCharge', function (e) {
    canvas.updateCharge(e.detail);
}, false);
