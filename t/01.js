'use strict'
var test     = require('tape')
var fs       = require('fs')
var path     = require('path')
var url      = require('url')
var http     = require('http')
var through  = require('through2')
var Hammer   = require('../index')
var template = path.join(__dirname, 'test.html')

test('var h = new Hammer', function (t) {
    var h  = new Hammer
    var ws = h.ws
    var fake = through.obj(function (html, enc, done) {
        t.ok(/<h1>Foo Man<\/h1>/.test(html), 'ok /<h1>Foo Man<\/h1>/.test(html)')
        t.ok(/<li>abc<\/li>/.test(html), 'ok /<li>abc<\/li>/.test(html)')
        t.ok(/<li>def<\/li>/.test(html), 'ok /<li>def<\/li>/.test(html)')
        t.ok(/<li>ghi<\/li>/.test(html), 'ok /<li>ghi<\/li>/.test(html)')
        done()
    }).once('finish', function () {
        t.is(spy[0], 'h.finish', 'spy[0] === "h.finish"')
        t.is(spy[1], 'h.ws.finish', 'spy[1] === "h.ws.finish"')
        t.is(spy[2], 'h.end', 'spy[2] === "h.end"')
        t.end()
    })

    var spy = []

    h.once('finish', function () {
        spy.push('h.finish')
        t.ok(true, 'h.once("finish")')
    })
    h.once('end', function () {
        spy.push('h.end')
        t.ok(true, 'h.once("end")')
    })
    ws.once('finish', function () {
        spy.push('h.ws.finish')
        t.ok(true, 'h.ws.once("finish")')
    })

    ws.write({list: ['abc']})

    setTimeout(function () {
        ws.write({list: ['def', 'ghi']})
        ws.end({title: 'Foo Man'})
    }, 400)

    fs.createReadStream(template).pipe(h).pipe(fake)
})

test('server', function (t) {
    var server = http.createServer(function (req, res) {
        var h  = Hammer()
        var ws = h.ws

        ws.end(url.parse(req.url, true).query)

        fs.createReadStream(template).pipe(h).pipe(res)
    }).listen(8080, function () {
        http.get('http://localhost:8080/?title=Boo&list=abc&list=def', function (res) {
            var b = ''
            res.on('data', function (c) { b += c })
            res.once('end', function () {
                t.is(res.headers['content-type'], 'text/html; charset=utf-8'
                  , 'res.headers["content-type"] eq "text/html; charset=utf-8"')
                var len = Buffer.byteLength(b)
                t.is(res.headers['content-length'], String(len)
                  , 'res.headers["content-length"] === ' + len)
                t.ok(/<h1>Boo<\/h1>/.test(b), 'ok /<h1>Boo<\/h1>/.test(body)')
                t.ok(/<li>abc<\/li>/.test(b), 'ok /<li>abc<\/li>/.test(body)')
                t.ok(/<li>def<\/li>/.test(b), 'ok /<li>def<\/li>/.test(body)')
                t.end()
                server.close()
            })
        })
    })
})

