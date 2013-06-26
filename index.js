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

module.exports = function(opts) {
    opts = opts || {};
    opts.sourceFolders = opts.sourceFolders || [];

    var entryModuleNames = [];

    function addSourceFolder( sourceFolder ) {
        opts.sourceFolders.push( sourceFolder );
    }

    function addEntryPoint( entryModuleName ) {
        entryModuleNames.push( entryModuleName );
    }

    function bundle(cb) {
        var b = build(analyse(opts));
        async.map(entryModuleNames, b.build, function(error, entryModules) {
            if ( error ) {
                return cb( error );
            }

            var r = resolve(opts);
            var resolvedModuleList = r.resolve( entryModules )
                .filter( function( m ) { return m.absolutePath; } );

            var p = pack(opts);
            var packed = p.pack(resolvedModuleList);

            cb(undefined, packed);
        });
    }

    return {
        addSourceFolder: addSourceFolder,
        addEntryPoint: addEntryPoint,
        bundle: bundle
    }
};