var falafel = require('falafel');
var fs = require('fs');
var path = require('path');

module.exports = new Unstructured();

function Unstructured() {

}

Unstructured.prototype.extractMemberPaths = function(src) {
    var memberPaths = [];
    falafel(src, function(node) {
        if (node.type == 'CallExpression' || node.type == 'NewExpression') {
            memberPaths.push(node.callee.source());
        }
    });
    return memberPaths;
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