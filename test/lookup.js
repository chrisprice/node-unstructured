var lookup = require('../lib/analyse/lookup');
var test = require('tape');

test('lookup', function(t) {
    t.plan(12);

    function find(sourceFolders, name, expected) {
        var moduleA = { name: name };
        lookup(sourceFolders, moduleA, function(error, moduleB) {
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
