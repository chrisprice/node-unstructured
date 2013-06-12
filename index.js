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
var EventEmitter = require('events').EventEmitter;
var util = require('util');
var fs = require('fs');
var path = require('path');
var combineSourceMap = require('combine-source-map');
var parse = require('esprima').parse;

module.exports = Unstructured;

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

function Unstructured(sourceFolders, cb) {
    this.modules = {};
    this.pending = [];
    this.sourceFolders = sourceFolders;
    this.cb = cb;
}

Unstructured.parse = function( sourceFolders, entryModuleNames, cb ) {

    if (!util.isArray(sourceFolders)) {
        sourceFolders = [sourceFolders];
    }

    if (!util.isArray(entryModuleNames)) {
        entryModuleNames = [entryModuleNames];
    }

    var unstructured = new Unstructured( sourceFolders, function( error ) {
        cb( error, entryModules, unstructured.resolve( entryModules ) );
    } );

    var entryModules = entryModuleNames.map( function( moduleName ) { return unstructured.lookup( moduleName ) } );
};

Unstructured.prototype.resolve = function( entryModules ) {

    return ( function resolveInternal( modules ) {

        modules = modules.map( function(module) {

            if ( module.resolved ) {
                return [];
            }

            module.resolved = true;

            return resolveInternal( module.dependencies ).concat( module );

        } );

        return Array.prototype.concat.apply([], modules);

    } ( entryModules ));
};

Unstructured.prototype.lookup = function(moduleName) {
    if (this.modules[moduleName]) {
        return this.modules[moduleName];
    }

    var module = this.modules[moduleName] = {
        name: moduleName,
        relativePath: moduleNameToRelativePath(moduleName)
    };

    this.pending.push(module);

    this.findFile( module.relativePath, function( error, absolutePath ) {

        module.absolutePath = absolutePath;

        this.parse( module.name, module.absolutePath, function( error, dependencies ) {
            if ( error ) {
                return this.cb( error );
            }

            module.dependencies = dependencies.map( function( moduleName ) {
                return this.lookup( moduleName );
            }, this );

            this.pending.splice(this.pending.indexOf(module), 1);

            if ( this.pending.length == 0 ) {
                this.cb( null );
            }
        }.bind( this ) );
    }.bind( this ));

    return module;
};

Unstructured.prototype.findFile = function( relativePath, cb ) {
    var sourceFolders = this.sourceFolders.slice();
    (function exists() {
        var sourceFolder = sourceFolders.shift();
        if (!sourceFolder) {
            return cb('Not found');
        }
        var absolutePath = path.join(sourceFolder, relativePath);

        fs.exists(absolutePath, function(result) {
            if (result) {
                cb(null, absolutePath);
            } else {
                exists();
            }
        });
    })();
};


Unstructured.prototype.parse = function( moduleName, absolutePath, cb ) {

    fs.readFile( absolutePath, 'utf8', function( error, source ) {
        if ( error ) {
            return cb( error );
        }

        var dependencies = Unstructured.extractMemberPaths( source )
            // ignore the module's own name
            .filter( function(name) { return moduleName != name; } )

        cb( null, dependencies );
    } );
};

Unstructured.extractMemberPaths = function( source ) {
    var expressions = [];

    var ast = parse( source, { range: true } );

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

Unstructured.prototype.pack = function(sourceList) {
    var sourceMap = combineSourceMap.create();
    return sourceList.reduce(function(combinedSource, item) {
        if (item.memberPath) {
            item.memberPath.split('.').forEach(function (part, i, parts) {
                if (i < parts.length - 1) {
                    var namespace = parts.slice(0, i + 1).join('.');
                    combinedSource += namespace + ' = ' + namespace + ' || {};\n'
                }
            });
        }
        var source = fs.readFileSync(item.filePath, 'utf8');
        sourceMap.addFile(
            { sourceFile: item.filePath, source: source },
            { line: combinedSource.split('\n').length - 1 });
        return combinedSource + combineSourceMap.removeComments(source) + '\n';
    }, '') + sourceMap.comment();
};
