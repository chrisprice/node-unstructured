var unstructured = require('../index');
var test = require('tape');
var fs = require('fs');

test('bundle', function(t) {
    t.plan(2);

    var u = unstructured();
    u.addSourceFolder(__dirname+'/example2');
    u.addSourceFolder(__dirname+'/example');
    u.addEntryPoint('index');
    u.bundle(function(error, output) {
        t.error(error);
        t.equals(output, fs.readFileSync(__dirname + '/example.packed.js', 'utf8'));
    })
});