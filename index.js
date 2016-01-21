/* eslint-disable complexity, max-statements, one-var */
module.exports = function(options) {
  var
    https = require('https'),
    http = require('http'),
    url = require('url'),
    util = require('util'),
    HttpsProxyAgent = require('https-proxy-agent'),
    HttpProxyAgent = require('http-proxy-agent'),
    httpProxy = (options && options.httpProxy) || process.env.http_proxy || process.env.HTTP_PROXY || null,
    httpsProxy = (options && options.httpsProxy) || process.env.https_proxy || process.env.HTTPS_PROXY || null,
    noProxy = (options && options.noProxy) || process.env.no_proxy || process.env.NO_PROXY || null,
    ignoreHost,
    patch;

  ignoreHost = function(noProxy, address) {
    if (noProxy) {
      if (noProxy === '*') {
        return true;
      }

      //@see https://github.com/restify/clients/blob/master/lib/HttpClient.js#L318
      if (noProxy !== null) {
        var noProxyItem, hostname, port, noProxyItemParts, noProxyHost, noProxyPort, noProxyList, isMatchedAt;

        // canonicalize the hostname
        hostname = address.hostname.replace(/^\.*/, '.').toLowerCase();
        noProxyList = noProxy.split(',');

        for (var i = 0, len = noProxyList.length; i < len; i++) {
          noProxyItem = noProxyList[i].trim().toLowerCase();

          // no_proxy can be granular at the port level
          if (noProxyItem.indexOf(':') > -1) {
            noProxyItemParts = noProxyItem.split(':', 2);

            noProxyHost = noProxyItemParts[0].replace(/^\.*/, '.');
            noProxyPort = noProxyItemParts[1];
            port = address.port ||
              (address.protocol === 'https:' ? '443' : '80');

            // match - ports are same and host ends with no_proxy entry.
            if (port === noProxyPort &&
              hostname.indexOf(noProxyHost) ===
              hostname.length - noProxyHost.length) {
              return true;
            }
          } else {
            // replace "*"-wildcards even though they are not strictly valid
            noProxyItem = noProxyItem.replace(/^\*?/, '');
            noProxyItem = noProxyItem.replace(/^\.*/, '.');
            isMatchedAt = hostname.indexOf(noProxyItem);

            if (isMatchedAt > -1 &&
              isMatchedAt === hostname.length - noProxyItem.length) {
              return true;
            }
          }
        }
      }
    }
    return false;
  };


  patch = function(proxy, HttpAgent, library) {
    var
      proxyAgent = new HttpAgent(proxy),
      _originalRequest;

    if (proxyAgent) {
      library.globalAgent = library.Agent.globalAgent = proxyAgent;
      _originalRequest = library.request;
      library.request = function(options, cb) {
        if (typeof options === 'string') {
          options = url.parse(options);
        } else {
          options = util._extend({}, options);
        }


        if (!ignoreHost(noProxy, options)) {
          options.agent = options.agent || proxyAgent;
        } else {
          options.agent = options.agent || new library.Agent();
        }

        return _originalRequest.call(library, options, cb);
      };
    }
  };

  if (httpProxy) {
    patch(httpProxy, HttpProxyAgent, http);
  }
  if (httpsProxy) {
    patch(httpsProxy, HttpsProxyAgent, https);
  }
};
