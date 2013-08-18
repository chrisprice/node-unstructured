var explicitWalker = require('../lib/analyse/explicitWalker');
var acorn = require('acorn');
var test = require('tape');
var util = require('util');

test('explicitWalker', function (t) {
    t.plan(4 * 3);

    function extract_(source, expected) {
        var moduleA = { source: source, ast: acorn.parse(source, { ranges:true }), references: [] };
        explicitWalker({
            lib: {
                require: function(module, args) {
                  module.references.push(args[0].value)
                }
            }
        }, moduleA, function(error, moduleB) {
            t.error(error);
            t.equals(moduleA, moduleB);
            t.deepEqual(moduleA.references, util.isArray(expected) ? expected : [expected]);
        });
    }

    extract_('lib.require("a.Module")', 'a.Module');

    extract_('lib.require.inner("a.Module")', 'a.Module');

    extract_('lib.other("a.Module")', []);
    extract_('lib.other = function(a) {}', []);
});