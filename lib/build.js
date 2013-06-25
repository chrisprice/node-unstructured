var async = require('async');

module.exports = function (opts) {
    var modules = {};

    function build(moduleName, cb) {

        var module = modules[moduleName];

        if (module) {

            if (module._callbacks) {
                module._callbacks.push(cb);
            } else {
                process.nextTick(function () {
                    cb(undefined, module);
                });
            }

            return module;
        }

        module = modules[moduleName] = {
            name:moduleName,
            _callbacks:[ cb ]
        };

        opts.analyse(module, function (error) {

            if (error) {
                return cb(error, module);
            }

            async.map(module.references, build, function (error, dependencies) {

                if (error) {
                    return cb(error, module);
                }

                module.dependencies = dependencies;

                module._callbacks.forEach(function (cb) {
                    cb(undefined, module);
                });

                delete module._callbacks;
            });
        });

        return module;

    }

    return {
        build:build
    };
};