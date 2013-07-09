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

var walker = walk.make({
    MemberExpression: function(node, scope, c) {

        var n = node, moduleName = [];

        while (n.type === 'MemberExpression') {

            if (n.property.type !== 'Identifier') {
                // turns out this isn't part of the module name
                break;
            }

            if (moduleName.length === 0 && !/^[A-Z]/.test(n.property.name)) {
                // the module name must start with an upper case letter
                break;
            }

            if (moduleName.length > 0 && !/^[a-z0-9]+$/.test(n.property.name)) {
                // the namespace must only contain lower case letters
                break;
            }

            moduleName.unshift(n.property.name);

            if (n.object.type === 'Identifier') {
                // just time for a quick check against scope vars
                var name = n.object.name;
                moduleName.unshift(name);

                var s = scope;
                while (true) {

                    if (s.vars[name]) {
                        // doh - it's rooted in a scoped variable
                        break;
                    }

                    if (s.references) {
                        // there be no more scopes, by this point it must be a global
                        moduleName = moduleName.join('.');

                        if (s.references.indexOf(moduleName) === -1) {
                            s.references.push(moduleName);
                        }
                        break;
                    }

                    s = s.prev;

                }

                break;
            }

            n = n.object;
        }

        c(node.object, scope);

    }
}, walk.scopeVisitor);

module.exports = function(module, cb) {
    module.references = [];

    if (module.ast) {
        try {
            walk.recursive(module.ast, { vars: {}, references: module.references }, walker);
        }
        catch (e) {
            return cb(e, module);
        }
    }

    cb(undefined, module);
};

module.exports.walker = walker;