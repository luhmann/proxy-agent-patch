PORT = 6768;
PROXY_RESPONSE = 'Hello People';
var http = require('http');

var createServer = function (port, protocol) {
  var s = http.createServer(function (req, resp) {
    s.emit('incoming', req, resp);
    s.emit(req.url.replace(/(\?.*)/, ''), req, resp)
  });

  s.port = port;
  s.url = 'http://localhost:' + port;
  s.protocol = protocol || 'http';
  return s
}

var createTestSetup = function(url, protocol) {
  var proxy = createServer(PORT, protocol);
  proxy.listen(PORT, function() {
    console.log('Server is listening');
    proxy.on('incoming', function(req, res) {
      console.log('ping!');
      res.writeHead(200);
      res.write('Hello World');
      res.end();
    });
    proxy.on(url, function(req, res) {
      res.writeHead(200);
      res.write(PROXY_RESPONSE);
      res.end();
    });
  });

  return proxy;
};

createTestSetup('https://www.google.de');
