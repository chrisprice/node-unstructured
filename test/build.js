var test = require('tape');
var analyse = require('../lib/analyse');
var build = require('../lib/build');

test('build not found', function(t) {
    t.plan(4);

    var exampleFolder = __dirname + '/example';
    var opts = { sourceFolders: [ exampleFolder ] };
    var b = build(analyse(opts));

    var module = b.build('not-found', function( error, module ) {
        t.error( error );
        t.equals( module.relativePath, 'not-found.js' );
        t.equals( module.absolutePath, undefined );
    } );
    t.equals(module.name, 'not-found');

});

test('lookup no recursion', function(t) {
    t.plan(4);

    var exampleFolder = __dirname + '/example';
    var opts = { sourceFolders: [ exampleFolder ] };
    var b = build(analyse(opts));

    var module = b.build('a.b.C', function( error, module ) {
        t.error( error );
        t.equal( module.relativePath, 'a/b/C.js');
        t.equal( module.absolutePath, exampleFolder + '/a/b/C.js');
    } );
    t.equals(module.name, 'a.b.C');

});

test('lookup the same module twice', function(t) {
    t.plan(9);

    var exampleFolder = __dirname + '/example';
    var opts = { sourceFolders: [ exampleFolder ] };
    var b = build(analyse(opts));

    var moduleA = b.build('a.b.C', function( error, module ) {
        t.error( error );
        t.equal( module.relativePath, 'a/b/C.js');
        t.equal( module.absolutePath, exampleFolder + '/a/b/C.js');
    } );
    var moduleB = b.build('a.b.C', function( error, module ) {
        t.error( error );
        t.equal( module.relativePath, 'a/b/C.js');
        t.equal( module.absolutePath, exampleFolder + '/a/b/C.js');
    } );
    t.equals(moduleA.name, 'a.b.C');
    t.equals(moduleB.name, 'a.b.C');
    t.equals(moduleA, moduleB);

});

test('lookup one level of recursion', function(t) {
    t.plan(7);

    var exampleFolder = __dirname + '/example';
    var opts = { sourceFolders: [ exampleFolder ] };
    var b = build(analyse(opts));

    var module = b.build('a.B', function( error, module ) {
        t.error( error );
        t.equal( module.relativePath, 'a/B.js');
        t.equal( module.absolutePath, exampleFolder + '/a/B.js');

        t.equal( module.dependencies[0].name, 'a.b.C');
        t.equal( module.dependencies[0].relativePath, 'a/b/C.js');
        t.equal( module.dependencies[0].absolutePath, exampleFolder + '/a/b/C.js');
    } );
    t.equals(module.name, 'a.B');

});

test('lookup two levels of recursion', function(t) {
    t.plan(10);

    var exampleFolder = __dirname + '/example';
    var opts = { sourceFolders: [ exampleFolder ] };
    var b = build(analyse(opts));

    var module = b.build('a.A', function( error, module ) {
        t.error( error );
        t.equal( module.relativePath, 'a/A.js');
        t.equal( module.absolutePath, exampleFolder + '/a/A.js');

        t.equal( module.dependencies[0].name, 'a.B');
        t.equal( module.dependencies[0].relativePath, 'a/B.js');
        t.equal( module.dependencies[0].absolutePath, exampleFolder + '/a/B.js');

        t.equal( module.dependencies[0].dependencies[0].name, 'a.b.C');
        t.equal( module.dependencies[0].dependencies[0].relativePath, 'a/b/C.js');
        t.equal( module.dependencies[0].dependencies[0].absolutePath, exampleFolder + '/a/b/C.js');
    } );
    t.equals(module.name, 'a.A');

});