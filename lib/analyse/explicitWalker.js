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
var memberPath = require('./memberPath');

/**
 * Walk the module's AST (if it exists), extracting the member
 * path from CallExpressions and matching them against the
 * supplied handlers. If a match is found the callback is
 * invoked. This means you could for example match explicit
 * module references found in function calls e.g.
 *
 * explicit({
 *  lib: {
 *    require: function(module, args, node) {
 *      module.references.push(args[0]);
 *    }
 *  }, module);
 *
 * The args array contains the value of any literal nodes or
 * undefined for any non-literal arguments. The full argument
 * node list is still available from node.arguments.
 *
 * @param handlers A nested object structure with functions as leaf nodes.
 * @param module The module to analyse.
 * @param cb The callback, invoked with the error and module.
 */
module.exports = function(handlers, module, cb) {

  if (module.ast) {
    try {
      walk.recursive(module.ast, { vars: {}, handlers: handlers, module: module }, walker);
    }
    catch (e) {
      return cb(e, module);
    }
  }

  return cb(undefined, module);
};

var walker = walk.make({
  CallExpression: function(node, scope, c) {

    // If the callee isn't a member expression or isn't parsable
    // as a member path then continue to recurse the AST.

    var path;

    if (node.callee.type === 'MemberExpression') {

      path = memberPath(node.callee, scope, c);

    } else {

      c(node.callee, scope, "Expression");

    }

    if (!path) {

      if (node.arguments) {

        for (var i = 0; i < node.arguments.length; ++i) {

          c(node.arguments[i], scope, "Expression");

        }

      }

      return;

    }

    // split the path up into the identifiers
    var identifiers = path.split('.');

    // traverse up the scopes till we find the root
    for (var s = scope; s.prev; s = s.prev) ;

    // navigate the handler tree
    for (var i = 0, handlers = s.handlers; i < identifiers.length, h = handlers[identifiers[i]]; i++) {

      if (typeof(h) === 'function') {

        var args = node.arguments.map(function(node) {
          return node.type === 'Literal' ? node.value : undefined;
        });

        // handler found
        h(s.module, args, node);
        break;

      } else {

        // jump to nested tree
        handlers = h;

      }

    }

  }
}, walk.scopeVisitor);

