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
var util = require('util');

module.exports = function build(moduleNames, opts, cb) {
    if (!util.isArray(moduleNames)) {
        moduleNames = [ moduleNames ];
    }

    var modules = {};

    function lookup(moduleName, cb) {
        var module = modules[moduleName];

        if (module) {

            process.nextTick(function () {
                cb(undefined, module);
            });

            return module;
        }

        module = modules[moduleName] = {
            name:moduleName,
            _callback:cb
        };

        opts.analyse(module, function (error) {

            if (error) {
                return cb(error, module);
            }

            async.map(module.references, lookup, function (error, dependencies) {

                if (error) {
                    return cb(error, module);
                }

                module.dependencies = dependencies;

                var cb = module._callback;
                delete module._callback;
                cb(undefined, module);
            });
        });

        return module;
    }

    async.map(moduleNames, lookup, cb);
};