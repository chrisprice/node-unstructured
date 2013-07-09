var unstructured = require('../index');
var test = require('tape');
var fs = require('fs');

test('bundle', function(t) {
    t.plan(2);

    unstructured({
        debug: true,
        verbose: true,
        sourceFolders: [__dirname+'/example2', __dirname+'/example'],
        entryPoints: ['index']
    }, function(error, output) {
        t.error(error);
        t.equals(output, fs.readFileSync(__dirname + '/example.packed.js', 'utf8'));
//        fs.writeFileSync(__dirname + '/example.packed.js', output, 'utf8')
    });
});