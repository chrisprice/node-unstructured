var unstructured = require('../index');
var fs = require('fs');
var test = require('tape');

test('extractMemberPaths', function (t) {
    t.plan(11);

    t.deepEqual(unstructured.extractMemberPaths('a.Module'), ['a.Module']);
    t.deepEqual(unstructured.extractMemberPaths('a.b.Module'), ['a.b.Module']);
    t.deepEqual(unstructured.extractMemberPaths('a.CamelCaseModule'), ['a.CamelCaseModule']);

    t.deepEqual(unstructured.extractMemberPaths('var Module = a.Module'), ['a.Module']);
    t.deepEqual(unstructured.extractMemberPaths('Module = a.Module'), ['a.Module']);
    t.deepEqual(unstructured.extractMemberPaths('new a.Module'), ['a.Module']);
    t.deepEqual(unstructured.extractMemberPaths('new a.Module()'), ['a.Module']);
    t.deepEqual(unstructured.extractMemberPaths('a.Module()'), ['a.Module']);
    t.deepEqual(unstructured.extractMemberPaths('a.Module.method()'), ['a.Module']);
    t.deepEqual(unstructured.extractMemberPaths('a.Module.prop = 1'), ['a.Module']);
    t.deepEqual(unstructured.extractMemberPaths('var prop = a.Module.prop'), ['a.Module']);
});

test('readSourceTree', function (t) {
    t.plan(1);

    var sourceTree = unstructured.readSourceTree(__dirname + '/example');
    t.deepEqual(sourceTree, {
        "a.A": __dirname + '/example/a/A.js',
        "a.B": __dirname + '/example/a/B.js',
        "a.b.C": __dirname + '/example/a/b/C.js',
        "index": __dirname + '/example/index.js'
    });
});

test('readSourceTrees', function (t) {
    t.plan(1);

    var sourceTree = unstructured.readSourceTrees([__dirname + '/example2', __dirname + '/example']);
    t.deepEqual(sourceTree, {
        "a.A": __dirname + '/example/a/A.js',
        "a.B": __dirname + '/example2/a/B.js',
        "a.C": __dirname + '/example2/a/C.js',
        "a.b.C": __dirname + '/example/a/b/C.js',
        "index": __dirname + '/example2/index.js'
    });
});

test('buildSourceList from readSourceTree', function (t) {
    t.plan(1);

    var sourceTree = unstructured.readSourceTree(__dirname + '/example');
    var sourceList = unstructured.buildSourceList(sourceTree, __dirname + '/example/index.js');
    t.deepEqual(sourceList, [
        { filePath: __dirname + '/example/a/b/C.js', memberPath: 'a.b.C' },
        { filePath: __dirname + '/example/a/B.js', memberPath: 'a.B' },
        { filePath: __dirname + '/example/a/A.js', memberPath: 'a.A' },
        { filePath: __dirname + '/example/index.js', memberPath: null }
    ]);
});

test('buildSourceList from readSourceTrees', function (t) {
    t.plan(1);

    var sourceTree = unstructured.readSourceTrees([__dirname + '/example2', __dirname + '/example']);
    var sourceList = unstructured.buildSourceList(sourceTree, __dirname + '/example/index.js');
    t.deepEqual(sourceList, [
        { filePath: __dirname + '/example/a/b/C.js', memberPath: 'a.b.C' },
        { filePath: __dirname + '/example2/a/C.js', memberPath: 'a.C' },
        { filePath: __dirname + '/example2/a/B.js', memberPath: 'a.B' },
        { filePath: __dirname + '/example/a/A.js', memberPath: 'a.A' },
        { filePath: __dirname + '/example/index.js', memberPath: null }
    ]);
});

test('buildSourceList with multiple entryPoints from readSourceTrees', function (t) {
    t.plan(1);

    var sourceTree = unstructured.readSourceTrees([__dirname + '/example2', __dirname + '/example']);
    var sourceList = unstructured.buildSourceList(sourceTree, [__dirname + '/example/index.js',
        __dirname + '/example2/index.js']);
    t.deepEqual(sourceList, [
        { filePath: __dirname + '/example/a/b/C.js', memberPath: 'a.b.C' },
        { filePath: __dirname + '/example2/a/C.js', memberPath: 'a.C' },
        { filePath: __dirname + '/example2/a/B.js', memberPath: 'a.B' },
        { filePath: __dirname + '/example/a/A.js', memberPath: 'a.A' },
        { filePath: __dirname + '/example/index.js', memberPath: null },
        { filePath: __dirname + '/example2/index.js', memberPath: null }
    ]);
});

test('pack from buildSourceList from readSourceTrees', function (t) {
    t.plan(1);

    var sourceTree = unstructured.readSourceTrees([__dirname + '/example2', __dirname + '/example']);
    var sourceList = unstructured.buildSourceList(sourceTree, __dirname + '/example/index.js');
    var packed = unstructured.pack(sourceList);
//    fs.writeFileSync(__dirname + '/example.packed.js', packed, 'utf8');
    t.equal(packed, fs.readFileSync(__dirname + '/example.packed.js', 'utf8'));
});
