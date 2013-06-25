var async = require('async');
var fs = require('fs');
var acorn = require('acorn');
var path = require('path');
var util = require('util');

module.exports = function (opts) {

    function unique(strArray) {
        var obj = {};
        strArray.forEach(function (str) {
            obj[str] = true;
        });
        return Object.keys(obj);
    }

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
        var expressions = [];

        (function processNode(node) {

            if (!( node && typeof node.type == 'string' ))
                return;

            Object.keys(node).forEach(function (k) {
                if (node.type == 'MemberExpression') {
                    expressions.push(module.source.slice(node.range[0], node.range[1]));
                }
                else if (util.isArray(node[k])) {
                    node[k].forEach(processNode);
                }
                else {
                    processNode(node[k]);
                }
            });

        }(module.ast));

        for (var i = expressions.length - 1; i >= 0; i--) {

            var matches = expressions[i].match(/^(?:[a-z][a-z0-9]*\.)*[A-Z][A-Za-z0-9]*/);
            if (!matches || matches[0] == module.name) {
                expressions.splice(i, 1);
            } else {
                expressions[i] = matches[0];
            }

        }

        module.references = unique(expressions);

        cb(undefined, module);
    }

    return {
        find: find,
        read: read,
        extract: extract,
        analyse: async.compose(extract, read, find)
    };
};