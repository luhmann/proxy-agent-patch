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

  if (httpProxy) {
    var httpAgent = new HttpProxyAgent(httpProxy);

    if(httpAgent) {
      http.globalAgent = http.Agent.globalAgent = httpAgent;
      var _httpRequest = http.request;
      http.request = function(options, cb) {
        if (typeof options === 'string') {
          options = url.parse(options);
        } else {
          options = util._extend({}, options);
        }
        options.agent = options.agent || httpAgent;
        return _httpRequest.call(http, options, cb);
      };
    }
  }

  if (httpsProxy) {
    var httpsAgent = new HttpsProxyAgent(httpsProxy);

    if(httpsAgent) {
      https.globalAgent = https.Agent.globalAgent = httpsAgent;
      var _httpsRequest = https.request;
      https.request = function(options, cb) {
        if (typeof options === 'string') {
          options = url.parse(options);
        } else {
          options = util._extend({}, options);
        }
        options.agent = options.agent || httpsAgent;
        return _httpsRequest.call(https, options, cb);
      };
    }
  }
};
