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
var fs = require('fs');
var path = require('path');
var combineSourceMap = require('combine-source-map');
var parse = require('acorn').parse;

module.exports = function() {
    return new Unstructured();
};

function unique(strArray) {
    var obj = {};
    strArray.forEach(function(str) {
        obj[str] = true;
    });
    return Object.keys(obj);
}

function extend(target, source) {
    Object.keys(source).forEach(function(key) {
        target[key] = source[key];
    });
    return target;
}

function moduleNameToRelativePath(moduleName) {
    return moduleName.split('.').join(path.sep) + '.js'
}

function Unstructured() {
    this.modules = {};
    this.sourceFolders = [];
    this.entryModuleNames = [];
}

Unstructured.prototype.addFolder = function( sourceFolder ) {

    this.sourceFolders.push( sourceFolder );

};

Unstructured.prototype.addEntryPoint = function( entryModuleName ) {

    this.entryModuleNames.push( entryModuleName );

};

Unstructured.prototype.bundle = function( opts, cb ) {

    var self = this;

    async.map( this.entryModuleNames, self.lookup.bind( this ), function( error, entryModules ) {

        if ( error ) {
            cb( error );
        }

        var resolvedSourceList = self.resolve( entryModules )
            .filter( function( m ) { return m.absolutePath; } );

        cb( error, self.pack( resolvedSourceList ) );

    } );
};

Unstructured.prototype.resolve = function( entryModules ) {

    return ( function resolveInternal( modules ) {

        if (!modules) {
            return [];
        }

        modules = modules.map( function(module) {

            if ( module._resolved ) {
                return [];
            }

            module._resolved = true;

            return resolveInternal( module.dependencies ).concat( module );

        } );

        return Array.prototype.concat.apply([], modules);

    } ( entryModules ));
};

Unstructured.prototype.lookup = function( moduleName, cb ) {

    var module = this.modules[moduleName];

    if (module) {

        if (module._callbacks) {
            module._callbacks.push(cb);
        } else {
            setTimeout(function() {
                cb(null, module);
            }, 0)
        }


        return module;
    }

    module = this.modules[moduleName] = {
        name: moduleName,
        relativePath: moduleNameToRelativePath(moduleName),
        _callbacks: [ cb ]
    };

    var self = this;

    async.waterfall([
        function(cb) {
            self.findFile(module.relativePath, function(absolutePath) {
                cb(!absolutePath, absolutePath);
            });
        },
        function(absolutePath, cb) {
            module.absolutePath = absolutePath;
            self.parse( module, cb);
        }
    ], function(error, dependencies) {
        async.map( error ? [] : dependencies, function( moduleName, cb ) {
            return self.lookup( moduleName, cb );
        }, function( error, dependencies ) {
            module.dependencies = dependencies;

            module._callbacks.forEach( function (cb) {
                cb( error, module);
            } );

            delete module._callbacks;
        } );
    });

    return module;
};

Unstructured.prototype.findFile = function( relativePath, cb ) {
    var possiblePaths = this.sourceFolders.map(function(sourceFolder) {
        return path.join(sourceFolder, relativePath);
    });
    async.detectSeries(possiblePaths, fs.exists, cb);
};

Unstructured.prototype.parse = function( module, cb ) {
    fs.readFile( module.absolutePath, 'utf8', function( error, source ) {
        if ( error ) {
            return cb( error );
        }

        module.source = source;

        var dependencies = this.extractMemberPaths( source )
            // ignore the module's own name
            .filter( function(name) { return module.name != name; } )

        cb( null, dependencies );
    }.bind( this ) );
};

Unstructured.prototype.extractMemberPaths = function( source ) {
    var expressions = [];

    var ast = parse( source, { ranges: true } );

    (function processNode( node ) {

        if ( ! ( node && typeof node.type == 'string' ) )
            return;

        Object.keys( node ).forEach(function( k ) {
            if ( node.type == 'MemberExpression' ) {
                expressions.push( source.slice( node.range[0], node.range[1] ) );
            }
            else if ( util.isArray( node[k] ) ) {
                node[k].forEach( processNode );
            }
            else {
                processNode( node[k] );
            }
        });

    } (ast));

    for ( var i = expressions.length - 1; i >= 0; i-- ) {

        var matches = expressions[i].match( /^(?:[a-z][a-z0-9]*\.)*[A-Z][A-Za-z0-9]*/ );
        if (!matches) {
            expressions.splice( i, 1 );
        } else {
            expressions[i] = matches[0];
        }

    }

    return unique( expressions );
};

Unstructured.prototype.pack = function(moduleList) {
    var sourceMap = combineSourceMap.create();
    var lineCount = 0, combinedSource = "";
    moduleList.forEach(function(module) {
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
            { sourceFile: module.absolutePath, source: module.source },
            { line: lineCount });

        var strippedSource = combineSourceMap.removeComments(module.source) + '\n';
        combinedSource += strippedSource;
        lineCount += strippedSource.match(/\n/g).length;
    });

    return combinedSource + sourceMap.comment();
};
