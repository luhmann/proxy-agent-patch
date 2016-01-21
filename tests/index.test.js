var
  _ = require('lodash'),
  bank = require('../'),
  test = require('tape'),
  http = require('http'),
  https = require('https'),
  _unpatchedHttp = _.cloneDeep(http),
  PORT = 6768,
  PROXY_URL = 'http://localhost:' + PORT,
  TEST_URL = 'http://example.org/',
  PROXY_RESPONSE = 'This is proxy calling',
  createServer,
  createTestSetup,
  setup;

createServer = function(port, protocol) {
  var s = _unpatchedHttp.createServer(function(req, resp) {
    s.emit('incoming', req, resp);
    s.emit(req.url.replace(/(\?.*)/, ''), req, resp)
  });

  s.port = port;
  s.url = 'http://localhost:' + port;
  s.protocol = protocol || 'http';
  return s
};

createTestSetup = function(url, protocol) {
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

setup = function() {
  http = _.cloneDeep(_unpatchedHttp);
  process.env = {};
}

test('replace global http agent', function(assert) {
  assert.test('globalAgent should contain proxy settings set from "http_proxy"-env variable', function(assert) {
    setup();
    var proxy = createTestSetup(TEST_URL);
    process.env.http_proxy = PROXY_URL;
    process.env.no_proxy = '';
    bank();
    http.get(TEST_URL, function(res) {
      var body = '';
      res.on('data', function(data) {
        body += data;
      });
      res.on('end', function() {
        assert.equal(body, PROXY_RESPONSE, 'Proxy was called');
        proxy.close();
        assert.end();
      });
    });
  });

  assert.test('globalAgent should contain proxy settings set from "HTTP_PROXY"-env variable', function(assert) {
    setup();
    var proxy = createTestSetup(TEST_URL);

    process.env.http_proxy = '';
    process.env.HTTP_PROXY = PROXY_URL;
    bank();
    http.get(TEST_URL, function(res) {
      var body = '';
      res.on('data', function(data) {
        body += data;
      });
      res.on('end', function() {
        assert.equal(body, PROXY_RESPONSE, 'Proxy was called');
        proxy.close();
        assert.end();
      });
    });
  });

  assert.test('globalAgent should contain passed proxy settings', function(assert) {
    setup();
    var proxy = createTestSetup(TEST_URL);
    bank({
      httpProxy: PROXY_URL
    });

    http.get(TEST_URL, function(res) {
      var body = '';
      res.on('data', function(data) {
        body += data;
      });
      res.on('end', function() {
        assert.equal(body, PROXY_RESPONSE, 'Proxy was called');
        proxy.close();
        assert.end();
      });
    });
  });
});

// TODO: add more complex setup for local https proxy-server
test('replace global https agent', function(assert) {
  assert.test('globalAgent should contain proxy settings set from "https_proxy"-env variable', function(assert) {
    setup();
    process.env.https_proxy = 'https://example.org:8000';
    bank();

    var proxySettings = https.globalAgent.proxy;
    assert.equal(proxySettings.protocol, 'https:', 'proxy protocol is https');
    assert.equal(proxySettings.host, 'example.org', 'proxy host is example.org');
    assert.equal(proxySettings.port, 8000, 'proxy port is 8000');
    assert.end();
  });

  assert.test('globalAgent should contain proxy settings set from "HTTPS_PROXY"-env variable', function(assert) {
    setup();
    process.env.https_proxy = '';
    process.env.HTTPS_PROXY = 'https://example.org:5000';
    bank();

    var proxySettings = https.globalAgent.proxy;
    assert.equal(proxySettings.protocol, 'https:', 'proxy protocol is https');
    assert.equal(proxySettings.host, 'example.org', 'proxy host is example.org');
    assert.equal(proxySettings.port, 5000, 'proxy port is 5000');
    assert.end();
  });

  assert.test('globalAgent should contain passed proxy settings', function(assert) {
    setup();
    bank({
      httpsProxy: 'https://foo.org:8080'
    });

    var proxySettings = https.globalAgent.proxy;
    assert.equal(proxySettings.protocol, 'https:', 'proxy protocol is https');
    assert.equal(proxySettings.host, 'foo.org', 'proxy host is foo.org');
    assert.equal(proxySettings.port, 8080, 'proxy port is 8080');
    assert.end();
  });

  assert.test('proxy should be definable as http even for https connections', function(assert) {
    setup();
    bank({
      httpsProxy: 'http://foo.org:8080'
    });

    var proxySettings = https.globalAgent.proxy;
    assert.equal(proxySettings.protocol, 'http:', 'proxy protocol is http');
    assert.equal(proxySettings.host, 'foo.org', 'proxy host is foo.org');
    assert.equal(proxySettings.port, 8080, 'proxy port is 8080');
    assert.end();
  });
});

test('no_proxy', function(assert) {
  assert.test('proxy should not be used when no_proxy-env-variable contains the request url', function(assert) {
    setup();
    var proxy = createTestSetup(TEST_URL);
    process.env.http_proxy = PROXY_URL;
    process.env.no_proxy = 'example.org, google.com'
    bank();
    http.get(TEST_URL, function(res) {
      var body = '';
      res.on('data', function(data) {
        body += data;
      });
      res.on('end', function() {
        assert.notEqual(body, PROXY_RESPONSE, 'Proxy was not called');
        proxy.close();
        assert.end();
      });
    });
  });

  assert.test('proxy should not be used when NO_PROXY-env-variable contains the request url', function(assert) {
    setup();
    var proxy = createTestSetup(TEST_URL);
    process.env.http_proxy = PROXY_URL;
    process.env.NO_PROXY = 'example.org, google.com'
    bank();
    http.get('http://mail.google.com', function(res) {
      var body = '';
      res.on('data', function(data) {
        body += data;
      });
      res.on('end', function() {
        assert.notEqual(body, PROXY_RESPONSE, 'Proxy was not called');
        proxy.close();
        assert.end();
      });
    });
  });

  assert.test('proxy should not be used when noProxy-option is passed', function(assert) {
    setup();
    var proxy = createTestSetup(TEST_URL);
    process.env.http_proxy = PROXY_URL;
    process.env.NO_PROXY = ''
    bank({
      noProxy: 'google.com'
    });
    http.get('http://mail.google.com', function(res) {
      var body = '';
      res.on('data', function(data) {
        body += data;
      });
      res.on('end', function() {
        assert.notEqual(body, PROXY_RESPONSE, 'Proxy was not called');
        proxy.close();
        assert.end();
      });
    });
  });

  assert.test('proxy should not be used when set "*"', function(assert) {
    setup();
    var proxy = createTestSetup(TEST_URL);
    process.env.http_proxy = PROXY_URL;
    process.env.NO_PROXY = '*'
    bank();
    http.get('http://mail.google.com', function(res) {
      var body = '';
      res.on('data', function(data) {
        body += data;
      });
      res.on('end', function() {
        assert.notEqual(body, PROXY_RESPONSE, 'Proxy was not called');
        proxy.close();
        assert.end();
      });
    });
  });

  assert.test('proxy should not be used, when "*"-wildcard for subdomain matching is set', function(assert) {
    setup();
    var proxy = createTestSetup(TEST_URL);
    process.env.http_proxy = PROXY_URL;
    process.env.NO_PROXY = '*.google.com, *.example.com';
    bank();
    http.get('http://mail.google.com', function(res) {
      var body = '';
      res.on('data', function(data) {
        body += data;
      });
      res.on('end', function() {
        assert.notEqual(body, PROXY_RESPONSE, 'Proxy was not called');
        proxy.close();
        assert.end();
      });
    });
  });

  assert.test('proxy should be used, when "NO_PROXY"-env-variable is set with non matching port', function(assert) {
    setup();
    var proxy = createTestSetup(TEST_URL);
    process.env.http_proxy = PROXY_URL;
    process.env.NO_PROXY = '.google.com,.example.org:8080';
    bank();
    http.get('http://example.org', function(res) {
      var body = '';
      res.on('data', function(data) {
        body += data;
      });
      res.on('end', function() {
        assert.equal(body, PROXY_RESPONSE, 'Proxy was called');
        proxy.close();
        assert.end();
      });
    });
  });
});
