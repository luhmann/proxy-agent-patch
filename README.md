# Proxy Agent Patch [![Build Status](https://travis-ci.org/luhmann/proxy-agent-patch.svg?branch=master)](https://travis-ci.org/luhmann/proxy-agent-patch)

[Monkey patches](https://en.wikipedia.org/wiki/Monkey_patch) the `http` and `https` global-agents to use a configured proxy.

### Installation
`npm install proxy-agent-patch`

### Usage

Include this before your code or any packages would use nodes `http` or `https`

```js
require('proxy-agent-patch')();
```

If no options are passed proxy-agent-patch will try to infer the proxy settings for `http` and `https` from
`process.env.http_proxy`, `process.env.https_proxy` or `process.env.HTTP_PROXY`, `process.env.HTTPS_PROXY`.
`process.env.no_proxy` and `process.env.NO_PROXY` are also respected;

You can also pass the settings explicitly:

```js
require('proxy-agent-patch')({
  httpProxy: 'http://proxy.com:8080',
  httpsProxy: 'https://proxy.com:8080',
  noProxy: 'localhost, 127.0.0.0'
});
```
You can also specify an http-proxy for https-connections.

### Testing

You can run the tests with

`npm test`

Note that at the moment tests try to connect to real urls, when testing the `no_proxy`-setting. This is far from ideal
as it will fail if you are behind a proxy as you probably are when trying out this package. It works on Travis for now
and will be fixed eventually.

### Release History
* 0.0.x Development Version. Do not use
* 0.0.1 Initial release version
* 0.0.2 Refactoring of patching
* 0.0.3 Add `no_proxy`-option
* 0.0.4 Differentiate `no_proxy`-settings at port level, allow subdomain wildcard
