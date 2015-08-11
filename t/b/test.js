'use strict'
var hammer  = require('../../index')
var test    = require('tape')
var through = require('through2')
var slows   = require('slows')

function delay (ary) {
    var rs = slows(500)
    ary.forEach(function (str) {
        rs.write(str)
    })
    rs.end()

    return rs
}

function Spy () {
    var spy = through.obj(function (chnk, enc, done) {
        this.buf += chnk
        done()
    })
    spy.buf = ''
    return spy
}

test('delay', function (t) {
    var rs = delay([
        '<h1>',
        '{{title}}',
        '</h1>'
    ])

    var ham = hammer()
    var spy = Spy()

    spy.once('finish', function () {
        t.ok(/<h1>FOO<\/h1>/.test(this.buf), this.buf)
        t.end()
    })

    ham.ws.end({title: 'FOO'})

    rs.pipe(ham).pipe(spy)
})
