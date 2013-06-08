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
var falafel = require('falafel');
var fs = require('fs');
var path = require('path');

module.exports = new Unstructured();

function unique(strArray) {
    var obj = {};
    strArray.forEach(function(str) {
        obj[str] = true;
    });
    return Object.keys(obj);
}

function extend(target, source) {
    Object.keys(source).forEach(function(key) {
        target[key] = source[key];
    });
    return target;
}

function Unstructured() {

}

Unstructured.prototype.buildSourceList = function(sourceTree, entryPointFilePath) {
    var sourceList = [], self = this;
    (function recurse(module) {
        var source = fs.readFileSync(module.filePath, 'utf8');
        self.extractMemberPaths(source)
            .map(function(dependencyMemberPath) {
                return {
                    filePath: sourceTree[dependencyMemberPath],
                    memberPath: dependencyMemberPath
                };
            })
            .filter(function(dependency) {
                return dependency.filePath;
            })
            .filter(function(dependency) {
                return dependency.filePath != module.filePath;
            })
            .forEach(recurse);
        if (sourceList.indexOf(module.filePath) == -1) {
            sourceList.push(module.filePath);
        }
    } ({
        filePath: entryPointFilePath,
        memberPath: null
    }));
    return sourceList;
};

Unstructured.prototype.extractMemberPaths = function(src) {
    var memberPaths = [];
    falafel(src, function(node) {
        var path;
        var parent = node.parent;
        if (node.type == 'Identifier' &&
            parent.type == 'MemberExpression' &&
            !parent.visited) {
            var path = parent.source();
            parent.visited = true;
        } else {
            return;
        }
        var matches = path.match(/^(?:[a-z]+\.)*[A-Z][A-Za-z]*/);
        if (matches) {
            memberPaths.push(matches[0]);
        }
    });
    return unique(memberPaths);
};

Unstructured.prototype.readSourceTree = function(root) {
    var tree = {};
    (function walk(parts) {
        var dirPath = path.join.apply(path, [root].concat(parts));
        fs.readdirSync(dirPath).map(function(node) {
            var fullPath = path.join(dirPath, node);
            var stats = fs.statSync(fullPath);
            if (stats.isDirectory()) {
                walk(parts.concat(node));
            } else if (path.extname(fullPath) == '.js') {
                tree[parts.concat(path.basename(node, '.js')).join('.')] = fullPath;
            }
        });
    } ([]));
    return tree;
};

Unstructured.prototype.readSourceTrees = function(roots) {
    return roots.reduceRight(function(tree, root) {
        return extend(tree, this.readSourceTree(root));
    }.bind(this), {});
};