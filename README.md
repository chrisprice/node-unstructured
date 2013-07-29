node-unstructured
=================

A library for wrangling unstructured JavaScript.

```
var u = require('unstructured');
u({
    sourceFolders: [ __dirname + '/src', __dirname + '/lib'],
    entryPoints: [ 'a.namespaced.Module' ],
    debug: true, // enable source maps  
    verbose: true // log resolved source list
  }, 
  function(error, concatenatedSource) {
    require('fs').writeFileSync('output.js', concatenatedSource);
  });
```
