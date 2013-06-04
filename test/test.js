var unstructured = require('../index');
var fs = require('fs');
var test = require('tape');

test('extractMemberPaths', function (t) {
    t.plan(1);

    var src = fs.readFileSync(__dirname + '/example/Entry.js', 'utf8');
    var memberPaths = unstructured.extractMemberPaths(src);
    t.deepEqual(memberPaths, [ 'a.Module',
        'a.b.Module',
        'ab.test',
        'a.b.c.Module',
        'a.b.d.Module',
        'Abd.test',
        'a.b.e.Module',
        'a.b.f.Module' ]);
});

test('readTree', function (t) {
    t.plan(1);

    var modules = unstructured.readTree(__dirname + '/example');
    t.deepEqual(Object.keys(modules), [ "a.b.c.Module",
        "a.b.d.Module",
        "a.b.e.Module",
        "a.b.f.Module",
        "a.b.Module",
        "a.Module",
        "Entry" ]);
});
