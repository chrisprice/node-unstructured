var analyse = require('../lib/analyse');
var acorn = require('acorn');
var test = require('tape');

test('find', function(t) {
    t.plan(12);

    function find(sourceFolders, name, expected) {
        var a = analyse({ sourceFolders: sourceFolders });
        var moduleA = { name: name };
        a.find(moduleA, function(error, moduleB) {
            t.error(error);
            t.equals(moduleA, moduleB);
            t.equals(moduleA.absolutePath, expected);
        });
    }

    var exampleFolder = __dirname + '/example',
        example2Folder = __dirname + '/example2';

    find([], 'index');
    find([ exampleFolder ], 'index', exampleFolder + '/index.js' );
    find([ example2Folder, exampleFolder ], 'index', example2Folder + '/index.js' );
    find([ example2Folder, exampleFolder ], 'a.A', exampleFolder + '/a/A.js' );
});

test('extract', function (t) {
    t.plan(39);

    function extract(source, expected) {
        var a = analyse();
        var moduleA = { source: source, ast: acorn.parse(source, { ranges:true }) };
        a.extract(moduleA, function(error, moduleB) {
            t.error(error);
            t.equals(moduleA, moduleB);
            t.deepEqual(moduleA.references, [expected]);
        });
    }

    extract('a.Module', 'a.Module');
    extract('a.b.Module', 'a.b.Module');
    extract('a.CamelCaseModule', 'a.CamelCaseModule');
    extract('a1.Module', 'a1.Module');
    extract('a.Module2', 'a.Module2');

    extract('var Module = a.Module', 'a.Module');
    extract('Module = a.Module', 'a.Module');
    extract('new a.Module', 'a.Module');
    extract('new a.Module()', 'a.Module');
    extract('a.Module()', 'a.Module');
    extract('a.Module.method()', 'a.Module');
    extract('a.Module.prop = 1', 'a.Module');
    extract('var prop = a.Module.prop', 'a.Module');
});

test('analyse', function(t) {
    t.plan(12);

    function _analyse(sourceFolders, name, expectedPath, expectedReferences) {
        var opts = { sourceFolders: sourceFolders };
        var a = analyse(opts);
        var moduleA = { name: name };
        a.analyse(moduleA, function(error, moduleB) {
            t.error(error);
            t.equals(moduleA, moduleB);
            t.equals(moduleA.absolutePath, expectedPath);
            t.deepEquals(moduleA.references, expectedReferences);
        });
    }

    var exampleFolder = __dirname + '/example';

    _analyse([exampleFolder], 'not-found', undefined, []);
    _analyse([exampleFolder], 'a.b.C', exampleFolder + '/a/b/C.js', []);
    _analyse([exampleFolder], 'a.B', exampleFolder + '/a/B.js', ['a.b.C']);

})