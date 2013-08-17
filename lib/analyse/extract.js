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

function extractMemberPath(node, scope, c) {

    var memberPath = [];

    for (var n = node; n.type === 'MemberExpression'; n = n.object) {

        // we define member paths to only include identifiers
        if (n.property.type !== 'Identifier') {

            // continue walk in case the property contains a member path
            c(node.property, scope);

            break;
        }

        memberPath.unshift(n.property.name);

        if (n.object.type === 'Identifier') {

            var name = n.object.name;

            // traverse through the scopes
            for (var s = scope; s; s = s.prev) {

                // we define member paths to not be rooted in a scoped variable
                if (s.vars[name]) {
                    return;
                }

            }

            memberPath.unshift(name);

            return memberPath.join('.');

        }

    }

    // continue walk - object is not a MemberExpression
    c(node.object, scope);

}

var walker = walk.make({
    MemberExpression: function(node, scope, c) {

        var path = extractMemberPath(node, scope, c);

        // the namespace must only contain lower case letters
        // the module name must start with an upper case letter
        var matches = path && path.match(/^(?:[a-z0-9]+\.)*[A-Z][a-zA-Z0-9]*/);
        if (!matches) {
            return;
        }

        // traverse up the scopes till we find the root
        for (var s = scope; s.prev; s = s.prev) ;

        // add a reference if it doesn't already exist
        var moduleName = matches[0], references = s.module.references;
        if (references.indexOf(moduleName) === -1) {
            references.push(moduleName);
        }

    }
}, walk.scopeVisitor);

module.exports = function(module, cb) {

    if (module.ast) {
        try {
            walk.recursive(module.ast, { vars: {}, module: module }, walker);
        }
        catch (e) {
            return cb(e, module);
        }
    }

    cb(undefined, module);
};

module.exports.walker = walker;