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

            sourceMap.addFile(
                { sourceFile:module.absolutePath, source:module.source },
                { line:lineCount });

            var strippedSource = combineSourceMap.removeComments(module.source) + '\n';
            combinedSource += strippedSource;
            lineCount += strippedSource.match(/\n/g).length;
        });

        return combinedSource + sourceMap.comment();
    }

    return {
        pack:pack
    };
};