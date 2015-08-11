'use strict'
var http   = require('http')
var path   = require('path')
var fs     = require('fs')
var url    = require('url')
var hammer = require('../index')

var template = path.join(__dirname, 'dashboard.html')
var port     = process.env.PORT || 3000

http.createServer(function (req, res) {
    var ham = hammer().once('error', onError)
    var ws  = ham.ws

    ws.end(map(url.parse(req.url, true).query))

    fs.createReadStream(template).once('error', onError).pipe(ham).pipe(res)

    function onError (err) {
        console.error(err)
        res.statusCode = 500
        res.end(err.message)
    }
}).listen(port, function () {
    console.log('[server start to listen on port %s]', port)
    console.log('[process.pid %s]', process.pid)
})

function map (q) {
    var list = q.list || []
    Array.isArray(list) || (list = [list])
    q.list = list

    return q
}
