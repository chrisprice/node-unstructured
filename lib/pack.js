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
var combineSourceMap = require('combine-source-map');

module.exports = function (opts) {

    function pack(modules) {
        var sourceMap = combineSourceMap.create();
        var lineCount = 0, combinedSource = "";
        modules.forEach(function (module) {
            if (module.name) {
                module.name.split('.').forEach(function (part, i, parts) {
                    if (i < parts.length - 1) {
                        var namespace = parts.slice(0, i + 1).join('.');
                        combinedSource += namespace + ' = ' + namespace + ' || {};\n'
                        lineCount++;
                    }
                });
            }

            if (opts.debug) {
                sourceMap.addFile(
                    { sourceFile:module.absolutePath, source:module.source },
                    { line:lineCount });
            }

            var strippedSource = combineSourceMap.removeComments(module.source) + '\n';
            combinedSource += strippedSource;
            lineCount += strippedSource.match(/\n/g).length;
        });

        if (opts.debug) {
            combinedSource += sourceMap.comment();
        }

        return combinedSource;
    }

    return {
        pack:pack
    };
};