var implicitWalker = require('../lib/analyse/implicitWalker');
var acorn = require('acorn');
var test = require('tape');
var util = require('util');

test('implicitWalker', function (t) {
    t.plan(21 * 3);

    function extract_(source, expected) {
        var moduleA = { source: source, ast: acorn.parse(source, { ranges:true }), references: [] };
        implicitWalker(moduleA, function(error, moduleB) {
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

    extract_('var map; map[a.Module.getGuid()]', ['a.Module']);
    extract_('this[a.Module.getGuid()]', ['a.Module']);

    extract_('this.Module', []);
    extract_('this.a.Module', []);

    extract_('var a; a.Module', []);
    extract_('function f(a) { a.Module; }', []);
    extract_('function f(a) { var b; a.Module; b.Module; }', []);
    extract_('function f(a) { function g(b) { a.Module; b.Module; } }', []);
});