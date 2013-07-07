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
var extend = require('xtend');

module.exports = function(modules, opts) {
    opts = extend({
        verbose: false
    }, opts);

    var verbose = opts.verbose;

    if (!modules) {
        return [];
    }

    function resolve(modules, prefix) {
        modules = modules.map(function (module) {

            if (module._resolved) {
                return [];
            }

            module._resolved = true;

            if (verbose) {
                console.log(prefix + module.name + (module.absolutePath ? '' : ' (not found)'));
            }

            return resolve(module.dependencies, prefix + '.').concat(module);

        });

        return Array.prototype.concat.apply([], modules);
    }

    return resolve(modules, '');
};