var APIBuilder = require('@axway/api-builder-runtime');
var Model = APIBuilder.createModel('resource', {
    "fields": {
        "group": {
            "type": "string",
            "required": true
        },
        "apiVersion": {
            "type": "string",
            "required": true
        },
        "kind": {
            "type": "string",
            "required": true
        },
        "name": {
            "type": "string",
            "required": true
        },
        "title": {
            "type": "string"
        },
        "metadata": {
            "type": "object"
        },
        "attributes": {
            "type": "object"
        },
        "finalizers": {
            "type": "array"
        },
        "tags": {
            "type": "array"
        },
        "spec": {
            "type": "object"
        }
    },
    "connector": "memory",
    "actions": [],
    "description": "API Server Resource"
});
module.exports = Model;