var https = require('https');
var proxyAgentPatch = require('./index.js');

// process.env.no_proxy = 'example.org';
process.env.https_proxy = 'http://localhost:6768';
proxyAgentPatch();
console.log(https.globalAgent.proxy);
https.get('https://www.google.de', function(response) {
  var body = '';

  response.on('data', function(data) {
    body += data;
  });

  response.on('end', function() {
    console.log(body);
  });
});
