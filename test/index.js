var index = require('../index');
var test = require('tape');

test('bundle', function(t) {
    t.plan(1);

    var i = index({ sourceFolders: [__dirname+'/example'] });
    i.addEntryPoint('index');
    i.bundle(function(error, output) {
        t.error(error);
        console.log(output);
    })
});