module.exports = function(options) {
  'use strict';

  var
    url = require('url'),
    https = require('https'),
    http = require('http'),
    util = require('util'),
    minimatch = require('minimatch'),
    HttpsProxyAgent = require('https-proxy-agent'),
    HttpProxyAgent = require('http-proxy-agent'),
    httpProxy,
    httpsProxy,
    noProxy;

  httpProxy = (options && options.httpProxy) || process.env.http_proxy || process.env.HTTP_PROXY;
  httpsProxy = (options && options.httpsProxy) || process.env.https_proxy || process.env.HTTPS_PROXY;
  noProxy = (
    (options && options.noProxy) || (
      process.env.https_proxy || 
      process.env.HTTPS_PROXY
    ) || ''
  ).split(',');

  var matchesNoProxy = function(host, noProxy) {
    for (var i = 0; i < noProxy.length; i++) {
      if (minimatch(host, noProxy[i])) { return true; }
    }

    return false;
  };

  var patch = function(proxy, HttpAgent, library, noProxy) {
    var
      httpAgent = new HttpAgent(proxy),
      _ordinaryGlobalAgent = library.globalAgent,
      _httpRequest;

    if (httpAgent) {
      // ...replace global agent on spec
      library.globalAgent = library.Agent.globalAgent = httpAgent;
      _httpRequest = library.request;

      library.request = function(options, cb) {
        if (typeof options === 'string') {
          options = url.parse(options);
        } else {
          options = util._extend({}, options);
        }

        // ...omitting patches of agent if host matches noProxy
        if (!matchesNoProxy(library.host, noProxy)) {
          library.globalAgent = library.Agent.globalAgent = httpAgent;
          options.agent = options.agent || httpAgent;
        } else {
          library.globalAgent = library.Agent.globalAgent = _ordinaryGlobalAgent;
        }

        return _httpRequest.call(http, options, cb);
      };
    }
  };

  if (httpProxy) { patch(httpProxy, HttpProxyAgent, http, noProxy); }
  if (httpsProxy) { patch(httpsProxy, HttpsProxyAgent, https, noProxy); }
};
