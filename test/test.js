var Unstructured = require('../index');
var fs = require('fs');
var test = require('tape');

test('extractMemberPaths', function (t) {
    t.plan(13);

    t.deepEqual(Unstructured.extractMemberPaths('a.Module'), ['a.Module']);
    t.deepEqual(Unstructured.extractMemberPaths('a.b.Module'), ['a.b.Module']);
    t.deepEqual(Unstructured.extractMemberPaths('a.CamelCaseModule'), ['a.CamelCaseModule']);
    t.deepEqual(Unstructured.extractMemberPaths('a1.Module'), ['a1.Module']);
    t.deepEqual(Unstructured.extractMemberPaths('a.Module2'), ['a.Module2']);

    t.deepEqual(Unstructured.extractMemberPaths('var Module = a.Module'), ['a.Module']);
    t.deepEqual(Unstructured.extractMemberPaths('Module = a.Module'), ['a.Module']);
    t.deepEqual(Unstructured.extractMemberPaths('new a.Module'), ['a.Module']);
    t.deepEqual(Unstructured.extractMemberPaths('new a.Module()'), ['a.Module']);
    t.deepEqual(Unstructured.extractMemberPaths('a.Module()'), ['a.Module']);
    t.deepEqual(Unstructured.extractMemberPaths('a.Module.method()'), ['a.Module']);
    t.deepEqual(Unstructured.extractMemberPaths('a.Module.prop = 1'), ['a.Module']);
    t.deepEqual(Unstructured.extractMemberPaths('var prop = a.Module.prop'), ['a.Module']);
});

//test('readSourceTree', function (t) {
//    t.plan(1);
//
//    var sourceTree = unstructured.readSourceTree(__dirname + '/example');
//    t.deepEqual(sourceTree, {
//        "a.A": __dirname + '/example/a/A.js',
//        "a.B": __dirname + '/example/a/B.js',
//        "a.b.C": __dirname + '/example/a/b/C.js',
//        "index": __dirname + '/example/index.js'
//    });
//});
//
//test('readSourceTrees', function (t) {
//    t.plan(1);
//
//    var sourceTree = unstructured.readSourceTrees([__dirname + '/example2', __dirname + '/example']);
//    t.deepEqual(sourceTree, {
//        "a.A": __dirname + '/example/a/A.js',
//        "a.B": __dirname + '/example2/a/B.js',
//        "a.C": __dirname + '/example2/a/C.js',
//        "a.b.C": __dirname + '/example/a/b/C.js',
//        "index": __dirname + '/example2/index.js'
//    });
//});
//
//test('buildSourceList from readSourceTree', function (t) {
//    t.plan(1);
//
//    var sourceTree = unstructured.readSourceTree(__dirname + '/example');
//    var sourceList = unstructured.buildSourceList(sourceTree, __dirname + '/example/index.js');
//    t.deepEqual(sourceList, [
//        { filePath: __dirname + '/example/a/b/C.js', memberPath: 'a.b.C' },
//        { filePath: __dirname + '/example/a/B.js', memberPath: 'a.B' },
//        { filePath: __dirname + '/example/a/A.js', memberPath: 'a.A' },
//        { filePath: __dirname + '/example/index.js', memberPath: null }
//    ]);
//});
//
//test('buildSourceList from readSourceTrees', function (t) {
//    t.plan(1);
//
//    var sourceTree = unstructured.readSourceTrees([__dirname + '/example2', __dirname + '/example']);
//    var sourceList = unstructured.buildSourceList(sourceTree, __dirname + '/example/index.js');
//    t.deepEqual(sourceList, [
//        { filePath: __dirname + '/example/a/b/C.js', memberPath: 'a.b.C' },
//        { filePath: __dirname + '/example2/a/C.js', memberPath: 'a.C' },
//        { filePath: __dirname + '/example2/a/B.js', memberPath: 'a.B' },
//        { filePath: __dirname + '/example/a/A.js', memberPath: 'a.A' },
//        { filePath: __dirname + '/example/index.js', memberPath: null }
//    ]);
//});
//
//test('buildSourceList with multiple entryPoints from readSourceTrees', function (t) {
//    t.plan(1);
//
//    var sourceTree = unstructured.readSourceTrees([__dirname + '/example2', __dirname + '/example']);
//    var sourceList = unstructured.buildSourceList(sourceTree, [__dirname + '/example/index.js',
//        __dirname + '/example2/index.js']);
//    t.deepEqual(sourceList, [
//        { filePath: __dirname + '/example/a/b/C.js', memberPath: 'a.b.C' },
//        { filePath: __dirname + '/example2/a/C.js', memberPath: 'a.C' },
//        { filePath: __dirname + '/example2/a/B.js', memberPath: 'a.B' },
//        { filePath: __dirname + '/example/a/A.js', memberPath: 'a.A' },
//        { filePath: __dirname + '/example/index.js', memberPath: null },
//        { filePath: __dirname + '/example2/index.js', memberPath: null }
//    ]);
//});
//
//test('pack from buildSourceList from readSourceTrees', function (t) {
//    t.plan(1);
//
//    var sourceTree = unstructured.readSourceTrees([__dirname + '/example2', __dirname + '/example']);
//    var sourceList = unstructured.buildSourceList(sourceTree, __dirname + '/example/index.js');
//    var packed = unstructured.pack(sourceList);
////    fs.writeFileSync(__dirname + '/example.packed.js', packed, 'utf8');
//    t.equal(packed, fs.readFileSync(__dirname + '/example.packed.js', 'utf8'));
//});

test('findFile', function(t) {
    t.plan(7);

    var unstructured = new Unstructured();

    var exampleFolder = __dirname + '/example',
        example2Folder = __dirname + '/example2';

    unstructured.sourceFolders = [];
    unstructured.findFile( 'index', function( error, filePath ) {
        t.notEqual( error, null );
    });

    unstructured.sourceFolders = [ exampleFolder ];
    unstructured.findFile( 'index.js', function( error, filePath ) {
        t.equals( error, null );
        t.equals( filePath, exampleFolder + '/index.js' );
    });

    unstructured.sourceFolders = [ example2Folder, exampleFolder ];
    unstructured.findFile( 'index.js', function( error, filePath ) {
        t.equals( error, null );
        t.equals( filePath, example2Folder + '/index.js' );
    });

    unstructured.sourceFolders = [ example2Folder, exampleFolder ];
    unstructured.findFile( 'a/A.js', function( error, filePath ) {
        t.equals( error, null );
        t.equals( filePath, exampleFolder + '/a/A.js' );
    });
});

test('resolve', function(t) {
    t.plan(1);

    var unstructured = new Unstructured();

    var moduleA = { dependencies: [] },
        moduleB = { dependencies: [ moduleA ] },
        moduleC = { dependencies: [ moduleB ] };

    t.deepEqual( new Unstructured().resolve( [ moduleC ] ), [ moduleA, moduleB, moduleC ] );

});

test('lookup', function(t) {
    t.plan(1);

    t.equals(1, 1);
});

test('parse', function(t) {
    t.plan(1);

    t.equals(1, 1);
});