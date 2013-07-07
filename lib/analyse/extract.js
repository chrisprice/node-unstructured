var walk = require('acorn/util/walk');

var walker = {
    source: function(node, module) {
        return module.source.substring(node.range[0], node.range[1]);
    },
    MemberExpression: function(node, module) {
        var matches = this.source(node, module).match(/^(?:[a-z][a-z0-9]*\.)*[A-Z][A-Za-z0-9]*/);
        if (matches) {
            var moduleName = matches[0];
            if (moduleName != module.name && module.references.indexOf(moduleName) == -1) {
                module.references.push(moduleName);
            }
        }
    }
};

module.exports = function(module, cb) {
    module.references = [];

    if (module.ast) {
        try {
            walk.recursive(module.ast, module, walker);
        }
        catch (e) {
            return cb(e, module);
        }
    }

    cb(undefined, module);
};

module.exports.walker = walker;