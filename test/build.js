var test = require('tape');
var analyse = require('../lib/analyse');
var build = require('../lib/build');

function _build(referenceMap, opts) {
    opts = opts || {};
    opts.analyse = function(module, cb) {
        module.references = referenceMap[module.name];
        process.nextTick(cb);
    };
    return {
        build: function(moduleNames, cb) {
            return build(moduleNames, opts, function(error, modules) {
                cb(error, modules[0])
            });
        }
    };
}

test('build a module with no references', function(t) {
    t.plan(2);

    var b = _build({
        'no-references': []
    });

    b.build('no-references', function( error, module ) {
        t.error( error );
        t.deepEquals(module.dependencies, []);
    } );
});

test('build a module with 1 reference', function(t) {
    t.plan(4);

    var b = _build({
        'no-references': [],
        '1-reference': [ 'no-references' ]
    });

    b.build('1-reference', function( error, module ) {
        t.error( error );
        t.equals(module.dependencies.length, 1);
        t.equals(module.dependencies[0].name, 'no-references');
        t.deepEquals(module.dependencies[0].dependencies, []);
    } );

});

test('build the same module twice', function(t) {
    t.plan(6);

    var b = _build({
        'no-references': []
    });

    b.build('no-references', function( error, module ) {
        t.error( error );
        t.equals(module.name, 'no-references');
        t.deepEquals(module.dependencies, []);
    } );
    b.build('no-references', function( error, module ) {
        t.error( error );
        t.equals(module.name, 'no-references');
        t.deepEquals(module.dependencies, []);
    } );
});

test('build a module with a self reference', function(t) {
    t.plan(3);

    var b = _build({
        '1-reference': [ '1-reference' ]
    });

    b.build('1-reference', function( error, module ) {
        t.error( error );
        t.equals(module.dependencies.length, 1);
        t.equals(module.dependencies[0], module);
    } );
});

test('build a module with a circular reference', function(t) {
    t.plan(4);

    var b = _build({
        'a': [ 'b' ],
        'b': [ 'a' ]
    });

    b.build('a', function( error, module ) {
        t.error( error );
        t.equals(module.dependencies.length, 1);
        t.equals(module.dependencies[0].name, 'b');
        t.deepEquals(module.dependencies[0].dependencies, [module]);
    } );

});

test('build a module with a sparse circular reference', function(t) {
    t.plan(6);

    var b = _build({
        'a': [ 'b' ],
        'b': [ 'c' ],
        'c': [ 'a' ]
    });

    b.build('a', function( error, module ) {
        t.error( error );
        t.equals(module.dependencies.length, 1);
        t.equals(module.dependencies[0].name, 'b');
        t.equals(module.dependencies[0].dependencies.length, 1);
        t.equals(module.dependencies[0].dependencies[0].name, 'c');
        t.deepEquals(module.dependencies[0].dependencies[0].dependencies, [module]);
    } );

});
