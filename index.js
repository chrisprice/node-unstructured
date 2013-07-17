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
var fs = require('fs');

module.exports = function(opts, cb) {
    opts = extend({
        sourceFolders: [],
        entryPoints: [],
        prefixOutput: [],
        suffixOutput: [],
        analyse: async.apply(analyse, opts.sourceFolders),
        debug: false,
        verbose: false,
        prePack: function(resolvedModuleList, cb) {
            async.parallel([
                async.apply(async.map, opts.prefixOutput, createModule),
                async.apply(async.map, opts.suffixOutput, createModule)
            ], function(error, results) {
                if (error) {
                  return cb(error);
                }
                cb(undefined, results[0].concat(resolvedModuleList, results[1]));
            })
        }
    }, opts);

    timer.start('build+analyse');

    build(opts.entryPoints, opts.analyse, function(error, entryModules) {

        if ( error ) {
            return cb( error );
        }

        timer.next('build+analyse', 'resolve');

        var resolvedModuleList = resolve( entryModules, { verbose: opts.verbose } )
            .filter( function( m ) { return m.absolutePath; } );

        timer.next('resolve', 'pack');

        opts.prePack(resolvedModuleList, function(error, moduleList) {

            if (error) {
                return cb(error);
            }

            var packed = pack(moduleList, { debug: opts.debug });

            timer.stop('pack');

            cb(undefined, packed);

        });

    });
};


function createModule(absolutePath, cb) {
  fs.readFile(absolutePath, 'utf8', function(error, data) {
    cb(error, {
      absolutePath: absolutePath,
      source: data
    });
  });
}
module.exports.createModule = createModule;