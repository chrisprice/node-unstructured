var unstructured = require('../index');
var fs = require('fs');
var test = require('tape');

test('extractMemberPaths', function (t) {
    t.plan(7);

    t.deepEqual(unstructured.extractMemberPaths('var Module = a.Module'), ['a.Module']);
    t.deepEqual(unstructured.extractMemberPaths('Module = a.Module'), ['a.Module']);
//    t.deepEqual(unstructured.extractMemberPaths('new a.Module'), ['a.Module']);
//    t.deepEqual(unstructured.extractMemberPaths('new a.Module()'), ['a.Module']);
//    t.deepEqual(unstructured.extractMemberPaths('a.Module()'), ['a.Module']);
//    t.deepEqual(unstructured.extractMemberPaths('a.Module.method()'), ['a.Module']);
//    t.deepEqual(unstructured.extractMemberPaths('a.Module.prop = 1'), ['a.Module']);
//    t.deepEqual(unstructured.extractMemberPaths('var prop = a.Module.prop'), ['a.Module']);
});

test('readTree', function (t) {
    t.plan(1);

    var modules = unstructured.readTree(__dirname + '/example');
    t.deepEqual(Object.keys(modules).sort(), [
        "Entry",
        "a.Module",
        "a.Static",
        "a.b.Module",
        "a.b.c.Module",
        "a.b.d.Module",
        "a.b.e.Module",
        "a.b.f.Module"
    ]);
});
