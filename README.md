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
`process.env.http_proxy`, `process.env.https_proxy` or `process.env.HTTP_PROXY`, `process.env.HTTPS_PROXY`

You can also pass the proxy explicitly:

```js
require('proxy-agent-patch')({
  httpProxy: 'http://proxy.com:8080',
  httpsProxy: 'https://proxy.com:8080'
});
```
You can also specify an http-proxy for https-connections.

### Release History
* 0.0.x Development Version. Do not use
