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