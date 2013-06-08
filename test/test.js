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
    t.deepEqual(Object.keys(sourceTree).sort(), [
        "a.A",
        "a.B",
        "a.b.C",
        "index"
    ]);
});

test('buildSourceList', function (t) {
    t.plan(1);

    var sourceTree = unstructured.readSourceTree(__dirname + '/example');
    var sourceList = unstructured.buildSourceList(sourceTree, __dirname + '/example/index.js');
    t.deepEqual(sourceList, [
        __dirname + '/example/a/b/C.js',
        __dirname + '/example/a/B.js',
        __dirname + '/example/a/A.js',
        __dirname + '/example/index.js'
    ]);
});
