# hogan-hammer

Hogan.js templating with stream.

## usage

```js
var hammer   = require('hogan-hammer')
var http     = require('http')
var fs       = require('fs')
var url      = require('url')
var template = __diranme + '/path/to/template.ext'

http.createServer(function (req, res) {
    var ham = hammer().once('error', onError)
    var ws  = ham.ws

    //req.pipe(ws)
    ws.write(url.parse(req.url, true).query || {})
    ws.end({user: 'Fooman'})

    fs.createReadStream(template).once('error').pipe(ham).pipe(res)

    function onError (err) {
        res.statusCode = 500
        res.end(err.message)
        console.error(err)
    }
}).listen(8080)
```

## example

```
$ PORT=8080 node example/app &
$ curl -sS -v http://localhost:8080/?title=FOO&list=abc&list=def
```

## api

```js
var hammer = require('hogan-hammer')
```

### var ham = hammer()

create a new hammer stream. this stream is duplex stream.

### ham.ws

`ham.ws` is a writable stream. 

```js
ham.ws.write(opts)
ham.ws.end([opts])
```

`opts` is a context object.

## test

```
$ npm test
```

### test with browserify

```
$ npm run testling
```

required `phantomjs`


## author

ishiduca@gmail.com

## license

MIT
