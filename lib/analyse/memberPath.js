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

/**
 * Extract a member path from a MemberExpression node as part of an AST walk.
 *
 * A member path is defined as a sequence of Identifiers not rooted in a scoped variable.
 *
 * E.g. a.b.c; but not function (a) { a.b.c; }.
 *
 * @param node The MemberExpression node.
 * @param scope The current scope object (from an acorn scoped walker).
 * @param c The continuation to call if non-Identifier nodes are found (from an acorn walker).
 * @return {String} The member path if successful or undefined if not.
 */
module.exports = function(node, scope, c) {

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

};