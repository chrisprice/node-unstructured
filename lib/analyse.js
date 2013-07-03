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

function find(opts, module, cb) {
    var relativePath = module.name.split('.').join(path.sep) + '.js';
    module.relativePath = relativePath;

    var possiblePaths = opts.sourceFolders.map(function (sourceFolder) {
        return path.join(sourceFolder, module.relativePath);
    });
    async.detectSeries(possiblePaths, fs.exists, function (absolutePath) {

        module.absolutePath = absolutePath;

        cb(undefined, opts, module);
    });
}

function read(opts, module, cb) {
    if (!module.absolutePath) {
        return cb(undefined, opts, module);
    }
    fs.readFile(module.absolutePath, 'utf8', function (error, source) {
        if (error) {
            return cb(error);
        }

        module.source = source;
        module.ast = acorn.parse(module.source, { ranges:true });

        cb(undefined, opts, module);
    });
}

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

function extract(opts, module, cb) {
    module.references = [];

    if (module.ast) {
        walk.recursive(module.ast, module, opts.walker ? walk.make(opts.walker, walker) : walker);
    }

    cb(undefined, opts, module);
}

function addOpts(opts, module, cb) {
    cb(undefined, opts ? opts : {}, module);
}

function stripOps(opts, module, cb) {
    cb(undefined, module);
}


module.exports = async.compose(stripOps, extract, read, find, addOpts);
module.exports.find = find;
module.exports.read = read;
module.exports.extract = extract;
module.exports.walker = walker;