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

        // TODO: make a module an event emitter (remove callbacks)
        module = modules[moduleName] = {
            name:moduleName,
            _callbacks:[ cb ]
        };

        opts.analyse(module, function (error) {

            if (error) {
                return cb(error, module);
            }

            // some pre-flight checks for circular dependencies
            module.references.forEach(function(name, refIndex) {
                var dependency = modules[name];
                if (!dependency) {
                    return;
                }

                function moduleIsReferencedBy(reference, path) {
                    var dependency = modules[reference];
                    if (dependency) {
                        if (dependency == module) {
                            return true;
                        }
                        return dependency.references.some(moduleIsReferencedBy);
                    }
                }

                if (dependency.references.some(moduleIsReferencedBy)) {

                    if (!opts.allowCircularReferences) {

                        cb('circular reference', module, dependency);

                    } else {
                        // remove module's dependency on the other module (first come, first served)
                        module.references.splice(refIndex, 1);

                        console.warn('Circular reference between ' + module.name + ' and ' + dependency.name);
                    }
                }
            });

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