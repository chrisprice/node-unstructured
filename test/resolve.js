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