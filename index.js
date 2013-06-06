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

function Unstructured() {

}

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
        var matches = path.match(/^(?:[a-z]+\.)*[A-Z][a-z]*/);
        if (matches) {
            memberPaths.push(matches[0]);
        }
    });
    return unique(memberPaths);
};

Unstructured.prototype.readTree = function(root) {
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