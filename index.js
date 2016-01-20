module.exports = function(options) {
  'use strict';

  var url = require('url');
  var https = require('https');
  var http = require('http');
  var util = require('util');
  var HttpsProxyAgent = require('https-proxy-agent');
  var HttpProxyAgent = require('http-proxy-agent');

  var httpProxy = (options && options.httpProxy) || process.env.http_proxy || process.env.HTTP_PROXY || null;
  var httpsProxy = (options && options.httpsProxy) || process.env.https_proxy || process.env.HTTPS_PROXY || null;
  var noProxy = (options && options.noProxy) || process.env.no_proxy || process.env.NO_PROXY || null;

  var ignoreHost = function(noProxy, hostname) {
    if (noProxy) {
      if (noProxy === '*') {
        return true;
      }

      var ignoredHosts = noProxy.split(',');
      for(var i = 0, l = ignoredHosts.length; i < l; i++) {
        var noProxyItem = ignoredHosts[i].trim();

        if (hostname.indexOf(noProxyItem) === hostname.length - noProxyItem.length) {
          return true;
          break;
        }
      }
    }

    return false;
  }


  var patch = function(proxy, HttpAgent, library) {
    var httpAgent = new HttpAgent(proxy);

    if (httpAgent) {
      var originalAgent = library.globalAgent || library.Agent.globalAgent;
      library.globalAgent = library.Agent.globalAgent = httpAgent;
      var _originalRequest = library.request;
      library.request = function(options, cb) {
        if (typeof options === 'string') {
          options = url.parse(options);
        } else {
          options = util._extend({}, options);
        }

        options.agent = options.agent || httpAgent;

        if (ignoreHost(noProxy, options.host)) {
          options.agent.proxy = {};
        }
        console.log(options);
        return _originalRequest.call(library, options, cb);
      };
    }
  };

  if (httpProxy) { patch(httpProxy, HttpProxyAgent, http); }
  if (httpsProxy) { patch(httpsProxy, HttpsProxyAgent, https); }
};
