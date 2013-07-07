/*!
 unstructured - a library for resolving dependencies in unstructured code
 Copyright (C) 2013  Chris Price

 This program is free software: you can redistribute it and/or modify
 it under the terms of the GNU General Public License as published by
 the Free Software Foundation, either version 3 of the License, or
 (at your option) any later version.

 This program is distributed in the hope that it will be useful,
 but WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 GNU General Public License for more details.

 You should have received a copy of the GNU General Public License
 along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
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