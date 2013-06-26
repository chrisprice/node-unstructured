var test = require('tape');
var analyse = require('../lib/analyse');
var build = require('../lib/build');

function _build(referenceMap) {
    return build({
        analyse: function(module, cb) {
            module.references = referenceMap[module.name];
            process.nextTick(cb);
        }
    });
}

test('build a module with no references', function(t) {
    t.plan(3);

    var b = _build({
        'no-references': []
    });

    var module = b.build('no-references', function( error, module ) {
        t.error( error );
        t.deepEquals(module.dependencies, []);
    } );
    t.equals(module.name, 'no-references');

});

test('build a module with 1 reference', function(t) {
    t.plan(5);

    var b = _build({
        'no-references': [],
        '1-reference': [ 'no-references' ]
    });

    var module = b.build('1-reference', function( error, module ) {
        t.error( error );
        t.equals(module.dependencies.length, 1);
        t.equals(module.dependencies[0].name, 'no-references');
        t.deepEquals(module.dependencies[0].dependencies, []);
    } );
    t.equals(module.name, '1-reference');

});

test('build the same module twice', function(t) {
    t.plan(7);

    var b = _build({
        'no-references': []
    });

    var moduleA = b.build('no-references', function( error, module ) {
        t.error( error );
        t.deepEquals(module.dependencies, []);
    } );
    var moduleB = b.build('no-references', function( error, module ) {
        t.error( error );
        t.deepEquals(module.dependencies, []);
    } );
    t.equals(moduleA.name, 'no-references');
    t.equals(moduleB.name, 'no-references');
    t.equals(moduleA, moduleB);

});

test('build a module with a circular reference', function(t) {
    t.plan(2);

    var b = _build({
        '1-reference': [ '1-reference' ]
    });

    var module = b.build('1-reference', function( error, module ) {
        t.equals( error, 'circular reference' );
    } );
    t.equals(module.name, '1-reference');

});
