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
var analyse = require('./lib/analyse');
var build = require('./lib/build');
var pack = require('./lib/pack');
var resolve = require('./lib/resolve');
var timer = require('./lib/timer');
var extend = require('xtend');

module.exports = function(opts, cb) {
    opts = extend({
        sourceFolders: [],
        entryPoints: [],
        analyse: async.apply(analyse, opts.sourceFolders),
        debug: false
    }, opts);

    timer.start('build+analyse');

    build(opts.entryPoints, opts, function(error, entryModules) {

        if ( error ) {
            return cb( error );
        }

        timer.stop('build+analyse');

        timer.start('resolve');

        var resolvedModuleList = resolve( entryModules )
            .filter( function( m ) { return m.absolutePath; } );

        timer.stop('resolve');

        timer.start('pack');

        var packed = pack(resolvedModuleList, opts);

        timer.stop('pack');

        cb(undefined, packed);
    });
};