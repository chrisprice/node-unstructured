var unstructured = require('../index');
var fs = require('fs');
var test = require('tape');

test('extractMemberPaths', function (t) {
    t.plan(13);

    var u = unstructured();

    t.deepEqual(u.extractMemberPaths('a.Module'), ['a.Module']);
    t.deepEqual(u.extractMemberPaths('a.b.Module'), ['a.b.Module']);
    t.deepEqual(u.extractMemberPaths('a.CamelCaseModule'), ['a.CamelCaseModule']);
    t.deepEqual(u.extractMemberPaths('a1.Module'), ['a1.Module']);
    t.deepEqual(u.extractMemberPaths('a.Module2'), ['a.Module2']);

    t.deepEqual(u.extractMemberPaths('var Module = a.Module'), ['a.Module']);
    t.deepEqual(u.extractMemberPaths('Module = a.Module'), ['a.Module']);
    t.deepEqual(u.extractMemberPaths('new a.Module'), ['a.Module']);
    t.deepEqual(u.extractMemberPaths('new a.Module()'), ['a.Module']);
    t.deepEqual(u.extractMemberPaths('a.Module()'), ['a.Module']);
    t.deepEqual(u.extractMemberPaths('a.Module.method()'), ['a.Module']);
    t.deepEqual(u.extractMemberPaths('a.Module.prop = 1'), ['a.Module']);
    t.deepEqual(u.extractMemberPaths('var prop = a.Module.prop'), ['a.Module']);
});

test('findFile', function(t) {
    t.plan(4);

    var u = unstructured();

    var exampleFolder = __dirname + '/example',
        example2Folder = __dirname + '/example2';

    u.sourceFolders = [];
    u.findFile( 'index', function( filePath ) {
        t.false( filePath );
    });

    u.sourceFolders = [ exampleFolder ];
    u.findFile( 'index.js', function( filePath ) {
        t.equals( filePath, exampleFolder + '/index.js' );
    });

    u.sourceFolders = [ example2Folder, exampleFolder ];
    u.findFile( 'index.js', function( filePath ) {
        t.equals( filePath, example2Folder + '/index.js' );
    });

    u.sourceFolders = [ example2Folder, exampleFolder ];
    u.findFile( 'a/A.js', function( filePath ) {
        t.equals( filePath, exampleFolder + '/a/A.js' );
    });
});

test('resolve', function(t) {
    t.plan(1);

    var u = unstructured();

    var moduleA = { dependencies: [] },
        moduleB = { dependencies: [ moduleA ] },
        moduleC = { dependencies: [ moduleB ] };

    t.deepEqual( u.resolve( [ moduleC ] ), [ moduleA, moduleB, moduleC ] );

});

test('lookup not found', function(t) {
    t.plan(4);

    var u = unstructured();

    var exampleFolder = __dirname + '/example';

    u.sourceFolders = [ exampleFolder ];
    var module = u.lookup('not-found', function( error, module ) {
        t.error( error );
        t.equals( module.relativePath, 'not-found.js' );
        t.equals( module.absolutePath, undefined );
    } );
    t.equals(module.name, 'not-found');

});

test('lookup no recursion', function(t) {
    t.plan(4);

    var u = unstructured();

    var exampleFolder = __dirname + '/example';

    u.sourceFolders = [ exampleFolder ];
    var module = u.lookup('a.b.C', function( error, module ) {
        t.error( error );
        t.equal( module.relativePath, 'a/b/C.js');
        t.equal( module.absolutePath, exampleFolder + '/a/b/C.js');
    } );
    t.equals(module.name, 'a.b.C');

});

test('lookup the same module twice', function(t) {
    t.plan(9);

    var u = unstructured();

    var exampleFolder = __dirname + '/example';

    u.sourceFolders = [ exampleFolder ];
    var moduleA = u.lookup('a.b.C', function( error, module ) {
        t.error( error );
        t.equal( module.relativePath, 'a/b/C.js');
        t.equal( module.absolutePath, exampleFolder + '/a/b/C.js');
    } );
    var moduleB = u.lookup('a.b.C', function( error, module ) {
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

    var u = unstructured();

    var exampleFolder = __dirname + '/example';

    u.sourceFolders = [ exampleFolder ];
    var module = u.lookup('a.B', function( error, module ) {
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

    var u = unstructured();

    var exampleFolder = __dirname + '/example';

    u.sourceFolders = [ exampleFolder ];
    var module = u.lookup('a.A', function( error, module ) {
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

test('parse', function(t) {
    t.plan(1);

    t.equals(1, 1);
});