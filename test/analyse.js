var analyse = require('../lib/analyse');
var acorn = require('acorn');
var test = require('tape');

test('find', function(t) {
    t.plan(8);

    function find(sourceFolders, name, expected) {
        var a = analyse({ sourceFolders: sourceFolders });
        var module = { name: name };
        a.find(module, function(error) {
            t.error(error);
            t.equals(module.absolutePath, expected);
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
    t.plan(26);

    function extract(source, expected) {
        var a = analyse();
        var module = { source: source, ast: acorn.parse(source, { ranges:true }) };
        a.extract(module, function(error) {
            t.error(error);
            t.deepEqual(module.references, [expected]);
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