var bank = require('../');
var test = require('tape');
var sinon = require('sinon');
var http = require('http');
var https = require('https');
var httpProxy = require('http-proxy');

var PORT = 6768;
var PROXY_URL = 'http://localhost:' + PORT;
var TEST_URL = 'http://example.org/';
// var HTTPS_TEST_URL = 'https://example.org';
var PROXY_RESPONSE = 'This is proxy calling';

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
    // proxy.on('incoming', function(req, res) { res.writeHead(200); res.write('Hello World'); } )
    proxy.on(url, function(req, res) {
      res.writeHead(200);
      res.write(PROXY_RESPONSE);
      res.end();
    });
  });

  return proxy;
};

test('replace global http agent', function (t) {

  t.test('globalAgent should contain proxy settings set from "http_proxy"-env variable', function(t) {
    var proxy = createTestSetup(TEST_URL);
    process.env.http_proxy = PROXY_URL;
    bank();
    http.get(TEST_URL, function(res) {
      var body = '';
      res.on('data', function(data) { body += data; });
      res.on('end', function() {
        t.equal(body, PROXY_RESPONSE, 'Proxy was called');
        proxy.close();
        t.end();
      });
    });
  });

  t.test('globalAgent should contain proxy settings set from "HTTP_PROXY"-env variable', function(t) {
    var proxy = createTestSetup(TEST_URL);

    process.env.http_proxy = '';
    process.env.HTTP_PROXY = PROXY_URL;
    bank();
    http.get(TEST_URL, function(res) {
      var body = '';
      res.on('data', function(data) { body += data; });
      res.on('end', function() {
        t.equal(body, PROXY_RESPONSE, 'Proxy was called');
        proxy.close();
        t.end();
      });
    });
  });

  t.test('globalAgent should contain passed proxy settings', function(t) {
    var proxy = createTestSetup(TEST_URL);
    bank({
      httpProxy: PROXY_URL
    });

    http.get(TEST_URL, function(res) {
      var body = '';
      res.on('data', function(data) { body += data; });
      res.on('end', function() {
        t.equal(body, PROXY_RESPONSE, 'Proxy was called');
        proxy.close();
        t.end();
      });
    });
  });
});

// TODO: add more complex setup for local https proxy-server
test('replace global https agent', function (t) {
  t.test('globalAgent should contain proxy settings set from "https_proxy"-env variable', function(t) {
    process.env.https_proxy = 'https://example.org:8000';
    bank();

    var proxySettings = https.globalAgent.proxy;
    t.equal(proxySettings.protocol, 'https:', 'proxy protocol is https');
    t.equal(proxySettings.host, 'example.org', 'proxy host is example.org');
    t.equal(proxySettings.port, 8000, 'proxy port is 8000');
    t.end();
  });

  t.test('globalAgent should contain proxy settings set from "HTTPS_PROXY"-env variable', function(t) {
    process.env.https_proxy = '';
    process.env.HTTPS_PROXY = 'https://example.org:5000';
    bank();

    var proxySettings = https.globalAgent.proxy;
    t.equal(proxySettings.protocol, 'https:', 'proxy protocol is https');
    t.equal(proxySettings.host, 'example.org', 'proxy host is example.org');
    t.equal(proxySettings.port, 5000, 'proxy port is 5000');
    t.end();
  });

  t.test('globalAgent should contain passed proxy settings', function(t) {
    bank({
      httpsProxy: 'https://foo.org:8080'
    });

    var proxySettings = https.globalAgent.proxy;
    t.equal(proxySettings.protocol, 'https:', 'proxy protocol is https');
    t.equal(proxySettings.host, 'foo.org', 'proxy host is foo.org');
    t.equal(proxySettings.port, 8080, 'proxy port is 8080');
    t.end();
  });

  t.test('proxy should be definable as http even for https connections', function(t) {
    bank({
      httpsProxy: 'http://foo.org:8080'
    });

    var proxySettings = https.globalAgent.proxy;
    t.equal(proxySettings.protocol, 'http:', 'proxy protocol is http');
    t.equal(proxySettings.host, 'foo.org', 'proxy host is foo.org');
    t.equal(proxySettings.port, 8080, 'proxy port is 8080');
    t.end();
  });
});

test('no_proxy', function(t) {
  t.test('proxy should not be used when no_proxy-env-variable contains url', function(t) {
    http = require('http');
    var proxy = createTestSetup(TEST_URL);
    process.env.http_proxy = PROXY_URL;
    process.env.no_proxy = 'example.org, google.com'
    bank();
    http.get(TEST_URL, function(res) {
      var body = '';
      res.on('data', function(data) { body += data; });
      res.on('end', function() {
        console.log(body);
        t.notEqual(body, PROXY_RESPONSE, 'Proxy was not called');
        proxy.close();
        t.end();
      });
    });
  });
});
