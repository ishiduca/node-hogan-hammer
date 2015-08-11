var Duplex   = require('readable-stream').Duplex
var Writable = require('readable-stream').Writable
var inherits = require('inherits')
var merge    = require('deepmerge')
var hogan    = require('hogan.js')
var mime     = require('mime')

inherits(Hammer,   Duplex)
inherits(Handle, Writable)

module.exports = Hammer

function Hammer () {
    if (!(this instanceof Hammer)) return new Hammer
    Duplex.call(this, {objectMode: true})

    var me = this
    this.buf = []
    this.ws  = new Handle

    this.ws.once('error', function (err) {
        me.emit('error', err)
    })
    //this.ws.once('finish', this.render.bind(this))
    this.ws.once('finish', function () {
        me.render()
    })

    this.once('finish', function () {
        this.body = Buffer.isBuffer(this.buf[0])
                  ? String(Buffer.concat(this.buf))
                  : this.buf.join('')
        this.render()
    })

    this.once('pipe', function (src) {
        this.src = src
    })
}

Hammer.prototype.pipe = function (dest) {
    this.dest = dest
    return Duplex.prototype.pipe.apply(this, arguments)
}

Hammer.prototype._read = function () {}

Hammer.prototype._write = function (chnk, enc, done) {
    this.buf.push(chnk)
    done()
}

Hammer.prototype.render = function () {
    var ws = this.ws
    if (this.body && ws.option && ws._writableState.finished) {
        var body
        try {
            body = hogan.compile(this.body).render(this.ws.option)
        } catch (err) {
            return this.emit('error', err)
        }

        if (this.dest && this.dest.setHeader) {
            this.dest.setHeader('content-length', Buffer.byteLength(body))

            if (this.src && this.src.path) {
                this.dest.setHeader(
                  'content-type', mime.lookup(this.src.path) + '; charset=utf-8')
            }
        }

        this.push(body)
        this.push(null)
    }
}

function Handle () {
    if (!(this instanceof Handle)) return new Handle()
    Writable.call(this, {objectMode: true})
}

Handle.prototype._write = function (opt, enc, done) {
    try {
        this.option = merge(this.option || {}, opt)
    } catch (err) {
        return done(err)
    }
    done()
}
