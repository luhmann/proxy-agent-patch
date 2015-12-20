module.exports = function(options) {
  'use strict';

  var url = require('url');
  var https = require('https');
  var http = require('http');
  var util = require('util');
  var HttpsProxyAgent = require('https-proxy-agent');
  var HttpProxyAgent = require('http-proxy-agent');

  var httpProxy = (options && options.httpProxy) || process.env.http_proxy || process.env.HTTP_PROXY;
  var httpsProxy = (options && options.httpsProxy) || process.env.https_proxy || process.env.HTTPS_PROXY;

  var patch = function(proxy, HttpAgent, library) {
    var httpAgent = new HttpAgent(proxy);

    if(httpAgent) {
      library.globalAgent = library.Agent.globalAgent = httpAgent;
      var _httpRequest = library.request;
      library.request = function(options, cb) {
        if (typeof options === 'string') {
          options = url.parse(options);
        } else {
          options = util._extend({}, options);
        }

        options.agent = options.agent || httpAgent;

        return _httpRequest.call(http, options, cb);
      };
    }
  };

  if (httpProxy) { patch(httpProxy, HttpProxyAgent, http); }
  if (httpsProxy) { patch(httpsProxy, HttpsProxyAgent, https); }
};
