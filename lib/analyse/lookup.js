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
var path = require('path');

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

function find(sourceFolders, module, cb) {
    var relativePath = module.name.split('.').join(path.sep) + '.js';
    module.relativePath = relativePath;

    var possiblePaths = sourceFolders.map(function (sourceFolder) {
        return path.join(sourceFolder, module.relativePath);
    });
    async.detectSeries(possiblePaths, fs.exists, function (absolutePath) {

        module.absolutePath = absolutePath;

        cb(undefined, module);
    });
};

module.exports = async.compose(read, find);
module.exports.read = read;
module.exports.find = find;