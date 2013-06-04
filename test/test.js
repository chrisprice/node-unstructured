var unstructured = require('../index');
var fs = require('fs');
var test = require('tape');

test('extractMemberPaths', function (t) {
    t.plan(1);

    var src = fs.readFileSync(__dirname + '/example/Entry.js', 'utf8');
    var memberPaths = unstructured.extractMemberPaths(src);
    t.deepEqual(memberPaths.sort(), [
        'Abd',
        'a.Module',
        'a.Static',
        'a.b.Module',
        'a.b.c.Module',
        'a.b.d.Module',
        'a.b.e.Module',
        'a.b.f.Module'
    ]);
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
