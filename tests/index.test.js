var bank = require('../');
var test = require('tape');
var http = require('http');
var https = require('https');

test('replace global http agent', function (t) {
  t.test('globalAgent should contain proxy settings set from "http_proxy"-env variable', function(t) {
    process.env.http_proxy = 'http://example.org:8000';
    bank();

    var proxySettings = http.globalAgent.proxy;
    t.equal(proxySettings.protocol, 'http:', 'proxy protocol is http');
    t.equal(proxySettings.host, 'example.org', 'proxy host is example.org');
    t.equal(proxySettings.port, 8000, 'proxy port is 8000');
    t.end();
  });

  t.test('globalAgent should contain proxy settings set from "HTTP_PROXY"-env variable', function(t) {
    process.env.http_proxy = '';
    process.env.HTTP_PROXY = 'http://example.org:5000';
    bank();

    var proxySettings = http.globalAgent.proxy;
    t.equal(proxySettings.protocol, 'http:', 'proxy protocol is http');
    t.equal(proxySettings.host, 'example.org', 'proxy host is example.org');
    t.equal(proxySettings.port, 5000, 'proxy port is 5000');
    t.end();
  });

  t.test('globalAgent should contain passed proxy settings', function(t) {
    bank({
      httpProxy: 'http://foo.org:8080'
    });

    var proxySettings = http.globalAgent.proxy;
    t.equal(proxySettings.protocol, 'http:', 'proxy protocol is http');
    t.equal(proxySettings.host, 'foo.org', 'proxy host is foo.org');
    t.equal(proxySettings.port, 8080, 'proxy port is 8080');
    t.end();
  });
});

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
