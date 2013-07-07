var test = require('tape');
var resolve = require('../lib/resolve');

test('resolve', function(t) {
    t.plan(1);

    var r = resolve();

    var moduleA = { dependencies: [] },
        moduleB = { dependencies: [ moduleA ] },
        moduleC = { dependencies: [ moduleB ] };

    t.deepEqual( r.resolve( [ moduleC ] ), [ moduleA, moduleB, moduleC ] );

});

test('resolve a self referencing dependency', function(t) {
    t.plan(1);

    var r = resolve();

    var moduleA = { dependencies: [ ] };
    moduleA.dependencies.push(moduleA);

    t.deepEqual( r.resolve( [ moduleA ] ), [ moduleA ] );

});

test('resolve a circular dependency', function(t) {
    t.plan(1);

    var r = resolve();

    var moduleA = { dependencies: [ ] },
        moduleB = { dependencies: [ moduleA ] };
    moduleA.dependencies.push(moduleB);

    t.deepEqual( r.resolve( [ moduleB ] ), [ moduleA, moduleB ] );

});

test('resolve a sparse circular dependency', function(t) {
    t.plan(1);

    var r = resolve();

    var moduleA = { dependencies: [] },
        moduleB = { dependencies: [ moduleA ] },
        moduleC = { dependencies: [ moduleB ] };
    moduleA.dependencies.push(moduleC);

    t.deepEqual( r.resolve( [ moduleC ] ), [ moduleA, moduleB, moduleC ] );

});