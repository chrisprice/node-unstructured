var extract = require('../lib/analyse/extract');
var lookup = require('../lib/analyse/lookup');
var analyse = require('../lib/analyse');
var acorn = require('acorn');
var test = require('tape');
var util = require('util');

test('find', function(t) {
    t.plan(12);

    function find(sourceFolders, name, expected) {
        var moduleA = { name: name };
        lookup.find(sourceFolders, moduleA, function(error, moduleB) {
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
    t.plan(57);

    function extract_(source, expected) {
        var moduleA = { source: source, ast: acorn.parse(source, { ranges:true }) };
        extract(moduleA, function(error, moduleB) {
            t.error(error);
            t.equals(moduleA, moduleB);
            t.deepEqual(moduleA.references, util.isArray(expected) ? expected : [expected]);
        });
    }

    extract_('a.Module', 'a.Module');
    extract_('a.b.Module', 'a.b.Module');
    extract_('a.CamelCaseModule', 'a.CamelCaseModule');
    extract_('a1.Module', 'a1.Module');
    extract_('a.Module2', 'a.Module2');

    extract_('var Module = a.Module', 'a.Module');
    extract_('Module = a.Module', 'a.Module');
    extract_('new a.Module', 'a.Module');
    extract_('new a.Module()', 'a.Module');
    extract_('a.Module()', 'a.Module');
    extract_('a.Module.method()', 'a.Module');
    extract_('a.Module.prop = 1', 'a.Module');
    extract_('var prop = a.Module.prop', 'a.Module');

    extract_('this.Module', []);
    extract_('this.a.Module', []);

    extract_('var a; a.Module', []);
    extract_('function f(a) { a.Module; }', []);
    extract_('function f(a) { var b; a.Module; b.Module; }', []);
    extract_('function f(a) { function g(b) { a.Module; b.Module; } }', []);
});

test('analyse', function(t) {
    t.plan(12);

    function _analyse(sourceFolders, name, expectedPath, expectedReferences) {
        var moduleA = { name: name };
        analyse(sourceFolders, moduleA, function(error, moduleB) {
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