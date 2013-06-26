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
var async = require('async');
var fs = require('fs');
var acorn = require('acorn');
var walk = require('acorn/util/walk');
var path = require('path');

module.exports = function (opts) {

    function find(module, cb) {
        var relativePath = module.name.split('.').join(path.sep) + '.js';
        module.relativePath = relativePath;

        var possiblePaths = opts.sourceFolders.map(function (sourceFolder) {
            return path.join(sourceFolder, module.relativePath);
        });
        async.detectSeries(possiblePaths, fs.exists, function (absolutePath) {

            module.absolutePath = absolutePath;

            cb(undefined, module);
        });
    }

    function read(module, cb) {
        if (!module.absolutePath) {
            return cb(undefined, module);
        }
        fs.readFile(module.absolutePath, 'utf8', function (error, source) {
            if (error) {
                return cb(error);
            }

            module.source = source;
            module.ast = acorn.parse(module.source, { ranges:true });

            cb(error, module);
        });
    }

    function extract(module, cb) {
        module.references = [];

        if (module.ast) {
            walk.recursive(module.ast, module.references, {
                MemberExpression: function(node, refs) {
                    var expr = module.source.slice(node.range[0], node.range[1]);
                    var matches = expr.match(/^(?:[a-z][a-z0-9]*\.)*[A-Z][A-Za-z0-9]*/);
                    if (matches) {
                        var moduleName = matches[0];
                        if (moduleName != module.name && refs.indexOf(moduleName) == -1) {
                            refs.push(moduleName);
                        }
                    }
                }
            });
        }

        cb(undefined, module);
    }

    return {
        find: find,
        read: read,
        extract: extract,
        analyse: async.compose(extract, read, find)
    };
};