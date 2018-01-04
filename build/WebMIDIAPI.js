(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
(function (process,__dirname){
var path='./bin/';
var v=process.versions.node.split('.');
if (v[0]==0 && v[1]<=10) path+='0_10/';
else if (v[0]==0 && v[1]<=12) path+='0_12/';
else if (v[0]<=4) path+='4_8/';
else if (v[0]<=5) path+='5_12/';
else if (v[0]<=6) path+='6_12/';
else if (v[0]<=7) path+='7_10/';
else if (v[0]<=8) path+='8_9/';
if(process.platform=="win32"&&process.arch=="ia32") path+='win32/jazz';
else if(process.platform=="win32"&&process.arch=="x64") path+='win64/jazz';
else if(process.platform=="darwin"&&process.arch=="x64") path+='macos64/jazz';
else if(process.platform=="darwin"&&process.arch=="ia32") path+='macos32/jazz';
else if(process.platform=="linux"&&process.arch=="x64") path+='linux64/jazz';
else if(process.platform=="linux"&&process.arch=="ia32") path+='linux32/jazz';
else if(process.platform=="linux"&&process.arch=="arm") path+='linuxa7/jazz';
module.exports=require(path);
module.exports.package=require(__dirname + '/package.json');

}).call(this,require('_process'),"/node_modules/jazz-midi")

},{"_process":4}],2:[function(require,module,exports){
/*
// This script is for Node.js only. Don't use it in HTML!
var JZZ;
eval(require('fs').readFileSync(require('path').join(__dirname, 'javascript', 'JZZ.js'))+'');
module.exports = JZZ;
*/

const createJazz = require('./javascript/JZZ.js');
module.exports = createJazz();

},{"./javascript/JZZ.js":3}],3:[function(require,module,exports){
module.exports = function () {

    var _version = '0.4.1';

    // _R: common root for all async objects
    function _R() {
        this._orig = this;
        this._ready = false;
        this._queue = [];
        this._err = [];
    };
    _R.prototype._exec = function () {
        while (this._ready && this._queue.length) {
            var x = this._queue.shift();
            if (this._orig._bad) {
                if (this._orig._hope && x[0] == _or) {
                    this._orig._hope = false;
                    x[0].apply(this, x[1]);
                }
                else {
                    this._queue = [];
                    this._orig._hope = false;
                }
            }
            else if (x[0] != _or) {
                x[0].apply(this, x[1]);
            }
        }
    }
    _R.prototype._push = function (func, arg) { this._queue.push([func, arg]); _R.prototype._exec.apply(this); }
    _R.prototype._slip = function (func, arg) { this._queue.unshift([func, arg]); }
    _R.prototype._pause = function () { this._ready = false; }
    _R.prototype._resume = function () { this._ready = true; _R.prototype._exec.apply(this); }
    _R.prototype._break = function (err) { this._orig._bad = true; this._orig._hope = true; if (err) this._orig._err.push(err); }
    _R.prototype._repair = function () { this._orig._bad = false; }
    _R.prototype._crash = function (err) { this._break(err); this._resume(); }
    _R.prototype.err = function () { return _clone(this._err); }

    function _wait(obj, delay) { setTimeout(function () { obj._resume(); }, delay); }
    _R.prototype.wait = function (delay) {
        if (!delay) return this;
        function F() { }; F.prototype = this._orig;
        var ret = new F();
        ret._ready = false;
        ret._queue = [];
        this._push(_wait, [ret, delay]);
        return ret;
    }

    function _and(q) { if (q instanceof Function) q.apply(this); else console.log(q); }
    _R.prototype.and = function (func) { this._push(_and, [func]); return this; }
    function _or(q) { if (q instanceof Function) q.apply(this); else console.log(q); }
    _R.prototype.or = function (func) { this._push(_or, [func]); return this; }

    _R.prototype._info = {};
    _R.prototype.info = function () {
        var info = _clone(this._orig._info);
        if (typeof info.engine == 'undefined') info.engine = 'none';
        if (typeof info.sysex == 'undefined') info.sysex = true;
        return info;
    }
    _R.prototype.name = function () { return this.info().name; }

    function _close(obj) {
        this._break('closed');
        obj._resume();
    }
    _R.prototype.close = function () {
        var ret = new _R();
        if (this._close) this._push(this._close, []);
        this._push(_close, [ret]);
        return ret;
    }

    function _tryAny(arr) {
        if (!arr.length) {
            this._break();
            return;
        }
        var func = arr.shift();
        if (arr.length) {
            var self = this;
            this._slip(_or, [function () { _tryAny.apply(self, [arr]); }]);
        }
        try {
            this._repair();
            func.apply(this);
        }
        catch (e) {
            this._break(e.toString());
        }
    }

    function _push(arr, obj) {
        for (var i = 0; i < arr.length; i++) if (arr[i] === obj) return;
        arr.push(obj);
    }
    function _pop(arr, obj) {
        for (var i = 0; i < arr.length; i++) if (arr[i] === obj) {
            arr.splice(i, 1);
            return;
        }
    }

    // _J: JZZ object
    function _J() {
        _R.apply(this);
    }
    _J.prototype = new _R();

    _J.prototype.time = function () { return 0; }
    if (typeof performance != 'undefined' && performance.now) _J.prototype._time = function () { return performance.now(); }
    function _initTimer() {
        if (!_J.prototype._time) _J.prototype._time = function () { return Date.now(); }
        _J.prototype._startTime = _J.prototype._time();
        _J.prototype.time = function () { return _J.prototype._time() - _J.prototype._startTime; }
    }

    function _clone(obj, key, val) {
        if (typeof key == 'undefined') return _clone(obj, [], []);
        if (obj instanceof Object) {
            for (var i = 0; i < key.length; i++) if (key[i] === obj) return val[i];
            var ret;
            if (obj instanceof Array) ret = []; else ret = {};
            key.push(obj); val.push(ret);
            for (var k in obj) if (obj.hasOwnProperty(k)) ret[k] = _clone(obj[k], key, val);
            return ret;
        }
        return obj;
    }
    _J.prototype._info = { name: 'JZZ.js', ver: _version, version: _version };

    var _outs = [];
    var _ins = [];

    function _postRefresh() {
        this._info.engine = _engine._type;
        this._info.version = _engine._version;
        this._info.sysex = _engine._sysex;
        this._info.inputs = [];
        this._info.outputs = [];
        _outs = [];
        _ins = [];
        _engine._allOuts = {};
        _engine._allIns = {};
        var i, x;
        for (i = 0; i < _engine._outs.length; i++) {
            x = _engine._outs[i];
            x.engine = _engine;
            _engine._allOuts[x.name] = x;
            this._info.outputs.push({
                name: x.name,
                manufacturer: x.manufacturer,
                version: x.version,
                engine: _engine._type
            });
            _outs.push(x);
        }
        for (i = 0; i < _virtual._outs.length; i++) {
            x = _virtual._outs[i];
            this._info.outputs.push({
                name: x.name,
                manufacturer: x.manufacturer,
                version: x.version,
                engine: x.type
            });
            _outs.push(x);
        }
        for (i = 0; i < _engine._ins.length; i++) {
            x = _engine._ins[i];
            x.engine = _engine;
            _engine._allIns[x.name] = x;
            this._info.inputs.push({
                name: x.name,
                manufacturer: x.manufacturer,
                version: x.version,
                engine: _engine._type
            });
            _ins.push(x);
        }
        for (i = 0; i < _virtual._ins.length; i++) {
            x = _virtual._ins[i];
            this._info.inputs.push({
                name: x.name,
                manufacturer: x.manufacturer,
                version: x.version,
                engine: x.type
            });
            _ins.push(x);
        }
    }
    function _refresh() {
        this._slip(_postRefresh, []);
        _engine._refresh();
    }
    _J.prototype.refresh = function () {
        this._push(_refresh, []);
        return this;
    }

    function _filterList(q, arr) {
        if (typeof q == 'undefined') return arr.slice();
        var i, n;
        var a = [];
        if (q instanceof RegExp) {
            for (n = 0; n < arr.length; n++) if (q.test(arr[n].name)) a.push(arr[n]);
            return a;
        }
        if (q instanceof Function) q = q(arr);
        if (!(q instanceof Array)) q = [q];
        for (i = 0; i < q.length; i++) {
            for (n = 0; n < arr.length; n++) {
                if (q[i] + '' === n + '' || q[i] === arr[n].name || (q[i] instanceof Object && q[i].name === arr[n].name)) a.push(arr[n]);
            }
        }
        return a;
    }

    function _notFound(port, q) {
        var msg;
        if (q instanceof RegExp) msg = 'Port matching ' + q + ' not found';
        else if (q instanceof Object || typeof q == 'undefined') msg = 'Port not found';
        else msg = 'Port "' + q + '" not found';
        port._crash(msg);
    }

    function _openMidiOut(port, arg) {
        var arr = _filterList(arg, _outs);
        if (!arr.length) { _notFound(port, arg); return; }
        function pack(x) { return function () { x.engine._openOut(this, x.name); }; };
        for (var i = 0; i < arr.length; i++) arr[i] = pack(arr[i]);
        port._slip(_tryAny, [arr]);
        port._resume();
    }
    _J.prototype.openMidiOut = function (arg) {
        var port = new _M();
        this._push(_refresh, []);
        this._push(_openMidiOut, [port, arg]);
        return port;
    }

    function _openMidiIn(port, arg) {
        var arr = _filterList(arg, _ins);
        if (!arr.length) { _notFound(port, arg); return; }
        function pack(x) { return function () { x.engine._openIn(this, x.name); }; };
        for (var i = 0; i < arr.length; i++) arr[i] = pack(arr[i]);
        port._slip(_tryAny, [arr]);
        port._resume();
    }
    _J.prototype.openMidiIn = function (arg) {
        var port = new _M();
        this._push(_refresh, []);
        this._push(_openMidiIn, [port, arg]);
        return port;
    }

    _J.prototype._close = function () {
        _engine._close();
    }

    // _M: MIDI-In/Out object
    function _M() {
        _R.apply(this);
        this._handles = [];
        this._outs = [];
    }
    _M.prototype = new _R();

    _M.prototype._receive = function (msg) { this._emit(msg); } // override!
    function _receive(msg) { this._receive(msg); }
    _M.prototype.send = function () {
        this._push(_receive, [MIDI.apply(null, arguments)]);
        return this;
    }
    _M.prototype.note = function (c, n, v, t) {
        this.noteOn(c, n, v);
        if (t) this.wait(t).noteOff(c, n);
        return this;
    }
    _M.prototype._emit = function (msg) {
        for (var i = 0; i < this._handles.length; i++) this._handles[i].apply(this, [MIDI(msg)._stamp(this)]);
        for (var i = 0; i < this._outs.length; i++) {
            var m = MIDI(msg);
            if (!m._stamped(this._outs[i])) this._outs[i].send(m._stamp(this));
        }
    }
    function _emit(msg) { this._emit(msg); }
    _M.prototype.emit = function (msg) {
        this._push(_emit, [msg]);
        return this;
    }
    function _connect(arg) {
        if (arg instanceof Function) _push(this._orig._handles, arg);
        else _push(this._orig._outs, arg);
    }
    function _disconnect(arg) {
        if (arg instanceof Function) _pop(this._orig._handles, arg);
        else _pop(this._orig._outs, arg);
    }
    _M.prototype.connect = function (arg) {
        this._push(_connect, [arg]);
        return this;
    }
    _M.prototype.disconnect = function (arg) {
        this._push(_disconnect, [arg]);
        return this;
    }

    var _jzz;
    var _engine = {};
    var _virtual = { _outs: [], _ins: [] };

    // Node.js
    function _tryNODE() {
        if (typeof module != 'undefined' && module.exports) {
            _initNode(require('jazz-midi'));
            return;
        }
        this._break();
    }
    // Jazz-Plugin
    function _tryJazzPlugin() {
        var div = document.createElement('div');
        div.style.visibility = 'hidden';
        document.body.appendChild(div);
        var obj = document.createElement('object');
        obj.style.visibility = 'hidden';
        obj.style.width = '0px'; obj.style.height = '0px';
        obj.classid = 'CLSID:1ACE1618-1C7D-4561-AEE1-34842AA85E90';
        obj.type = 'audio/x-jazz';
        document.body.appendChild(obj);
        if (obj.isJazz) {
            _initJazzPlugin(obj);
            return;
        }
        this._break();
    }
    // Web MIDI API
    function _tryWebMIDI() {
        if (navigator.requestMIDIAccess) {
            var self = this;
            function onGood(midi) {
                _initWebMIDI(midi);
                self._resume();
            }
            function onBad(msg) {
                self._crash(msg);
            }
            var opt = {};
            navigator.requestMIDIAccess(opt).then(onGood, onBad);
            this._pause();
            return;
        }
        this._break();
    }
    function _tryWebMIDIsysex() {
        if (navigator.requestMIDIAccess) {
            var self = this;
            function onGood(midi) {
                _initWebMIDI(midi, true);
                self._resume();
            }
            function onBad(msg) {
                self._crash(msg);
            }
            var opt = { sysex: true };
            navigator.requestMIDIAccess(opt).then(onGood, onBad);
            this._pause();
            return;
        }
        this._break();
    }
    // Web-extension
    function _tryCRX() {
        var self = this;
        var inst;
        var msg;
        function eventHandle(e) {
            inst = true;
            if (!msg) msg = document.getElementById('jazz-midi-msg');
            if (!msg) return;
            var a = [];
            try { a = JSON.parse(msg.innerText); } catch (e) { }
            msg.innerText = '';
            document.removeEventListener('jazz-midi-msg', eventHandle);
            if (a[0] === 'version') {
                _initCRX(msg, a[2]);
                self._resume();
            }
            else {
                self._crash();
            }
        }
        this._pause();
        document.addEventListener('jazz-midi-msg', eventHandle);
        try { document.dispatchEvent(new Event('jazz-midi')); } catch (e) { }
        window.setTimeout(function () { if (!inst) self._crash(); }, 0);
    }

    function _zeroBreak() {
        this._pause();
        var self = this;
        setTimeout(function () { self._crash(); }, 0);
    }

    function _filterEngines(opt) {
        var ret = [_tryNODE, _zeroBreak];
        var arr = _filterEngineNames(opt);
        for (var i = 0; i < arr.length; i++) {
            if (arr[i] == 'webmidi') {
                if (opt && opt.sysex === true) ret.push(_tryWebMIDIsysex);
                if (!opt || opt.sysex !== true || opt.degrade === true) ret.push(_tryWebMIDI);
            }
            else if (arr[i] == 'extension') ret.push(_tryCRX);
            else if (arr[i] == 'plugin') ret.push(_tryJazzPlugin);
        }
        ret.push(_initNONE);
        return ret;
    }

    function _filterEngineNames(opt) {
        var web = ['extension', 'webmidi', 'plugin'];
        if (!opt || !opt.engine) return web;
        var arr = opt.engine instanceof Array ? opt.engine : [opt.engine];
        var dup = {};
        var none;
        var etc;
        var head = [];
        var tail = [];
        for (var i = 0; i < arr.length; i++) {
            var name = arr[i].toString().toLowerCase();
            if (dup[name]) continue;
            dup[name] = true;
            if (name === 'none') none = true;
            if (name === 'etc') etc = true;
            if (etc) tail.push(name); else head.push(name);
            _pop(web, name);
        }
        if (etc || head.length || tail.length) none = false;
        return none ? [] : head.concat(etc ? web : tail);
    }

    function _initJZZ(opt) {
        _jzz = new _J();
        _jzz._options = opt;
        _jzz._push(_tryAny, [_filterEngines(opt)]);
        _jzz.refresh();
        _jzz._push(_initTimer, []);
        _jzz._push(function () { if (!_outs.length && !_ins.length) this._break(); }, []);
        _jzz._resume();
    }

    function _initNONE() {
        _engine._type = 'none';
        _engine._sysex = true;
        _engine._refresh = function () { _engine._outs = []; _engine._ins = []; }
    }
    // common initialization for Jazz-Plugin and jazz-midi
    function _initEngineJP() {
        _engine._inArr = [];
        _engine._outArr = [];
        _engine._inMap = {};
        _engine._outMap = {};
        _engine._version = _engine._main.version;
        _engine._sysex = true;
        _engine._refresh = function () {
            _engine._outs = [];
            _engine._ins = [];
            var i, x;
            for (i = 0; (x = _engine._main.MidiOutInfo(i)).length; i++) {
                _engine._outs.push({ type: _engine._type, name: x[0], manufacturer: x[1], version: x[2] });
            }
            for (i = 0; (x = _engine._main.MidiInInfo(i)).length; i++) {
                _engine._ins.push({ type: _engine._type, name: x[0], manufacturer: x[1], version: x[2] });
            }
        }
        _engine._openOut = function (port, name) {
            var impl = _engine._outMap[name];
            if (!impl) {
                if (_engine._pool.length <= _engine._outArr.length) _engine._pool.push(_engine._newPlugin());
                impl = {
                    name: name,
                    clients: [],
                    info: {
                        name: name,
                        manufacturer: _engine._allOuts[name].manufacturer,
                        version: _engine._allOuts[name].version,
                        type: 'MIDI-out',
                        sysex: _engine._sysex,
                        engine: _engine._type
                    },
                    _close: function (port) { _engine._closeOut(port); },
                    _receive: function (a) { this.plugin.MidiOutRaw(a.slice()); }
                };
                var plugin = _engine._pool[_engine._outArr.length];
                impl.plugin = plugin;
                _engine._outArr.push(impl);
                _engine._outMap[name] = impl;
            }
            if (!impl.open) {
                var s = impl.plugin.MidiOutOpen(name);
                if (s !== name) {
                    if (s) impl.plugin.MidiOutClose();
                    port._break(); return;
                }
                impl.open = true;
            }
            port._orig._impl = impl;
            _push(impl.clients, port._orig);
            port._info = impl.info;
            port._receive = function (arg) { impl._receive(arg); }
            port._close = function () { impl._close(this); }
        }
        _engine._openIn = function (port, name) {
            var impl = _engine._inMap[name];
            if (!impl) {
                if (_engine._pool.length <= _engine._inArr.length) _engine._pool.push(_engine._newPlugin());
                impl = {
                    name: name,
                    clients: [],
                    info: {
                        name: name,
                        manufacturer: _engine._allIns[name].manufacturer,
                        version: _engine._allIns[name].version,
                        type: 'MIDI-in',
                        sysex: _engine._sysex,
                        engine: _engine._type
                    },
                    _close: function (port) { _engine._closeIn(port); },
                    handle: function (t, a) {
                        for (var i = 0; i < this.clients.length; i++) {
                            var msg = MIDI(a);
                            this.clients[i]._emit(msg);
                        }
                    }
                };
                function makeHandle(x) { return function (t, a) { x.handle(t, a); }; };
                impl.onmidi = makeHandle(impl);
                var plugin = _engine._pool[_engine._inArr.length];
                impl.plugin = plugin;
                _engine._inArr.push(impl);
                _engine._inMap[name] = impl;
            }
            if (!impl.open) {
                var s = impl.plugin.MidiInOpen(name, impl.onmidi);
                if (s !== name) {
                    if (s) impl.plugin.MidiInClose();
                    port._break(); return;
                }
                impl.open = true;
            }
            port._orig._impl = impl;
            _push(impl.clients, port._orig);
            port._info = impl.info;
            port._close = function () { impl._close(this); }
        }
        _engine._closeOut = function (port) {
            var impl = port._impl;
            _pop(impl.clients, port._orig);
            if (!impl.clients.length) {
                impl.open = false;
                impl.plugin.MidiOutClose();
            }
        }
        _engine._closeIn = function (port) {
            var impl = port._impl;
            _pop(impl.clients, port._orig);
            if (!impl.clients.length) {
                impl.open = false;
                impl.plugin.MidiInClose();
            }
        }
        _engine._close = function () {
            for (var i = 0; i < _engine._inArr.length; i++) if (_engine._inArr[i].open) _engine._inArr[i].plugin.MidiInClose();
        }
        _J.prototype._time = function () { return _engine._main.Time(); }
    }

    function _initNode(obj) {
        _engine._type = 'node';
        _engine._main = obj;
        _engine._pool = [];
        _engine._newPlugin = function () { return new obj.MIDI(); }
        _initEngineJP();
    }
    function _initJazzPlugin(obj) {
        _engine._type = 'plugin';
        _engine._main = obj;
        _engine._pool = [obj];
        _engine._newPlugin = function () {
            var plg = document.createElement('object');
            plg.style.visibility = 'hidden';
            plg.style.width = '0px'; obj.style.height = '0px';
            plg.classid = 'CLSID:1ACE1618-1C7D-4561-AEE1-34842AA85E90';
            plg.type = 'audio/x-jazz';
            document.body.appendChild(plg);
            return plg.isJazz ? plg : undefined;
        }
        _initEngineJP();
    }
    function _initWebMIDI(access, sysex) {
        _engine._type = 'webmidi';
        _engine._version = 43;
        _engine._sysex = !!sysex;
        _engine._access = access;
        _engine._inMap = {};
        _engine._outMap = {};
        _engine._refresh = function () {
            _engine._outs = [];
            _engine._ins = [];
            _engine._access.outputs.forEach(function (port, key) {
                _engine._outs.push({ type: _engine._type, name: port.name, manufacturer: port.manufacturer, version: port.version });
            });
            _engine._access.inputs.forEach(function (port, key) {
                _engine._ins.push({ type: _engine._type, name: port.name, manufacturer: port.manufacturer, version: port.version });
            });
        }
        _engine._openOut = function (port, name) {
            var impl = _engine._outMap[name];
            if (!impl) {
                impl = {
                    name: name,
                    clients: [],
                    info: {
                        name: name,
                        manufacturer: _engine._allOuts[name].manufacturer,
                        version: _engine._allOuts[name].version,
                        type: 'MIDI-out',
                        sysex: _engine._sysex,
                        engine: _engine._type
                    },
                    _close: function (port) { _engine._closeOut(port); },
                    _receive: function (a) { this.dev.send(a.slice()); }
                };
                var id, dev;
                _engine._access.outputs.forEach(function (dev, key) {
                    if (dev.name === name) impl.dev = dev;
                });
                if (impl.dev) {
                    _engine._outMap[name] = impl;
                }
                else impl = undefined;
            }
            if (impl) {
                if (impl.dev.open) impl.dev.open();
                port._orig._impl = impl;
                _push(impl.clients, port._orig);
                port._info = impl.info;
                port._receive = function (arg) { impl._receive(arg); }
                port._close = function () { impl._close(this); }
            }
            else port._break();
        }
        _engine._openIn = function (port, name) {
            var impl = _engine._inMap[name];
            if (!impl) {
                impl = {
                    name: name,
                    clients: [],
                    info: {
                        name: name,
                        manufacturer: _engine._allIns[name].manufacturer,
                        version: _engine._allIns[name].version,
                        type: 'MIDI-in',
                        sysex: _engine._sysex,
                        engine: _engine._type
                    },
                    _close: function (port) { _engine._closeIn(port); },
                    handle: function (evt) {
                        for (var i = 0; i < this.clients.length; i++) {
                            var msg = MIDI([].slice.call(evt.data));
                            this.clients[i]._emit(msg);
                        }
                    }
                };
                var id, dev;
                _engine._access.inputs.forEach(function (dev, key) {
                    if (dev.name === name) impl.dev = dev;
                });
                if (impl.dev) {
                    function makeHandle(x) { return function (evt) { x.handle(evt); }; };
                    impl.dev.onmidimessage = makeHandle(impl);
                    _engine._inMap[name] = impl;
                }
                else impl = undefined;
            }
            if (impl) {
                if (impl.dev.open) impl.dev.open();
                port._orig._impl = impl;
                _push(impl.clients, port._orig);
                port._info = impl.info;
                port._close = function () { impl._close(this); }
            }
            else port._break();
        }
        _engine._closeOut = function (port) {
            var impl = port._impl;
            if (!impl.clients.length) {
                if (impl.dev.close) impl.dev.close();
            }
            _pop(impl.clients, port._orig);
        }
        _engine._closeIn = function (port) {
            var impl = port._impl;
            _pop(impl.clients, port._orig);
            if (!impl.clients.length) {
                if (impl.dev.close) impl.dev.close();
            }
        }
        _engine._close = function () {
        }
    }
    function _initCRX(msg, ver) {
        _engine._type = 'extension';
        _engine._version = ver;
        _engine._sysex = true;
        _engine._pool = [];
        _engine._inArr = [];
        _engine._outArr = [];
        _engine._inMap = {};
        _engine._outMap = {};
        _engine._msg = msg;
        _engine._newPlugin = function () {
            var plugin = { id: _engine._pool.length };
            if (!plugin.id) plugin.ready = true;
            else document.dispatchEvent(new CustomEvent('jazz-midi', { detail: ['new'] }));
            _engine._pool.push(plugin);
        }
        _engine._newPlugin();
        _engine._refresh = function () {
            _engine._outs = [];
            _engine._ins = [];
            _jzz._pause();
            document.dispatchEvent(new CustomEvent('jazz-midi', { detail: ['refresh'] }));
        }
        _engine._openOut = function (port, name) {
            var impl = _engine._outMap[name];
            if (!impl) {
                if (_engine._pool.length <= _engine._outArr.length) _engine._newPlugin();
                var plugin = _engine._pool[_engine._outArr.length];
                impl = {
                    name: name,
                    clients: [],
                    info: {
                        name: name,
                        manufacturer: _engine._allOuts[name].manufacturer,
                        version: _engine._allOuts[name].version,
                        type: 'MIDI-out',
                        sysex: _engine._sysex,
                        engine: _engine._type
                    },
                    _start: function () { document.dispatchEvent(new CustomEvent('jazz-midi', { detail: ['openout', plugin.id, name] })); },
                    _close: function (port) { _engine._closeOut(port); },
                    _receive: function (a) { var v = a.slice(); v.splice(0, 0, 'play', plugin.id); document.dispatchEvent(new CustomEvent('jazz-midi', { detail: v })); }
                };
                impl.plugin = plugin;
                plugin.output = impl;
                _engine._outArr.push(impl);
                _engine._outMap[name] = impl;
            }
            port._orig._impl = impl;
            _push(impl.clients, port._orig);
            port._info = impl.info;
            port._receive = function (arg) { impl._receive(arg); }
            port._close = function () { impl._close(this); }
            if (!impl.open) {
                if (impl.plugin.ready) impl._start();
                port._pause();
            }
        }
        _engine._openIn = function (port, name) {
            var impl = _engine._inMap[name];
            if (!impl) {
                if (_engine._pool.length <= _engine._inArr.length) _engine._newPlugin();
                var plugin = _engine._pool[_engine._inArr.length];
                impl = {
                    name: name,
                    clients: [],
                    info: {
                        name: name,
                        manufacturer: _engine._allIns[name].manufacturer,
                        version: _engine._allIns[name].version,
                        type: 'MIDI-in',
                        sysex: _engine._sysex,
                        engine: _engine._type
                    },
                    _start: function () { document.dispatchEvent(new CustomEvent('jazz-midi', { detail: ['openin', plugin.id, name] })); },
                    _close: function (port) { _engine._closeIn(port); }
                };
                impl.plugin = plugin;
                plugin.input = impl;
                _engine._inArr.push(impl);
                _engine._inMap[name] = impl;
            }
            port._orig._impl = impl;
            _push(impl.clients, port._orig);
            port._info = impl.info;
            port._close = function () { impl._close(this); }
            if (!impl.open) {
                if (impl.plugin.ready) impl._start();
                port._pause();
            }
        }
        _engine._closeOut = function (port) {
            var impl = port._impl;
            _pop(impl.clients, port._orig);
            if (!impl.clients.length) {
                impl.open = false;
                document.dispatchEvent(new CustomEvent('jazz-midi', { detail: ['closeout', impl.plugin.id] }));
            }
        }
        _engine._closeIn = function (port) {
            var impl = port._impl;
            _pop(impl.clients, port._orig);
            if (!impl.clients.length) {
                impl.open = false;
                document.dispatchEvent(new CustomEvent('jazz-midi', { detail: ['closein', impl.plugin.id] }));
            }
        }
        _engine._close = function () {
        }
        document.addEventListener('jazz-midi-msg', function (e) {
            var v = _engine._msg.innerText.split('\n');
            _engine._msg.innerText = '';
            for (var i = 0; i < v.length; i++) {
                var a = [];
                try { a = JSON.parse(v[i]); } catch (e) { }
                if (!a.length) continue;
                if (a[0] === 'refresh') {
                    if (a[1].ins) {
                        for (var j = 0; i < a[1].ins; i++) a[1].ins[j].type = _engine._type;
                        _engine._ins = a[1].ins;
                    }
                    if (a[1].outs) {
                        for (var j = 0; i < a[1].outs; i++) a[1].outs[j].type = _engine._type;
                        _engine._outs = a[1].outs;
                    }
                    _jzz._resume();
                }
                else if (a[0] === 'version') {
                    var plugin = _engine._pool[a[1]];
                    if (plugin) {
                        plugin.ready = true;
                        if (plugin.input) plugin.input._start();
                        if (plugin.output) plugin.output._start();
                    }
                }
                else if (a[0] === 'openout') {
                    var impl = _engine._pool[a[1]].output;
                    if (impl) {
                        if (a[2] == impl.name) {
                            impl.open = true;
                            if (impl.clients) for (var i = 0; i < impl.clients.length; i++) impl.clients[i]._resume();
                        }
                        else if (impl.clients) for (var i = 0; i < impl.clients.length; i++) impl.clients[i]._crash();
                    }
                }
                else if (a[0] === 'openin') {
                    var impl = _engine._pool[a[1]].input;
                    if (impl) {
                        if (a[2] == impl.name) {
                            impl.open = true;
                            if (impl.clients) for (var i = 0; i < impl.clients.length; i++) impl.clients[i]._resume();
                        }
                        else if (impl.clients) for (var i = 0; i < impl.clients.length; i++) impl.clients[i]._crash();
                    }
                }
                else if (a[0] === 'midi') {
                    var impl = _engine._pool[a[1]].input;
                    if (impl && impl.clients) {
                        for (var i = 0; i < impl.clients.length; i++) {
                            var msg = MIDI(a.slice(3));
                            impl.clients[i]._emit(msg);
                        }
                    }
                }
            }
        });
    }

    var JZZ = function (opt) {
        if (!_jzz) _initJZZ(opt);
        return _jzz;
    }
    JZZ.info = function () { return _J.prototype.info(); }
    JZZ.createNew = function (arg) {
        var obj = new _M();
        if (arg instanceof Object) for (var k in arg) if (arg.hasOwnProperty(k)) obj[k] = arg[k];
        obj._resume();
        return obj;
    }
    _J.prototype.createNew = JZZ.createNew;

    // JZZ.SMPTE

    function SMPTE() {
        var self = this instanceof SMPTE ? this : self = new SMPTE();
        SMPTE.prototype.reset.apply(self, arguments);
        return self;
    }
    SMPTE.prototype.reset = function (arg) {
        if (arg instanceof SMPTE) {
            this.setType(arg.getType());
            this.setHour(arg.getHour());
            this.setMinute(arg.getMinute());
            this.setSecond(arg.getSecond());
            this.setFrame(arg.getFrame());
            this.setQuarter(arg.getQuarter());
            return this;
        }
        var arr = arg instanceof Array ? arg : arguments;
        this.setType(arr[0]);
        this.setHour(arr[1]);
        this.setMinute(arr[2]);
        this.setSecond(arr[3]);
        this.setFrame(arr[4]);
        this.setQuarter(arr[5]);
        return this;
    }
    function _fixDropFrame() { if (this.type == 29.97 && !this.second && this.frame < 2 && this.minute % 10) this.frame = 2; }
    SMPTE.prototype.isFullFrame = function () { return this.quarter == 0 || this.quarter == 4; }
    SMPTE.prototype.getType = function () { return this.type; }
    SMPTE.prototype.getHour = function () { return this.hour; }
    SMPTE.prototype.getMinute = function () { return this.minute; }
    SMPTE.prototype.getSecond = function () { return this.second; }
    SMPTE.prototype.getFrame = function () { return this.frame; }
    SMPTE.prototype.getQuarter = function () { return this.quarter; }
    SMPTE.prototype.setType = function (x) {
        if (typeof x == 'undefined' || x == 24) this.type = 24;
        else if (x == 25) this.type = 25;
        else if (x == 29.97) { this.type = 29.97; _fixDropFrame.apply(this); }
        else if (x == 30) this.type = 30;
        else throw RangeError('Bad SMPTE frame rate: ' + x);
        if (this.frame >= this.type) this.frame = this.type == 29.97 ? 29 : this.type - 1;
        return this;
    }
    SMPTE.prototype.setHour = function (x) {
        if (typeof x == 'undefined') x = 0;
        if (x != parseInt(x) || x < 0 || x >= 24) throw RangeError('Bad SMPTE hours value: ' + x);
        this.hour = x;
        return this;
    }
    SMPTE.prototype.setMinute = function (x) {
        if (typeof x == 'undefined') x = 0;
        if (x != parseInt(x) || x < 0 || x >= 60) throw RangeError('Bad SMPTE minutes value: ' + x);
        this.minute = x;
        _fixDropFrame.apply(this);
        return this;
    }
    SMPTE.prototype.setSecond = function (x) {
        if (typeof x == 'undefined') x = 0;
        if (x != parseInt(x) || x < 0 || x >= 60) throw RangeError('Bad SMPTE seconds value: ' + x);
        this.second = x;
        _fixDropFrame.apply(this);
        return this;
    }
    SMPTE.prototype.setFrame = function (x) {
        if (typeof x == 'undefined') x = 0;
        if (x != parseInt(x) || x < 0 || x >= this.type) throw RangeError('Bad SMPTE frame number: ' + x);
        this.frame = x;
        _fixDropFrame.apply(this);
        return this;
    }
    SMPTE.prototype.setQuarter = function (x) {
        if (typeof x == 'undefined') x = 0;
        if (x != parseInt(x) || x < 0 || x >= 8) throw RangeError('Bad SMPTE quarter frame: ' + x);
        this.quarter = x;
        return this;
    }
    SMPTE.prototype.incrFrame = function () {
        this.frame++;
        if (this.frame >= this.type) {
            this.frame = 0;
            this.second++;
            if (this.second >= 60) {
                this.second = 0;
                this.minute++;
                if (this.minute >= 60) {
                    this.minute = 0;
                    this.hour = this.hour >= 23 ? 0 : this.hour + 1;
                }
            }
        }
        _fixDropFrame.apply(this);
        return this;
    }
    SMPTE.prototype.decrFrame = function () {
        if (!this.second && this.frame == 2 && this.type == 29.97 && this.minute % 10) this.frame = 0; // drop-frame
        this.frame--;
        if (this.frame < 0) {
            this.frame = this.type == 29.97 ? 29 : this.type - 1;
            this.second--;
            if (this.second < 0) {
                this.second = 59;
                this.minute--;
                if (this.minute < 0) {
                    this.minute = 59;
                    this.hour = this.hour ? this.hour - 1 : 23;
                }
            }
        }
        return this;
    }
    SMPTE.prototype.incrQF = function () {
        this.backwards = false;
        this.quarter = (this.quarter + 1) & 7;
        if (this.quarter == 0 || this.quarter == 4) this.incrFrame();
        return this;
    }
    SMPTE.prototype.decrQF = function () {
        this.backwards = true;
        this.quarter = (this.quarter + 7) & 7;
        if (this.quarter == 3 || this.quarter == 7) this.decrFrame();
        return this;
    }
    function _825(a) { return [[24, 25, 29.97, 30][(a[7] >> 1) & 3], ((a[7] & 1) << 4) | a[6], (a[5] << 4) | a[4], (a[3] << 4) | a[2], (a[1] << 4) | a[0]]; }
    SMPTE.prototype.read = function (m) {
        if (!(m instanceof MIDI)) m = MIDI.apply(null, arguments);
        if (m[0] == 0xf0 && m[1] == 0x7f && m[3] == 1 && m[4] == 1 && m[9] == 0xf7) {
            this.type = [24, 25, 29.97, 30][(m[5] >> 5) & 3];
            this.hour = m[5] & 31;
            this.minute = m[6];
            this.second = m[7];
            this.frame = m[8];
            this.quarter = 0;
            this._ = undefined;
            this._b = undefined;
            this._f = undefined;
            return true;
        }
        if (m[0] == 0xf1 && typeof m[1] != 'undefined') {
            var q = m[1] >> 4;
            var n = m[1] & 15;
            if (q == 0) {
                if (this._ == 7) {
                    if (this._f == 7) {
                        this.reset(_825(this._a));
                        this.incrFrame();
                    }
                    this.incrFrame();
                }
            }
            else if (q == 3) {
                if (this._ == 4) {
                    this.decrFrame();
                }
            }
            else if (q == 4) {
                if (this._ == 3) {
                    this.incrFrame();
                }
            }
            else if (q == 7) {
                if (this._ === 0) {
                    if (this._b === 0) {
                        this.reset(_825(this._a));
                        this.decrFrame();
                    }
                    this.decrFrame();
                }
            }
            if (!this._a) this._a = [];
            this._a[q] = n;
            this._f = this._f === q - 1 || q == 0 ? q : undefined;
            this._b = this._b === q + 1 || q == 7 ? q : undefined;
            this._ = q;
            this.quarter = q;
            return true;
        }
        return false;
    }
    function _mtc(t) {
        if (!t.backwards && t.quarter >= 4) t.decrFrame(); // continue encoding previous frame
        else if (t.backwards && t.quarter < 4) t.incrFrame();
        var ret;
        switch (t.quarter >> 1) {
            case 0: ret = t.frame; break;
            case 1: ret = t.second; break;
            case 2: ret = t.minute; break;
            default: ret = t.hour;
        }
        if (t.quarter & 1) ret >>= 4;
        else ret &= 15;
        if (t.quarter == 7) {
            if (t.type == 25) ret |= 2;
            else if (t.type == 29.97) ret |= 4;
            else if (t.type == 30) ret |= 6;
        }
        if (!t.backwards && t.quarter >= 4) t.incrFrame();
        else if (t.backwards && t.quarter < 4) t.decrFrame();
        return ret | (t.quarter << 4);
    }
    function _hrtype(t) {
        if (t.type == 25) return t.hour | 0x20;
        if (t.type == 29.97) return t.hour | 0x40;
        if (t.type == 30) return t.hour | 0x60;
        return t.hour;
    }
    function _dec(x) { return x < 10 ? '0' + x : x; }
    SMPTE.prototype.toString = function () { return [_dec(this.hour), _dec(this.minute), _dec(this.second), _dec(this.frame)].join(':'); }
    JZZ.SMPTE = SMPTE;

    // JZZ.MIDI

    function MIDI(arg) {
        var self = this instanceof MIDI ? this : self = new MIDI();
        self._from = arg instanceof MIDI ? arg._from.slice() : [];
        if (!arguments.length) return self;
        var arr = arg instanceof Array ? arg : arguments;
        for (var i = 0; i < arr.length; i++) {
            var n = arr[i];
            if (i == 1 && self[0] >= 0x80 && self[0] <= 0xAF) n = MIDI.noteValue(n);
            if (n != parseInt(n) || n < 0 || n > 255) _throw(arr[i]);
            self.push(n);
        }
        return self;
    }
    MIDI.prototype = [];
    MIDI.prototype.constructor = MIDI;
    var _noteNum = {};
    MIDI.noteValue = function (x) { return _noteNum[x.toString().toLowerCase()]; }

    var _noteMap = { c: 0, d: 2, e: 4, f: 5, g: 7, a: 9, b: 11, h: 11 };
    for (var k in _noteMap) {
        if (!_noteMap.hasOwnProperty(k)) continue;
        for (var n = 0; n < 12; n++) {
            var m = _noteMap[k] + n * 12;
            if (m > 127) break;
            _noteNum[k + n] = m;
            if (m > 0) { _noteNum[k + 'b' + n] = m - 1; _noteNum[k + 'bb' + n] = m - 2; }
            if (m < 127) { _noteNum[k + '#' + n] = m + 1; _noteNum[k + '##' + n] = m + 2; }
        }
    }
    for (var n = 0; n < 128; n++) _noteNum[n] = n;
    function _throw(x) { throw RangeError('Bad MIDI value: ' + x); }
    function _ch(n) { if (n != parseInt(n) || n < 0 || n > 0xf) _throw(n); return n; }
    function _7b(n) { if (n != parseInt(n) || n < 0 || n > 0x7f) _throw(n); return n; }
    function _lsb(n) { if (n != parseInt(n) || n < 0 || n > 0x3fff) _throw(n); return n & 0x7f; }
    function _msb(n) { if (n != parseInt(n) || n < 0 || n > 0x3fff) _throw(n); return n >> 7; }
    var _helper = {
        noteOff: function (c, n) { return [0x80 + _ch(c), _7b(MIDI.noteValue(n)), 0]; },
        noteOn: function (c, n, v) { return [0x90 + _ch(c), _7b(MIDI.noteValue(n)), _7b(v)]; },
        aftertouch: function (c, n, v) { return [0xA0 + _ch(c), _7b(MIDI.noteValue(n)), _7b(v)]; },
        control: function (c, n, v) { return [0xB0 + _ch(c), _7b(n), _7b(v)]; },
        program: function (c, n) { return [0xC0 + _ch(c), _7b(n)]; },
        pressure: function (c, n) { return [0xD0 + _ch(c), _7b(n)]; },
        pitchBend: function (c, n) { return [0xE0 + _ch(c), _lsb(n), _msb(n)]; },
        bankMSB: function (c, n) { return [0xB0 + _ch(c), 0x00, _7b(n)]; },
        bankLSB: function (c, n) { return [0xB0 + _ch(c), 0x20, _7b(n)]; },
        modMSB: function (c, n) { return [0xB0 + _ch(c), 0x01, _7b(n)]; },
        modLSB: function (c, n) { return [0xB0 + _ch(c), 0x21, _7b(n)]; },
        breathMSB: function (c, n) { return [0xB0 + _ch(c), 0x02, _7b(n)]; },
        breathLSB: function (c, n) { return [0xB0 + _ch(c), 0x22, _7b(n)]; },
        footMSB: function (c, n) { return [0xB0 + _ch(c), 0x04, _7b(n)]; },
        footLSB: function (c, n) { return [0xB0 + _ch(c), 0x24, _7b(n)]; },
        portamentoMSB: function (c, n) { return [0xB0 + _ch(c), 0x05, _7b(n)]; },
        portamentoLSB: function (c, n) { return [0xB0 + _ch(c), 0x25, _7b(n)]; },
        volumeMSB: function (c, n) { return [0xB0 + _ch(c), 0x07, _7b(n)]; },
        volumeLSB: function (c, n) { return [0xB0 + _ch(c), 0x27, _7b(n)]; },
        balanceMSB: function (c, n) { return [0xB0 + _ch(c), 0x08, _7b(n)]; },
        balanceLSB: function (c, n) { return [0xB0 + _ch(c), 0x28, _7b(n)]; },
        panMSB: function (c, n) { return [0xB0 + _ch(c), 0x0A, _7b(n)]; },
        panLSB: function (c, n) { return [0xB0 + _ch(c), 0x2A, _7b(n)]; },
        expressionMSB: function (c, n) { return [0xB0 + _ch(c), 0x0B, _7b(n)]; },
        expressionLSB: function (c, n) { return [0xB0 + _ch(c), 0x2B, _7b(n)]; },
        damper: function (c, b) { return [0xB0 + _ch(c), 0x40, b ? 127 : 0]; },
        portamento: function (c, b) { return [0xB0 + _ch(c), 0x41, b ? 127 : 0]; },
        sostenuto: function (c, b) { return [0xB0 + _ch(c), 0x42, b ? 127 : 0]; },
        soft: function (c, b) { return [0xB0 + _ch(c), 0x43, b ? 127 : 0]; },
        allSoundOff: function (c) { return [0xB0 + _ch(c), 0x78, 0]; },
        allNotesOff: function (c) { return [0xB0 + _ch(c), 0x7b, 0]; },
        mtc: function (t) { return [0xF1, _mtc(t)]; },
        songPosition: function (n) { return [0xF2, _lsb(n), _msb(n)]; },
        songSelect: function (n) { return [0xF3, _7b(n)]; },
        tune: function () { return [0xF6]; },
        clock: function () { return [0xF8]; },
        start: function () { return [0xFA]; },
        continue: function () { return [0xFB]; },
        stop: function () { return [0xFC]; },
        active: function () { return [0xFE]; },
        sxIdRequest: function () { return [0xF0, 0x7E, 0x7F, 0x06, 0x01, 0xF7]; },
        sxFullFrame: function (t) { return [0xF0, 0x7F, 0x7F, 0x01, 0x01, _hrtype(t), t.getMinute(), t.getSecond(), t.getFrame(), 0xF7]; },
        reset: function () { return [0xFF]; }
    };
    function _copyHelper(name, func) {
        MIDI[name] = function () { return new MIDI(func.apply(0, arguments)); };
        _M.prototype[name] = function () { this.send(func.apply(0, arguments)); return this; };
    }
    for (var k in _helper) if (_helper.hasOwnProperty(k)) _copyHelper(k, _helper[k]);

    var _channelMap = { a: 10, b: 11, c: 12, d: 13, e: 14, f: 15, A: 10, B: 11, C: 12, D: 13, E: 14, F: 15 };
    for (var k = 0; k < 16; k++) _channelMap[k] = k;
    MIDI.prototype.getChannel = function () {
        var c = this[0];
        if (typeof c == 'undefined' || c < 0x80 || c > 0xef) return;
        return c & 15;
    }
    MIDI.prototype.setChannel = function (x) {
        var c = this[0];
        if (typeof c == 'undefined' || c < 0x80 || c > 0xef) return this;
        x = _channelMap[x];
        if (typeof x != 'undefined') this[0] = (c & 0xf0) | x;
        return this;
    }
    MIDI.prototype.getNote = function () {
        var c = this[0];
        if (typeof c == 'undefined' || c < 0x80 || c > 0xaf) return;
        return this[1];
    }
    MIDI.prototype.setNote = function (x) {
        var c = this[0];
        if (typeof c == 'undefined' || c < 0x80 || c > 0xaf) return this;
        x = MIDI.noteValue(x);
        if (typeof x != 'undefined') this[1] = x;
        return this;
    }
    MIDI.prototype.getVelocity = function () {
        var c = this[0];
        if (typeof c == 'undefined' || c < 0x90 || c > 0x9f) return;
        return this[2];
    }
    MIDI.prototype.setVelocity = function (x) {
        var c = this[0];
        if (typeof c == 'undefined' || c < 0x90 || c > 0x9f) return this;
        x = parseInt(x);
        if (x >= 0 && x < 128) this[2] = x;
        return this;
    }
    MIDI.prototype.getSysExChannel = function () {
        if (this[0] == 0xf0) return this[2];
    }
    MIDI.prototype.setSysExChannel = function (x) {
        if (this[0] == 0xf0 && this.length > 2) {
            x = parseInt(x);
            if (x >= 0 && x < 128) this[2] = x;
        }
        return this;
    }
    MIDI.prototype.isNoteOn = function () {
        var c = this[0];
        if (typeof c == 'undefined' || c < 0x90 || c > 0x9f) return false;
        return this[2] > 0 ? true : false;
    }
    MIDI.prototype.isNoteOff = function () {
        var c = this[0];
        if (typeof c == 'undefined' || c < 0x80 || c > 0x9f) return false;
        if (c < 0x90) return true;
        return this[2] == 0 ? true : false;
    }
    MIDI.prototype.isSysEx = function () {
        return this[0] == 0xf0;
    }
    MIDI.prototype.isFullSysEx = function () {
        return this[0] == 0xf0 && this[this.length - 1] == 0xf7;
    }

    function _hex(x) {
        var a = [];
        for (var i = 0; i < x.length; i++) {
            a[i] = (x[i] < 16 ? '0' : '') + x[i].toString(16);
        }
        return a.join(' ');
    }
    MIDI.prototype.toString = function () {
        if (!this.length) return 'empty';
        var s = _hex(this);
        if (this[0] < 0x80) return s;
        var ss = {
            241: 'MIDI Time Code',
            242: 'Song Position',
            243: 'Song Select',
            244: 'Undefined',
            245: 'Undefined',
            246: 'Tune request',
            248: 'Timing clock',
            249: 'Undefined',
            250: 'Start',
            251: 'Continue',
            252: 'Stop',
            253: 'Undefined',
            254: 'Active Sensing',
            255: 'Reset'
        }[this[0]];
        if (ss) return s + ' -- ' + ss;
        var c = this[0] >> 4;
        ss = { 8: 'Note Off', 10: 'Aftertouch', 12: 'Program Change', 13: 'Channel Aftertouch', 14: 'Pitch Wheel' }[c];
        if (ss) return s + ' -- ' + ss;
        if (c == 9) return s + ' -- ' + (this[2] ? 'Note On' : 'Note Off');
        if (c != 11) return s;
        ss = {
            0: 'Bank Select MSB',
            1: 'Modulation Wheel MSB',
            2: 'Breath Controller MSB',
            4: 'Foot Controller MSB',
            5: 'Portamento Time MSB',
            6: 'Data Entry MSB',
            7: 'Channel Volume MSB',
            8: 'Balance MSB',
            10: 'Pan MSB',
            11: 'Expression Controller MSB',
            12: 'Effect Control 1 MSB',
            13: 'Effect Control 2 MSB',
            16: 'General Purpose Controller 1 MSB',
            17: 'General Purpose Controller 2 MSB',
            18: 'General Purpose Controller 3 MSB',
            19: 'General Purpose Controller 4 MSB',
            32: 'Bank Select LSB',
            33: 'Modulation Wheel LSB',
            34: 'Breath Controller LSB',
            36: 'Foot Controller LSB',
            37: 'Portamento Time LSB',
            38: 'Data Entry LSB',
            39: 'Channel Volume LSB',
            40: 'Balance LSB',
            42: 'Pan LSB',
            43: 'Expression Controller LSB',
            44: 'Effect control 1 LSB',
            45: 'Effect control 2 LSB',
            48: 'General Purpose Controller 1 LSB',
            49: 'General Purpose Controller 2 LSB',
            50: 'General Purpose Controller 3 LSB',
            51: 'General Purpose Controller 4 LSB',
            64: 'Damper Pedal On/Off',
            65: 'Portamento On/Off',
            66: 'Sostenuto On/Off',
            67: 'Soft Pedal On/Off',
            68: 'Legato Footswitch',
            69: 'Hold 2',
            70: 'Sound Controller 1',
            71: 'Sound Controller 2',
            72: 'Sound Controller 3',
            73: 'Sound Controller 4',
            74: 'Sound Controller 5',
            75: 'Sound Controller 6',
            76: 'Sound Controller 7',
            77: 'Sound Controller 8',
            78: 'Sound Controller 9',
            79: 'Sound Controller 10',
            80: 'General Purpose Controller 5',
            81: 'General Purpose Controller 6',
            82: 'General Purpose Controller 7',
            83: 'General Purpose Controller 8',
            84: 'Portamento Control',
            88: 'High Resolution Velocity Prefix',
            91: 'Effects 1 Depth',
            92: 'Effects 2 Depth',
            93: 'Effects 3 Depth',
            94: 'Effects 4 Depth',
            95: 'Effects 5 Depth',
            96: 'Data Increment',
            97: 'Data Decrement',
            98: 'Non-Registered Parameter Number LSB',
            99: 'Non-Registered Parameter Number MSB',
            100: 'Registered Parameter Number LSB',
            101: 'Registered Parameter Number MSB',
            120: 'All Sound Off',
            121: 'Reset All Controllers',
            122: 'Local Control On/Off',
            123: 'All Notes Off',
            124: 'Omni Mode Off',
            125: 'Omni Mode On',
            126: 'Mono Mode On',
            127: 'Poly Mode On'
        }[this[1]];
        if (!ss) ss = 'Undefined';
        return s + ' -- ' + ss;
    }
    MIDI.prototype._stamp = function (obj) { this._from.push(obj._orig ? obj._orig : obj); return this; }
    MIDI.prototype._unstamp = function (obj) {
        if (typeof obj == 'undefined') this._from = [];
        else {
            if (obj._orig) obj = obj._orig;
            var i = this._from.indexOf(obj);
            if (i > -1) this._from.splice(i, 1);
        }
        return this;
    }
    MIDI.prototype._stamped = function (obj) {
        if (obj._orig) obj = obj._orig;
        for (var i = 0; i < this._from.length; i++) if (this._from[i] == obj) return true;
        return false;
    }

    JZZ.MIDI = MIDI;

    JZZ.lib = {};
    JZZ.lib.openMidiOut = function (name, engine) {
        var port = new _M();
        engine._openOut(port, name);
        return port;
    }
    JZZ.lib.openMidiIn = function (name, engine) {
        var port = new _M();
        engine._openIn(port, name);
        return port;
    }
    JZZ.lib.registerMidiOut = function (name, engine) {
        var x = engine._info(name);
        for (var i = 0; i < _virtual._outs.length; i++) if (_virtual._outs[i].name == x.name) return false;
        x.engine = engine;
        _virtual._outs.push(x);
        if (_jzz && _jzz._bad) { _jzz._repair(); _jzz._resume(); }
        return true;
    }
    JZZ.lib.registerMidiIn = function (name, engine) {
        var x = engine._info(name);
        for (var i = 0; i < _virtual._ins.length; i++) if (_virtual._ins[i].name == x.name) return false;
        x.engine = engine;
        _virtual._ins.push(x);
        if (_jzz && _jzz._bad) { _jzz._repair(); _jzz._resume(); }
        return true;
    }
    var _ac;
    JZZ.lib.getAudioContext = function () { return _ac; }
    if (window) {
        var AudioContext = window.AudioContext || window.webkitAudioContext;
        if (AudioContext) _ac = new AudioContext();
        if (_ac && !_ac.createGain) _ac.createGain = _ac.createGainNode;
        function _activateAudioContext() {
            if (_ac.state != 'running') {
                _ac.resume();
                var osc = _ac.createOscillator();
                var gain = _ac.createGain();
                gain.gain.setTargetAtTime(0, _ac.currentTime, 0.01);
                osc.connect(gain);
                gain.connect(_ac.destination);
                if (!osc.start) osc.start = osc.noteOn;
                if (!osc.stop) osc.stop = osc.noteOff;
                osc.start(.1); osc.stop(0.11);
            }
            else {
                document.removeEventListener('touchend', _activateAudioContext);
                document.removeEventListener('mousedown', _activateAudioContext);
                document.removeEventListener('keydown', _activateAudioContext);
            }
        }
        document.addEventListener('touchend', _activateAudioContext);
        document.addEventListener('mousedown', _activateAudioContext);
        document.addEventListener('keydown', _activateAudioContext);
        _activateAudioContext();
    }

    JZZ.util = {};
    JZZ.util.iosSound = function () {
        // deprecated. will be removed in next version
    }
    return JZZ;
}

},{"jazz-midi":1}],4:[function(require,module,exports){
// shim for using process in browser
var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
    throw new Error('clearTimeout has not been defined');
}
(function () {
    try {
        if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
        } else {
            cachedSetTimeout = defaultSetTimout;
        }
    } catch (e) {
        cachedSetTimeout = defaultSetTimout;
    }
    try {
        if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
        } else {
            cachedClearTimeout = defaultClearTimeout;
        }
    } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
    }
} ())
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;
process.prependListener = noop;
process.prependOnceListener = noop;

process.listeners = function (name) { return [] }

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}],5:[function(require,module,exports){
'use strict';

var _midi_access = require('./midi/midi_access');

var _util = require('./util/util');

var _midi_input = require('./midi/midi_input');

var Input = _interopRequireWildcard(_midi_input);

var _midi_output = require('./midi/midi_output');

var Output = _interopRequireWildcard(_midi_output);

var _midimessage_event = require('./midi/midimessage_event');

var _midimessage_event2 = _interopRequireDefault(_midimessage_event);

var _midiconnection_event = require('./midi/midiconnection_event');

var _midiconnection_event2 = _interopRequireDefault(_midiconnection_event);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

// import MIDIInput from './midi/midi_input';
// import MIDIOutput from './midi/midi_output';
var midiAccess = void 0;

var init = function init() {
    if (!navigator.requestMIDIAccess) {
        // Add some functionality to older browsers
        (0, _util.polyfill)();

        navigator.requestMIDIAccess = function () {
            // Singleton-ish, no need to create multiple instances of MIDIAccess
            if (midiAccess === undefined) {
                midiAccess = (0, _midi_access.createMIDIAccess)();
                // Add global vars that mimic WebMIDI API native globals
                var scope = (0, _util.getScope)();
                scope.MIDIInput = Input;
                scope.MIDIOutput = Output;
                scope.MIDIMessageEvent = _midimessage_event2.default;
                scope.MIDIConnectionEvent = _midiconnection_event2.default;
            }
            return midiAccess;
        };
        if ((0, _util.getDevice)().nodejs === true) {
            navigator.close = function () {
                // For Nodejs applications we need to add a method that closes all MIDI input ports,
                // otherwise Nodejs will wait for MIDI input forever.
                (0, _midi_access.closeAllMIDIInputs)();
            };
        }
    }
};

init();

},{"./midi/midi_access":6,"./midi/midi_input":7,"./midi/midi_output":8,"./midi/midiconnection_event":9,"./midi/midimessage_event":10,"./util/util":12}],6:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }(); /*
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       Creates a MIDIAccess instance:
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       - Creates MIDIInput and MIDIOutput instances for the initially connected MIDI devices.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       - Keeps track of newly connected devices and creates the necessary instances of MIDIInput and MIDIOutput.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       - Keeps track of disconnected devices and removes them from the inputs and/or outputs map.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       - Creates a unique id for every device and stores these ids by the name of the device:
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         so when a device gets disconnected and reconnected again, it will still have the same id. This
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         is in line with the behavior of the native MIDIAccess object.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     */


exports.getMIDIPorts = getMIDIPorts;
exports.createMIDIAccess = createMIDIAccess;
exports.dispatchEvent = dispatchEvent;
exports.closeAllMIDIInputs = closeAllMIDIInputs;

var _jzz = require('jzz');

var _jzz2 = _interopRequireDefault(_jzz);

var _midi_input = require('./midi_input');

var _midi_input2 = _interopRequireDefault(_midi_input);

var _midi_output = require('./midi_output');

var _midi_output2 = _interopRequireDefault(_midi_output);

var _midiconnection_event = require('./midiconnection_event');

var _midiconnection_event2 = _interopRequireDefault(_midiconnection_event);

var _util = require('../util/util');

var _store = require('../util/store');

var _store2 = _interopRequireDefault(_store);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var midiAccess = void 0;
var listeners = new _store2.default();
var midiInputs = new _store2.default();
var midiOutputs = new _store2.default();

var MIDIAccess = function () {
    function MIDIAccess(inputs, outputs) {
        _classCallCheck(this, MIDIAccess);

        this.sysexEnabled = true;
        this.inputs = inputs;
        this.outputs = outputs;
    }

    _createClass(MIDIAccess, [{
        key: 'addEventListener',
        value: function addEventListener(type, listener) {
            if (type !== 'statechange') {
                return;
            }
            if (listeners.has(listener) === false) {
                listeners.add(listener);
            }
        }
    }, {
        key: 'removeEventListener',
        value: function removeEventListener(type, listener) {
            if (type !== 'statechange') {
                return;
            }
            if (listeners.has(listener) === true) {
                listeners.delete(listener);
            }
        }
    }]);

    return MIDIAccess;
}();

function getMIDIPorts() {
    midiInputs.clear();
    midiOutputs.clear();
    (0, _jzz2.default)().info().inputs.forEach(function (info) {
        var port = new _midi_input2.default(info);
        midiInputs.set(port.id, port);
        // midiInputIds.set(port.name, port.id);
    });
    (0, _jzz2.default)().info().outputs.forEach(function (info) {
        var port = new _midi_output2.default(info);
        midiOutputs.set(port.id, port);
        // midiOutputIds.set(port.name, port.id);
    });
}

function createMIDIAccess() {
    return new Promise(function (resolve, reject) {
        if (typeof midiAccess !== 'undefined') {
            resolve(midiAccess);
            return;
        }

        if ((0, _util.getDevice)().browser === 'ie9') {
            reject({ message: 'WebMIDIAPIShim supports Internet Explorer 10 and above.' });
            return;
        }
        (0, _jzz2.default)({ engine: ['plugin', 'extension', 'webmidi'] }).or(function () {
            reject({ message: 'No access to MIDI devices: your browser does not support the WebMIDI API and the Jazz extension (or Jazz plugin) is not installed.' });
        }).and(function () {
            getMIDIPorts();
            midiAccess = new MIDIAccess(midiInputs, midiOutputs);
            resolve(midiAccess);
        }).err(function (msg) {
            reject(msg);
        });
    });
}

// when a device gets connected/disconnected both the port and MIDIAccess dispatch a MIDIConnectionEvent
// therefor we call the ports dispatchEvent function here as well
function dispatchEvent(port) {
    port.dispatchEvent(new _midiconnection_event2.default(port, port));

    var evt = new _midiconnection_event2.default(midiAccess, port);

    if (typeof midiAccess.onstatechange === 'function') {
        midiAccess.onstatechange(evt);
    }
    listeners.forEach(function (listener) {
        return listener(evt);
    });
}

function closeAllMIDIInputs() {
    midiInputs.forEach(function (input) {
        // input.close();
        input._jazzInstance.MidiInClose();
    });
}

},{"../util/store":11,"../util/util":12,"./midi_input":7,"./midi_output":8,"./midiconnection_event":9,"jzz":2}],7:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }(); /*
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       MIDIInput is a wrapper around an input of a Jazz instance
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     */


var _jzz = require('jzz');

var _jzz2 = _interopRequireDefault(_jzz);

var _midimessage_event = require('./midimessage_event');

var _midimessage_event2 = _interopRequireDefault(_midimessage_event);

var _midiconnection_event = require('./midiconnection_event');

var _midiconnection_event2 = _interopRequireDefault(_midiconnection_event);

var _midi_access = require('./midi_access');

var _util = require('../util/util');

var _store = require('../util/store');

var _store2 = _interopRequireDefault(_store);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var MIDIInput = function () {
    function MIDIInput(info) {
        _classCallCheck(this, MIDIInput);

        this.id = info.id || (0, _util.generateUUID)();
        this.name = info.name;
        this.manufacturer = info.manufacturer;
        this.version = info.version;
        this.type = 'input';
        this.state = 'connected';
        this.connection = 'pending';
        this.port = null;

        this.onstatechange = null;
        this._onmidimessage = null;

        // because we need to implicitly open the device when an onmidimessage handler gets added
        // we define a setter that opens the device if the set value is a function
        Object.defineProperty(this, 'onmidimessage', {
            set: function set(value) {
                var _this = this;

                this._onmidimessage = value;
                if (typeof value === 'function') {
                    if (this.port === null) {
                        this.open();
                    }
                    this.port.connect(function (msg) {
                        var m = new _midimessage_event2.default(_this, msg);
                        value(m);
                    });
                }
            }
        });

        this._listeners = new _store2.default().set('midimessage', new _store2.default()).set('statechange', new _store2.default());
    }

    _createClass(MIDIInput, [{
        key: 'addEventListener',
        value: function addEventListener(type, listener) {
            var listeners = this._listeners.get(type);
            if (typeof listeners === 'undefined') {
                return;
            }

            if (listeners.has(listener) === false) {
                listeners.add(listener);
            }
        }
    }, {
        key: 'removeEventListener',
        value: function removeEventListener(type, listener) {
            var listeners = this._listeners.get(type);
            if (typeof listeners === 'undefined') {
                return;
            }

            if (listeners.has(listener) === true) {
                listeners.delete(listener);
            }
        }
    }, {
        key: 'dispatchEvent',
        value: function dispatchEvent(evt) {
            var listeners = this._listeners.get(evt.type);
            listeners.forEach(function (listener) {
                listener(evt);
            });

            if (evt.type === 'midimessage') {
                if (this._onmidimessage !== null) {
                    this._onmidimessage(evt);
                }
            } else if (evt.type === 'statechange') {
                if (this.onstatechange !== null) {
                    this.onstatechange(evt);
                }
            }
        }
    }, {
        key: 'open',
        value: function open() {
            var _this2 = this;

            if (this.connection === 'open') {
                return;
            }
            this.port = (0, _jzz2.default)().openMidiIn(this.name).or('Could not open input ' + this.name).and(function () {
                _this2.connection = 'open';
                (0, _midi_access.dispatchEvent)(_this2); // dispatch MIDIConnectionEvent via MIDIAccess
            });
        }
    }, {
        key: 'close',
        value: function close() {
            var _this3 = this;

            if (this.connection === 'closed') {
                return;
            }
            this.port.close().or('Could not close input ' + this.name).and(function () {
                _this3.connection = 'closed';
                _this3.port = null;
                _this3._onmidimessage = null;
                _this3.onstatechange = null;
                _this3._listeners.get('midimessage').clear();
                _this3._listeners.get('statechange').clear();
                (0, _midi_access.dispatchEvent)(_this3); // dispatch MIDIConnectionEvent via MIDIAccess
            });
        }
    }]);

    return MIDIInput;
}();

exports.default = MIDIInput;

},{"../util/store":11,"../util/util":12,"./midi_access":6,"./midiconnection_event":9,"./midimessage_event":10,"jzz":2}],8:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }(); /*
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       MIDIOutput is a wrapper around an output of a Jazz instance
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     */


var _jzz = require('jzz');

var _jzz2 = _interopRequireDefault(_jzz);

var _util = require('../util/util');

var _store = require('../util/store');

var _store2 = _interopRequireDefault(_store);

var _midi_access = require('./midi_access');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var MIDIOutput = function () {
    function MIDIOutput(info) {
        _classCallCheck(this, MIDIOutput);

        this.id = info.id || (0, _util.generateUUID)();
        this.name = info.name;
        this.manufacturer = info.manufacturer;
        this.version = info.version;
        this.type = 'output';
        this.state = 'connected';
        this.connection = 'pending';
        this.onmidimessage = null;
        this.onstatechange = null;
        this.port = null;

        this._listeners = new _store2.default();
    }

    _createClass(MIDIOutput, [{
        key: 'open',
        value: function open() {
            var _this = this;

            if (this.connection === 'open') {
                return;
            }
            this.port = (0, _jzz2.default)().openMidiOut(this.name).or('Could not open input ' + this.name).and(function () {
                _this.connection = 'open';
                (0, _midi_access.dispatchEvent)(_this); // dispatch MIDIConnectionEvent via MIDIAccess
            });
        }
    }, {
        key: 'close',
        value: function close() {
            var _this2 = this;

            if (this.connection === 'closed') {
                return;
            }
            this.port.close().or('Could not close output ' + this.name).and(function () {
                (0, _midi_access.dispatchEvent)(_this2); // dispatch MIDIConnectionEvent via MIDIAccess
                _this2.connection = 'closed';
                _this2.onstatechange = null;
                _this2._listeners.clear();
            });
        }
    }, {
        key: 'send',
        value: function send(data) {
            var timestamp = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;

            var delayBeforeSend = 0;
            if (timestamp !== 0) {
                delayBeforeSend = Math.floor(timestamp - performance.now());
            }

            this.port.wait(delayBeforeSend).send(data);

            return true;
        }
    }, {
        key: 'clear',
        value: function clear() {
            // to be implemented
        }
    }, {
        key: 'addEventListener',
        value: function addEventListener(type, listener) {
            if (type !== 'statechange') {
                return;
            }

            if (this._listeners.has(listener) === false) {
                this._listeners.add(listener);
            }
        }
    }, {
        key: 'removeEventListener',
        value: function removeEventListener(type, listener) {
            if (type !== 'statechange') {
                return;
            }

            if (this._listeners.has(listener) === true) {
                this._listeners.delete(listener);
            }
        }
    }, {
        key: 'dispatchEvent',
        value: function dispatchEvent(evt) {
            this._listeners.forEach(function (listener) {
                listener(evt);
            });

            if (this.onstatechange !== null) {
                this.onstatechange(evt);
            }
        }
    }]);

    return MIDIOutput;
}();

exports.default = MIDIOutput;

},{"../util/store":11,"../util/util":12,"./midi_access":6,"jzz":2}],9:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var MIDIConnectionEvent = function MIDIConnectionEvent(midiAccess, port) {
    _classCallCheck(this, MIDIConnectionEvent);

    this.bubbles = false;
    this.cancelBubble = false;
    this.cancelable = false;
    this.currentTarget = midiAccess;
    this.defaultPrevented = false;
    this.eventPhase = 0;
    this.path = [];
    this.port = port;
    this.returnValue = true;
    this.srcElement = midiAccess;
    this.target = midiAccess;
    this.timeStamp = Date.now();
    this.type = 'statechange';
};

exports.default = MIDIConnectionEvent;

},{}],10:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var MIDIMessageEvent = function MIDIMessageEvent(port, data, receivedTime) {
    _classCallCheck(this, MIDIMessageEvent);

    this.bubbles = false;
    this.cancelBubble = false;
    this.cancelable = false;
    this.currentTarget = port;
    this.data = data;
    this.defaultPrevented = false;
    this.eventPhase = 0;
    this.path = [];
    this.receivedTime = receivedTime;
    this.returnValue = true;
    this.srcElement = port;
    this.target = port;
    this.timeStamp = Date.now();
    this.type = 'midimessage';
};

exports.default = MIDIMessageEvent;

},{}],11:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

// es5 implementation of both Map and Set

var idIndex = 0;

var Store = function () {
    function Store() {
        _classCallCheck(this, Store);

        this.store = {};
        this.keys = [];
    }

    _createClass(Store, [{
        key: "add",
        value: function add(obj) {
            var id = "" + new Date().getTime() + idIndex;
            idIndex += 1;
            this.keys.push(id);
            this.store[id] = obj;
        }
    }, {
        key: "set",
        value: function set(id, obj) {
            this.keys.push(id);
            this.store[id] = obj;
            return this;
        }
    }, {
        key: "get",
        value: function get(id) {
            return this.store[id];
        }
    }, {
        key: "has",
        value: function has(id) {
            return this.keys.indexOf(id) !== -1;
        }
    }, {
        key: "delete",
        value: function _delete(id) {
            delete this.store[id];
            var index = this.keys.indexOf(id);
            if (index > -1) {
                this.keys.splice(index, 1);
            }
            return this;
        }
    }, {
        key: "values",
        value: function values() {
            var elements = [];
            var l = this.keys.length;
            for (var i = 0; i < l; i += 1) {
                var element = this.store[this.keys[i]];
                elements.push(element);
            }
            return elements;
        }
    }, {
        key: "forEach",
        value: function forEach(cb) {
            var l = this.keys.length;
            for (var i = 0; i < l; i += 1) {
                var element = this.store[this.keys[i]];
                cb(element);
            }
        }
    }, {
        key: "clear",
        value: function clear() {
            this.keys = [];
            this.store = {};
        }
    }]);

    return Store;
}();

exports.default = Store;

},{}],12:[function(require,module,exports){
(function (process,global){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.getScope = getScope;
exports.getDevice = getDevice;
exports.generateUUID = generateUUID;
exports.polyfill = polyfill;
var Scope = void 0;
var device = null;

// check if we are in a browser or in Nodejs
function getScope() {
    if (typeof Scope !== 'undefined') {
        return Scope;
    }
    Scope = null;
    if (typeof window !== 'undefined') {
        Scope = window;
    } else if (typeof global !== 'undefined') {
        Scope = global;
    }
    // console.log('scope', scope);
    return Scope;
}

// check on what type of device we are running, note that in this context
// a device is a computer not a MIDI device
function getDevice() {
    var scope = getScope();
    if (device !== null) {
        return device;
    }

    var platform = 'undetected';
    var browser = 'undetected';

    if (scope.navigator.node === true) {
        device = {
            platform: process.platform,
            nodejs: true,
            mobile: platform === 'ios' || platform === 'android'
        };
        return device;
    }

    var ua = scope.navigator.userAgent;

    if (ua.match(/(iPad|iPhone|iPod)/g)) {
        platform = 'ios';
    } else if (ua.indexOf('Android') !== -1) {
        platform = 'android';
    } else if (ua.indexOf('Linux') !== -1) {
        platform = 'linux';
    } else if (ua.indexOf('Macintosh') !== -1) {
        platform = 'osx';
    } else if (ua.indexOf('Windows') !== -1) {
        platform = 'windows';
    }

    if (ua.indexOf('Chrome') !== -1) {
        // chrome, chromium and canary
        browser = 'chrome';

        if (ua.indexOf('OPR') !== -1) {
            browser = 'opera';
        } else if (ua.indexOf('Chromium') !== -1) {
            browser = 'chromium';
        }
    } else if (ua.indexOf('Safari') !== -1) {
        browser = 'safari';
    } else if (ua.indexOf('Firefox') !== -1) {
        browser = 'firefox';
    } else if (ua.indexOf('Trident') !== -1) {
        browser = 'ie';
        if (ua.indexOf('MSIE 9') !== -1) {
            browser = 'ie9';
        }
    }

    if (platform === 'ios') {
        if (ua.indexOf('CriOS') !== -1) {
            browser = 'chrome';
        }
    }

    device = {
        platform: platform,
        browser: browser,
        mobile: platform === 'ios' || platform === 'android',
        nodejs: false
    };
    return device;
}

// polyfill for window.performance.now()
var polyfillPerformance = function polyfillPerformance() {
    var scope = getScope();
    if (typeof scope.performance === 'undefined') {
        scope.performance = {};
    }
    Date.now = Date.now || function () {
        return new Date().getTime();
    };

    if (typeof scope.performance.now === 'undefined') {
        var nowOffset = Date.now();
        if (typeof scope.performance.timing !== 'undefined' && typeof scope.performance.timing.navigationStart !== 'undefined') {
            nowOffset = scope.performance.timing.navigationStart;
        }
        scope.performance.now = function now() {
            return Date.now() - nowOffset;
        };
    }
};

// generates UUID for MIDI devices
function generateUUID() {
    var d = new Date().getTime();
    var uuid = new Array(64).join('x'); // 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx';
    uuid = uuid.replace(/[xy]/g, function (c) {
        var r = (d + Math.random() * 16) % 16 | 0;
        d = Math.floor(d / 16);
        return (c === 'x' ? r : r & 0x3 | 0x8).toString(16).toUpperCase();
    });
    return uuid;
}

// a very simple implementation of a Promise for Internet Explorer and Nodejs
var polyfillPromise = function polyfillPromise() {
    var scope = getScope();
    if (typeof scope.Promise !== 'function') {
        scope.Promise = function promise(executor) {
            this.executor = executor;
        };

        scope.Promise.prototype.then = function then(resolve, reject) {
            if (typeof resolve !== 'function') {
                resolve = function resolve() {};
            }
            if (typeof reject !== 'function') {
                reject = function reject() {};
            }
            this.executor(resolve, reject);
        };
    }
};

function polyfill() {
    var d = getDevice();
    // console.log(device);
    if (d.browser === 'ie' || d.nodejs === true) {
        polyfillPromise();
    }
    polyfillPerformance();
}

}).call(this,require('_process'),typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"_process":4}]},{},[5])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJub2RlX21vZHVsZXMvamF6ei1taWRpL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL2p6ei9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9qenovamF2YXNjcmlwdC9KWlouanMiLCJub2RlX21vZHVsZXMvcHJvY2Vzcy9icm93c2VyLmpzIiwic3JjL2luZGV4LmpzIiwic3JjL21pZGkvbWlkaV9hY2Nlc3MuanMiLCJzcmMvbWlkaS9taWRpX2lucHV0LmpzIiwic3JjL21pZGkvbWlkaV9vdXRwdXQuanMiLCJzcmMvbWlkaS9taWRpY29ubmVjdGlvbl9ldmVudC5qcyIsInNyYy9taWRpL21pZGltZXNzYWdlX2V2ZW50LmpzIiwic3JjL3V0aWwvc3RvcmUuanMiLCJzcmMvdXRpbC91dGlsLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOztBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O0FDbEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4NkNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FB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LENBakJEOztBQW9CTyxTQUFTLFFBQVQsR0FBb0I7QUFDdkIsUUFBTSxJQUFJLFdBQVY7QUFDQTtBQUNBLFFBQUksRUFBRSxPQUFGLEtBQWMsSUFBZCxJQUFzQixFQUFFLE1BQUYsS0FBYSxJQUF2QyxFQUE2QztBQUN6QztBQUNIO0FBQ0Q7QUFDSCIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJ2YXIgcGF0aD0nLi9iaW4vJztcclxudmFyIHY9cHJvY2Vzcy52ZXJzaW9ucy5ub2RlLnNwbGl0KCcuJyk7XHJcbmlmICh2WzBdPT0wICYmIHZbMV08PTEwKSBwYXRoKz0nMF8xMC8nO1xyXG5lbHNlIGlmICh2WzBdPT0wICYmIHZbMV08PTEyKSBwYXRoKz0nMF8xMi8nO1xyXG5lbHNlIGlmICh2WzBdPD00KSBwYXRoKz0nNF84Lyc7XHJcbmVsc2UgaWYgKHZbMF08PTUpIHBhdGgrPSc1XzEyLyc7XHJcbmVsc2UgaWYgKHZbMF08PTYpIHBhdGgrPSc2XzEyLyc7XHJcbmVsc2UgaWYgKHZbMF08PTcpIHBhdGgrPSc3XzEwLyc7XHJcbmVsc2UgaWYgKHZbMF08PTgpIHBhdGgrPSc4XzkvJztcclxuaWYocHJvY2Vzcy5wbGF0Zm9ybT09XCJ3aW4zMlwiJiZwcm9jZXNzLmFyY2g9PVwiaWEzMlwiKSBwYXRoKz0nd2luMzIvamF6eic7XHJcbmVsc2UgaWYocHJvY2Vzcy5wbGF0Zm9ybT09XCJ3aW4zMlwiJiZwcm9jZXNzLmFyY2g9PVwieDY0XCIpIHBhdGgrPSd3aW42NC9qYXp6JztcclxuZWxzZSBpZihwcm9jZXNzLnBsYXRmb3JtPT1cImRhcndpblwiJiZwcm9jZXNzLmFyY2g9PVwieDY0XCIpIHBhdGgrPSdtYWNvczY0L2phenonO1xyXG5lbHNlIGlmKHByb2Nlc3MucGxhdGZvcm09PVwiZGFyd2luXCImJnByb2Nlc3MuYXJjaD09XCJpYTMyXCIpIHBhdGgrPSdtYWNvczMyL2phenonO1xyXG5lbHNlIGlmKHByb2Nlc3MucGxhdGZvcm09PVwibGludXhcIiYmcHJvY2Vzcy5hcmNoPT1cIng2NFwiKSBwYXRoKz0nbGludXg2NC9qYXp6JztcclxuZWxzZSBpZihwcm9jZXNzLnBsYXRmb3JtPT1cImxpbnV4XCImJnByb2Nlc3MuYXJjaD09XCJpYTMyXCIpIHBhdGgrPSdsaW51eDMyL2phenonO1xyXG5lbHNlIGlmKHByb2Nlc3MucGxhdGZvcm09PVwibGludXhcIiYmcHJvY2Vzcy5hcmNoPT1cImFybVwiKSBwYXRoKz0nbGludXhhNy9qYXp6JztcclxubW9kdWxlLmV4cG9ydHM9cmVxdWlyZShwYXRoKTtcclxubW9kdWxlLmV4cG9ydHMucGFja2FnZT1yZXF1aXJlKF9fZGlybmFtZSArICcvcGFja2FnZS5qc29uJyk7XHJcbiIsIi8qXG4vLyBUaGlzIHNjcmlwdCBpcyBmb3IgTm9kZS5qcyBvbmx5LiBEb24ndCB1c2UgaXQgaW4gSFRNTCFcbnZhciBKWlo7XG5ldmFsKHJlcXVpcmUoJ2ZzJykucmVhZEZpbGVTeW5jKHJlcXVpcmUoJ3BhdGgnKS5qb2luKF9fZGlybmFtZSwgJ2phdmFzY3JpcHQnLCAnSlpaLmpzJykpKycnKTtcbm1vZHVsZS5leHBvcnRzID0gSlpaO1xuKi9cblxuY29uc3QgY3JlYXRlSmF6eiA9IHJlcXVpcmUoJy4vamF2YXNjcmlwdC9KWlouanMnKTtcbm1vZHVsZS5leHBvcnRzID0gY3JlYXRlSmF6eigpO1xuIiwibW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoKSB7XG5cbiAgICB2YXIgX3ZlcnNpb24gPSAnMC40LjEnO1xuXG4gICAgLy8gX1I6IGNvbW1vbiByb290IGZvciBhbGwgYXN5bmMgb2JqZWN0c1xuICAgIGZ1bmN0aW9uIF9SKCkge1xuICAgICAgICB0aGlzLl9vcmlnID0gdGhpcztcbiAgICAgICAgdGhpcy5fcmVhZHkgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5fcXVldWUgPSBbXTtcbiAgICAgICAgdGhpcy5fZXJyID0gW107XG4gICAgfTtcbiAgICBfUi5wcm90b3R5cGUuX2V4ZWMgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHdoaWxlICh0aGlzLl9yZWFkeSAmJiB0aGlzLl9xdWV1ZS5sZW5ndGgpIHtcbiAgICAgICAgICAgIHZhciB4ID0gdGhpcy5fcXVldWUuc2hpZnQoKTtcbiAgICAgICAgICAgIGlmICh0aGlzLl9vcmlnLl9iYWQpIHtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5fb3JpZy5faG9wZSAmJiB4WzBdID09IF9vcikge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLl9vcmlnLl9ob3BlID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgIHhbMF0uYXBwbHkodGhpcywgeFsxXSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLl9xdWV1ZSA9IFtdO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLl9vcmlnLl9ob3BlID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAoeFswXSAhPSBfb3IpIHtcbiAgICAgICAgICAgICAgICB4WzBdLmFwcGx5KHRoaXMsIHhbMV0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuICAgIF9SLnByb3RvdHlwZS5fcHVzaCA9IGZ1bmN0aW9uIChmdW5jLCBhcmcpIHsgdGhpcy5fcXVldWUucHVzaChbZnVuYywgYXJnXSk7IF9SLnByb3RvdHlwZS5fZXhlYy5hcHBseSh0aGlzKTsgfVxuICAgIF9SLnByb3RvdHlwZS5fc2xpcCA9IGZ1bmN0aW9uIChmdW5jLCBhcmcpIHsgdGhpcy5fcXVldWUudW5zaGlmdChbZnVuYywgYXJnXSk7IH1cbiAgICBfUi5wcm90b3R5cGUuX3BhdXNlID0gZnVuY3Rpb24gKCkgeyB0aGlzLl9yZWFkeSA9IGZhbHNlOyB9XG4gICAgX1IucHJvdG90eXBlLl9yZXN1bWUgPSBmdW5jdGlvbiAoKSB7IHRoaXMuX3JlYWR5ID0gdHJ1ZTsgX1IucHJvdG90eXBlLl9leGVjLmFwcGx5KHRoaXMpOyB9XG4gICAgX1IucHJvdG90eXBlLl9icmVhayA9IGZ1bmN0aW9uIChlcnIpIHsgdGhpcy5fb3JpZy5fYmFkID0gdHJ1ZTsgdGhpcy5fb3JpZy5faG9wZSA9IHRydWU7IGlmIChlcnIpIHRoaXMuX29yaWcuX2Vyci5wdXNoKGVycik7IH1cbiAgICBfUi5wcm90b3R5cGUuX3JlcGFpciA9IGZ1bmN0aW9uICgpIHsgdGhpcy5fb3JpZy5fYmFkID0gZmFsc2U7IH1cbiAgICBfUi5wcm90b3R5cGUuX2NyYXNoID0gZnVuY3Rpb24gKGVycikgeyB0aGlzLl9icmVhayhlcnIpOyB0aGlzLl9yZXN1bWUoKTsgfVxuICAgIF9SLnByb3RvdHlwZS5lcnIgPSBmdW5jdGlvbiAoKSB7IHJldHVybiBfY2xvbmUodGhpcy5fZXJyKTsgfVxuXG4gICAgZnVuY3Rpb24gX3dhaXQob2JqLCBkZWxheSkgeyBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHsgb2JqLl9yZXN1bWUoKTsgfSwgZGVsYXkpOyB9XG4gICAgX1IucHJvdG90eXBlLndhaXQgPSBmdW5jdGlvbiAoZGVsYXkpIHtcbiAgICAgICAgaWYgKCFkZWxheSkgcmV0dXJuIHRoaXM7XG4gICAgICAgIGZ1bmN0aW9uIEYoKSB7IH07IEYucHJvdG90eXBlID0gdGhpcy5fb3JpZztcbiAgICAgICAgdmFyIHJldCA9IG5ldyBGKCk7XG4gICAgICAgIHJldC5fcmVhZHkgPSBmYWxzZTtcbiAgICAgICAgcmV0Ll9xdWV1ZSA9IFtdO1xuICAgICAgICB0aGlzLl9wdXNoKF93YWl0LCBbcmV0LCBkZWxheV0pO1xuICAgICAgICByZXR1cm4gcmV0O1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIF9hbmQocSkgeyBpZiAocSBpbnN0YW5jZW9mIEZ1bmN0aW9uKSBxLmFwcGx5KHRoaXMpOyBlbHNlIGNvbnNvbGUubG9nKHEpOyB9XG4gICAgX1IucHJvdG90eXBlLmFuZCA9IGZ1bmN0aW9uIChmdW5jKSB7IHRoaXMuX3B1c2goX2FuZCwgW2Z1bmNdKTsgcmV0dXJuIHRoaXM7IH1cbiAgICBmdW5jdGlvbiBfb3IocSkgeyBpZiAocSBpbnN0YW5jZW9mIEZ1bmN0aW9uKSBxLmFwcGx5KHRoaXMpOyBlbHNlIGNvbnNvbGUubG9nKHEpOyB9XG4gICAgX1IucHJvdG90eXBlLm9yID0gZnVuY3Rpb24gKGZ1bmMpIHsgdGhpcy5fcHVzaChfb3IsIFtmdW5jXSk7IHJldHVybiB0aGlzOyB9XG5cbiAgICBfUi5wcm90b3R5cGUuX2luZm8gPSB7fTtcbiAgICBfUi5wcm90b3R5cGUuaW5mbyA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmFyIGluZm8gPSBfY2xvbmUodGhpcy5fb3JpZy5faW5mbyk7XG4gICAgICAgIGlmICh0eXBlb2YgaW5mby5lbmdpbmUgPT0gJ3VuZGVmaW5lZCcpIGluZm8uZW5naW5lID0gJ25vbmUnO1xuICAgICAgICBpZiAodHlwZW9mIGluZm8uc3lzZXggPT0gJ3VuZGVmaW5lZCcpIGluZm8uc3lzZXggPSB0cnVlO1xuICAgICAgICByZXR1cm4gaW5mbztcbiAgICB9XG4gICAgX1IucHJvdG90eXBlLm5hbWUgPSBmdW5jdGlvbiAoKSB7IHJldHVybiB0aGlzLmluZm8oKS5uYW1lOyB9XG5cbiAgICBmdW5jdGlvbiBfY2xvc2Uob2JqKSB7XG4gICAgICAgIHRoaXMuX2JyZWFrKCdjbG9zZWQnKTtcbiAgICAgICAgb2JqLl9yZXN1bWUoKTtcbiAgICB9XG4gICAgX1IucHJvdG90eXBlLmNsb3NlID0gZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgcmV0ID0gbmV3IF9SKCk7XG4gICAgICAgIGlmICh0aGlzLl9jbG9zZSkgdGhpcy5fcHVzaCh0aGlzLl9jbG9zZSwgW10pO1xuICAgICAgICB0aGlzLl9wdXNoKF9jbG9zZSwgW3JldF0pO1xuICAgICAgICByZXR1cm4gcmV0O1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIF90cnlBbnkoYXJyKSB7XG4gICAgICAgIGlmICghYXJyLmxlbmd0aCkge1xuICAgICAgICAgICAgdGhpcy5fYnJlYWsoKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICB2YXIgZnVuYyA9IGFyci5zaGlmdCgpO1xuICAgICAgICBpZiAoYXJyLmxlbmd0aCkge1xuICAgICAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgICAgICAgICAgdGhpcy5fc2xpcChfb3IsIFtmdW5jdGlvbiAoKSB7IF90cnlBbnkuYXBwbHkoc2VsZiwgW2Fycl0pOyB9XSk7XG4gICAgICAgIH1cbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIHRoaXMuX3JlcGFpcigpO1xuICAgICAgICAgICAgZnVuYy5hcHBseSh0aGlzKTtcbiAgICAgICAgfVxuICAgICAgICBjYXRjaCAoZSkge1xuICAgICAgICAgICAgdGhpcy5fYnJlYWsoZS50b1N0cmluZygpKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIF9wdXNoKGFyciwgb2JqKSB7XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgYXJyLmxlbmd0aDsgaSsrKSBpZiAoYXJyW2ldID09PSBvYmopIHJldHVybjtcbiAgICAgICAgYXJyLnB1c2gob2JqKTtcbiAgICB9XG4gICAgZnVuY3Rpb24gX3BvcChhcnIsIG9iaikge1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGFyci5sZW5ndGg7IGkrKykgaWYgKGFycltpXSA9PT0gb2JqKSB7XG4gICAgICAgICAgICBhcnIuc3BsaWNlKGksIDEpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLy8gX0o6IEpaWiBvYmplY3RcbiAgICBmdW5jdGlvbiBfSigpIHtcbiAgICAgICAgX1IuYXBwbHkodGhpcyk7XG4gICAgfVxuICAgIF9KLnByb3RvdHlwZSA9IG5ldyBfUigpO1xuXG4gICAgX0oucHJvdG90eXBlLnRpbWUgPSBmdW5jdGlvbiAoKSB7IHJldHVybiAwOyB9XG4gICAgaWYgKHR5cGVvZiBwZXJmb3JtYW5jZSAhPSAndW5kZWZpbmVkJyAmJiBwZXJmb3JtYW5jZS5ub3cpIF9KLnByb3RvdHlwZS5fdGltZSA9IGZ1bmN0aW9uICgpIHsgcmV0dXJuIHBlcmZvcm1hbmNlLm5vdygpOyB9XG4gICAgZnVuY3Rpb24gX2luaXRUaW1lcigpIHtcbiAgICAgICAgaWYgKCFfSi5wcm90b3R5cGUuX3RpbWUpIF9KLnByb3RvdHlwZS5fdGltZSA9IGZ1bmN0aW9uICgpIHsgcmV0dXJuIERhdGUubm93KCk7IH1cbiAgICAgICAgX0oucHJvdG90eXBlLl9zdGFydFRpbWUgPSBfSi5wcm90b3R5cGUuX3RpbWUoKTtcbiAgICAgICAgX0oucHJvdG90eXBlLnRpbWUgPSBmdW5jdGlvbiAoKSB7IHJldHVybiBfSi5wcm90b3R5cGUuX3RpbWUoKSAtIF9KLnByb3RvdHlwZS5fc3RhcnRUaW1lOyB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gX2Nsb25lKG9iaiwga2V5LCB2YWwpIHtcbiAgICAgICAgaWYgKHR5cGVvZiBrZXkgPT0gJ3VuZGVmaW5lZCcpIHJldHVybiBfY2xvbmUob2JqLCBbXSwgW10pO1xuICAgICAgICBpZiAob2JqIGluc3RhbmNlb2YgT2JqZWN0KSB7XG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGtleS5sZW5ndGg7IGkrKykgaWYgKGtleVtpXSA9PT0gb2JqKSByZXR1cm4gdmFsW2ldO1xuICAgICAgICAgICAgdmFyIHJldDtcbiAgICAgICAgICAgIGlmIChvYmogaW5zdGFuY2VvZiBBcnJheSkgcmV0ID0gW107IGVsc2UgcmV0ID0ge307XG4gICAgICAgICAgICBrZXkucHVzaChvYmopOyB2YWwucHVzaChyZXQpO1xuICAgICAgICAgICAgZm9yICh2YXIgayBpbiBvYmopIGlmIChvYmouaGFzT3duUHJvcGVydHkoaykpIHJldFtrXSA9IF9jbG9uZShvYmpba10sIGtleSwgdmFsKTtcbiAgICAgICAgICAgIHJldHVybiByZXQ7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG9iajtcbiAgICB9XG4gICAgX0oucHJvdG90eXBlLl9pbmZvID0geyBuYW1lOiAnSlpaLmpzJywgdmVyOiBfdmVyc2lvbiwgdmVyc2lvbjogX3ZlcnNpb24gfTtcblxuICAgIHZhciBfb3V0cyA9IFtdO1xuICAgIHZhciBfaW5zID0gW107XG5cbiAgICBmdW5jdGlvbiBfcG9zdFJlZnJlc2goKSB7XG4gICAgICAgIHRoaXMuX2luZm8uZW5naW5lID0gX2VuZ2luZS5fdHlwZTtcbiAgICAgICAgdGhpcy5faW5mby52ZXJzaW9uID0gX2VuZ2luZS5fdmVyc2lvbjtcbiAgICAgICAgdGhpcy5faW5mby5zeXNleCA9IF9lbmdpbmUuX3N5c2V4O1xuICAgICAgICB0aGlzLl9pbmZvLmlucHV0cyA9IFtdO1xuICAgICAgICB0aGlzLl9pbmZvLm91dHB1dHMgPSBbXTtcbiAgICAgICAgX291dHMgPSBbXTtcbiAgICAgICAgX2lucyA9IFtdO1xuICAgICAgICBfZW5naW5lLl9hbGxPdXRzID0ge307XG4gICAgICAgIF9lbmdpbmUuX2FsbElucyA9IHt9O1xuICAgICAgICB2YXIgaSwgeDtcbiAgICAgICAgZm9yIChpID0gMDsgaSA8IF9lbmdpbmUuX291dHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIHggPSBfZW5naW5lLl9vdXRzW2ldO1xuICAgICAgICAgICAgeC5lbmdpbmUgPSBfZW5naW5lO1xuICAgICAgICAgICAgX2VuZ2luZS5fYWxsT3V0c1t4Lm5hbWVdID0geDtcbiAgICAgICAgICAgIHRoaXMuX2luZm8ub3V0cHV0cy5wdXNoKHtcbiAgICAgICAgICAgICAgICBuYW1lOiB4Lm5hbWUsXG4gICAgICAgICAgICAgICAgbWFudWZhY3R1cmVyOiB4Lm1hbnVmYWN0dXJlcixcbiAgICAgICAgICAgICAgICB2ZXJzaW9uOiB4LnZlcnNpb24sXG4gICAgICAgICAgICAgICAgZW5naW5lOiBfZW5naW5lLl90eXBlXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIF9vdXRzLnB1c2goeCk7XG4gICAgICAgIH1cbiAgICAgICAgZm9yIChpID0gMDsgaSA8IF92aXJ0dWFsLl9vdXRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICB4ID0gX3ZpcnR1YWwuX291dHNbaV07XG4gICAgICAgICAgICB0aGlzLl9pbmZvLm91dHB1dHMucHVzaCh7XG4gICAgICAgICAgICAgICAgbmFtZTogeC5uYW1lLFxuICAgICAgICAgICAgICAgIG1hbnVmYWN0dXJlcjogeC5tYW51ZmFjdHVyZXIsXG4gICAgICAgICAgICAgICAgdmVyc2lvbjogeC52ZXJzaW9uLFxuICAgICAgICAgICAgICAgIGVuZ2luZTogeC50eXBlXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIF9vdXRzLnB1c2goeCk7XG4gICAgICAgIH1cbiAgICAgICAgZm9yIChpID0gMDsgaSA8IF9lbmdpbmUuX2lucy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgeCA9IF9lbmdpbmUuX2luc1tpXTtcbiAgICAgICAgICAgIHguZW5naW5lID0gX2VuZ2luZTtcbiAgICAgICAgICAgIF9lbmdpbmUuX2FsbEluc1t4Lm5hbWVdID0geDtcbiAgICAgICAgICAgIHRoaXMuX2luZm8uaW5wdXRzLnB1c2goe1xuICAgICAgICAgICAgICAgIG5hbWU6IHgubmFtZSxcbiAgICAgICAgICAgICAgICBtYW51ZmFjdHVyZXI6IHgubWFudWZhY3R1cmVyLFxuICAgICAgICAgICAgICAgIHZlcnNpb246IHgudmVyc2lvbixcbiAgICAgICAgICAgICAgICBlbmdpbmU6IF9lbmdpbmUuX3R5cGVcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgX2lucy5wdXNoKHgpO1xuICAgICAgICB9XG4gICAgICAgIGZvciAoaSA9IDA7IGkgPCBfdmlydHVhbC5faW5zLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICB4ID0gX3ZpcnR1YWwuX2luc1tpXTtcbiAgICAgICAgICAgIHRoaXMuX2luZm8uaW5wdXRzLnB1c2goe1xuICAgICAgICAgICAgICAgIG5hbWU6IHgubmFtZSxcbiAgICAgICAgICAgICAgICBtYW51ZmFjdHVyZXI6IHgubWFudWZhY3R1cmVyLFxuICAgICAgICAgICAgICAgIHZlcnNpb246IHgudmVyc2lvbixcbiAgICAgICAgICAgICAgICBlbmdpbmU6IHgudHlwZVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBfaW5zLnB1c2goeCk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgZnVuY3Rpb24gX3JlZnJlc2goKSB7XG4gICAgICAgIHRoaXMuX3NsaXAoX3Bvc3RSZWZyZXNoLCBbXSk7XG4gICAgICAgIF9lbmdpbmUuX3JlZnJlc2goKTtcbiAgICB9XG4gICAgX0oucHJvdG90eXBlLnJlZnJlc2ggPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHRoaXMuX3B1c2goX3JlZnJlc2gsIFtdKTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gX2ZpbHRlckxpc3QocSwgYXJyKSB7XG4gICAgICAgIGlmICh0eXBlb2YgcSA9PSAndW5kZWZpbmVkJykgcmV0dXJuIGFyci5zbGljZSgpO1xuICAgICAgICB2YXIgaSwgbjtcbiAgICAgICAgdmFyIGEgPSBbXTtcbiAgICAgICAgaWYgKHEgaW5zdGFuY2VvZiBSZWdFeHApIHtcbiAgICAgICAgICAgIGZvciAobiA9IDA7IG4gPCBhcnIubGVuZ3RoOyBuKyspIGlmIChxLnRlc3QoYXJyW25dLm5hbWUpKSBhLnB1c2goYXJyW25dKTtcbiAgICAgICAgICAgIHJldHVybiBhO1xuICAgICAgICB9XG4gICAgICAgIGlmIChxIGluc3RhbmNlb2YgRnVuY3Rpb24pIHEgPSBxKGFycik7XG4gICAgICAgIGlmICghKHEgaW5zdGFuY2VvZiBBcnJheSkpIHEgPSBbcV07XG4gICAgICAgIGZvciAoaSA9IDA7IGkgPCBxLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBmb3IgKG4gPSAwOyBuIDwgYXJyLmxlbmd0aDsgbisrKSB7XG4gICAgICAgICAgICAgICAgaWYgKHFbaV0gKyAnJyA9PT0gbiArICcnIHx8IHFbaV0gPT09IGFycltuXS5uYW1lIHx8IChxW2ldIGluc3RhbmNlb2YgT2JqZWN0ICYmIHFbaV0ubmFtZSA9PT0gYXJyW25dLm5hbWUpKSBhLnB1c2goYXJyW25dKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gYTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBfbm90Rm91bmQocG9ydCwgcSkge1xuICAgICAgICB2YXIgbXNnO1xuICAgICAgICBpZiAocSBpbnN0YW5jZW9mIFJlZ0V4cCkgbXNnID0gJ1BvcnQgbWF0Y2hpbmcgJyArIHEgKyAnIG5vdCBmb3VuZCc7XG4gICAgICAgIGVsc2UgaWYgKHEgaW5zdGFuY2VvZiBPYmplY3QgfHwgdHlwZW9mIHEgPT0gJ3VuZGVmaW5lZCcpIG1zZyA9ICdQb3J0IG5vdCBmb3VuZCc7XG4gICAgICAgIGVsc2UgbXNnID0gJ1BvcnQgXCInICsgcSArICdcIiBub3QgZm91bmQnO1xuICAgICAgICBwb3J0Ll9jcmFzaChtc2cpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIF9vcGVuTWlkaU91dChwb3J0LCBhcmcpIHtcbiAgICAgICAgdmFyIGFyciA9IF9maWx0ZXJMaXN0KGFyZywgX291dHMpO1xuICAgICAgICBpZiAoIWFyci5sZW5ndGgpIHsgX25vdEZvdW5kKHBvcnQsIGFyZyk7IHJldHVybjsgfVxuICAgICAgICBmdW5jdGlvbiBwYWNrKHgpIHsgcmV0dXJuIGZ1bmN0aW9uICgpIHsgeC5lbmdpbmUuX29wZW5PdXQodGhpcywgeC5uYW1lKTsgfTsgfTtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBhcnIubGVuZ3RoOyBpKyspIGFycltpXSA9IHBhY2soYXJyW2ldKTtcbiAgICAgICAgcG9ydC5fc2xpcChfdHJ5QW55LCBbYXJyXSk7XG4gICAgICAgIHBvcnQuX3Jlc3VtZSgpO1xuICAgIH1cbiAgICBfSi5wcm90b3R5cGUub3Blbk1pZGlPdXQgPSBmdW5jdGlvbiAoYXJnKSB7XG4gICAgICAgIHZhciBwb3J0ID0gbmV3IF9NKCk7XG4gICAgICAgIHRoaXMuX3B1c2goX3JlZnJlc2gsIFtdKTtcbiAgICAgICAgdGhpcy5fcHVzaChfb3Blbk1pZGlPdXQsIFtwb3J0LCBhcmddKTtcbiAgICAgICAgcmV0dXJuIHBvcnQ7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gX29wZW5NaWRpSW4ocG9ydCwgYXJnKSB7XG4gICAgICAgIHZhciBhcnIgPSBfZmlsdGVyTGlzdChhcmcsIF9pbnMpO1xuICAgICAgICBpZiAoIWFyci5sZW5ndGgpIHsgX25vdEZvdW5kKHBvcnQsIGFyZyk7IHJldHVybjsgfVxuICAgICAgICBmdW5jdGlvbiBwYWNrKHgpIHsgcmV0dXJuIGZ1bmN0aW9uICgpIHsgeC5lbmdpbmUuX29wZW5Jbih0aGlzLCB4Lm5hbWUpOyB9OyB9O1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGFyci5sZW5ndGg7IGkrKykgYXJyW2ldID0gcGFjayhhcnJbaV0pO1xuICAgICAgICBwb3J0Ll9zbGlwKF90cnlBbnksIFthcnJdKTtcbiAgICAgICAgcG9ydC5fcmVzdW1lKCk7XG4gICAgfVxuICAgIF9KLnByb3RvdHlwZS5vcGVuTWlkaUluID0gZnVuY3Rpb24gKGFyZykge1xuICAgICAgICB2YXIgcG9ydCA9IG5ldyBfTSgpO1xuICAgICAgICB0aGlzLl9wdXNoKF9yZWZyZXNoLCBbXSk7XG4gICAgICAgIHRoaXMuX3B1c2goX29wZW5NaWRpSW4sIFtwb3J0LCBhcmddKTtcbiAgICAgICAgcmV0dXJuIHBvcnQ7XG4gICAgfVxuXG4gICAgX0oucHJvdG90eXBlLl9jbG9zZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgX2VuZ2luZS5fY2xvc2UoKTtcbiAgICB9XG5cbiAgICAvLyBfTTogTUlESS1Jbi9PdXQgb2JqZWN0XG4gICAgZnVuY3Rpb24gX00oKSB7XG4gICAgICAgIF9SLmFwcGx5KHRoaXMpO1xuICAgICAgICB0aGlzLl9oYW5kbGVzID0gW107XG4gICAgICAgIHRoaXMuX291dHMgPSBbXTtcbiAgICB9XG4gICAgX00ucHJvdG90eXBlID0gbmV3IF9SKCk7XG5cbiAgICBfTS5wcm90b3R5cGUuX3JlY2VpdmUgPSBmdW5jdGlvbiAobXNnKSB7IHRoaXMuX2VtaXQobXNnKTsgfSAvLyBvdmVycmlkZSFcbiAgICBmdW5jdGlvbiBfcmVjZWl2ZShtc2cpIHsgdGhpcy5fcmVjZWl2ZShtc2cpOyB9XG4gICAgX00ucHJvdG90eXBlLnNlbmQgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHRoaXMuX3B1c2goX3JlY2VpdmUsIFtNSURJLmFwcGx5KG51bGwsIGFyZ3VtZW50cyldKTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuICAgIF9NLnByb3RvdHlwZS5ub3RlID0gZnVuY3Rpb24gKGMsIG4sIHYsIHQpIHtcbiAgICAgICAgdGhpcy5ub3RlT24oYywgbiwgdik7XG4gICAgICAgIGlmICh0KSB0aGlzLndhaXQodCkubm90ZU9mZihjLCBuKTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuICAgIF9NLnByb3RvdHlwZS5fZW1pdCA9IGZ1bmN0aW9uIChtc2cpIHtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLl9oYW5kbGVzLmxlbmd0aDsgaSsrKSB0aGlzLl9oYW5kbGVzW2ldLmFwcGx5KHRoaXMsIFtNSURJKG1zZykuX3N0YW1wKHRoaXMpXSk7XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5fb3V0cy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgdmFyIG0gPSBNSURJKG1zZyk7XG4gICAgICAgICAgICBpZiAoIW0uX3N0YW1wZWQodGhpcy5fb3V0c1tpXSkpIHRoaXMuX291dHNbaV0uc2VuZChtLl9zdGFtcCh0aGlzKSk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgZnVuY3Rpb24gX2VtaXQobXNnKSB7IHRoaXMuX2VtaXQobXNnKTsgfVxuICAgIF9NLnByb3RvdHlwZS5lbWl0ID0gZnVuY3Rpb24gKG1zZykge1xuICAgICAgICB0aGlzLl9wdXNoKF9lbWl0LCBbbXNnXSk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cbiAgICBmdW5jdGlvbiBfY29ubmVjdChhcmcpIHtcbiAgICAgICAgaWYgKGFyZyBpbnN0YW5jZW9mIEZ1bmN0aW9uKSBfcHVzaCh0aGlzLl9vcmlnLl9oYW5kbGVzLCBhcmcpO1xuICAgICAgICBlbHNlIF9wdXNoKHRoaXMuX29yaWcuX291dHMsIGFyZyk7XG4gICAgfVxuICAgIGZ1bmN0aW9uIF9kaXNjb25uZWN0KGFyZykge1xuICAgICAgICBpZiAoYXJnIGluc3RhbmNlb2YgRnVuY3Rpb24pIF9wb3AodGhpcy5fb3JpZy5faGFuZGxlcywgYXJnKTtcbiAgICAgICAgZWxzZSBfcG9wKHRoaXMuX29yaWcuX291dHMsIGFyZyk7XG4gICAgfVxuICAgIF9NLnByb3RvdHlwZS5jb25uZWN0ID0gZnVuY3Rpb24gKGFyZykge1xuICAgICAgICB0aGlzLl9wdXNoKF9jb25uZWN0LCBbYXJnXSk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cbiAgICBfTS5wcm90b3R5cGUuZGlzY29ubmVjdCA9IGZ1bmN0aW9uIChhcmcpIHtcbiAgICAgICAgdGhpcy5fcHVzaChfZGlzY29ubmVjdCwgW2FyZ10pO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICB2YXIgX2p6ejtcbiAgICB2YXIgX2VuZ2luZSA9IHt9O1xuICAgIHZhciBfdmlydHVhbCA9IHsgX291dHM6IFtdLCBfaW5zOiBbXSB9O1xuXG4gICAgLy8gTm9kZS5qc1xuICAgIGZ1bmN0aW9uIF90cnlOT0RFKCkge1xuICAgICAgICBpZiAodHlwZW9mIG1vZHVsZSAhPSAndW5kZWZpbmVkJyAmJiBtb2R1bGUuZXhwb3J0cykge1xuICAgICAgICAgICAgX2luaXROb2RlKHJlcXVpcmUoJ2phenotbWlkaScpKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLl9icmVhaygpO1xuICAgIH1cbiAgICAvLyBKYXp6LVBsdWdpblxuICAgIGZ1bmN0aW9uIF90cnlKYXp6UGx1Z2luKCkge1xuICAgICAgICB2YXIgZGl2ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgICAgIGRpdi5zdHlsZS52aXNpYmlsaXR5ID0gJ2hpZGRlbic7XG4gICAgICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQoZGl2KTtcbiAgICAgICAgdmFyIG9iaiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ29iamVjdCcpO1xuICAgICAgICBvYmouc3R5bGUudmlzaWJpbGl0eSA9ICdoaWRkZW4nO1xuICAgICAgICBvYmouc3R5bGUud2lkdGggPSAnMHB4Jzsgb2JqLnN0eWxlLmhlaWdodCA9ICcwcHgnO1xuICAgICAgICBvYmouY2xhc3NpZCA9ICdDTFNJRDoxQUNFMTYxOC0xQzdELTQ1NjEtQUVFMS0zNDg0MkFBODVFOTAnO1xuICAgICAgICBvYmoudHlwZSA9ICdhdWRpby94LWphenonO1xuICAgICAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKG9iaik7XG4gICAgICAgIGlmIChvYmouaXNKYXp6KSB7XG4gICAgICAgICAgICBfaW5pdEphenpQbHVnaW4ob2JqKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLl9icmVhaygpO1xuICAgIH1cbiAgICAvLyBXZWIgTUlESSBBUElcbiAgICBmdW5jdGlvbiBfdHJ5V2ViTUlESSgpIHtcbiAgICAgICAgaWYgKG5hdmlnYXRvci5yZXF1ZXN0TUlESUFjY2Vzcykge1xuICAgICAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgICAgICAgICAgZnVuY3Rpb24gb25Hb29kKG1pZGkpIHtcbiAgICAgICAgICAgICAgICBfaW5pdFdlYk1JREkobWlkaSk7XG4gICAgICAgICAgICAgICAgc2VsZi5fcmVzdW1lKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBmdW5jdGlvbiBvbkJhZChtc2cpIHtcbiAgICAgICAgICAgICAgICBzZWxmLl9jcmFzaChtc2cpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdmFyIG9wdCA9IHt9O1xuICAgICAgICAgICAgbmF2aWdhdG9yLnJlcXVlc3RNSURJQWNjZXNzKG9wdCkudGhlbihvbkdvb2QsIG9uQmFkKTtcbiAgICAgICAgICAgIHRoaXMuX3BhdXNlKCk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5fYnJlYWsoKTtcbiAgICB9XG4gICAgZnVuY3Rpb24gX3RyeVdlYk1JRElzeXNleCgpIHtcbiAgICAgICAgaWYgKG5hdmlnYXRvci5yZXF1ZXN0TUlESUFjY2Vzcykge1xuICAgICAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgICAgICAgICAgZnVuY3Rpb24gb25Hb29kKG1pZGkpIHtcbiAgICAgICAgICAgICAgICBfaW5pdFdlYk1JREkobWlkaSwgdHJ1ZSk7XG4gICAgICAgICAgICAgICAgc2VsZi5fcmVzdW1lKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBmdW5jdGlvbiBvbkJhZChtc2cpIHtcbiAgICAgICAgICAgICAgICBzZWxmLl9jcmFzaChtc2cpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdmFyIG9wdCA9IHsgc3lzZXg6IHRydWUgfTtcbiAgICAgICAgICAgIG5hdmlnYXRvci5yZXF1ZXN0TUlESUFjY2VzcyhvcHQpLnRoZW4ob25Hb29kLCBvbkJhZCk7XG4gICAgICAgICAgICB0aGlzLl9wYXVzZSgpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuX2JyZWFrKCk7XG4gICAgfVxuICAgIC8vIFdlYi1leHRlbnNpb25cbiAgICBmdW5jdGlvbiBfdHJ5Q1JYKCkge1xuICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgICAgIHZhciBpbnN0O1xuICAgICAgICB2YXIgbXNnO1xuICAgICAgICBmdW5jdGlvbiBldmVudEhhbmRsZShlKSB7XG4gICAgICAgICAgICBpbnN0ID0gdHJ1ZTtcbiAgICAgICAgICAgIGlmICghbXNnKSBtc2cgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnamF6ei1taWRpLW1zZycpO1xuICAgICAgICAgICAgaWYgKCFtc2cpIHJldHVybjtcbiAgICAgICAgICAgIHZhciBhID0gW107XG4gICAgICAgICAgICB0cnkgeyBhID0gSlNPTi5wYXJzZShtc2cuaW5uZXJUZXh0KTsgfSBjYXRjaCAoZSkgeyB9XG4gICAgICAgICAgICBtc2cuaW5uZXJUZXh0ID0gJyc7XG4gICAgICAgICAgICBkb2N1bWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCdqYXp6LW1pZGktbXNnJywgZXZlbnRIYW5kbGUpO1xuICAgICAgICAgICAgaWYgKGFbMF0gPT09ICd2ZXJzaW9uJykge1xuICAgICAgICAgICAgICAgIF9pbml0Q1JYKG1zZywgYVsyXSk7XG4gICAgICAgICAgICAgICAgc2VsZi5fcmVzdW1lKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICBzZWxmLl9jcmFzaCgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHRoaXMuX3BhdXNlKCk7XG4gICAgICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2phenotbWlkaS1tc2cnLCBldmVudEhhbmRsZSk7XG4gICAgICAgIHRyeSB7IGRvY3VtZW50LmRpc3BhdGNoRXZlbnQobmV3IEV2ZW50KCdqYXp6LW1pZGknKSk7IH0gY2F0Y2ggKGUpIHsgfVxuICAgICAgICB3aW5kb3cuc2V0VGltZW91dChmdW5jdGlvbiAoKSB7IGlmICghaW5zdCkgc2VsZi5fY3Jhc2goKTsgfSwgMCk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gX3plcm9CcmVhaygpIHtcbiAgICAgICAgdGhpcy5fcGF1c2UoKTtcbiAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHsgc2VsZi5fY3Jhc2goKTsgfSwgMCk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gX2ZpbHRlckVuZ2luZXMob3B0KSB7XG4gICAgICAgIHZhciByZXQgPSBbX3RyeU5PREUsIF96ZXJvQnJlYWtdO1xuICAgICAgICB2YXIgYXJyID0gX2ZpbHRlckVuZ2luZU5hbWVzKG9wdCk7XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgYXJyLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBpZiAoYXJyW2ldID09ICd3ZWJtaWRpJykge1xuICAgICAgICAgICAgICAgIGlmIChvcHQgJiYgb3B0LnN5c2V4ID09PSB0cnVlKSByZXQucHVzaChfdHJ5V2ViTUlESXN5c2V4KTtcbiAgICAgICAgICAgICAgICBpZiAoIW9wdCB8fCBvcHQuc3lzZXggIT09IHRydWUgfHwgb3B0LmRlZ3JhZGUgPT09IHRydWUpIHJldC5wdXNoKF90cnlXZWJNSURJKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKGFycltpXSA9PSAnZXh0ZW5zaW9uJykgcmV0LnB1c2goX3RyeUNSWCk7XG4gICAgICAgICAgICBlbHNlIGlmIChhcnJbaV0gPT0gJ3BsdWdpbicpIHJldC5wdXNoKF90cnlKYXp6UGx1Z2luKTtcbiAgICAgICAgfVxuICAgICAgICByZXQucHVzaChfaW5pdE5PTkUpO1xuICAgICAgICByZXR1cm4gcmV0O1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIF9maWx0ZXJFbmdpbmVOYW1lcyhvcHQpIHtcbiAgICAgICAgdmFyIHdlYiA9IFsnZXh0ZW5zaW9uJywgJ3dlYm1pZGknLCAncGx1Z2luJ107XG4gICAgICAgIGlmICghb3B0IHx8ICFvcHQuZW5naW5lKSByZXR1cm4gd2ViO1xuICAgICAgICB2YXIgYXJyID0gb3B0LmVuZ2luZSBpbnN0YW5jZW9mIEFycmF5ID8gb3B0LmVuZ2luZSA6IFtvcHQuZW5naW5lXTtcbiAgICAgICAgdmFyIGR1cCA9IHt9O1xuICAgICAgICB2YXIgbm9uZTtcbiAgICAgICAgdmFyIGV0YztcbiAgICAgICAgdmFyIGhlYWQgPSBbXTtcbiAgICAgICAgdmFyIHRhaWwgPSBbXTtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBhcnIubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIHZhciBuYW1lID0gYXJyW2ldLnRvU3RyaW5nKCkudG9Mb3dlckNhc2UoKTtcbiAgICAgICAgICAgIGlmIChkdXBbbmFtZV0pIGNvbnRpbnVlO1xuICAgICAgICAgICAgZHVwW25hbWVdID0gdHJ1ZTtcbiAgICAgICAgICAgIGlmIChuYW1lID09PSAnbm9uZScpIG5vbmUgPSB0cnVlO1xuICAgICAgICAgICAgaWYgKG5hbWUgPT09ICdldGMnKSBldGMgPSB0cnVlO1xuICAgICAgICAgICAgaWYgKGV0YykgdGFpbC5wdXNoKG5hbWUpOyBlbHNlIGhlYWQucHVzaChuYW1lKTtcbiAgICAgICAgICAgIF9wb3Aod2ViLCBuYW1lKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoZXRjIHx8IGhlYWQubGVuZ3RoIHx8IHRhaWwubGVuZ3RoKSBub25lID0gZmFsc2U7XG4gICAgICAgIHJldHVybiBub25lID8gW10gOiBoZWFkLmNvbmNhdChldGMgPyB3ZWIgOiB0YWlsKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBfaW5pdEpaWihvcHQpIHtcbiAgICAgICAgX2p6eiA9IG5ldyBfSigpO1xuICAgICAgICBfanp6Ll9vcHRpb25zID0gb3B0O1xuICAgICAgICBfanp6Ll9wdXNoKF90cnlBbnksIFtfZmlsdGVyRW5naW5lcyhvcHQpXSk7XG4gICAgICAgIF9qenoucmVmcmVzaCgpO1xuICAgICAgICBfanp6Ll9wdXNoKF9pbml0VGltZXIsIFtdKTtcbiAgICAgICAgX2p6ei5fcHVzaChmdW5jdGlvbiAoKSB7IGlmICghX291dHMubGVuZ3RoICYmICFfaW5zLmxlbmd0aCkgdGhpcy5fYnJlYWsoKTsgfSwgW10pO1xuICAgICAgICBfanp6Ll9yZXN1bWUoKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBfaW5pdE5PTkUoKSB7XG4gICAgICAgIF9lbmdpbmUuX3R5cGUgPSAnbm9uZSc7XG4gICAgICAgIF9lbmdpbmUuX3N5c2V4ID0gdHJ1ZTtcbiAgICAgICAgX2VuZ2luZS5fcmVmcmVzaCA9IGZ1bmN0aW9uICgpIHsgX2VuZ2luZS5fb3V0cyA9IFtdOyBfZW5naW5lLl9pbnMgPSBbXTsgfVxuICAgIH1cbiAgICAvLyBjb21tb24gaW5pdGlhbGl6YXRpb24gZm9yIEphenotUGx1Z2luIGFuZCBqYXp6LW1pZGlcbiAgICBmdW5jdGlvbiBfaW5pdEVuZ2luZUpQKCkge1xuICAgICAgICBfZW5naW5lLl9pbkFyciA9IFtdO1xuICAgICAgICBfZW5naW5lLl9vdXRBcnIgPSBbXTtcbiAgICAgICAgX2VuZ2luZS5faW5NYXAgPSB7fTtcbiAgICAgICAgX2VuZ2luZS5fb3V0TWFwID0ge307XG4gICAgICAgIF9lbmdpbmUuX3ZlcnNpb24gPSBfZW5naW5lLl9tYWluLnZlcnNpb247XG4gICAgICAgIF9lbmdpbmUuX3N5c2V4ID0gdHJ1ZTtcbiAgICAgICAgX2VuZ2luZS5fcmVmcmVzaCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIF9lbmdpbmUuX291dHMgPSBbXTtcbiAgICAgICAgICAgIF9lbmdpbmUuX2lucyA9IFtdO1xuICAgICAgICAgICAgdmFyIGksIHg7XG4gICAgICAgICAgICBmb3IgKGkgPSAwOyAoeCA9IF9lbmdpbmUuX21haW4uTWlkaU91dEluZm8oaSkpLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgX2VuZ2luZS5fb3V0cy5wdXNoKHsgdHlwZTogX2VuZ2luZS5fdHlwZSwgbmFtZTogeFswXSwgbWFudWZhY3R1cmVyOiB4WzFdLCB2ZXJzaW9uOiB4WzJdIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZm9yIChpID0gMDsgKHggPSBfZW5naW5lLl9tYWluLk1pZGlJbkluZm8oaSkpLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgX2VuZ2luZS5faW5zLnB1c2goeyB0eXBlOiBfZW5naW5lLl90eXBlLCBuYW1lOiB4WzBdLCBtYW51ZmFjdHVyZXI6IHhbMV0sIHZlcnNpb246IHhbMl0gfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgX2VuZ2luZS5fb3Blbk91dCA9IGZ1bmN0aW9uIChwb3J0LCBuYW1lKSB7XG4gICAgICAgICAgICB2YXIgaW1wbCA9IF9lbmdpbmUuX291dE1hcFtuYW1lXTtcbiAgICAgICAgICAgIGlmICghaW1wbCkge1xuICAgICAgICAgICAgICAgIGlmIChfZW5naW5lLl9wb29sLmxlbmd0aCA8PSBfZW5naW5lLl9vdXRBcnIubGVuZ3RoKSBfZW5naW5lLl9wb29sLnB1c2goX2VuZ2luZS5fbmV3UGx1Z2luKCkpO1xuICAgICAgICAgICAgICAgIGltcGwgPSB7XG4gICAgICAgICAgICAgICAgICAgIG5hbWU6IG5hbWUsXG4gICAgICAgICAgICAgICAgICAgIGNsaWVudHM6IFtdLFxuICAgICAgICAgICAgICAgICAgICBpbmZvOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBuYW1lOiBuYW1lLFxuICAgICAgICAgICAgICAgICAgICAgICAgbWFudWZhY3R1cmVyOiBfZW5naW5lLl9hbGxPdXRzW25hbWVdLm1hbnVmYWN0dXJlcixcbiAgICAgICAgICAgICAgICAgICAgICAgIHZlcnNpb246IF9lbmdpbmUuX2FsbE91dHNbbmFtZV0udmVyc2lvbixcbiAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6ICdNSURJLW91dCcsXG4gICAgICAgICAgICAgICAgICAgICAgICBzeXNleDogX2VuZ2luZS5fc3lzZXgsXG4gICAgICAgICAgICAgICAgICAgICAgICBlbmdpbmU6IF9lbmdpbmUuX3R5cGVcbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgX2Nsb3NlOiBmdW5jdGlvbiAocG9ydCkgeyBfZW5naW5lLl9jbG9zZU91dChwb3J0KTsgfSxcbiAgICAgICAgICAgICAgICAgICAgX3JlY2VpdmU6IGZ1bmN0aW9uIChhKSB7IHRoaXMucGx1Z2luLk1pZGlPdXRSYXcoYS5zbGljZSgpKTsgfVxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgdmFyIHBsdWdpbiA9IF9lbmdpbmUuX3Bvb2xbX2VuZ2luZS5fb3V0QXJyLmxlbmd0aF07XG4gICAgICAgICAgICAgICAgaW1wbC5wbHVnaW4gPSBwbHVnaW47XG4gICAgICAgICAgICAgICAgX2VuZ2luZS5fb3V0QXJyLnB1c2goaW1wbCk7XG4gICAgICAgICAgICAgICAgX2VuZ2luZS5fb3V0TWFwW25hbWVdID0gaW1wbDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICghaW1wbC5vcGVuKSB7XG4gICAgICAgICAgICAgICAgdmFyIHMgPSBpbXBsLnBsdWdpbi5NaWRpT3V0T3BlbihuYW1lKTtcbiAgICAgICAgICAgICAgICBpZiAocyAhPT0gbmFtZSkge1xuICAgICAgICAgICAgICAgICAgICBpZiAocykgaW1wbC5wbHVnaW4uTWlkaU91dENsb3NlKCk7XG4gICAgICAgICAgICAgICAgICAgIHBvcnQuX2JyZWFrKCk7IHJldHVybjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaW1wbC5vcGVuID0gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHBvcnQuX29yaWcuX2ltcGwgPSBpbXBsO1xuICAgICAgICAgICAgX3B1c2goaW1wbC5jbGllbnRzLCBwb3J0Ll9vcmlnKTtcbiAgICAgICAgICAgIHBvcnQuX2luZm8gPSBpbXBsLmluZm87XG4gICAgICAgICAgICBwb3J0Ll9yZWNlaXZlID0gZnVuY3Rpb24gKGFyZykgeyBpbXBsLl9yZWNlaXZlKGFyZyk7IH1cbiAgICAgICAgICAgIHBvcnQuX2Nsb3NlID0gZnVuY3Rpb24gKCkgeyBpbXBsLl9jbG9zZSh0aGlzKTsgfVxuICAgICAgICB9XG4gICAgICAgIF9lbmdpbmUuX29wZW5JbiA9IGZ1bmN0aW9uIChwb3J0LCBuYW1lKSB7XG4gICAgICAgICAgICB2YXIgaW1wbCA9IF9lbmdpbmUuX2luTWFwW25hbWVdO1xuICAgICAgICAgICAgaWYgKCFpbXBsKSB7XG4gICAgICAgICAgICAgICAgaWYgKF9lbmdpbmUuX3Bvb2wubGVuZ3RoIDw9IF9lbmdpbmUuX2luQXJyLmxlbmd0aCkgX2VuZ2luZS5fcG9vbC5wdXNoKF9lbmdpbmUuX25ld1BsdWdpbigpKTtcbiAgICAgICAgICAgICAgICBpbXBsID0ge1xuICAgICAgICAgICAgICAgICAgICBuYW1lOiBuYW1lLFxuICAgICAgICAgICAgICAgICAgICBjbGllbnRzOiBbXSxcbiAgICAgICAgICAgICAgICAgICAgaW5mbzoge1xuICAgICAgICAgICAgICAgICAgICAgICAgbmFtZTogbmFtZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG1hbnVmYWN0dXJlcjogX2VuZ2luZS5fYWxsSW5zW25hbWVdLm1hbnVmYWN0dXJlcixcbiAgICAgICAgICAgICAgICAgICAgICAgIHZlcnNpb246IF9lbmdpbmUuX2FsbEluc1tuYW1lXS52ZXJzaW9uLFxuICAgICAgICAgICAgICAgICAgICAgICAgdHlwZTogJ01JREktaW4nLFxuICAgICAgICAgICAgICAgICAgICAgICAgc3lzZXg6IF9lbmdpbmUuX3N5c2V4LFxuICAgICAgICAgICAgICAgICAgICAgICAgZW5naW5lOiBfZW5naW5lLl90eXBlXG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIF9jbG9zZTogZnVuY3Rpb24gKHBvcnQpIHsgX2VuZ2luZS5fY2xvc2VJbihwb3J0KTsgfSxcbiAgICAgICAgICAgICAgICAgICAgaGFuZGxlOiBmdW5jdGlvbiAodCwgYSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLmNsaWVudHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgbXNnID0gTUlESShhKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmNsaWVudHNbaV0uX2VtaXQobXNnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgZnVuY3Rpb24gbWFrZUhhbmRsZSh4KSB7IHJldHVybiBmdW5jdGlvbiAodCwgYSkgeyB4LmhhbmRsZSh0LCBhKTsgfTsgfTtcbiAgICAgICAgICAgICAgICBpbXBsLm9ubWlkaSA9IG1ha2VIYW5kbGUoaW1wbCk7XG4gICAgICAgICAgICAgICAgdmFyIHBsdWdpbiA9IF9lbmdpbmUuX3Bvb2xbX2VuZ2luZS5faW5BcnIubGVuZ3RoXTtcbiAgICAgICAgICAgICAgICBpbXBsLnBsdWdpbiA9IHBsdWdpbjtcbiAgICAgICAgICAgICAgICBfZW5naW5lLl9pbkFyci5wdXNoKGltcGwpO1xuICAgICAgICAgICAgICAgIF9lbmdpbmUuX2luTWFwW25hbWVdID0gaW1wbDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICghaW1wbC5vcGVuKSB7XG4gICAgICAgICAgICAgICAgdmFyIHMgPSBpbXBsLnBsdWdpbi5NaWRpSW5PcGVuKG5hbWUsIGltcGwub25taWRpKTtcbiAgICAgICAgICAgICAgICBpZiAocyAhPT0gbmFtZSkge1xuICAgICAgICAgICAgICAgICAgICBpZiAocykgaW1wbC5wbHVnaW4uTWlkaUluQ2xvc2UoKTtcbiAgICAgICAgICAgICAgICAgICAgcG9ydC5fYnJlYWsoKTsgcmV0dXJuO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpbXBsLm9wZW4gPSB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcG9ydC5fb3JpZy5faW1wbCA9IGltcGw7XG4gICAgICAgICAgICBfcHVzaChpbXBsLmNsaWVudHMsIHBvcnQuX29yaWcpO1xuICAgICAgICAgICAgcG9ydC5faW5mbyA9IGltcGwuaW5mbztcbiAgICAgICAgICAgIHBvcnQuX2Nsb3NlID0gZnVuY3Rpb24gKCkgeyBpbXBsLl9jbG9zZSh0aGlzKTsgfVxuICAgICAgICB9XG4gICAgICAgIF9lbmdpbmUuX2Nsb3NlT3V0ID0gZnVuY3Rpb24gKHBvcnQpIHtcbiAgICAgICAgICAgIHZhciBpbXBsID0gcG9ydC5faW1wbDtcbiAgICAgICAgICAgIF9wb3AoaW1wbC5jbGllbnRzLCBwb3J0Ll9vcmlnKTtcbiAgICAgICAgICAgIGlmICghaW1wbC5jbGllbnRzLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgIGltcGwub3BlbiA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIGltcGwucGx1Z2luLk1pZGlPdXRDbG9zZSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIF9lbmdpbmUuX2Nsb3NlSW4gPSBmdW5jdGlvbiAocG9ydCkge1xuICAgICAgICAgICAgdmFyIGltcGwgPSBwb3J0Ll9pbXBsO1xuICAgICAgICAgICAgX3BvcChpbXBsLmNsaWVudHMsIHBvcnQuX29yaWcpO1xuICAgICAgICAgICAgaWYgKCFpbXBsLmNsaWVudHMubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgaW1wbC5vcGVuID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgaW1wbC5wbHVnaW4uTWlkaUluQ2xvc2UoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBfZW5naW5lLl9jbG9zZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgX2VuZ2luZS5faW5BcnIubGVuZ3RoOyBpKyspIGlmIChfZW5naW5lLl9pbkFycltpXS5vcGVuKSBfZW5naW5lLl9pbkFycltpXS5wbHVnaW4uTWlkaUluQ2xvc2UoKTtcbiAgICAgICAgfVxuICAgICAgICBfSi5wcm90b3R5cGUuX3RpbWUgPSBmdW5jdGlvbiAoKSB7IHJldHVybiBfZW5naW5lLl9tYWluLlRpbWUoKTsgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIF9pbml0Tm9kZShvYmopIHtcbiAgICAgICAgX2VuZ2luZS5fdHlwZSA9ICdub2RlJztcbiAgICAgICAgX2VuZ2luZS5fbWFpbiA9IG9iajtcbiAgICAgICAgX2VuZ2luZS5fcG9vbCA9IFtdO1xuICAgICAgICBfZW5naW5lLl9uZXdQbHVnaW4gPSBmdW5jdGlvbiAoKSB7IHJldHVybiBuZXcgb2JqLk1JREkoKTsgfVxuICAgICAgICBfaW5pdEVuZ2luZUpQKCk7XG4gICAgfVxuICAgIGZ1bmN0aW9uIF9pbml0SmF6elBsdWdpbihvYmopIHtcbiAgICAgICAgX2VuZ2luZS5fdHlwZSA9ICdwbHVnaW4nO1xuICAgICAgICBfZW5naW5lLl9tYWluID0gb2JqO1xuICAgICAgICBfZW5naW5lLl9wb29sID0gW29ial07XG4gICAgICAgIF9lbmdpbmUuX25ld1BsdWdpbiA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHZhciBwbGcgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdvYmplY3QnKTtcbiAgICAgICAgICAgIHBsZy5zdHlsZS52aXNpYmlsaXR5ID0gJ2hpZGRlbic7XG4gICAgICAgICAgICBwbGcuc3R5bGUud2lkdGggPSAnMHB4Jzsgb2JqLnN0eWxlLmhlaWdodCA9ICcwcHgnO1xuICAgICAgICAgICAgcGxnLmNsYXNzaWQgPSAnQ0xTSUQ6MUFDRTE2MTgtMUM3RC00NTYxLUFFRTEtMzQ4NDJBQTg1RTkwJztcbiAgICAgICAgICAgIHBsZy50eXBlID0gJ2F1ZGlvL3gtamF6eic7XG4gICAgICAgICAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKHBsZyk7XG4gICAgICAgICAgICByZXR1cm4gcGxnLmlzSmF6eiA/IHBsZyA6IHVuZGVmaW5lZDtcbiAgICAgICAgfVxuICAgICAgICBfaW5pdEVuZ2luZUpQKCk7XG4gICAgfVxuICAgIGZ1bmN0aW9uIF9pbml0V2ViTUlESShhY2Nlc3MsIHN5c2V4KSB7XG4gICAgICAgIF9lbmdpbmUuX3R5cGUgPSAnd2VibWlkaSc7XG4gICAgICAgIF9lbmdpbmUuX3ZlcnNpb24gPSA0MztcbiAgICAgICAgX2VuZ2luZS5fc3lzZXggPSAhIXN5c2V4O1xuICAgICAgICBfZW5naW5lLl9hY2Nlc3MgPSBhY2Nlc3M7XG4gICAgICAgIF9lbmdpbmUuX2luTWFwID0ge307XG4gICAgICAgIF9lbmdpbmUuX291dE1hcCA9IHt9O1xuICAgICAgICBfZW5naW5lLl9yZWZyZXNoID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgX2VuZ2luZS5fb3V0cyA9IFtdO1xuICAgICAgICAgICAgX2VuZ2luZS5faW5zID0gW107XG4gICAgICAgICAgICBfZW5naW5lLl9hY2Nlc3Mub3V0cHV0cy5mb3JFYWNoKGZ1bmN0aW9uIChwb3J0LCBrZXkpIHtcbiAgICAgICAgICAgICAgICBfZW5naW5lLl9vdXRzLnB1c2goeyB0eXBlOiBfZW5naW5lLl90eXBlLCBuYW1lOiBwb3J0Lm5hbWUsIG1hbnVmYWN0dXJlcjogcG9ydC5tYW51ZmFjdHVyZXIsIHZlcnNpb246IHBvcnQudmVyc2lvbiB9KTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgX2VuZ2luZS5fYWNjZXNzLmlucHV0cy5mb3JFYWNoKGZ1bmN0aW9uIChwb3J0LCBrZXkpIHtcbiAgICAgICAgICAgICAgICBfZW5naW5lLl9pbnMucHVzaCh7IHR5cGU6IF9lbmdpbmUuX3R5cGUsIG5hbWU6IHBvcnQubmFtZSwgbWFudWZhY3R1cmVyOiBwb3J0Lm1hbnVmYWN0dXJlciwgdmVyc2lvbjogcG9ydC52ZXJzaW9uIH0pO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgX2VuZ2luZS5fb3Blbk91dCA9IGZ1bmN0aW9uIChwb3J0LCBuYW1lKSB7XG4gICAgICAgICAgICB2YXIgaW1wbCA9IF9lbmdpbmUuX291dE1hcFtuYW1lXTtcbiAgICAgICAgICAgIGlmICghaW1wbCkge1xuICAgICAgICAgICAgICAgIGltcGwgPSB7XG4gICAgICAgICAgICAgICAgICAgIG5hbWU6IG5hbWUsXG4gICAgICAgICAgICAgICAgICAgIGNsaWVudHM6IFtdLFxuICAgICAgICAgICAgICAgICAgICBpbmZvOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBuYW1lOiBuYW1lLFxuICAgICAgICAgICAgICAgICAgICAgICAgbWFudWZhY3R1cmVyOiBfZW5naW5lLl9hbGxPdXRzW25hbWVdLm1hbnVmYWN0dXJlcixcbiAgICAgICAgICAgICAgICAgICAgICAgIHZlcnNpb246IF9lbmdpbmUuX2FsbE91dHNbbmFtZV0udmVyc2lvbixcbiAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6ICdNSURJLW91dCcsXG4gICAgICAgICAgICAgICAgICAgICAgICBzeXNleDogX2VuZ2luZS5fc3lzZXgsXG4gICAgICAgICAgICAgICAgICAgICAgICBlbmdpbmU6IF9lbmdpbmUuX3R5cGVcbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgX2Nsb3NlOiBmdW5jdGlvbiAocG9ydCkgeyBfZW5naW5lLl9jbG9zZU91dChwb3J0KTsgfSxcbiAgICAgICAgICAgICAgICAgICAgX3JlY2VpdmU6IGZ1bmN0aW9uIChhKSB7IHRoaXMuZGV2LnNlbmQoYS5zbGljZSgpKTsgfVxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgdmFyIGlkLCBkZXY7XG4gICAgICAgICAgICAgICAgX2VuZ2luZS5fYWNjZXNzLm91dHB1dHMuZm9yRWFjaChmdW5jdGlvbiAoZGV2LCBrZXkpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGRldi5uYW1lID09PSBuYW1lKSBpbXBsLmRldiA9IGRldjtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICBpZiAoaW1wbC5kZXYpIHtcbiAgICAgICAgICAgICAgICAgICAgX2VuZ2luZS5fb3V0TWFwW25hbWVdID0gaW1wbDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSBpbXBsID0gdW5kZWZpbmVkO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGltcGwpIHtcbiAgICAgICAgICAgICAgICBpZiAoaW1wbC5kZXYub3BlbikgaW1wbC5kZXYub3BlbigpO1xuICAgICAgICAgICAgICAgIHBvcnQuX29yaWcuX2ltcGwgPSBpbXBsO1xuICAgICAgICAgICAgICAgIF9wdXNoKGltcGwuY2xpZW50cywgcG9ydC5fb3JpZyk7XG4gICAgICAgICAgICAgICAgcG9ydC5faW5mbyA9IGltcGwuaW5mbztcbiAgICAgICAgICAgICAgICBwb3J0Ll9yZWNlaXZlID0gZnVuY3Rpb24gKGFyZykgeyBpbXBsLl9yZWNlaXZlKGFyZyk7IH1cbiAgICAgICAgICAgICAgICBwb3J0Ll9jbG9zZSA9IGZ1bmN0aW9uICgpIHsgaW1wbC5fY2xvc2UodGhpcyk7IH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgcG9ydC5fYnJlYWsoKTtcbiAgICAgICAgfVxuICAgICAgICBfZW5naW5lLl9vcGVuSW4gPSBmdW5jdGlvbiAocG9ydCwgbmFtZSkge1xuICAgICAgICAgICAgdmFyIGltcGwgPSBfZW5naW5lLl9pbk1hcFtuYW1lXTtcbiAgICAgICAgICAgIGlmICghaW1wbCkge1xuICAgICAgICAgICAgICAgIGltcGwgPSB7XG4gICAgICAgICAgICAgICAgICAgIG5hbWU6IG5hbWUsXG4gICAgICAgICAgICAgICAgICAgIGNsaWVudHM6IFtdLFxuICAgICAgICAgICAgICAgICAgICBpbmZvOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBuYW1lOiBuYW1lLFxuICAgICAgICAgICAgICAgICAgICAgICAgbWFudWZhY3R1cmVyOiBfZW5naW5lLl9hbGxJbnNbbmFtZV0ubWFudWZhY3R1cmVyLFxuICAgICAgICAgICAgICAgICAgICAgICAgdmVyc2lvbjogX2VuZ2luZS5fYWxsSW5zW25hbWVdLnZlcnNpb24sXG4gICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiAnTUlESS1pbicsXG4gICAgICAgICAgICAgICAgICAgICAgICBzeXNleDogX2VuZ2luZS5fc3lzZXgsXG4gICAgICAgICAgICAgICAgICAgICAgICBlbmdpbmU6IF9lbmdpbmUuX3R5cGVcbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgX2Nsb3NlOiBmdW5jdGlvbiAocG9ydCkgeyBfZW5naW5lLl9jbG9zZUluKHBvcnQpOyB9LFxuICAgICAgICAgICAgICAgICAgICBoYW5kbGU6IGZ1bmN0aW9uIChldnQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5jbGllbnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIG1zZyA9IE1JREkoW10uc2xpY2UuY2FsbChldnQuZGF0YSkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuY2xpZW50c1tpXS5fZW1pdChtc2cpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICB2YXIgaWQsIGRldjtcbiAgICAgICAgICAgICAgICBfZW5naW5lLl9hY2Nlc3MuaW5wdXRzLmZvckVhY2goZnVuY3Rpb24gKGRldiwga2V5KSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChkZXYubmFtZSA9PT0gbmFtZSkgaW1wbC5kZXYgPSBkZXY7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgaWYgKGltcGwuZGV2KSB7XG4gICAgICAgICAgICAgICAgICAgIGZ1bmN0aW9uIG1ha2VIYW5kbGUoeCkgeyByZXR1cm4gZnVuY3Rpb24gKGV2dCkgeyB4LmhhbmRsZShldnQpOyB9OyB9O1xuICAgICAgICAgICAgICAgICAgICBpbXBsLmRldi5vbm1pZGltZXNzYWdlID0gbWFrZUhhbmRsZShpbXBsKTtcbiAgICAgICAgICAgICAgICAgICAgX2VuZ2luZS5faW5NYXBbbmFtZV0gPSBpbXBsO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIGltcGwgPSB1bmRlZmluZWQ7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoaW1wbCkge1xuICAgICAgICAgICAgICAgIGlmIChpbXBsLmRldi5vcGVuKSBpbXBsLmRldi5vcGVuKCk7XG4gICAgICAgICAgICAgICAgcG9ydC5fb3JpZy5faW1wbCA9IGltcGw7XG4gICAgICAgICAgICAgICAgX3B1c2goaW1wbC5jbGllbnRzLCBwb3J0Ll9vcmlnKTtcbiAgICAgICAgICAgICAgICBwb3J0Ll9pbmZvID0gaW1wbC5pbmZvO1xuICAgICAgICAgICAgICAgIHBvcnQuX2Nsb3NlID0gZnVuY3Rpb24gKCkgeyBpbXBsLl9jbG9zZSh0aGlzKTsgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBwb3J0Ll9icmVhaygpO1xuICAgICAgICB9XG4gICAgICAgIF9lbmdpbmUuX2Nsb3NlT3V0ID0gZnVuY3Rpb24gKHBvcnQpIHtcbiAgICAgICAgICAgIHZhciBpbXBsID0gcG9ydC5faW1wbDtcbiAgICAgICAgICAgIGlmICghaW1wbC5jbGllbnRzLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgIGlmIChpbXBsLmRldi5jbG9zZSkgaW1wbC5kZXYuY2xvc2UoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIF9wb3AoaW1wbC5jbGllbnRzLCBwb3J0Ll9vcmlnKTtcbiAgICAgICAgfVxuICAgICAgICBfZW5naW5lLl9jbG9zZUluID0gZnVuY3Rpb24gKHBvcnQpIHtcbiAgICAgICAgICAgIHZhciBpbXBsID0gcG9ydC5faW1wbDtcbiAgICAgICAgICAgIF9wb3AoaW1wbC5jbGllbnRzLCBwb3J0Ll9vcmlnKTtcbiAgICAgICAgICAgIGlmICghaW1wbC5jbGllbnRzLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgIGlmIChpbXBsLmRldi5jbG9zZSkgaW1wbC5kZXYuY2xvc2UoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBfZW5naW5lLl9jbG9zZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgfVxuICAgIH1cbiAgICBmdW5jdGlvbiBfaW5pdENSWChtc2csIHZlcikge1xuICAgICAgICBfZW5naW5lLl90eXBlID0gJ2V4dGVuc2lvbic7XG4gICAgICAgIF9lbmdpbmUuX3ZlcnNpb24gPSB2ZXI7XG4gICAgICAgIF9lbmdpbmUuX3N5c2V4ID0gdHJ1ZTtcbiAgICAgICAgX2VuZ2luZS5fcG9vbCA9IFtdO1xuICAgICAgICBfZW5naW5lLl9pbkFyciA9IFtdO1xuICAgICAgICBfZW5naW5lLl9vdXRBcnIgPSBbXTtcbiAgICAgICAgX2VuZ2luZS5faW5NYXAgPSB7fTtcbiAgICAgICAgX2VuZ2luZS5fb3V0TWFwID0ge307XG4gICAgICAgIF9lbmdpbmUuX21zZyA9IG1zZztcbiAgICAgICAgX2VuZ2luZS5fbmV3UGx1Z2luID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIHBsdWdpbiA9IHsgaWQ6IF9lbmdpbmUuX3Bvb2wubGVuZ3RoIH07XG4gICAgICAgICAgICBpZiAoIXBsdWdpbi5pZCkgcGx1Z2luLnJlYWR5ID0gdHJ1ZTtcbiAgICAgICAgICAgIGVsc2UgZG9jdW1lbnQuZGlzcGF0Y2hFdmVudChuZXcgQ3VzdG9tRXZlbnQoJ2phenotbWlkaScsIHsgZGV0YWlsOiBbJ25ldyddIH0pKTtcbiAgICAgICAgICAgIF9lbmdpbmUuX3Bvb2wucHVzaChwbHVnaW4pO1xuICAgICAgICB9XG4gICAgICAgIF9lbmdpbmUuX25ld1BsdWdpbigpO1xuICAgICAgICBfZW5naW5lLl9yZWZyZXNoID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgX2VuZ2luZS5fb3V0cyA9IFtdO1xuICAgICAgICAgICAgX2VuZ2luZS5faW5zID0gW107XG4gICAgICAgICAgICBfanp6Ll9wYXVzZSgpO1xuICAgICAgICAgICAgZG9jdW1lbnQuZGlzcGF0Y2hFdmVudChuZXcgQ3VzdG9tRXZlbnQoJ2phenotbWlkaScsIHsgZGV0YWlsOiBbJ3JlZnJlc2gnXSB9KSk7XG4gICAgICAgIH1cbiAgICAgICAgX2VuZ2luZS5fb3Blbk91dCA9IGZ1bmN0aW9uIChwb3J0LCBuYW1lKSB7XG4gICAgICAgICAgICB2YXIgaW1wbCA9IF9lbmdpbmUuX291dE1hcFtuYW1lXTtcbiAgICAgICAgICAgIGlmICghaW1wbCkge1xuICAgICAgICAgICAgICAgIGlmIChfZW5naW5lLl9wb29sLmxlbmd0aCA8PSBfZW5naW5lLl9vdXRBcnIubGVuZ3RoKSBfZW5naW5lLl9uZXdQbHVnaW4oKTtcbiAgICAgICAgICAgICAgICB2YXIgcGx1Z2luID0gX2VuZ2luZS5fcG9vbFtfZW5naW5lLl9vdXRBcnIubGVuZ3RoXTtcbiAgICAgICAgICAgICAgICBpbXBsID0ge1xuICAgICAgICAgICAgICAgICAgICBuYW1lOiBuYW1lLFxuICAgICAgICAgICAgICAgICAgICBjbGllbnRzOiBbXSxcbiAgICAgICAgICAgICAgICAgICAgaW5mbzoge1xuICAgICAgICAgICAgICAgICAgICAgICAgbmFtZTogbmFtZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG1hbnVmYWN0dXJlcjogX2VuZ2luZS5fYWxsT3V0c1tuYW1lXS5tYW51ZmFjdHVyZXIsXG4gICAgICAgICAgICAgICAgICAgICAgICB2ZXJzaW9uOiBfZW5naW5lLl9hbGxPdXRzW25hbWVdLnZlcnNpb24sXG4gICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiAnTUlESS1vdXQnLFxuICAgICAgICAgICAgICAgICAgICAgICAgc3lzZXg6IF9lbmdpbmUuX3N5c2V4LFxuICAgICAgICAgICAgICAgICAgICAgICAgZW5naW5lOiBfZW5naW5lLl90eXBlXG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIF9zdGFydDogZnVuY3Rpb24gKCkgeyBkb2N1bWVudC5kaXNwYXRjaEV2ZW50KG5ldyBDdXN0b21FdmVudCgnamF6ei1taWRpJywgeyBkZXRhaWw6IFsnb3Blbm91dCcsIHBsdWdpbi5pZCwgbmFtZV0gfSkpOyB9LFxuICAgICAgICAgICAgICAgICAgICBfY2xvc2U6IGZ1bmN0aW9uIChwb3J0KSB7IF9lbmdpbmUuX2Nsb3NlT3V0KHBvcnQpOyB9LFxuICAgICAgICAgICAgICAgICAgICBfcmVjZWl2ZTogZnVuY3Rpb24gKGEpIHsgdmFyIHYgPSBhLnNsaWNlKCk7IHYuc3BsaWNlKDAsIDAsICdwbGF5JywgcGx1Z2luLmlkKTsgZG9jdW1lbnQuZGlzcGF0Y2hFdmVudChuZXcgQ3VzdG9tRXZlbnQoJ2phenotbWlkaScsIHsgZGV0YWlsOiB2IH0pKTsgfVxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgaW1wbC5wbHVnaW4gPSBwbHVnaW47XG4gICAgICAgICAgICAgICAgcGx1Z2luLm91dHB1dCA9IGltcGw7XG4gICAgICAgICAgICAgICAgX2VuZ2luZS5fb3V0QXJyLnB1c2goaW1wbCk7XG4gICAgICAgICAgICAgICAgX2VuZ2luZS5fb3V0TWFwW25hbWVdID0gaW1wbDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHBvcnQuX29yaWcuX2ltcGwgPSBpbXBsO1xuICAgICAgICAgICAgX3B1c2goaW1wbC5jbGllbnRzLCBwb3J0Ll9vcmlnKTtcbiAgICAgICAgICAgIHBvcnQuX2luZm8gPSBpbXBsLmluZm87XG4gICAgICAgICAgICBwb3J0Ll9yZWNlaXZlID0gZnVuY3Rpb24gKGFyZykgeyBpbXBsLl9yZWNlaXZlKGFyZyk7IH1cbiAgICAgICAgICAgIHBvcnQuX2Nsb3NlID0gZnVuY3Rpb24gKCkgeyBpbXBsLl9jbG9zZSh0aGlzKTsgfVxuICAgICAgICAgICAgaWYgKCFpbXBsLm9wZW4pIHtcbiAgICAgICAgICAgICAgICBpZiAoaW1wbC5wbHVnaW4ucmVhZHkpIGltcGwuX3N0YXJ0KCk7XG4gICAgICAgICAgICAgICAgcG9ydC5fcGF1c2UoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBfZW5naW5lLl9vcGVuSW4gPSBmdW5jdGlvbiAocG9ydCwgbmFtZSkge1xuICAgICAgICAgICAgdmFyIGltcGwgPSBfZW5naW5lLl9pbk1hcFtuYW1lXTtcbiAgICAgICAgICAgIGlmICghaW1wbCkge1xuICAgICAgICAgICAgICAgIGlmIChfZW5naW5lLl9wb29sLmxlbmd0aCA8PSBfZW5naW5lLl9pbkFyci5sZW5ndGgpIF9lbmdpbmUuX25ld1BsdWdpbigpO1xuICAgICAgICAgICAgICAgIHZhciBwbHVnaW4gPSBfZW5naW5lLl9wb29sW19lbmdpbmUuX2luQXJyLmxlbmd0aF07XG4gICAgICAgICAgICAgICAgaW1wbCA9IHtcbiAgICAgICAgICAgICAgICAgICAgbmFtZTogbmFtZSxcbiAgICAgICAgICAgICAgICAgICAgY2xpZW50czogW10sXG4gICAgICAgICAgICAgICAgICAgIGluZm86IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG5hbWU6IG5hbWUsXG4gICAgICAgICAgICAgICAgICAgICAgICBtYW51ZmFjdHVyZXI6IF9lbmdpbmUuX2FsbEluc1tuYW1lXS5tYW51ZmFjdHVyZXIsXG4gICAgICAgICAgICAgICAgICAgICAgICB2ZXJzaW9uOiBfZW5naW5lLl9hbGxJbnNbbmFtZV0udmVyc2lvbixcbiAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6ICdNSURJLWluJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHN5c2V4OiBfZW5naW5lLl9zeXNleCxcbiAgICAgICAgICAgICAgICAgICAgICAgIGVuZ2luZTogX2VuZ2luZS5fdHlwZVxuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICBfc3RhcnQ6IGZ1bmN0aW9uICgpIHsgZG9jdW1lbnQuZGlzcGF0Y2hFdmVudChuZXcgQ3VzdG9tRXZlbnQoJ2phenotbWlkaScsIHsgZGV0YWlsOiBbJ29wZW5pbicsIHBsdWdpbi5pZCwgbmFtZV0gfSkpOyB9LFxuICAgICAgICAgICAgICAgICAgICBfY2xvc2U6IGZ1bmN0aW9uIChwb3J0KSB7IF9lbmdpbmUuX2Nsb3NlSW4ocG9ydCk7IH1cbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIGltcGwucGx1Z2luID0gcGx1Z2luO1xuICAgICAgICAgICAgICAgIHBsdWdpbi5pbnB1dCA9IGltcGw7XG4gICAgICAgICAgICAgICAgX2VuZ2luZS5faW5BcnIucHVzaChpbXBsKTtcbiAgICAgICAgICAgICAgICBfZW5naW5lLl9pbk1hcFtuYW1lXSA9IGltcGw7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBwb3J0Ll9vcmlnLl9pbXBsID0gaW1wbDtcbiAgICAgICAgICAgIF9wdXNoKGltcGwuY2xpZW50cywgcG9ydC5fb3JpZyk7XG4gICAgICAgICAgICBwb3J0Ll9pbmZvID0gaW1wbC5pbmZvO1xuICAgICAgICAgICAgcG9ydC5fY2xvc2UgPSBmdW5jdGlvbiAoKSB7IGltcGwuX2Nsb3NlKHRoaXMpOyB9XG4gICAgICAgICAgICBpZiAoIWltcGwub3Blbikge1xuICAgICAgICAgICAgICAgIGlmIChpbXBsLnBsdWdpbi5yZWFkeSkgaW1wbC5fc3RhcnQoKTtcbiAgICAgICAgICAgICAgICBwb3J0Ll9wYXVzZSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIF9lbmdpbmUuX2Nsb3NlT3V0ID0gZnVuY3Rpb24gKHBvcnQpIHtcbiAgICAgICAgICAgIHZhciBpbXBsID0gcG9ydC5faW1wbDtcbiAgICAgICAgICAgIF9wb3AoaW1wbC5jbGllbnRzLCBwb3J0Ll9vcmlnKTtcbiAgICAgICAgICAgIGlmICghaW1wbC5jbGllbnRzLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgIGltcGwub3BlbiA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIGRvY3VtZW50LmRpc3BhdGNoRXZlbnQobmV3IEN1c3RvbUV2ZW50KCdqYXp6LW1pZGknLCB7IGRldGFpbDogWydjbG9zZW91dCcsIGltcGwucGx1Z2luLmlkXSB9KSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgX2VuZ2luZS5fY2xvc2VJbiA9IGZ1bmN0aW9uIChwb3J0KSB7XG4gICAgICAgICAgICB2YXIgaW1wbCA9IHBvcnQuX2ltcGw7XG4gICAgICAgICAgICBfcG9wKGltcGwuY2xpZW50cywgcG9ydC5fb3JpZyk7XG4gICAgICAgICAgICBpZiAoIWltcGwuY2xpZW50cy5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICBpbXBsLm9wZW4gPSBmYWxzZTtcbiAgICAgICAgICAgICAgICBkb2N1bWVudC5kaXNwYXRjaEV2ZW50KG5ldyBDdXN0b21FdmVudCgnamF6ei1taWRpJywgeyBkZXRhaWw6IFsnY2xvc2VpbicsIGltcGwucGx1Z2luLmlkXSB9KSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgX2VuZ2luZS5fY2xvc2UgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIH1cbiAgICAgICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignamF6ei1taWRpLW1zZycsIGZ1bmN0aW9uIChlKSB7XG4gICAgICAgICAgICB2YXIgdiA9IF9lbmdpbmUuX21zZy5pbm5lclRleHQuc3BsaXQoJ1xcbicpO1xuICAgICAgICAgICAgX2VuZ2luZS5fbXNnLmlubmVyVGV4dCA9ICcnO1xuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB2Lmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgdmFyIGEgPSBbXTtcbiAgICAgICAgICAgICAgICB0cnkgeyBhID0gSlNPTi5wYXJzZSh2W2ldKTsgfSBjYXRjaCAoZSkgeyB9XG4gICAgICAgICAgICAgICAgaWYgKCFhLmxlbmd0aCkgY29udGludWU7XG4gICAgICAgICAgICAgICAgaWYgKGFbMF0gPT09ICdyZWZyZXNoJykge1xuICAgICAgICAgICAgICAgICAgICBpZiAoYVsxXS5pbnMpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvciAodmFyIGogPSAwOyBpIDwgYVsxXS5pbnM7IGkrKykgYVsxXS5pbnNbal0udHlwZSA9IF9lbmdpbmUuX3R5cGU7XG4gICAgICAgICAgICAgICAgICAgICAgICBfZW5naW5lLl9pbnMgPSBhWzFdLmlucztcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBpZiAoYVsxXS5vdXRzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBmb3IgKHZhciBqID0gMDsgaSA8IGFbMV0ub3V0czsgaSsrKSBhWzFdLm91dHNbal0udHlwZSA9IF9lbmdpbmUuX3R5cGU7XG4gICAgICAgICAgICAgICAgICAgICAgICBfZW5naW5lLl9vdXRzID0gYVsxXS5vdXRzO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIF9qenouX3Jlc3VtZSgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIGlmIChhWzBdID09PSAndmVyc2lvbicpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHBsdWdpbiA9IF9lbmdpbmUuX3Bvb2xbYVsxXV07XG4gICAgICAgICAgICAgICAgICAgIGlmIChwbHVnaW4pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHBsdWdpbi5yZWFkeSA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAocGx1Z2luLmlucHV0KSBwbHVnaW4uaW5wdXQuX3N0YXJ0KCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAocGx1Z2luLm91dHB1dCkgcGx1Z2luLm91dHB1dC5fc3RhcnQoKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIGlmIChhWzBdID09PSAnb3Blbm91dCcpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGltcGwgPSBfZW5naW5lLl9wb29sW2FbMV1dLm91dHB1dDtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGltcGwpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChhWzJdID09IGltcGwubmFtZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGltcGwub3BlbiA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGltcGwuY2xpZW50cykgZm9yICh2YXIgaSA9IDA7IGkgPCBpbXBsLmNsaWVudHMubGVuZ3RoOyBpKyspIGltcGwuY2xpZW50c1tpXS5fcmVzdW1lKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBlbHNlIGlmIChpbXBsLmNsaWVudHMpIGZvciAodmFyIGkgPSAwOyBpIDwgaW1wbC5jbGllbnRzLmxlbmd0aDsgaSsrKSBpbXBsLmNsaWVudHNbaV0uX2NyYXNoKCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSBpZiAoYVswXSA9PT0gJ29wZW5pbicpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGltcGwgPSBfZW5naW5lLl9wb29sW2FbMV1dLmlucHV0O1xuICAgICAgICAgICAgICAgICAgICBpZiAoaW1wbCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGFbMl0gPT0gaW1wbC5uYW1lKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaW1wbC5vcGVuID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoaW1wbC5jbGllbnRzKSBmb3IgKHZhciBpID0gMDsgaSA8IGltcGwuY2xpZW50cy5sZW5ndGg7IGkrKykgaW1wbC5jbGllbnRzW2ldLl9yZXN1bWUoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGVsc2UgaWYgKGltcGwuY2xpZW50cykgZm9yICh2YXIgaSA9IDA7IGkgPCBpbXBsLmNsaWVudHMubGVuZ3RoOyBpKyspIGltcGwuY2xpZW50c1tpXS5fY3Jhc2goKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIGlmIChhWzBdID09PSAnbWlkaScpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGltcGwgPSBfZW5naW5lLl9wb29sW2FbMV1dLmlucHV0O1xuICAgICAgICAgICAgICAgICAgICBpZiAoaW1wbCAmJiBpbXBsLmNsaWVudHMpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgaW1wbC5jbGllbnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIG1zZyA9IE1JREkoYS5zbGljZSgzKSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaW1wbC5jbGllbnRzW2ldLl9lbWl0KG1zZyk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHZhciBKWlogPSBmdW5jdGlvbiAob3B0KSB7XG4gICAgICAgIGlmICghX2p6eikgX2luaXRKWloob3B0KTtcbiAgICAgICAgcmV0dXJuIF9qeno7XG4gICAgfVxuICAgIEpaWi5pbmZvID0gZnVuY3Rpb24gKCkgeyByZXR1cm4gX0oucHJvdG90eXBlLmluZm8oKTsgfVxuICAgIEpaWi5jcmVhdGVOZXcgPSBmdW5jdGlvbiAoYXJnKSB7XG4gICAgICAgIHZhciBvYmogPSBuZXcgX00oKTtcbiAgICAgICAgaWYgKGFyZyBpbnN0YW5jZW9mIE9iamVjdCkgZm9yICh2YXIgayBpbiBhcmcpIGlmIChhcmcuaGFzT3duUHJvcGVydHkoaykpIG9ialtrXSA9IGFyZ1trXTtcbiAgICAgICAgb2JqLl9yZXN1bWUoKTtcbiAgICAgICAgcmV0dXJuIG9iajtcbiAgICB9XG4gICAgX0oucHJvdG90eXBlLmNyZWF0ZU5ldyA9IEpaWi5jcmVhdGVOZXc7XG5cbiAgICAvLyBKWlouU01QVEVcblxuICAgIGZ1bmN0aW9uIFNNUFRFKCkge1xuICAgICAgICB2YXIgc2VsZiA9IHRoaXMgaW5zdGFuY2VvZiBTTVBURSA/IHRoaXMgOiBzZWxmID0gbmV3IFNNUFRFKCk7XG4gICAgICAgIFNNUFRFLnByb3RvdHlwZS5yZXNldC5hcHBseShzZWxmLCBhcmd1bWVudHMpO1xuICAgICAgICByZXR1cm4gc2VsZjtcbiAgICB9XG4gICAgU01QVEUucHJvdG90eXBlLnJlc2V0ID0gZnVuY3Rpb24gKGFyZykge1xuICAgICAgICBpZiAoYXJnIGluc3RhbmNlb2YgU01QVEUpIHtcbiAgICAgICAgICAgIHRoaXMuc2V0VHlwZShhcmcuZ2V0VHlwZSgpKTtcbiAgICAgICAgICAgIHRoaXMuc2V0SG91cihhcmcuZ2V0SG91cigpKTtcbiAgICAgICAgICAgIHRoaXMuc2V0TWludXRlKGFyZy5nZXRNaW51dGUoKSk7XG4gICAgICAgICAgICB0aGlzLnNldFNlY29uZChhcmcuZ2V0U2Vjb25kKCkpO1xuICAgICAgICAgICAgdGhpcy5zZXRGcmFtZShhcmcuZ2V0RnJhbWUoKSk7XG4gICAgICAgICAgICB0aGlzLnNldFF1YXJ0ZXIoYXJnLmdldFF1YXJ0ZXIoKSk7XG4gICAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgfVxuICAgICAgICB2YXIgYXJyID0gYXJnIGluc3RhbmNlb2YgQXJyYXkgPyBhcmcgOiBhcmd1bWVudHM7XG4gICAgICAgIHRoaXMuc2V0VHlwZShhcnJbMF0pO1xuICAgICAgICB0aGlzLnNldEhvdXIoYXJyWzFdKTtcbiAgICAgICAgdGhpcy5zZXRNaW51dGUoYXJyWzJdKTtcbiAgICAgICAgdGhpcy5zZXRTZWNvbmQoYXJyWzNdKTtcbiAgICAgICAgdGhpcy5zZXRGcmFtZShhcnJbNF0pO1xuICAgICAgICB0aGlzLnNldFF1YXJ0ZXIoYXJyWzVdKTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuICAgIGZ1bmN0aW9uIF9maXhEcm9wRnJhbWUoKSB7IGlmICh0aGlzLnR5cGUgPT0gMjkuOTcgJiYgIXRoaXMuc2Vjb25kICYmIHRoaXMuZnJhbWUgPCAyICYmIHRoaXMubWludXRlICUgMTApIHRoaXMuZnJhbWUgPSAyOyB9XG4gICAgU01QVEUucHJvdG90eXBlLmlzRnVsbEZyYW1lID0gZnVuY3Rpb24gKCkgeyByZXR1cm4gdGhpcy5xdWFydGVyID09IDAgfHwgdGhpcy5xdWFydGVyID09IDQ7IH1cbiAgICBTTVBURS5wcm90b3R5cGUuZ2V0VHlwZSA9IGZ1bmN0aW9uICgpIHsgcmV0dXJuIHRoaXMudHlwZTsgfVxuICAgIFNNUFRFLnByb3RvdHlwZS5nZXRIb3VyID0gZnVuY3Rpb24gKCkgeyByZXR1cm4gdGhpcy5ob3VyOyB9XG4gICAgU01QVEUucHJvdG90eXBlLmdldE1pbnV0ZSA9IGZ1bmN0aW9uICgpIHsgcmV0dXJuIHRoaXMubWludXRlOyB9XG4gICAgU01QVEUucHJvdG90eXBlLmdldFNlY29uZCA9IGZ1bmN0aW9uICgpIHsgcmV0dXJuIHRoaXMuc2Vjb25kOyB9XG4gICAgU01QVEUucHJvdG90eXBlLmdldEZyYW1lID0gZnVuY3Rpb24gKCkgeyByZXR1cm4gdGhpcy5mcmFtZTsgfVxuICAgIFNNUFRFLnByb3RvdHlwZS5nZXRRdWFydGVyID0gZnVuY3Rpb24gKCkgeyByZXR1cm4gdGhpcy5xdWFydGVyOyB9XG4gICAgU01QVEUucHJvdG90eXBlLnNldFR5cGUgPSBmdW5jdGlvbiAoeCkge1xuICAgICAgICBpZiAodHlwZW9mIHggPT0gJ3VuZGVmaW5lZCcgfHwgeCA9PSAyNCkgdGhpcy50eXBlID0gMjQ7XG4gICAgICAgIGVsc2UgaWYgKHggPT0gMjUpIHRoaXMudHlwZSA9IDI1O1xuICAgICAgICBlbHNlIGlmICh4ID09IDI5Ljk3KSB7IHRoaXMudHlwZSA9IDI5Ljk3OyBfZml4RHJvcEZyYW1lLmFwcGx5KHRoaXMpOyB9XG4gICAgICAgIGVsc2UgaWYgKHggPT0gMzApIHRoaXMudHlwZSA9IDMwO1xuICAgICAgICBlbHNlIHRocm93IFJhbmdlRXJyb3IoJ0JhZCBTTVBURSBmcmFtZSByYXRlOiAnICsgeCk7XG4gICAgICAgIGlmICh0aGlzLmZyYW1lID49IHRoaXMudHlwZSkgdGhpcy5mcmFtZSA9IHRoaXMudHlwZSA9PSAyOS45NyA/IDI5IDogdGhpcy50eXBlIC0gMTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuICAgIFNNUFRFLnByb3RvdHlwZS5zZXRIb3VyID0gZnVuY3Rpb24gKHgpIHtcbiAgICAgICAgaWYgKHR5cGVvZiB4ID09ICd1bmRlZmluZWQnKSB4ID0gMDtcbiAgICAgICAgaWYgKHggIT0gcGFyc2VJbnQoeCkgfHwgeCA8IDAgfHwgeCA+PSAyNCkgdGhyb3cgUmFuZ2VFcnJvcignQmFkIFNNUFRFIGhvdXJzIHZhbHVlOiAnICsgeCk7XG4gICAgICAgIHRoaXMuaG91ciA9IHg7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cbiAgICBTTVBURS5wcm90b3R5cGUuc2V0TWludXRlID0gZnVuY3Rpb24gKHgpIHtcbiAgICAgICAgaWYgKHR5cGVvZiB4ID09ICd1bmRlZmluZWQnKSB4ID0gMDtcbiAgICAgICAgaWYgKHggIT0gcGFyc2VJbnQoeCkgfHwgeCA8IDAgfHwgeCA+PSA2MCkgdGhyb3cgUmFuZ2VFcnJvcignQmFkIFNNUFRFIG1pbnV0ZXMgdmFsdWU6ICcgKyB4KTtcbiAgICAgICAgdGhpcy5taW51dGUgPSB4O1xuICAgICAgICBfZml4RHJvcEZyYW1lLmFwcGx5KHRoaXMpO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG4gICAgU01QVEUucHJvdG90eXBlLnNldFNlY29uZCA9IGZ1bmN0aW9uICh4KSB7XG4gICAgICAgIGlmICh0eXBlb2YgeCA9PSAndW5kZWZpbmVkJykgeCA9IDA7XG4gICAgICAgIGlmICh4ICE9IHBhcnNlSW50KHgpIHx8IHggPCAwIHx8IHggPj0gNjApIHRocm93IFJhbmdlRXJyb3IoJ0JhZCBTTVBURSBzZWNvbmRzIHZhbHVlOiAnICsgeCk7XG4gICAgICAgIHRoaXMuc2Vjb25kID0geDtcbiAgICAgICAgX2ZpeERyb3BGcmFtZS5hcHBseSh0aGlzKTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuICAgIFNNUFRFLnByb3RvdHlwZS5zZXRGcmFtZSA9IGZ1bmN0aW9uICh4KSB7XG4gICAgICAgIGlmICh0eXBlb2YgeCA9PSAndW5kZWZpbmVkJykgeCA9IDA7XG4gICAgICAgIGlmICh4ICE9IHBhcnNlSW50KHgpIHx8IHggPCAwIHx8IHggPj0gdGhpcy50eXBlKSB0aHJvdyBSYW5nZUVycm9yKCdCYWQgU01QVEUgZnJhbWUgbnVtYmVyOiAnICsgeCk7XG4gICAgICAgIHRoaXMuZnJhbWUgPSB4O1xuICAgICAgICBfZml4RHJvcEZyYW1lLmFwcGx5KHRoaXMpO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG4gICAgU01QVEUucHJvdG90eXBlLnNldFF1YXJ0ZXIgPSBmdW5jdGlvbiAoeCkge1xuICAgICAgICBpZiAodHlwZW9mIHggPT0gJ3VuZGVmaW5lZCcpIHggPSAwO1xuICAgICAgICBpZiAoeCAhPSBwYXJzZUludCh4KSB8fCB4IDwgMCB8fCB4ID49IDgpIHRocm93IFJhbmdlRXJyb3IoJ0JhZCBTTVBURSBxdWFydGVyIGZyYW1lOiAnICsgeCk7XG4gICAgICAgIHRoaXMucXVhcnRlciA9IHg7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cbiAgICBTTVBURS5wcm90b3R5cGUuaW5jckZyYW1lID0gZnVuY3Rpb24gKCkge1xuICAgICAgICB0aGlzLmZyYW1lKys7XG4gICAgICAgIGlmICh0aGlzLmZyYW1lID49IHRoaXMudHlwZSkge1xuICAgICAgICAgICAgdGhpcy5mcmFtZSA9IDA7XG4gICAgICAgICAgICB0aGlzLnNlY29uZCsrO1xuICAgICAgICAgICAgaWYgKHRoaXMuc2Vjb25kID49IDYwKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5zZWNvbmQgPSAwO1xuICAgICAgICAgICAgICAgIHRoaXMubWludXRlKys7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMubWludXRlID49IDYwKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMubWludXRlID0gMDtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5ob3VyID0gdGhpcy5ob3VyID49IDIzID8gMCA6IHRoaXMuaG91ciArIDE7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIF9maXhEcm9wRnJhbWUuYXBwbHkodGhpcyk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cbiAgICBTTVBURS5wcm90b3R5cGUuZGVjckZyYW1lID0gZnVuY3Rpb24gKCkge1xuICAgICAgICBpZiAoIXRoaXMuc2Vjb25kICYmIHRoaXMuZnJhbWUgPT0gMiAmJiB0aGlzLnR5cGUgPT0gMjkuOTcgJiYgdGhpcy5taW51dGUgJSAxMCkgdGhpcy5mcmFtZSA9IDA7IC8vIGRyb3AtZnJhbWVcbiAgICAgICAgdGhpcy5mcmFtZS0tO1xuICAgICAgICBpZiAodGhpcy5mcmFtZSA8IDApIHtcbiAgICAgICAgICAgIHRoaXMuZnJhbWUgPSB0aGlzLnR5cGUgPT0gMjkuOTcgPyAyOSA6IHRoaXMudHlwZSAtIDE7XG4gICAgICAgICAgICB0aGlzLnNlY29uZC0tO1xuICAgICAgICAgICAgaWYgKHRoaXMuc2Vjb25kIDwgMCkge1xuICAgICAgICAgICAgICAgIHRoaXMuc2Vjb25kID0gNTk7XG4gICAgICAgICAgICAgICAgdGhpcy5taW51dGUtLTtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5taW51dGUgPCAwKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMubWludXRlID0gNTk7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuaG91ciA9IHRoaXMuaG91ciA/IHRoaXMuaG91ciAtIDEgOiAyMztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuICAgIFNNUFRFLnByb3RvdHlwZS5pbmNyUUYgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHRoaXMuYmFja3dhcmRzID0gZmFsc2U7XG4gICAgICAgIHRoaXMucXVhcnRlciA9ICh0aGlzLnF1YXJ0ZXIgKyAxKSAmIDc7XG4gICAgICAgIGlmICh0aGlzLnF1YXJ0ZXIgPT0gMCB8fCB0aGlzLnF1YXJ0ZXIgPT0gNCkgdGhpcy5pbmNyRnJhbWUoKTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuICAgIFNNUFRFLnByb3RvdHlwZS5kZWNyUUYgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHRoaXMuYmFja3dhcmRzID0gdHJ1ZTtcbiAgICAgICAgdGhpcy5xdWFydGVyID0gKHRoaXMucXVhcnRlciArIDcpICYgNztcbiAgICAgICAgaWYgKHRoaXMucXVhcnRlciA9PSAzIHx8IHRoaXMucXVhcnRlciA9PSA3KSB0aGlzLmRlY3JGcmFtZSgpO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG4gICAgZnVuY3Rpb24gXzgyNShhKSB7IHJldHVybiBbWzI0LCAyNSwgMjkuOTcsIDMwXVsoYVs3XSA+PiAxKSAmIDNdLCAoKGFbN10gJiAxKSA8PCA0KSB8IGFbNl0sIChhWzVdIDw8IDQpIHwgYVs0XSwgKGFbM10gPDwgNCkgfCBhWzJdLCAoYVsxXSA8PCA0KSB8IGFbMF1dOyB9XG4gICAgU01QVEUucHJvdG90eXBlLnJlYWQgPSBmdW5jdGlvbiAobSkge1xuICAgICAgICBpZiAoIShtIGluc3RhbmNlb2YgTUlESSkpIG0gPSBNSURJLmFwcGx5KG51bGwsIGFyZ3VtZW50cyk7XG4gICAgICAgIGlmIChtWzBdID09IDB4ZjAgJiYgbVsxXSA9PSAweDdmICYmIG1bM10gPT0gMSAmJiBtWzRdID09IDEgJiYgbVs5XSA9PSAweGY3KSB7XG4gICAgICAgICAgICB0aGlzLnR5cGUgPSBbMjQsIDI1LCAyOS45NywgMzBdWyhtWzVdID4+IDUpICYgM107XG4gICAgICAgICAgICB0aGlzLmhvdXIgPSBtWzVdICYgMzE7XG4gICAgICAgICAgICB0aGlzLm1pbnV0ZSA9IG1bNl07XG4gICAgICAgICAgICB0aGlzLnNlY29uZCA9IG1bN107XG4gICAgICAgICAgICB0aGlzLmZyYW1lID0gbVs4XTtcbiAgICAgICAgICAgIHRoaXMucXVhcnRlciA9IDA7XG4gICAgICAgICAgICB0aGlzLl8gPSB1bmRlZmluZWQ7XG4gICAgICAgICAgICB0aGlzLl9iID0gdW5kZWZpbmVkO1xuICAgICAgICAgICAgdGhpcy5fZiA9IHVuZGVmaW5lZDtcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG4gICAgICAgIGlmIChtWzBdID09IDB4ZjEgJiYgdHlwZW9mIG1bMV0gIT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICAgIHZhciBxID0gbVsxXSA+PiA0O1xuICAgICAgICAgICAgdmFyIG4gPSBtWzFdICYgMTU7XG4gICAgICAgICAgICBpZiAocSA9PSAwKSB7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuXyA9PSA3KSB7XG4gICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLl9mID09IDcpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucmVzZXQoXzgyNSh0aGlzLl9hKSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmluY3JGcmFtZSgpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuaW5jckZyYW1lKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAocSA9PSAzKSB7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuXyA9PSA0KSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZGVjckZyYW1lKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAocSA9PSA0KSB7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuXyA9PSAzKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuaW5jckZyYW1lKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAocSA9PSA3KSB7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuXyA9PT0gMCkge1xuICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5fYiA9PT0gMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5yZXNldChfODI1KHRoaXMuX2EpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuZGVjckZyYW1lKCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgdGhpcy5kZWNyRnJhbWUoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoIXRoaXMuX2EpIHRoaXMuX2EgPSBbXTtcbiAgICAgICAgICAgIHRoaXMuX2FbcV0gPSBuO1xuICAgICAgICAgICAgdGhpcy5fZiA9IHRoaXMuX2YgPT09IHEgLSAxIHx8IHEgPT0gMCA/IHEgOiB1bmRlZmluZWQ7XG4gICAgICAgICAgICB0aGlzLl9iID0gdGhpcy5fYiA9PT0gcSArIDEgfHwgcSA9PSA3ID8gcSA6IHVuZGVmaW5lZDtcbiAgICAgICAgICAgIHRoaXMuXyA9IHE7XG4gICAgICAgICAgICB0aGlzLnF1YXJ0ZXIgPSBxO1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICBmdW5jdGlvbiBfbXRjKHQpIHtcbiAgICAgICAgaWYgKCF0LmJhY2t3YXJkcyAmJiB0LnF1YXJ0ZXIgPj0gNCkgdC5kZWNyRnJhbWUoKTsgLy8gY29udGludWUgZW5jb2RpbmcgcHJldmlvdXMgZnJhbWVcbiAgICAgICAgZWxzZSBpZiAodC5iYWNrd2FyZHMgJiYgdC5xdWFydGVyIDwgNCkgdC5pbmNyRnJhbWUoKTtcbiAgICAgICAgdmFyIHJldDtcbiAgICAgICAgc3dpdGNoICh0LnF1YXJ0ZXIgPj4gMSkge1xuICAgICAgICAgICAgY2FzZSAwOiByZXQgPSB0LmZyYW1lOyBicmVhaztcbiAgICAgICAgICAgIGNhc2UgMTogcmV0ID0gdC5zZWNvbmQ7IGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAyOiByZXQgPSB0Lm1pbnV0ZTsgYnJlYWs7XG4gICAgICAgICAgICBkZWZhdWx0OiByZXQgPSB0LmhvdXI7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHQucXVhcnRlciAmIDEpIHJldCA+Pj0gNDtcbiAgICAgICAgZWxzZSByZXQgJj0gMTU7XG4gICAgICAgIGlmICh0LnF1YXJ0ZXIgPT0gNykge1xuICAgICAgICAgICAgaWYgKHQudHlwZSA9PSAyNSkgcmV0IHw9IDI7XG4gICAgICAgICAgICBlbHNlIGlmICh0LnR5cGUgPT0gMjkuOTcpIHJldCB8PSA0O1xuICAgICAgICAgICAgZWxzZSBpZiAodC50eXBlID09IDMwKSByZXQgfD0gNjtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIXQuYmFja3dhcmRzICYmIHQucXVhcnRlciA+PSA0KSB0LmluY3JGcmFtZSgpO1xuICAgICAgICBlbHNlIGlmICh0LmJhY2t3YXJkcyAmJiB0LnF1YXJ0ZXIgPCA0KSB0LmRlY3JGcmFtZSgpO1xuICAgICAgICByZXR1cm4gcmV0IHwgKHQucXVhcnRlciA8PCA0KTtcbiAgICB9XG4gICAgZnVuY3Rpb24gX2hydHlwZSh0KSB7XG4gICAgICAgIGlmICh0LnR5cGUgPT0gMjUpIHJldHVybiB0LmhvdXIgfCAweDIwO1xuICAgICAgICBpZiAodC50eXBlID09IDI5Ljk3KSByZXR1cm4gdC5ob3VyIHwgMHg0MDtcbiAgICAgICAgaWYgKHQudHlwZSA9PSAzMCkgcmV0dXJuIHQuaG91ciB8IDB4NjA7XG4gICAgICAgIHJldHVybiB0LmhvdXI7XG4gICAgfVxuICAgIGZ1bmN0aW9uIF9kZWMoeCkgeyByZXR1cm4geCA8IDEwID8gJzAnICsgeCA6IHg7IH1cbiAgICBTTVBURS5wcm90b3R5cGUudG9TdHJpbmcgPSBmdW5jdGlvbiAoKSB7IHJldHVybiBbX2RlYyh0aGlzLmhvdXIpLCBfZGVjKHRoaXMubWludXRlKSwgX2RlYyh0aGlzLnNlY29uZCksIF9kZWModGhpcy5mcmFtZSldLmpvaW4oJzonKTsgfVxuICAgIEpaWi5TTVBURSA9IFNNUFRFO1xuXG4gICAgLy8gSlpaLk1JRElcblxuICAgIGZ1bmN0aW9uIE1JREkoYXJnKSB7XG4gICAgICAgIHZhciBzZWxmID0gdGhpcyBpbnN0YW5jZW9mIE1JREkgPyB0aGlzIDogc2VsZiA9IG5ldyBNSURJKCk7XG4gICAgICAgIHNlbGYuX2Zyb20gPSBhcmcgaW5zdGFuY2VvZiBNSURJID8gYXJnLl9mcm9tLnNsaWNlKCkgOiBbXTtcbiAgICAgICAgaWYgKCFhcmd1bWVudHMubGVuZ3RoKSByZXR1cm4gc2VsZjtcbiAgICAgICAgdmFyIGFyciA9IGFyZyBpbnN0YW5jZW9mIEFycmF5ID8gYXJnIDogYXJndW1lbnRzO1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGFyci5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgdmFyIG4gPSBhcnJbaV07XG4gICAgICAgICAgICBpZiAoaSA9PSAxICYmIHNlbGZbMF0gPj0gMHg4MCAmJiBzZWxmWzBdIDw9IDB4QUYpIG4gPSBNSURJLm5vdGVWYWx1ZShuKTtcbiAgICAgICAgICAgIGlmIChuICE9IHBhcnNlSW50KG4pIHx8IG4gPCAwIHx8IG4gPiAyNTUpIF90aHJvdyhhcnJbaV0pO1xuICAgICAgICAgICAgc2VsZi5wdXNoKG4pO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBzZWxmO1xuICAgIH1cbiAgICBNSURJLnByb3RvdHlwZSA9IFtdO1xuICAgIE1JREkucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gTUlESTtcbiAgICB2YXIgX25vdGVOdW0gPSB7fTtcbiAgICBNSURJLm5vdGVWYWx1ZSA9IGZ1bmN0aW9uICh4KSB7IHJldHVybiBfbm90ZU51bVt4LnRvU3RyaW5nKCkudG9Mb3dlckNhc2UoKV07IH1cblxuICAgIHZhciBfbm90ZU1hcCA9IHsgYzogMCwgZDogMiwgZTogNCwgZjogNSwgZzogNywgYTogOSwgYjogMTEsIGg6IDExIH07XG4gICAgZm9yICh2YXIgayBpbiBfbm90ZU1hcCkge1xuICAgICAgICBpZiAoIV9ub3RlTWFwLmhhc093blByb3BlcnR5KGspKSBjb250aW51ZTtcbiAgICAgICAgZm9yICh2YXIgbiA9IDA7IG4gPCAxMjsgbisrKSB7XG4gICAgICAgICAgICB2YXIgbSA9IF9ub3RlTWFwW2tdICsgbiAqIDEyO1xuICAgICAgICAgICAgaWYgKG0gPiAxMjcpIGJyZWFrO1xuICAgICAgICAgICAgX25vdGVOdW1bayArIG5dID0gbTtcbiAgICAgICAgICAgIGlmIChtID4gMCkgeyBfbm90ZU51bVtrICsgJ2InICsgbl0gPSBtIC0gMTsgX25vdGVOdW1bayArICdiYicgKyBuXSA9IG0gLSAyOyB9XG4gICAgICAgICAgICBpZiAobSA8IDEyNykgeyBfbm90ZU51bVtrICsgJyMnICsgbl0gPSBtICsgMTsgX25vdGVOdW1bayArICcjIycgKyBuXSA9IG0gKyAyOyB9XG4gICAgICAgIH1cbiAgICB9XG4gICAgZm9yICh2YXIgbiA9IDA7IG4gPCAxMjg7IG4rKykgX25vdGVOdW1bbl0gPSBuO1xuICAgIGZ1bmN0aW9uIF90aHJvdyh4KSB7IHRocm93IFJhbmdlRXJyb3IoJ0JhZCBNSURJIHZhbHVlOiAnICsgeCk7IH1cbiAgICBmdW5jdGlvbiBfY2gobikgeyBpZiAobiAhPSBwYXJzZUludChuKSB8fCBuIDwgMCB8fCBuID4gMHhmKSBfdGhyb3cobik7IHJldHVybiBuOyB9XG4gICAgZnVuY3Rpb24gXzdiKG4pIHsgaWYgKG4gIT0gcGFyc2VJbnQobikgfHwgbiA8IDAgfHwgbiA+IDB4N2YpIF90aHJvdyhuKTsgcmV0dXJuIG47IH1cbiAgICBmdW5jdGlvbiBfbHNiKG4pIHsgaWYgKG4gIT0gcGFyc2VJbnQobikgfHwgbiA8IDAgfHwgbiA+IDB4M2ZmZikgX3Rocm93KG4pOyByZXR1cm4gbiAmIDB4N2Y7IH1cbiAgICBmdW5jdGlvbiBfbXNiKG4pIHsgaWYgKG4gIT0gcGFyc2VJbnQobikgfHwgbiA8IDAgfHwgbiA+IDB4M2ZmZikgX3Rocm93KG4pOyByZXR1cm4gbiA+PiA3OyB9XG4gICAgdmFyIF9oZWxwZXIgPSB7XG4gICAgICAgIG5vdGVPZmY6IGZ1bmN0aW9uIChjLCBuKSB7IHJldHVybiBbMHg4MCArIF9jaChjKSwgXzdiKE1JREkubm90ZVZhbHVlKG4pKSwgMF07IH0sXG4gICAgICAgIG5vdGVPbjogZnVuY3Rpb24gKGMsIG4sIHYpIHsgcmV0dXJuIFsweDkwICsgX2NoKGMpLCBfN2IoTUlESS5ub3RlVmFsdWUobikpLCBfN2IodildOyB9LFxuICAgICAgICBhZnRlcnRvdWNoOiBmdW5jdGlvbiAoYywgbiwgdikgeyByZXR1cm4gWzB4QTAgKyBfY2goYyksIF83YihNSURJLm5vdGVWYWx1ZShuKSksIF83Yih2KV07IH0sXG4gICAgICAgIGNvbnRyb2w6IGZ1bmN0aW9uIChjLCBuLCB2KSB7IHJldHVybiBbMHhCMCArIF9jaChjKSwgXzdiKG4pLCBfN2IodildOyB9LFxuICAgICAgICBwcm9ncmFtOiBmdW5jdGlvbiAoYywgbikgeyByZXR1cm4gWzB4QzAgKyBfY2goYyksIF83YihuKV07IH0sXG4gICAgICAgIHByZXNzdXJlOiBmdW5jdGlvbiAoYywgbikgeyByZXR1cm4gWzB4RDAgKyBfY2goYyksIF83YihuKV07IH0sXG4gICAgICAgIHBpdGNoQmVuZDogZnVuY3Rpb24gKGMsIG4pIHsgcmV0dXJuIFsweEUwICsgX2NoKGMpLCBfbHNiKG4pLCBfbXNiKG4pXTsgfSxcbiAgICAgICAgYmFua01TQjogZnVuY3Rpb24gKGMsIG4pIHsgcmV0dXJuIFsweEIwICsgX2NoKGMpLCAweDAwLCBfN2IobildOyB9LFxuICAgICAgICBiYW5rTFNCOiBmdW5jdGlvbiAoYywgbikgeyByZXR1cm4gWzB4QjAgKyBfY2goYyksIDB4MjAsIF83YihuKV07IH0sXG4gICAgICAgIG1vZE1TQjogZnVuY3Rpb24gKGMsIG4pIHsgcmV0dXJuIFsweEIwICsgX2NoKGMpLCAweDAxLCBfN2IobildOyB9LFxuICAgICAgICBtb2RMU0I6IGZ1bmN0aW9uIChjLCBuKSB7IHJldHVybiBbMHhCMCArIF9jaChjKSwgMHgyMSwgXzdiKG4pXTsgfSxcbiAgICAgICAgYnJlYXRoTVNCOiBmdW5jdGlvbiAoYywgbikgeyByZXR1cm4gWzB4QjAgKyBfY2goYyksIDB4MDIsIF83YihuKV07IH0sXG4gICAgICAgIGJyZWF0aExTQjogZnVuY3Rpb24gKGMsIG4pIHsgcmV0dXJuIFsweEIwICsgX2NoKGMpLCAweDIyLCBfN2IobildOyB9LFxuICAgICAgICBmb290TVNCOiBmdW5jdGlvbiAoYywgbikgeyByZXR1cm4gWzB4QjAgKyBfY2goYyksIDB4MDQsIF83YihuKV07IH0sXG4gICAgICAgIGZvb3RMU0I6IGZ1bmN0aW9uIChjLCBuKSB7IHJldHVybiBbMHhCMCArIF9jaChjKSwgMHgyNCwgXzdiKG4pXTsgfSxcbiAgICAgICAgcG9ydGFtZW50b01TQjogZnVuY3Rpb24gKGMsIG4pIHsgcmV0dXJuIFsweEIwICsgX2NoKGMpLCAweDA1LCBfN2IobildOyB9LFxuICAgICAgICBwb3J0YW1lbnRvTFNCOiBmdW5jdGlvbiAoYywgbikgeyByZXR1cm4gWzB4QjAgKyBfY2goYyksIDB4MjUsIF83YihuKV07IH0sXG4gICAgICAgIHZvbHVtZU1TQjogZnVuY3Rpb24gKGMsIG4pIHsgcmV0dXJuIFsweEIwICsgX2NoKGMpLCAweDA3LCBfN2IobildOyB9LFxuICAgICAgICB2b2x1bWVMU0I6IGZ1bmN0aW9uIChjLCBuKSB7IHJldHVybiBbMHhCMCArIF9jaChjKSwgMHgyNywgXzdiKG4pXTsgfSxcbiAgICAgICAgYmFsYW5jZU1TQjogZnVuY3Rpb24gKGMsIG4pIHsgcmV0dXJuIFsweEIwICsgX2NoKGMpLCAweDA4LCBfN2IobildOyB9LFxuICAgICAgICBiYWxhbmNlTFNCOiBmdW5jdGlvbiAoYywgbikgeyByZXR1cm4gWzB4QjAgKyBfY2goYyksIDB4MjgsIF83YihuKV07IH0sXG4gICAgICAgIHBhbk1TQjogZnVuY3Rpb24gKGMsIG4pIHsgcmV0dXJuIFsweEIwICsgX2NoKGMpLCAweDBBLCBfN2IobildOyB9LFxuICAgICAgICBwYW5MU0I6IGZ1bmN0aW9uIChjLCBuKSB7IHJldHVybiBbMHhCMCArIF9jaChjKSwgMHgyQSwgXzdiKG4pXTsgfSxcbiAgICAgICAgZXhwcmVzc2lvbk1TQjogZnVuY3Rpb24gKGMsIG4pIHsgcmV0dXJuIFsweEIwICsgX2NoKGMpLCAweDBCLCBfN2IobildOyB9LFxuICAgICAgICBleHByZXNzaW9uTFNCOiBmdW5jdGlvbiAoYywgbikgeyByZXR1cm4gWzB4QjAgKyBfY2goYyksIDB4MkIsIF83YihuKV07IH0sXG4gICAgICAgIGRhbXBlcjogZnVuY3Rpb24gKGMsIGIpIHsgcmV0dXJuIFsweEIwICsgX2NoKGMpLCAweDQwLCBiID8gMTI3IDogMF07IH0sXG4gICAgICAgIHBvcnRhbWVudG86IGZ1bmN0aW9uIChjLCBiKSB7IHJldHVybiBbMHhCMCArIF9jaChjKSwgMHg0MSwgYiA/IDEyNyA6IDBdOyB9LFxuICAgICAgICBzb3N0ZW51dG86IGZ1bmN0aW9uIChjLCBiKSB7IHJldHVybiBbMHhCMCArIF9jaChjKSwgMHg0MiwgYiA/IDEyNyA6IDBdOyB9LFxuICAgICAgICBzb2Z0OiBmdW5jdGlvbiAoYywgYikgeyByZXR1cm4gWzB4QjAgKyBfY2goYyksIDB4NDMsIGIgPyAxMjcgOiAwXTsgfSxcbiAgICAgICAgYWxsU291bmRPZmY6IGZ1bmN0aW9uIChjKSB7IHJldHVybiBbMHhCMCArIF9jaChjKSwgMHg3OCwgMF07IH0sXG4gICAgICAgIGFsbE5vdGVzT2ZmOiBmdW5jdGlvbiAoYykgeyByZXR1cm4gWzB4QjAgKyBfY2goYyksIDB4N2IsIDBdOyB9LFxuICAgICAgICBtdGM6IGZ1bmN0aW9uICh0KSB7IHJldHVybiBbMHhGMSwgX210Yyh0KV07IH0sXG4gICAgICAgIHNvbmdQb3NpdGlvbjogZnVuY3Rpb24gKG4pIHsgcmV0dXJuIFsweEYyLCBfbHNiKG4pLCBfbXNiKG4pXTsgfSxcbiAgICAgICAgc29uZ1NlbGVjdDogZnVuY3Rpb24gKG4pIHsgcmV0dXJuIFsweEYzLCBfN2IobildOyB9LFxuICAgICAgICB0dW5lOiBmdW5jdGlvbiAoKSB7IHJldHVybiBbMHhGNl07IH0sXG4gICAgICAgIGNsb2NrOiBmdW5jdGlvbiAoKSB7IHJldHVybiBbMHhGOF07IH0sXG4gICAgICAgIHN0YXJ0OiBmdW5jdGlvbiAoKSB7IHJldHVybiBbMHhGQV07IH0sXG4gICAgICAgIGNvbnRpbnVlOiBmdW5jdGlvbiAoKSB7IHJldHVybiBbMHhGQl07IH0sXG4gICAgICAgIHN0b3A6IGZ1bmN0aW9uICgpIHsgcmV0dXJuIFsweEZDXTsgfSxcbiAgICAgICAgYWN0aXZlOiBmdW5jdGlvbiAoKSB7IHJldHVybiBbMHhGRV07IH0sXG4gICAgICAgIHN4SWRSZXF1ZXN0OiBmdW5jdGlvbiAoKSB7IHJldHVybiBbMHhGMCwgMHg3RSwgMHg3RiwgMHgwNiwgMHgwMSwgMHhGN107IH0sXG4gICAgICAgIHN4RnVsbEZyYW1lOiBmdW5jdGlvbiAodCkgeyByZXR1cm4gWzB4RjAsIDB4N0YsIDB4N0YsIDB4MDEsIDB4MDEsIF9ocnR5cGUodCksIHQuZ2V0TWludXRlKCksIHQuZ2V0U2Vjb25kKCksIHQuZ2V0RnJhbWUoKSwgMHhGN107IH0sXG4gICAgICAgIHJlc2V0OiBmdW5jdGlvbiAoKSB7IHJldHVybiBbMHhGRl07IH1cbiAgICB9O1xuICAgIGZ1bmN0aW9uIF9jb3B5SGVscGVyKG5hbWUsIGZ1bmMpIHtcbiAgICAgICAgTUlESVtuYW1lXSA9IGZ1bmN0aW9uICgpIHsgcmV0dXJuIG5ldyBNSURJKGZ1bmMuYXBwbHkoMCwgYXJndW1lbnRzKSk7IH07XG4gICAgICAgIF9NLnByb3RvdHlwZVtuYW1lXSA9IGZ1bmN0aW9uICgpIHsgdGhpcy5zZW5kKGZ1bmMuYXBwbHkoMCwgYXJndW1lbnRzKSk7IHJldHVybiB0aGlzOyB9O1xuICAgIH1cbiAgICBmb3IgKHZhciBrIGluIF9oZWxwZXIpIGlmIChfaGVscGVyLmhhc093blByb3BlcnR5KGspKSBfY29weUhlbHBlcihrLCBfaGVscGVyW2tdKTtcblxuICAgIHZhciBfY2hhbm5lbE1hcCA9IHsgYTogMTAsIGI6IDExLCBjOiAxMiwgZDogMTMsIGU6IDE0LCBmOiAxNSwgQTogMTAsIEI6IDExLCBDOiAxMiwgRDogMTMsIEU6IDE0LCBGOiAxNSB9O1xuICAgIGZvciAodmFyIGsgPSAwOyBrIDwgMTY7IGsrKykgX2NoYW5uZWxNYXBba10gPSBrO1xuICAgIE1JREkucHJvdG90eXBlLmdldENoYW5uZWwgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciBjID0gdGhpc1swXTtcbiAgICAgICAgaWYgKHR5cGVvZiBjID09ICd1bmRlZmluZWQnIHx8IGMgPCAweDgwIHx8IGMgPiAweGVmKSByZXR1cm47XG4gICAgICAgIHJldHVybiBjICYgMTU7XG4gICAgfVxuICAgIE1JREkucHJvdG90eXBlLnNldENoYW5uZWwgPSBmdW5jdGlvbiAoeCkge1xuICAgICAgICB2YXIgYyA9IHRoaXNbMF07XG4gICAgICAgIGlmICh0eXBlb2YgYyA9PSAndW5kZWZpbmVkJyB8fCBjIDwgMHg4MCB8fCBjID4gMHhlZikgcmV0dXJuIHRoaXM7XG4gICAgICAgIHggPSBfY2hhbm5lbE1hcFt4XTtcbiAgICAgICAgaWYgKHR5cGVvZiB4ICE9ICd1bmRlZmluZWQnKSB0aGlzWzBdID0gKGMgJiAweGYwKSB8IHg7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cbiAgICBNSURJLnByb3RvdHlwZS5nZXROb3RlID0gZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgYyA9IHRoaXNbMF07XG4gICAgICAgIGlmICh0eXBlb2YgYyA9PSAndW5kZWZpbmVkJyB8fCBjIDwgMHg4MCB8fCBjID4gMHhhZikgcmV0dXJuO1xuICAgICAgICByZXR1cm4gdGhpc1sxXTtcbiAgICB9XG4gICAgTUlESS5wcm90b3R5cGUuc2V0Tm90ZSA9IGZ1bmN0aW9uICh4KSB7XG4gICAgICAgIHZhciBjID0gdGhpc1swXTtcbiAgICAgICAgaWYgKHR5cGVvZiBjID09ICd1bmRlZmluZWQnIHx8IGMgPCAweDgwIHx8IGMgPiAweGFmKSByZXR1cm4gdGhpcztcbiAgICAgICAgeCA9IE1JREkubm90ZVZhbHVlKHgpO1xuICAgICAgICBpZiAodHlwZW9mIHggIT0gJ3VuZGVmaW5lZCcpIHRoaXNbMV0gPSB4O1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG4gICAgTUlESS5wcm90b3R5cGUuZ2V0VmVsb2NpdHkgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciBjID0gdGhpc1swXTtcbiAgICAgICAgaWYgKHR5cGVvZiBjID09ICd1bmRlZmluZWQnIHx8IGMgPCAweDkwIHx8IGMgPiAweDlmKSByZXR1cm47XG4gICAgICAgIHJldHVybiB0aGlzWzJdO1xuICAgIH1cbiAgICBNSURJLnByb3RvdHlwZS5zZXRWZWxvY2l0eSA9IGZ1bmN0aW9uICh4KSB7XG4gICAgICAgIHZhciBjID0gdGhpc1swXTtcbiAgICAgICAgaWYgKHR5cGVvZiBjID09ICd1bmRlZmluZWQnIHx8IGMgPCAweDkwIHx8IGMgPiAweDlmKSByZXR1cm4gdGhpcztcbiAgICAgICAgeCA9IHBhcnNlSW50KHgpO1xuICAgICAgICBpZiAoeCA+PSAwICYmIHggPCAxMjgpIHRoaXNbMl0gPSB4O1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG4gICAgTUlESS5wcm90b3R5cGUuZ2V0U3lzRXhDaGFubmVsID0gZnVuY3Rpb24gKCkge1xuICAgICAgICBpZiAodGhpc1swXSA9PSAweGYwKSByZXR1cm4gdGhpc1syXTtcbiAgICB9XG4gICAgTUlESS5wcm90b3R5cGUuc2V0U3lzRXhDaGFubmVsID0gZnVuY3Rpb24gKHgpIHtcbiAgICAgICAgaWYgKHRoaXNbMF0gPT0gMHhmMCAmJiB0aGlzLmxlbmd0aCA+IDIpIHtcbiAgICAgICAgICAgIHggPSBwYXJzZUludCh4KTtcbiAgICAgICAgICAgIGlmICh4ID49IDAgJiYgeCA8IDEyOCkgdGhpc1syXSA9IHg7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuICAgIE1JREkucHJvdG90eXBlLmlzTm90ZU9uID0gZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgYyA9IHRoaXNbMF07XG4gICAgICAgIGlmICh0eXBlb2YgYyA9PSAndW5kZWZpbmVkJyB8fCBjIDwgMHg5MCB8fCBjID4gMHg5ZikgcmV0dXJuIGZhbHNlO1xuICAgICAgICByZXR1cm4gdGhpc1syXSA+IDAgPyB0cnVlIDogZmFsc2U7XG4gICAgfVxuICAgIE1JREkucHJvdG90eXBlLmlzTm90ZU9mZiA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmFyIGMgPSB0aGlzWzBdO1xuICAgICAgICBpZiAodHlwZW9mIGMgPT0gJ3VuZGVmaW5lZCcgfHwgYyA8IDB4ODAgfHwgYyA+IDB4OWYpIHJldHVybiBmYWxzZTtcbiAgICAgICAgaWYgKGMgPCAweDkwKSByZXR1cm4gdHJ1ZTtcbiAgICAgICAgcmV0dXJuIHRoaXNbMl0gPT0gMCA/IHRydWUgOiBmYWxzZTtcbiAgICB9XG4gICAgTUlESS5wcm90b3R5cGUuaXNTeXNFeCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXNbMF0gPT0gMHhmMDtcbiAgICB9XG4gICAgTUlESS5wcm90b3R5cGUuaXNGdWxsU3lzRXggPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiB0aGlzWzBdID09IDB4ZjAgJiYgdGhpc1t0aGlzLmxlbmd0aCAtIDFdID09IDB4Zjc7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gX2hleCh4KSB7XG4gICAgICAgIHZhciBhID0gW107XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgeC5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgYVtpXSA9ICh4W2ldIDwgMTYgPyAnMCcgOiAnJykgKyB4W2ldLnRvU3RyaW5nKDE2KTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gYS5qb2luKCcgJyk7XG4gICAgfVxuICAgIE1JREkucHJvdG90eXBlLnRvU3RyaW5nID0gZnVuY3Rpb24gKCkge1xuICAgICAgICBpZiAoIXRoaXMubGVuZ3RoKSByZXR1cm4gJ2VtcHR5JztcbiAgICAgICAgdmFyIHMgPSBfaGV4KHRoaXMpO1xuICAgICAgICBpZiAodGhpc1swXSA8IDB4ODApIHJldHVybiBzO1xuICAgICAgICB2YXIgc3MgPSB7XG4gICAgICAgICAgICAyNDE6ICdNSURJIFRpbWUgQ29kZScsXG4gICAgICAgICAgICAyNDI6ICdTb25nIFBvc2l0aW9uJyxcbiAgICAgICAgICAgIDI0MzogJ1NvbmcgU2VsZWN0JyxcbiAgICAgICAgICAgIDI0NDogJ1VuZGVmaW5lZCcsXG4gICAgICAgICAgICAyNDU6ICdVbmRlZmluZWQnLFxuICAgICAgICAgICAgMjQ2OiAnVHVuZSByZXF1ZXN0JyxcbiAgICAgICAgICAgIDI0ODogJ1RpbWluZyBjbG9jaycsXG4gICAgICAgICAgICAyNDk6ICdVbmRlZmluZWQnLFxuICAgICAgICAgICAgMjUwOiAnU3RhcnQnLFxuICAgICAgICAgICAgMjUxOiAnQ29udGludWUnLFxuICAgICAgICAgICAgMjUyOiAnU3RvcCcsXG4gICAgICAgICAgICAyNTM6ICdVbmRlZmluZWQnLFxuICAgICAgICAgICAgMjU0OiAnQWN0aXZlIFNlbnNpbmcnLFxuICAgICAgICAgICAgMjU1OiAnUmVzZXQnXG4gICAgICAgIH1bdGhpc1swXV07XG4gICAgICAgIGlmIChzcykgcmV0dXJuIHMgKyAnIC0tICcgKyBzcztcbiAgICAgICAgdmFyIGMgPSB0aGlzWzBdID4+IDQ7XG4gICAgICAgIHNzID0geyA4OiAnTm90ZSBPZmYnLCAxMDogJ0FmdGVydG91Y2gnLCAxMjogJ1Byb2dyYW0gQ2hhbmdlJywgMTM6ICdDaGFubmVsIEFmdGVydG91Y2gnLCAxNDogJ1BpdGNoIFdoZWVsJyB9W2NdO1xuICAgICAgICBpZiAoc3MpIHJldHVybiBzICsgJyAtLSAnICsgc3M7XG4gICAgICAgIGlmIChjID09IDkpIHJldHVybiBzICsgJyAtLSAnICsgKHRoaXNbMl0gPyAnTm90ZSBPbicgOiAnTm90ZSBPZmYnKTtcbiAgICAgICAgaWYgKGMgIT0gMTEpIHJldHVybiBzO1xuICAgICAgICBzcyA9IHtcbiAgICAgICAgICAgIDA6ICdCYW5rIFNlbGVjdCBNU0InLFxuICAgICAgICAgICAgMTogJ01vZHVsYXRpb24gV2hlZWwgTVNCJyxcbiAgICAgICAgICAgIDI6ICdCcmVhdGggQ29udHJvbGxlciBNU0InLFxuICAgICAgICAgICAgNDogJ0Zvb3QgQ29udHJvbGxlciBNU0InLFxuICAgICAgICAgICAgNTogJ1BvcnRhbWVudG8gVGltZSBNU0InLFxuICAgICAgICAgICAgNjogJ0RhdGEgRW50cnkgTVNCJyxcbiAgICAgICAgICAgIDc6ICdDaGFubmVsIFZvbHVtZSBNU0InLFxuICAgICAgICAgICAgODogJ0JhbGFuY2UgTVNCJyxcbiAgICAgICAgICAgIDEwOiAnUGFuIE1TQicsXG4gICAgICAgICAgICAxMTogJ0V4cHJlc3Npb24gQ29udHJvbGxlciBNU0InLFxuICAgICAgICAgICAgMTI6ICdFZmZlY3QgQ29udHJvbCAxIE1TQicsXG4gICAgICAgICAgICAxMzogJ0VmZmVjdCBDb250cm9sIDIgTVNCJyxcbiAgICAgICAgICAgIDE2OiAnR2VuZXJhbCBQdXJwb3NlIENvbnRyb2xsZXIgMSBNU0InLFxuICAgICAgICAgICAgMTc6ICdHZW5lcmFsIFB1cnBvc2UgQ29udHJvbGxlciAyIE1TQicsXG4gICAgICAgICAgICAxODogJ0dlbmVyYWwgUHVycG9zZSBDb250cm9sbGVyIDMgTVNCJyxcbiAgICAgICAgICAgIDE5OiAnR2VuZXJhbCBQdXJwb3NlIENvbnRyb2xsZXIgNCBNU0InLFxuICAgICAgICAgICAgMzI6ICdCYW5rIFNlbGVjdCBMU0InLFxuICAgICAgICAgICAgMzM6ICdNb2R1bGF0aW9uIFdoZWVsIExTQicsXG4gICAgICAgICAgICAzNDogJ0JyZWF0aCBDb250cm9sbGVyIExTQicsXG4gICAgICAgICAgICAzNjogJ0Zvb3QgQ29udHJvbGxlciBMU0InLFxuICAgICAgICAgICAgMzc6ICdQb3J0YW1lbnRvIFRpbWUgTFNCJyxcbiAgICAgICAgICAgIDM4OiAnRGF0YSBFbnRyeSBMU0InLFxuICAgICAgICAgICAgMzk6ICdDaGFubmVsIFZvbHVtZSBMU0InLFxuICAgICAgICAgICAgNDA6ICdCYWxhbmNlIExTQicsXG4gICAgICAgICAgICA0MjogJ1BhbiBMU0InLFxuICAgICAgICAgICAgNDM6ICdFeHByZXNzaW9uIENvbnRyb2xsZXIgTFNCJyxcbiAgICAgICAgICAgIDQ0OiAnRWZmZWN0IGNvbnRyb2wgMSBMU0InLFxuICAgICAgICAgICAgNDU6ICdFZmZlY3QgY29udHJvbCAyIExTQicsXG4gICAgICAgICAgICA0ODogJ0dlbmVyYWwgUHVycG9zZSBDb250cm9sbGVyIDEgTFNCJyxcbiAgICAgICAgICAgIDQ5OiAnR2VuZXJhbCBQdXJwb3NlIENvbnRyb2xsZXIgMiBMU0InLFxuICAgICAgICAgICAgNTA6ICdHZW5lcmFsIFB1cnBvc2UgQ29udHJvbGxlciAzIExTQicsXG4gICAgICAgICAgICA1MTogJ0dlbmVyYWwgUHVycG9zZSBDb250cm9sbGVyIDQgTFNCJyxcbiAgICAgICAgICAgIDY0OiAnRGFtcGVyIFBlZGFsIE9uL09mZicsXG4gICAgICAgICAgICA2NTogJ1BvcnRhbWVudG8gT24vT2ZmJyxcbiAgICAgICAgICAgIDY2OiAnU29zdGVudXRvIE9uL09mZicsXG4gICAgICAgICAgICA2NzogJ1NvZnQgUGVkYWwgT24vT2ZmJyxcbiAgICAgICAgICAgIDY4OiAnTGVnYXRvIEZvb3Rzd2l0Y2gnLFxuICAgICAgICAgICAgNjk6ICdIb2xkIDInLFxuICAgICAgICAgICAgNzA6ICdTb3VuZCBDb250cm9sbGVyIDEnLFxuICAgICAgICAgICAgNzE6ICdTb3VuZCBDb250cm9sbGVyIDInLFxuICAgICAgICAgICAgNzI6ICdTb3VuZCBDb250cm9sbGVyIDMnLFxuICAgICAgICAgICAgNzM6ICdTb3VuZCBDb250cm9sbGVyIDQnLFxuICAgICAgICAgICAgNzQ6ICdTb3VuZCBDb250cm9sbGVyIDUnLFxuICAgICAgICAgICAgNzU6ICdTb3VuZCBDb250cm9sbGVyIDYnLFxuICAgICAgICAgICAgNzY6ICdTb3VuZCBDb250cm9sbGVyIDcnLFxuICAgICAgICAgICAgNzc6ICdTb3VuZCBDb250cm9sbGVyIDgnLFxuICAgICAgICAgICAgNzg6ICdTb3VuZCBDb250cm9sbGVyIDknLFxuICAgICAgICAgICAgNzk6ICdTb3VuZCBDb250cm9sbGVyIDEwJyxcbiAgICAgICAgICAgIDgwOiAnR2VuZXJhbCBQdXJwb3NlIENvbnRyb2xsZXIgNScsXG4gICAgICAgICAgICA4MTogJ0dlbmVyYWwgUHVycG9zZSBDb250cm9sbGVyIDYnLFxuICAgICAgICAgICAgODI6ICdHZW5lcmFsIFB1cnBvc2UgQ29udHJvbGxlciA3JyxcbiAgICAgICAgICAgIDgzOiAnR2VuZXJhbCBQdXJwb3NlIENvbnRyb2xsZXIgOCcsXG4gICAgICAgICAgICA4NDogJ1BvcnRhbWVudG8gQ29udHJvbCcsXG4gICAgICAgICAgICA4ODogJ0hpZ2ggUmVzb2x1dGlvbiBWZWxvY2l0eSBQcmVmaXgnLFxuICAgICAgICAgICAgOTE6ICdFZmZlY3RzIDEgRGVwdGgnLFxuICAgICAgICAgICAgOTI6ICdFZmZlY3RzIDIgRGVwdGgnLFxuICAgICAgICAgICAgOTM6ICdFZmZlY3RzIDMgRGVwdGgnLFxuICAgICAgICAgICAgOTQ6ICdFZmZlY3RzIDQgRGVwdGgnLFxuICAgICAgICAgICAgOTU6ICdFZmZlY3RzIDUgRGVwdGgnLFxuICAgICAgICAgICAgOTY6ICdEYXRhIEluY3JlbWVudCcsXG4gICAgICAgICAgICA5NzogJ0RhdGEgRGVjcmVtZW50JyxcbiAgICAgICAgICAgIDk4OiAnTm9uLVJlZ2lzdGVyZWQgUGFyYW1ldGVyIE51bWJlciBMU0InLFxuICAgICAgICAgICAgOTk6ICdOb24tUmVnaXN0ZXJlZCBQYXJhbWV0ZXIgTnVtYmVyIE1TQicsXG4gICAgICAgICAgICAxMDA6ICdSZWdpc3RlcmVkIFBhcmFtZXRlciBOdW1iZXIgTFNCJyxcbiAgICAgICAgICAgIDEwMTogJ1JlZ2lzdGVyZWQgUGFyYW1ldGVyIE51bWJlciBNU0InLFxuICAgICAgICAgICAgMTIwOiAnQWxsIFNvdW5kIE9mZicsXG4gICAgICAgICAgICAxMjE6ICdSZXNldCBBbGwgQ29udHJvbGxlcnMnLFxuICAgICAgICAgICAgMTIyOiAnTG9jYWwgQ29udHJvbCBPbi9PZmYnLFxuICAgICAgICAgICAgMTIzOiAnQWxsIE5vdGVzIE9mZicsXG4gICAgICAgICAgICAxMjQ6ICdPbW5pIE1vZGUgT2ZmJyxcbiAgICAgICAgICAgIDEyNTogJ09tbmkgTW9kZSBPbicsXG4gICAgICAgICAgICAxMjY6ICdNb25vIE1vZGUgT24nLFxuICAgICAgICAgICAgMTI3OiAnUG9seSBNb2RlIE9uJ1xuICAgICAgICB9W3RoaXNbMV1dO1xuICAgICAgICBpZiAoIXNzKSBzcyA9ICdVbmRlZmluZWQnO1xuICAgICAgICByZXR1cm4gcyArICcgLS0gJyArIHNzO1xuICAgIH1cbiAgICBNSURJLnByb3RvdHlwZS5fc3RhbXAgPSBmdW5jdGlvbiAob2JqKSB7IHRoaXMuX2Zyb20ucHVzaChvYmouX29yaWcgPyBvYmouX29yaWcgOiBvYmopOyByZXR1cm4gdGhpczsgfVxuICAgIE1JREkucHJvdG90eXBlLl91bnN0YW1wID0gZnVuY3Rpb24gKG9iaikge1xuICAgICAgICBpZiAodHlwZW9mIG9iaiA9PSAndW5kZWZpbmVkJykgdGhpcy5fZnJvbSA9IFtdO1xuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGlmIChvYmouX29yaWcpIG9iaiA9IG9iai5fb3JpZztcbiAgICAgICAgICAgIHZhciBpID0gdGhpcy5fZnJvbS5pbmRleE9mKG9iaik7XG4gICAgICAgICAgICBpZiAoaSA+IC0xKSB0aGlzLl9mcm9tLnNwbGljZShpLCAxKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG4gICAgTUlESS5wcm90b3R5cGUuX3N0YW1wZWQgPSBmdW5jdGlvbiAob2JqKSB7XG4gICAgICAgIGlmIChvYmouX29yaWcpIG9iaiA9IG9iai5fb3JpZztcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLl9mcm9tLmxlbmd0aDsgaSsrKSBpZiAodGhpcy5fZnJvbVtpXSA9PSBvYmopIHJldHVybiB0cnVlO1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgSlpaLk1JREkgPSBNSURJO1xuXG4gICAgSlpaLmxpYiA9IHt9O1xuICAgIEpaWi5saWIub3Blbk1pZGlPdXQgPSBmdW5jdGlvbiAobmFtZSwgZW5naW5lKSB7XG4gICAgICAgIHZhciBwb3J0ID0gbmV3IF9NKCk7XG4gICAgICAgIGVuZ2luZS5fb3Blbk91dChwb3J0LCBuYW1lKTtcbiAgICAgICAgcmV0dXJuIHBvcnQ7XG4gICAgfVxuICAgIEpaWi5saWIub3Blbk1pZGlJbiA9IGZ1bmN0aW9uIChuYW1lLCBlbmdpbmUpIHtcbiAgICAgICAgdmFyIHBvcnQgPSBuZXcgX00oKTtcbiAgICAgICAgZW5naW5lLl9vcGVuSW4ocG9ydCwgbmFtZSk7XG4gICAgICAgIHJldHVybiBwb3J0O1xuICAgIH1cbiAgICBKWloubGliLnJlZ2lzdGVyTWlkaU91dCA9IGZ1bmN0aW9uIChuYW1lLCBlbmdpbmUpIHtcbiAgICAgICAgdmFyIHggPSBlbmdpbmUuX2luZm8obmFtZSk7XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgX3ZpcnR1YWwuX291dHMubGVuZ3RoOyBpKyspIGlmIChfdmlydHVhbC5fb3V0c1tpXS5uYW1lID09IHgubmFtZSkgcmV0dXJuIGZhbHNlO1xuICAgICAgICB4LmVuZ2luZSA9IGVuZ2luZTtcbiAgICAgICAgX3ZpcnR1YWwuX291dHMucHVzaCh4KTtcbiAgICAgICAgaWYgKF9qenogJiYgX2p6ei5fYmFkKSB7IF9qenouX3JlcGFpcigpOyBfanp6Ll9yZXN1bWUoKTsgfVxuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gICAgSlpaLmxpYi5yZWdpc3Rlck1pZGlJbiA9IGZ1bmN0aW9uIChuYW1lLCBlbmdpbmUpIHtcbiAgICAgICAgdmFyIHggPSBlbmdpbmUuX2luZm8obmFtZSk7XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgX3ZpcnR1YWwuX2lucy5sZW5ndGg7IGkrKykgaWYgKF92aXJ0dWFsLl9pbnNbaV0ubmFtZSA9PSB4Lm5hbWUpIHJldHVybiBmYWxzZTtcbiAgICAgICAgeC5lbmdpbmUgPSBlbmdpbmU7XG4gICAgICAgIF92aXJ0dWFsLl9pbnMucHVzaCh4KTtcbiAgICAgICAgaWYgKF9qenogJiYgX2p6ei5fYmFkKSB7IF9qenouX3JlcGFpcigpOyBfanp6Ll9yZXN1bWUoKTsgfVxuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gICAgdmFyIF9hYztcbiAgICBKWloubGliLmdldEF1ZGlvQ29udGV4dCA9IGZ1bmN0aW9uICgpIHsgcmV0dXJuIF9hYzsgfVxuICAgIGlmICh3aW5kb3cpIHtcbiAgICAgICAgdmFyIEF1ZGlvQ29udGV4dCA9IHdpbmRvdy5BdWRpb0NvbnRleHQgfHwgd2luZG93LndlYmtpdEF1ZGlvQ29udGV4dDtcbiAgICAgICAgaWYgKEF1ZGlvQ29udGV4dCkgX2FjID0gbmV3IEF1ZGlvQ29udGV4dCgpO1xuICAgICAgICBpZiAoX2FjICYmICFfYWMuY3JlYXRlR2FpbikgX2FjLmNyZWF0ZUdhaW4gPSBfYWMuY3JlYXRlR2Fpbk5vZGU7XG4gICAgICAgIGZ1bmN0aW9uIF9hY3RpdmF0ZUF1ZGlvQ29udGV4dCgpIHtcbiAgICAgICAgICAgIGlmIChfYWMuc3RhdGUgIT0gJ3J1bm5pbmcnKSB7XG4gICAgICAgICAgICAgICAgX2FjLnJlc3VtZSgpO1xuICAgICAgICAgICAgICAgIHZhciBvc2MgPSBfYWMuY3JlYXRlT3NjaWxsYXRvcigpO1xuICAgICAgICAgICAgICAgIHZhciBnYWluID0gX2FjLmNyZWF0ZUdhaW4oKTtcbiAgICAgICAgICAgICAgICBnYWluLmdhaW4uc2V0VGFyZ2V0QXRUaW1lKDAsIF9hYy5jdXJyZW50VGltZSwgMC4wMSk7XG4gICAgICAgICAgICAgICAgb3NjLmNvbm5lY3QoZ2Fpbik7XG4gICAgICAgICAgICAgICAgZ2Fpbi5jb25uZWN0KF9hYy5kZXN0aW5hdGlvbik7XG4gICAgICAgICAgICAgICAgaWYgKCFvc2Muc3RhcnQpIG9zYy5zdGFydCA9IG9zYy5ub3RlT247XG4gICAgICAgICAgICAgICAgaWYgKCFvc2Muc3RvcCkgb3NjLnN0b3AgPSBvc2Mubm90ZU9mZjtcbiAgICAgICAgICAgICAgICBvc2Muc3RhcnQoLjEpOyBvc2Muc3RvcCgwLjExKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIGRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3RvdWNoZW5kJywgX2FjdGl2YXRlQXVkaW9Db250ZXh0KTtcbiAgICAgICAgICAgICAgICBkb2N1bWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCdtb3VzZWRvd24nLCBfYWN0aXZhdGVBdWRpb0NvbnRleHQpO1xuICAgICAgICAgICAgICAgIGRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCBfYWN0aXZhdGVBdWRpb0NvbnRleHQpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ3RvdWNoZW5kJywgX2FjdGl2YXRlQXVkaW9Db250ZXh0KTtcbiAgICAgICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignbW91c2Vkb3duJywgX2FjdGl2YXRlQXVkaW9Db250ZXh0KTtcbiAgICAgICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIF9hY3RpdmF0ZUF1ZGlvQ29udGV4dCk7XG4gICAgICAgIF9hY3RpdmF0ZUF1ZGlvQ29udGV4dCgpO1xuICAgIH1cblxuICAgIEpaWi51dGlsID0ge307XG4gICAgSlpaLnV0aWwuaW9zU291bmQgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIC8vIGRlcHJlY2F0ZWQuIHdpbGwgYmUgcmVtb3ZlZCBpbiBuZXh0IHZlcnNpb25cbiAgICB9XG4gICAgcmV0dXJuIEpaWjtcbn1cbiIsIi8vIHNoaW0gZm9yIHVzaW5nIHByb2Nlc3MgaW4gYnJvd3NlclxudmFyIHByb2Nlc3MgPSBtb2R1bGUuZXhwb3J0cyA9IHt9O1xuXG4vLyBjYWNoZWQgZnJvbSB3aGF0ZXZlciBnbG9iYWwgaXMgcHJlc2VudCBzbyB0aGF0IHRlc3QgcnVubmVycyB0aGF0IHN0dWIgaXRcbi8vIGRvbid0IGJyZWFrIHRoaW5ncy4gIEJ1dCB3ZSBuZWVkIHRvIHdyYXAgaXQgaW4gYSB0cnkgY2F0Y2ggaW4gY2FzZSBpdCBpc1xuLy8gd3JhcHBlZCBpbiBzdHJpY3QgbW9kZSBjb2RlIHdoaWNoIGRvZXNuJ3QgZGVmaW5lIGFueSBnbG9iYWxzLiAgSXQncyBpbnNpZGUgYVxuLy8gZnVuY3Rpb24gYmVjYXVzZSB0cnkvY2F0Y2hlcyBkZW9wdGltaXplIGluIGNlcnRhaW4gZW5naW5lcy5cblxudmFyIGNhY2hlZFNldFRpbWVvdXQ7XG52YXIgY2FjaGVkQ2xlYXJUaW1lb3V0O1xuXG5mdW5jdGlvbiBkZWZhdWx0U2V0VGltb3V0KCkge1xuICAgIHRocm93IG5ldyBFcnJvcignc2V0VGltZW91dCBoYXMgbm90IGJlZW4gZGVmaW5lZCcpO1xufVxuZnVuY3Rpb24gZGVmYXVsdENsZWFyVGltZW91dCAoKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdjbGVhclRpbWVvdXQgaGFzIG5vdCBiZWVuIGRlZmluZWQnKTtcbn1cbihmdW5jdGlvbiAoKSB7XG4gICAgdHJ5IHtcbiAgICAgICAgaWYgKHR5cGVvZiBzZXRUaW1lb3V0ID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICBjYWNoZWRTZXRUaW1lb3V0ID0gc2V0VGltZW91dDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNhY2hlZFNldFRpbWVvdXQgPSBkZWZhdWx0U2V0VGltb3V0O1xuICAgICAgICB9XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgICBjYWNoZWRTZXRUaW1lb3V0ID0gZGVmYXVsdFNldFRpbW91dDtcbiAgICB9XG4gICAgdHJ5IHtcbiAgICAgICAgaWYgKHR5cGVvZiBjbGVhclRpbWVvdXQgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgIGNhY2hlZENsZWFyVGltZW91dCA9IGNsZWFyVGltZW91dDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNhY2hlZENsZWFyVGltZW91dCA9IGRlZmF1bHRDbGVhclRpbWVvdXQ7XG4gICAgICAgIH1cbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIGNhY2hlZENsZWFyVGltZW91dCA9IGRlZmF1bHRDbGVhclRpbWVvdXQ7XG4gICAgfVxufSAoKSlcbmZ1bmN0aW9uIHJ1blRpbWVvdXQoZnVuKSB7XG4gICAgaWYgKGNhY2hlZFNldFRpbWVvdXQgPT09IHNldFRpbWVvdXQpIHtcbiAgICAgICAgLy9ub3JtYWwgZW52aXJvbWVudHMgaW4gc2FuZSBzaXR1YXRpb25zXG4gICAgICAgIHJldHVybiBzZXRUaW1lb3V0KGZ1biwgMCk7XG4gICAgfVxuICAgIC8vIGlmIHNldFRpbWVvdXQgd2Fzbid0IGF2YWlsYWJsZSBidXQgd2FzIGxhdHRlciBkZWZpbmVkXG4gICAgaWYgKChjYWNoZWRTZXRUaW1lb3V0ID09PSBkZWZhdWx0U2V0VGltb3V0IHx8ICFjYWNoZWRTZXRUaW1lb3V0KSAmJiBzZXRUaW1lb3V0KSB7XG4gICAgICAgIGNhY2hlZFNldFRpbWVvdXQgPSBzZXRUaW1lb3V0O1xuICAgICAgICByZXR1cm4gc2V0VGltZW91dChmdW4sIDApO1xuICAgIH1cbiAgICB0cnkge1xuICAgICAgICAvLyB3aGVuIHdoZW4gc29tZWJvZHkgaGFzIHNjcmV3ZWQgd2l0aCBzZXRUaW1lb3V0IGJ1dCBubyBJLkUuIG1hZGRuZXNzXG4gICAgICAgIHJldHVybiBjYWNoZWRTZXRUaW1lb3V0KGZ1biwgMCk7XG4gICAgfSBjYXRjaChlKXtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIC8vIFdoZW4gd2UgYXJlIGluIEkuRS4gYnV0IHRoZSBzY3JpcHQgaGFzIGJlZW4gZXZhbGVkIHNvIEkuRS4gZG9lc24ndCB0cnVzdCB0aGUgZ2xvYmFsIG9iamVjdCB3aGVuIGNhbGxlZCBub3JtYWxseVxuICAgICAgICAgICAgcmV0dXJuIGNhY2hlZFNldFRpbWVvdXQuY2FsbChudWxsLCBmdW4sIDApO1xuICAgICAgICB9IGNhdGNoKGUpe1xuICAgICAgICAgICAgLy8gc2FtZSBhcyBhYm92ZSBidXQgd2hlbiBpdCdzIGEgdmVyc2lvbiBvZiBJLkUuIHRoYXQgbXVzdCBoYXZlIHRoZSBnbG9iYWwgb2JqZWN0IGZvciAndGhpcycsIGhvcGZ1bGx5IG91ciBjb250ZXh0IGNvcnJlY3Qgb3RoZXJ3aXNlIGl0IHdpbGwgdGhyb3cgYSBnbG9iYWwgZXJyb3JcbiAgICAgICAgICAgIHJldHVybiBjYWNoZWRTZXRUaW1lb3V0LmNhbGwodGhpcywgZnVuLCAwKTtcbiAgICAgICAgfVxuICAgIH1cblxuXG59XG5mdW5jdGlvbiBydW5DbGVhclRpbWVvdXQobWFya2VyKSB7XG4gICAgaWYgKGNhY2hlZENsZWFyVGltZW91dCA9PT0gY2xlYXJUaW1lb3V0KSB7XG4gICAgICAgIC8vbm9ybWFsIGVudmlyb21lbnRzIGluIHNhbmUgc2l0dWF0aW9uc1xuICAgICAgICByZXR1cm4gY2xlYXJUaW1lb3V0KG1hcmtlcik7XG4gICAgfVxuICAgIC8vIGlmIGNsZWFyVGltZW91dCB3YXNuJ3QgYXZhaWxhYmxlIGJ1dCB3YXMgbGF0dGVyIGRlZmluZWRcbiAgICBpZiAoKGNhY2hlZENsZWFyVGltZW91dCA9PT0gZGVmYXVsdENsZWFyVGltZW91dCB8fCAhY2FjaGVkQ2xlYXJUaW1lb3V0KSAmJiBjbGVhclRpbWVvdXQpIHtcbiAgICAgICAgY2FjaGVkQ2xlYXJUaW1lb3V0ID0gY2xlYXJUaW1lb3V0O1xuICAgICAgICByZXR1cm4gY2xlYXJUaW1lb3V0KG1hcmtlcik7XG4gICAgfVxuICAgIHRyeSB7XG4gICAgICAgIC8vIHdoZW4gd2hlbiBzb21lYm9keSBoYXMgc2NyZXdlZCB3aXRoIHNldFRpbWVvdXQgYnV0IG5vIEkuRS4gbWFkZG5lc3NcbiAgICAgICAgcmV0dXJuIGNhY2hlZENsZWFyVGltZW91dChtYXJrZXIpO1xuICAgIH0gY2F0Y2ggKGUpe1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgLy8gV2hlbiB3ZSBhcmUgaW4gSS5FLiBidXQgdGhlIHNjcmlwdCBoYXMgYmVlbiBldmFsZWQgc28gSS5FLiBkb2Vzbid0ICB0cnVzdCB0aGUgZ2xvYmFsIG9iamVjdCB3aGVuIGNhbGxlZCBub3JtYWxseVxuICAgICAgICAgICAgcmV0dXJuIGNhY2hlZENsZWFyVGltZW91dC5jYWxsKG51bGwsIG1hcmtlcik7XG4gICAgICAgIH0gY2F0Y2ggKGUpe1xuICAgICAgICAgICAgLy8gc2FtZSBhcyBhYm92ZSBidXQgd2hlbiBpdCdzIGEgdmVyc2lvbiBvZiBJLkUuIHRoYXQgbXVzdCBoYXZlIHRoZSBnbG9iYWwgb2JqZWN0IGZvciAndGhpcycsIGhvcGZ1bGx5IG91ciBjb250ZXh0IGNvcnJlY3Qgb3RoZXJ3aXNlIGl0IHdpbGwgdGhyb3cgYSBnbG9iYWwgZXJyb3IuXG4gICAgICAgICAgICAvLyBTb21lIHZlcnNpb25zIG9mIEkuRS4gaGF2ZSBkaWZmZXJlbnQgcnVsZXMgZm9yIGNsZWFyVGltZW91dCB2cyBzZXRUaW1lb3V0XG4gICAgICAgICAgICByZXR1cm4gY2FjaGVkQ2xlYXJUaW1lb3V0LmNhbGwodGhpcywgbWFya2VyKTtcbiAgICAgICAgfVxuICAgIH1cblxuXG5cbn1cbnZhciBxdWV1ZSA9IFtdO1xudmFyIGRyYWluaW5nID0gZmFsc2U7XG52YXIgY3VycmVudFF1ZXVlO1xudmFyIHF1ZXVlSW5kZXggPSAtMTtcblxuZnVuY3Rpb24gY2xlYW5VcE5leHRUaWNrKCkge1xuICAgIGlmICghZHJhaW5pbmcgfHwgIWN1cnJlbnRRdWV1ZSkge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIGRyYWluaW5nID0gZmFsc2U7XG4gICAgaWYgKGN1cnJlbnRRdWV1ZS5sZW5ndGgpIHtcbiAgICAgICAgcXVldWUgPSBjdXJyZW50UXVldWUuY29uY2F0KHF1ZXVlKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICBxdWV1ZUluZGV4ID0gLTE7XG4gICAgfVxuICAgIGlmIChxdWV1ZS5sZW5ndGgpIHtcbiAgICAgICAgZHJhaW5RdWV1ZSgpO1xuICAgIH1cbn1cblxuZnVuY3Rpb24gZHJhaW5RdWV1ZSgpIHtcbiAgICBpZiAoZHJhaW5pbmcpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB2YXIgdGltZW91dCA9IHJ1blRpbWVvdXQoY2xlYW5VcE5leHRUaWNrKTtcbiAgICBkcmFpbmluZyA9IHRydWU7XG5cbiAgICB2YXIgbGVuID0gcXVldWUubGVuZ3RoO1xuICAgIHdoaWxlKGxlbikge1xuICAgICAgICBjdXJyZW50UXVldWUgPSBxdWV1ZTtcbiAgICAgICAgcXVldWUgPSBbXTtcbiAgICAgICAgd2hpbGUgKCsrcXVldWVJbmRleCA8IGxlbikge1xuICAgICAgICAgICAgaWYgKGN1cnJlbnRRdWV1ZSkge1xuICAgICAgICAgICAgICAgIGN1cnJlbnRRdWV1ZVtxdWV1ZUluZGV4XS5ydW4oKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBxdWV1ZUluZGV4ID0gLTE7XG4gICAgICAgIGxlbiA9IHF1ZXVlLmxlbmd0aDtcbiAgICB9XG4gICAgY3VycmVudFF1ZXVlID0gbnVsbDtcbiAgICBkcmFpbmluZyA9IGZhbHNlO1xuICAgIHJ1bkNsZWFyVGltZW91dCh0aW1lb3V0KTtcbn1cblxucHJvY2Vzcy5uZXh0VGljayA9IGZ1bmN0aW9uIChmdW4pIHtcbiAgICB2YXIgYXJncyA9IG5ldyBBcnJheShhcmd1bWVudHMubGVuZ3RoIC0gMSk7XG4gICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPiAxKSB7XG4gICAgICAgIGZvciAodmFyIGkgPSAxOyBpIDwgYXJndW1lbnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBhcmdzW2kgLSAxXSA9IGFyZ3VtZW50c1tpXTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBxdWV1ZS5wdXNoKG5ldyBJdGVtKGZ1biwgYXJncykpO1xuICAgIGlmIChxdWV1ZS5sZW5ndGggPT09IDEgJiYgIWRyYWluaW5nKSB7XG4gICAgICAgIHJ1blRpbWVvdXQoZHJhaW5RdWV1ZSk7XG4gICAgfVxufTtcblxuLy8gdjggbGlrZXMgcHJlZGljdGlibGUgb2JqZWN0c1xuZnVuY3Rpb24gSXRlbShmdW4sIGFycmF5KSB7XG4gICAgdGhpcy5mdW4gPSBmdW47XG4gICAgdGhpcy5hcnJheSA9IGFycmF5O1xufVxuSXRlbS5wcm90b3R5cGUucnVuID0gZnVuY3Rpb24gKCkge1xuICAgIHRoaXMuZnVuLmFwcGx5KG51bGwsIHRoaXMuYXJyYXkpO1xufTtcbnByb2Nlc3MudGl0bGUgPSAnYnJvd3Nlcic7XG5wcm9jZXNzLmJyb3dzZXIgPSB0cnVlO1xucHJvY2Vzcy5lbnYgPSB7fTtcbnByb2Nlc3MuYXJndiA9IFtdO1xucHJvY2Vzcy52ZXJzaW9uID0gJyc7IC8vIGVtcHR5IHN0cmluZyB0byBhdm9pZCByZWdleHAgaXNzdWVzXG5wcm9jZXNzLnZlcnNpb25zID0ge307XG5cbmZ1bmN0aW9uIG5vb3AoKSB7fVxuXG5wcm9jZXNzLm9uID0gbm9vcDtcbnByb2Nlc3MuYWRkTGlzdGVuZXIgPSBub29wO1xucHJvY2Vzcy5vbmNlID0gbm9vcDtcbnByb2Nlc3Mub2ZmID0gbm9vcDtcbnByb2Nlc3MucmVtb3ZlTGlzdGVuZXIgPSBub29wO1xucHJvY2Vzcy5yZW1vdmVBbGxMaXN0ZW5lcnMgPSBub29wO1xucHJvY2Vzcy5lbWl0ID0gbm9vcDtcbnByb2Nlc3MucHJlcGVuZExpc3RlbmVyID0gbm9vcDtcbnByb2Nlc3MucHJlcGVuZE9uY2VMaXN0ZW5lciA9IG5vb3A7XG5cbnByb2Nlc3MubGlzdGVuZXJzID0gZnVuY3Rpb24gKG5hbWUpIHsgcmV0dXJuIFtdIH1cblxucHJvY2Vzcy5iaW5kaW5nID0gZnVuY3Rpb24gKG5hbWUpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3Byb2Nlc3MuYmluZGluZyBpcyBub3Qgc3VwcG9ydGVkJyk7XG59O1xuXG5wcm9jZXNzLmN3ZCA9IGZ1bmN0aW9uICgpIHsgcmV0dXJuICcvJyB9O1xucHJvY2Vzcy5jaGRpciA9IGZ1bmN0aW9uIChkaXIpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3Byb2Nlc3MuY2hkaXIgaXMgbm90IHN1cHBvcnRlZCcpO1xufTtcbnByb2Nlc3MudW1hc2sgPSBmdW5jdGlvbigpIHsgcmV0dXJuIDA7IH07XG4iLCJpbXBvcnQgeyBjcmVhdGVNSURJQWNjZXNzLCBjbG9zZUFsbE1JRElJbnB1dHMgfSBmcm9tICcuL21pZGkvbWlkaV9hY2Nlc3MnO1xuaW1wb3J0IHsgcG9seWZpbGwsIGdldERldmljZSwgZ2V0U2NvcGUgfSBmcm9tICcuL3V0aWwvdXRpbCc7XG4vLyBpbXBvcnQgTUlESUlucHV0IGZyb20gJy4vbWlkaS9taWRpX2lucHV0Jztcbi8vIGltcG9ydCBNSURJT3V0cHV0IGZyb20gJy4vbWlkaS9taWRpX291dHB1dCc7XG5pbXBvcnQgKiBhcyBJbnB1dCBmcm9tICcuL21pZGkvbWlkaV9pbnB1dCc7XG5pbXBvcnQgKiBhcyBPdXRwdXQgZnJvbSAnLi9taWRpL21pZGlfb3V0cHV0JztcbmltcG9ydCBNSURJTWVzc2FnZUV2ZW50IGZyb20gJy4vbWlkaS9taWRpbWVzc2FnZV9ldmVudCc7XG5pbXBvcnQgTUlESUNvbm5lY3Rpb25FdmVudCBmcm9tICcuL21pZGkvbWlkaWNvbm5lY3Rpb25fZXZlbnQnO1xuXG5sZXQgbWlkaUFjY2VzcztcblxuY29uc3QgaW5pdCA9ICgpID0+IHtcbiAgICBpZiAoIW5hdmlnYXRvci5yZXF1ZXN0TUlESUFjY2Vzcykge1xuICAgICAgICAvLyBBZGQgc29tZSBmdW5jdGlvbmFsaXR5IHRvIG9sZGVyIGJyb3dzZXJzXG4gICAgICAgIHBvbHlmaWxsKCk7XG5cbiAgICAgICAgbmF2aWdhdG9yLnJlcXVlc3RNSURJQWNjZXNzID0gKCkgPT4ge1xuICAgICAgICAgICAgLy8gU2luZ2xldG9uLWlzaCwgbm8gbmVlZCB0byBjcmVhdGUgbXVsdGlwbGUgaW5zdGFuY2VzIG9mIE1JRElBY2Nlc3NcbiAgICAgICAgICAgIGlmIChtaWRpQWNjZXNzID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICBtaWRpQWNjZXNzID0gY3JlYXRlTUlESUFjY2VzcygpO1xuICAgICAgICAgICAgICAgIC8vIEFkZCBnbG9iYWwgdmFycyB0aGF0IG1pbWljIFdlYk1JREkgQVBJIG5hdGl2ZSBnbG9iYWxzXG4gICAgICAgICAgICAgICAgY29uc3Qgc2NvcGUgPSBnZXRTY29wZSgpO1xuICAgICAgICAgICAgICAgIHNjb3BlLk1JRElJbnB1dCA9IElucHV0O1xuICAgICAgICAgICAgICAgIHNjb3BlLk1JRElPdXRwdXQgPSBPdXRwdXQ7XG4gICAgICAgICAgICAgICAgc2NvcGUuTUlESU1lc3NhZ2VFdmVudCA9IE1JRElNZXNzYWdlRXZlbnQ7XG4gICAgICAgICAgICAgICAgc2NvcGUuTUlESUNvbm5lY3Rpb25FdmVudCA9IE1JRElDb25uZWN0aW9uRXZlbnQ7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gbWlkaUFjY2VzcztcbiAgICAgICAgfTtcbiAgICAgICAgaWYgKGdldERldmljZSgpLm5vZGVqcyA9PT0gdHJ1ZSkge1xuICAgICAgICAgICAgbmF2aWdhdG9yLmNsb3NlID0gKCkgPT4ge1xuICAgICAgICAgICAgICAgIC8vIEZvciBOb2RlanMgYXBwbGljYXRpb25zIHdlIG5lZWQgdG8gYWRkIGEgbWV0aG9kIHRoYXQgY2xvc2VzIGFsbCBNSURJIGlucHV0IHBvcnRzLFxuICAgICAgICAgICAgICAgIC8vIG90aGVyd2lzZSBOb2RlanMgd2lsbCB3YWl0IGZvciBNSURJIGlucHV0IGZvcmV2ZXIuXG4gICAgICAgICAgICAgICAgY2xvc2VBbGxNSURJSW5wdXRzKCk7XG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgfVxufTtcblxuaW5pdCgpO1xuIiwiLypcbiAgQ3JlYXRlcyBhIE1JRElBY2Nlc3MgaW5zdGFuY2U6XG4gIC0gQ3JlYXRlcyBNSURJSW5wdXQgYW5kIE1JRElPdXRwdXQgaW5zdGFuY2VzIGZvciB0aGUgaW5pdGlhbGx5IGNvbm5lY3RlZCBNSURJIGRldmljZXMuXG4gIC0gS2VlcHMgdHJhY2sgb2YgbmV3bHkgY29ubmVjdGVkIGRldmljZXMgYW5kIGNyZWF0ZXMgdGhlIG5lY2Vzc2FyeSBpbnN0YW5jZXMgb2YgTUlESUlucHV0IGFuZCBNSURJT3V0cHV0LlxuICAtIEtlZXBzIHRyYWNrIG9mIGRpc2Nvbm5lY3RlZCBkZXZpY2VzIGFuZCByZW1vdmVzIHRoZW0gZnJvbSB0aGUgaW5wdXRzIGFuZC9vciBvdXRwdXRzIG1hcC5cbiAgLSBDcmVhdGVzIGEgdW5pcXVlIGlkIGZvciBldmVyeSBkZXZpY2UgYW5kIHN0b3JlcyB0aGVzZSBpZHMgYnkgdGhlIG5hbWUgb2YgdGhlIGRldmljZTpcbiAgICBzbyB3aGVuIGEgZGV2aWNlIGdldHMgZGlzY29ubmVjdGVkIGFuZCByZWNvbm5lY3RlZCBhZ2FpbiwgaXQgd2lsbCBzdGlsbCBoYXZlIHRoZSBzYW1lIGlkLiBUaGlzXG4gICAgaXMgaW4gbGluZSB3aXRoIHRoZSBiZWhhdmlvciBvZiB0aGUgbmF0aXZlIE1JRElBY2Nlc3Mgb2JqZWN0LlxuXG4qL1xuaW1wb3J0IEp6eiBmcm9tICdqenonO1xuaW1wb3J0IE1JRElJbnB1dCBmcm9tICcuL21pZGlfaW5wdXQnO1xuaW1wb3J0IE1JRElPdXRwdXQgZnJvbSAnLi9taWRpX291dHB1dCc7XG5pbXBvcnQgTUlESUNvbm5lY3Rpb25FdmVudCBmcm9tICcuL21pZGljb25uZWN0aW9uX2V2ZW50JztcbmltcG9ydCB7IGdldERldmljZSB9IGZyb20gJy4uL3V0aWwvdXRpbCc7XG5pbXBvcnQgU3RvcmUgZnJvbSAnLi4vdXRpbC9zdG9yZSc7XG5cbmxldCBtaWRpQWNjZXNzO1xuY29uc3QgbGlzdGVuZXJzID0gbmV3IFN0b3JlKCk7XG5jb25zdCBtaWRpSW5wdXRzID0gbmV3IFN0b3JlKCk7XG5jb25zdCBtaWRpT3V0cHV0cyA9IG5ldyBTdG9yZSgpO1xuXG5jbGFzcyBNSURJQWNjZXNzIHtcbiAgICBjb25zdHJ1Y3RvcihpbnB1dHMsIG91dHB1dHMpIHtcbiAgICAgICAgdGhpcy5zeXNleEVuYWJsZWQgPSB0cnVlO1xuICAgICAgICB0aGlzLmlucHV0cyA9IGlucHV0cztcbiAgICAgICAgdGhpcy5vdXRwdXRzID0gb3V0cHV0cztcbiAgICB9XG5cbiAgICBhZGRFdmVudExpc3RlbmVyKHR5cGUsIGxpc3RlbmVyKSB7XG4gICAgICAgIGlmICh0eXBlICE9PSAnc3RhdGVjaGFuZ2UnKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGxpc3RlbmVycy5oYXMobGlzdGVuZXIpID09PSBmYWxzZSkge1xuICAgICAgICAgICAgbGlzdGVuZXJzLmFkZChsaXN0ZW5lcik7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZW1vdmVFdmVudExpc3RlbmVyKHR5cGUsIGxpc3RlbmVyKSB7XG4gICAgICAgIGlmICh0eXBlICE9PSAnc3RhdGVjaGFuZ2UnKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGxpc3RlbmVycy5oYXMobGlzdGVuZXIpID09PSB0cnVlKSB7XG4gICAgICAgICAgICBsaXN0ZW5lcnMuZGVsZXRlKGxpc3RlbmVyKTtcbiAgICAgICAgfVxuICAgIH1cbn1cblxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0TUlESVBvcnRzKCkge1xuICAgIG1pZGlJbnB1dHMuY2xlYXIoKTtcbiAgICBtaWRpT3V0cHV0cy5jbGVhcigpO1xuICAgIEp6eigpLmluZm8oKS5pbnB1dHMuZm9yRWFjaChpbmZvID0+IHtcbiAgICAgICAgbGV0IHBvcnQgPSBuZXcgTUlESUlucHV0KGluZm8pO1xuICAgICAgICBtaWRpSW5wdXRzLnNldChwb3J0LmlkLCBwb3J0KTtcbiAgICAgICAgLy8gbWlkaUlucHV0SWRzLnNldChwb3J0Lm5hbWUsIHBvcnQuaWQpO1xuICAgIH0pO1xuICAgIEp6eigpLmluZm8oKS5vdXRwdXRzLmZvckVhY2goaW5mbyA9PiB7XG4gICAgICAgIGxldCBwb3J0ID0gbmV3IE1JRElPdXRwdXQoaW5mbyk7XG4gICAgICAgIG1pZGlPdXRwdXRzLnNldChwb3J0LmlkLCBwb3J0KTtcbiAgICAgICAgLy8gbWlkaU91dHB1dElkcy5zZXQocG9ydC5uYW1lLCBwb3J0LmlkKTtcbiAgICB9KTtcbn1cblxuXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlTUlESUFjY2VzcygpIHtcbiAgICByZXR1cm4gbmV3IFByb21pc2UoKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgICAgaWYgKHR5cGVvZiBtaWRpQWNjZXNzICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgICAgICAgcmVzb2x2ZShtaWRpQWNjZXNzKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChnZXREZXZpY2UoKS5icm93c2VyID09PSAnaWU5Jykge1xuICAgICAgICAgICAgcmVqZWN0KHsgbWVzc2FnZTogJ1dlYk1JRElBUElTaGltIHN1cHBvcnRzIEludGVybmV0IEV4cGxvcmVyIDEwIGFuZCBhYm92ZS4nIH0pO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIEp6eih7IGVuZ2luZTogWydwbHVnaW4nLCAnZXh0ZW5zaW9uJywgJ3dlYm1pZGknXSB9KVxuICAgICAgICAgICAgLm9yKCgpID0+IHtcbiAgICAgICAgICAgICAgICByZWplY3QoeyBtZXNzYWdlOiAnTm8gYWNjZXNzIHRvIE1JREkgZGV2aWNlczogeW91ciBicm93c2VyIGRvZXMgbm90IHN1cHBvcnQgdGhlIFdlYk1JREkgQVBJIGFuZCB0aGUgSmF6eiBleHRlbnNpb24gKG9yIEphenogcGx1Z2luKSBpcyBub3QgaW5zdGFsbGVkLicgfSk7XG4gICAgICAgICAgICB9KVxuICAgICAgICAgICAgLmFuZCgoKSA9PiB7XG4gICAgICAgICAgICAgICAgZ2V0TUlESVBvcnRzKCk7XG4gICAgICAgICAgICAgICAgbWlkaUFjY2VzcyA9IG5ldyBNSURJQWNjZXNzKG1pZGlJbnB1dHMsIG1pZGlPdXRwdXRzKTtcbiAgICAgICAgICAgICAgICByZXNvbHZlKG1pZGlBY2Nlc3MpO1xuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIC5lcnIoKG1zZykgPT4ge1xuICAgICAgICAgICAgICAgIHJlamVjdChtc2cpO1xuICAgICAgICAgICAgfSlcbiAgICB9KSk7XG59XG5cblxuLy8gd2hlbiBhIGRldmljZSBnZXRzIGNvbm5lY3RlZC9kaXNjb25uZWN0ZWQgYm90aCB0aGUgcG9ydCBhbmQgTUlESUFjY2VzcyBkaXNwYXRjaCBhIE1JRElDb25uZWN0aW9uRXZlbnRcbi8vIHRoZXJlZm9yIHdlIGNhbGwgdGhlIHBvcnRzIGRpc3BhdGNoRXZlbnQgZnVuY3Rpb24gaGVyZSBhcyB3ZWxsXG5leHBvcnQgZnVuY3Rpb24gZGlzcGF0Y2hFdmVudChwb3J0KSB7XG4gICAgcG9ydC5kaXNwYXRjaEV2ZW50KG5ldyBNSURJQ29ubmVjdGlvbkV2ZW50KHBvcnQsIHBvcnQpKTtcblxuICAgIGNvbnN0IGV2dCA9IG5ldyBNSURJQ29ubmVjdGlvbkV2ZW50KG1pZGlBY2Nlc3MsIHBvcnQpO1xuXG4gICAgaWYgKHR5cGVvZiBtaWRpQWNjZXNzLm9uc3RhdGVjaGFuZ2UgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgbWlkaUFjY2Vzcy5vbnN0YXRlY2hhbmdlKGV2dCk7XG4gICAgfVxuICAgIGxpc3RlbmVycy5mb3JFYWNoKGxpc3RlbmVyID0+IGxpc3RlbmVyKGV2dCkpO1xufVxuXG5cbmV4cG9ydCBmdW5jdGlvbiBjbG9zZUFsbE1JRElJbnB1dHMoKSB7XG4gICAgbWlkaUlucHV0cy5mb3JFYWNoKChpbnB1dCkgPT4ge1xuICAgICAgICAvLyBpbnB1dC5jbG9zZSgpO1xuICAgICAgICBpbnB1dC5famF6ekluc3RhbmNlLk1pZGlJbkNsb3NlKCk7XG4gICAgfSk7XG59XG4iLCIvKlxuICBNSURJSW5wdXQgaXMgYSB3cmFwcGVyIGFyb3VuZCBhbiBpbnB1dCBvZiBhIEphenogaW5zdGFuY2VcbiovXG5pbXBvcnQgSnp6IGZyb20gJ2p6eic7XG5pbXBvcnQgTUlESU1lc3NhZ2VFdmVudCBmcm9tICcuL21pZGltZXNzYWdlX2V2ZW50JztcbmltcG9ydCBNSURJQ29ubmVjdGlvbkV2ZW50IGZyb20gJy4vbWlkaWNvbm5lY3Rpb25fZXZlbnQnO1xuaW1wb3J0IHsgZGlzcGF0Y2hFdmVudCB9IGZyb20gJy4vbWlkaV9hY2Nlc3MnO1xuaW1wb3J0IHsgZ2VuZXJhdGVVVUlEIH0gZnJvbSAnLi4vdXRpbC91dGlsJztcbmltcG9ydCBTdG9yZSBmcm9tICcuLi91dGlsL3N0b3JlJztcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgTUlESUlucHV0IHtcbiAgICBjb25zdHJ1Y3RvcihpbmZvKSB7XG4gICAgICAgIHRoaXMuaWQgPSBpbmZvLmlkIHx8IGdlbmVyYXRlVVVJRCgpO1xuICAgICAgICB0aGlzLm5hbWUgPSBpbmZvLm5hbWU7XG4gICAgICAgIHRoaXMubWFudWZhY3R1cmVyID0gaW5mby5tYW51ZmFjdHVyZXI7XG4gICAgICAgIHRoaXMudmVyc2lvbiA9IGluZm8udmVyc2lvbjtcbiAgICAgICAgdGhpcy50eXBlID0gJ2lucHV0JztcbiAgICAgICAgdGhpcy5zdGF0ZSA9ICdjb25uZWN0ZWQnO1xuICAgICAgICB0aGlzLmNvbm5lY3Rpb24gPSAncGVuZGluZyc7XG4gICAgICAgIHRoaXMucG9ydCA9IG51bGw7XG5cbiAgICAgICAgdGhpcy5vbnN0YXRlY2hhbmdlID0gbnVsbDtcbiAgICAgICAgdGhpcy5fb25taWRpbWVzc2FnZSA9IG51bGw7XG5cbiAgICAgICAgLy8gYmVjYXVzZSB3ZSBuZWVkIHRvIGltcGxpY2l0bHkgb3BlbiB0aGUgZGV2aWNlIHdoZW4gYW4gb25taWRpbWVzc2FnZSBoYW5kbGVyIGdldHMgYWRkZWRcbiAgICAgICAgLy8gd2UgZGVmaW5lIGEgc2V0dGVyIHRoYXQgb3BlbnMgdGhlIGRldmljZSBpZiB0aGUgc2V0IHZhbHVlIGlzIGEgZnVuY3Rpb25cbiAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRoaXMsICdvbm1pZGltZXNzYWdlJywge1xuICAgICAgICAgICAgc2V0KHZhbHVlKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fb25taWRpbWVzc2FnZSA9IHZhbHVlO1xuICAgICAgICAgICAgICAgIGlmICh0eXBlb2YgdmFsdWUgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMucG9ydCA9PT0gbnVsbCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5vcGVuKCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgdGhpcy5wb3J0LmNvbm5lY3QoKG1zZykgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgbSA9IG5ldyBNSURJTWVzc2FnZUV2ZW50KHRoaXMsIG1zZyk7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZShtKTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcblxuICAgICAgICB0aGlzLl9saXN0ZW5lcnMgPSBuZXcgU3RvcmUoKVxuICAgICAgICAgICAgLnNldCgnbWlkaW1lc3NhZ2UnLCBuZXcgU3RvcmUoKSlcbiAgICAgICAgICAgIC5zZXQoJ3N0YXRlY2hhbmdlJywgbmV3IFN0b3JlKCkpO1xuICAgIH1cblxuICAgIGFkZEV2ZW50TGlzdGVuZXIodHlwZSwgbGlzdGVuZXIpIHtcbiAgICAgICAgY29uc3QgbGlzdGVuZXJzID0gdGhpcy5fbGlzdGVuZXJzLmdldCh0eXBlKTtcbiAgICAgICAgaWYgKHR5cGVvZiBsaXN0ZW5lcnMgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBpZiAobGlzdGVuZXJzLmhhcyhsaXN0ZW5lcikgPT09IGZhbHNlKSB7XG4gICAgICAgICAgICBsaXN0ZW5lcnMuYWRkKGxpc3RlbmVyKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHJlbW92ZUV2ZW50TGlzdGVuZXIodHlwZSwgbGlzdGVuZXIpIHtcbiAgICAgICAgY29uc3QgbGlzdGVuZXJzID0gdGhpcy5fbGlzdGVuZXJzLmdldCh0eXBlKTtcbiAgICAgICAgaWYgKHR5cGVvZiBsaXN0ZW5lcnMgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBpZiAobGlzdGVuZXJzLmhhcyhsaXN0ZW5lcikgPT09IHRydWUpIHtcbiAgICAgICAgICAgIGxpc3RlbmVycy5kZWxldGUobGlzdGVuZXIpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgZGlzcGF0Y2hFdmVudChldnQpIHtcbiAgICAgICAgY29uc3QgbGlzdGVuZXJzID0gdGhpcy5fbGlzdGVuZXJzLmdldChldnQudHlwZSk7XG4gICAgICAgIGxpc3RlbmVycy5mb3JFYWNoKChsaXN0ZW5lcikgPT4ge1xuICAgICAgICAgICAgbGlzdGVuZXIoZXZ0KTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgaWYgKGV2dC50eXBlID09PSAnbWlkaW1lc3NhZ2UnKSB7XG4gICAgICAgICAgICBpZiAodGhpcy5fb25taWRpbWVzc2FnZSAhPT0gbnVsbCkge1xuICAgICAgICAgICAgICAgIHRoaXMuX29ubWlkaW1lc3NhZ2UoZXZ0KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIGlmIChldnQudHlwZSA9PT0gJ3N0YXRlY2hhbmdlJykge1xuICAgICAgICAgICAgaWYgKHRoaXMub25zdGF0ZWNoYW5nZSAhPT0gbnVsbCkge1xuICAgICAgICAgICAgICAgIHRoaXMub25zdGF0ZWNoYW5nZShldnQpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgb3BlbigpIHtcbiAgICAgICAgaWYgKHRoaXMuY29ubmVjdGlvbiA9PT0gJ29wZW4nKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5wb3J0ID0gSnp6KCkub3Blbk1pZGlJbih0aGlzLm5hbWUpXG4gICAgICAgICAgICAub3IoYENvdWxkIG5vdCBvcGVuIGlucHV0ICR7dGhpcy5uYW1lfWApXG4gICAgICAgICAgICAuYW5kKCgpID0+IHtcbiAgICAgICAgICAgICAgICB0aGlzLmNvbm5lY3Rpb24gPSAnb3Blbic7XG4gICAgICAgICAgICAgICAgZGlzcGF0Y2hFdmVudCh0aGlzKTsgLy8gZGlzcGF0Y2ggTUlESUNvbm5lY3Rpb25FdmVudCB2aWEgTUlESUFjY2Vzc1xuICAgICAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgY2xvc2UoKSB7XG4gICAgICAgIGlmICh0aGlzLmNvbm5lY3Rpb24gPT09ICdjbG9zZWQnKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5wb3J0LmNsb3NlKClcbiAgICAgICAgICAgIC5vcihgQ291bGQgbm90IGNsb3NlIGlucHV0ICR7dGhpcy5uYW1lfWApXG4gICAgICAgICAgICAuYW5kKCgpID0+IHtcbiAgICAgICAgICAgICAgICB0aGlzLmNvbm5lY3Rpb24gPSAnY2xvc2VkJztcbiAgICAgICAgICAgICAgICB0aGlzLnBvcnQgPSBudWxsO1xuICAgICAgICAgICAgICAgIHRoaXMuX29ubWlkaW1lc3NhZ2UgPSBudWxsO1xuICAgICAgICAgICAgICAgIHRoaXMub25zdGF0ZWNoYW5nZSA9IG51bGw7XG4gICAgICAgICAgICAgICAgdGhpcy5fbGlzdGVuZXJzLmdldCgnbWlkaW1lc3NhZ2UnKS5jbGVhcigpO1xuICAgICAgICAgICAgICAgIHRoaXMuX2xpc3RlbmVycy5nZXQoJ3N0YXRlY2hhbmdlJykuY2xlYXIoKTtcbiAgICAgICAgICAgICAgICBkaXNwYXRjaEV2ZW50KHRoaXMpOyAvLyBkaXNwYXRjaCBNSURJQ29ubmVjdGlvbkV2ZW50IHZpYSBNSURJQWNjZXNzXG4gICAgICAgICAgICB9KTtcbiAgICB9XG59XG4iLCIvKlxuICBNSURJT3V0cHV0IGlzIGEgd3JhcHBlciBhcm91bmQgYW4gb3V0cHV0IG9mIGEgSmF6eiBpbnN0YW5jZVxuKi9cbmltcG9ydCBKenogZnJvbSAnanp6JztcbmltcG9ydCB7IGdlbmVyYXRlVVVJRCB9IGZyb20gJy4uL3V0aWwvdXRpbCc7XG5pbXBvcnQgU3RvcmUgZnJvbSAnLi4vdXRpbC9zdG9yZSc7XG5pbXBvcnQgeyBkaXNwYXRjaEV2ZW50IH0gZnJvbSAnLi9taWRpX2FjY2Vzcyc7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIE1JRElPdXRwdXQge1xuICAgIGNvbnN0cnVjdG9yKGluZm8pIHtcbiAgICAgICAgdGhpcy5pZCA9IGluZm8uaWQgfHwgZ2VuZXJhdGVVVUlEKCk7XG4gICAgICAgIHRoaXMubmFtZSA9IGluZm8ubmFtZTtcbiAgICAgICAgdGhpcy5tYW51ZmFjdHVyZXIgPSBpbmZvLm1hbnVmYWN0dXJlcjtcbiAgICAgICAgdGhpcy52ZXJzaW9uID0gaW5mby52ZXJzaW9uO1xuICAgICAgICB0aGlzLnR5cGUgPSAnb3V0cHV0JztcbiAgICAgICAgdGhpcy5zdGF0ZSA9ICdjb25uZWN0ZWQnO1xuICAgICAgICB0aGlzLmNvbm5lY3Rpb24gPSAncGVuZGluZyc7XG4gICAgICAgIHRoaXMub25taWRpbWVzc2FnZSA9IG51bGw7XG4gICAgICAgIHRoaXMub25zdGF0ZWNoYW5nZSA9IG51bGw7XG4gICAgICAgIHRoaXMucG9ydCA9IG51bGw7XG5cbiAgICAgICAgdGhpcy5fbGlzdGVuZXJzID0gbmV3IFN0b3JlKCk7XG4gICAgfVxuXG4gICAgb3BlbigpIHtcbiAgICAgICAgaWYgKHRoaXMuY29ubmVjdGlvbiA9PT0gJ29wZW4nKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5wb3J0ID0gSnp6KCkub3Blbk1pZGlPdXQodGhpcy5uYW1lKVxuICAgICAgICAgICAgLm9yKGBDb3VsZCBub3Qgb3BlbiBpbnB1dCAke3RoaXMubmFtZX1gKVxuICAgICAgICAgICAgLmFuZCgoKSA9PiB7XG4gICAgICAgICAgICAgICAgdGhpcy5jb25uZWN0aW9uID0gJ29wZW4nO1xuICAgICAgICAgICAgICAgIGRpc3BhdGNoRXZlbnQodGhpcyk7IC8vIGRpc3BhdGNoIE1JRElDb25uZWN0aW9uRXZlbnQgdmlhIE1JRElBY2Nlc3NcbiAgICAgICAgICAgIH0pO1xuICAgIH1cblxuICAgIGNsb3NlKCkge1xuICAgICAgICBpZiAodGhpcy5jb25uZWN0aW9uID09PSAnY2xvc2VkJykge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMucG9ydC5jbG9zZSgpXG4gICAgICAgICAgICAub3IoYENvdWxkIG5vdCBjbG9zZSBvdXRwdXQgJHt0aGlzLm5hbWV9YClcbiAgICAgICAgICAgIC5hbmQoKCkgPT4ge1xuICAgICAgICAgICAgICAgIGRpc3BhdGNoRXZlbnQodGhpcyk7IC8vIGRpc3BhdGNoIE1JRElDb25uZWN0aW9uRXZlbnQgdmlhIE1JRElBY2Nlc3NcbiAgICAgICAgICAgICAgICB0aGlzLmNvbm5lY3Rpb24gPSAnY2xvc2VkJztcbiAgICAgICAgICAgICAgICB0aGlzLm9uc3RhdGVjaGFuZ2UgPSBudWxsO1xuICAgICAgICAgICAgICAgIHRoaXMuX2xpc3RlbmVycy5jbGVhcigpO1xuICAgICAgICAgICAgfSlcbiAgICB9XG5cbiAgICBzZW5kKGRhdGEsIHRpbWVzdGFtcCA9IDApIHtcbiAgICAgICAgbGV0IGRlbGF5QmVmb3JlU2VuZCA9IDA7XG4gICAgICAgIGlmICh0aW1lc3RhbXAgIT09IDApIHtcbiAgICAgICAgICAgIGRlbGF5QmVmb3JlU2VuZCA9IE1hdGguZmxvb3IodGltZXN0YW1wIC0gcGVyZm9ybWFuY2Uubm93KCkpO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5wb3J0XG4gICAgICAgICAgICAud2FpdChkZWxheUJlZm9yZVNlbmQpXG4gICAgICAgICAgICAuc2VuZChkYXRhKTtcblxuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG5cbiAgICBjbGVhcigpIHtcbiAgICAgICAgLy8gdG8gYmUgaW1wbGVtZW50ZWRcbiAgICB9XG5cbiAgICBhZGRFdmVudExpc3RlbmVyKHR5cGUsIGxpc3RlbmVyKSB7XG4gICAgICAgIGlmICh0eXBlICE9PSAnc3RhdGVjaGFuZ2UnKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodGhpcy5fbGlzdGVuZXJzLmhhcyhsaXN0ZW5lcikgPT09IGZhbHNlKSB7XG4gICAgICAgICAgICB0aGlzLl9saXN0ZW5lcnMuYWRkKGxpc3RlbmVyKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHJlbW92ZUV2ZW50TGlzdGVuZXIodHlwZSwgbGlzdGVuZXIpIHtcbiAgICAgICAgaWYgKHR5cGUgIT09ICdzdGF0ZWNoYW5nZScpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0aGlzLl9saXN0ZW5lcnMuaGFzKGxpc3RlbmVyKSA9PT0gdHJ1ZSkge1xuICAgICAgICAgICAgdGhpcy5fbGlzdGVuZXJzLmRlbGV0ZShsaXN0ZW5lcik7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBkaXNwYXRjaEV2ZW50KGV2dCkge1xuICAgICAgICB0aGlzLl9saXN0ZW5lcnMuZm9yRWFjaCgobGlzdGVuZXIpID0+IHtcbiAgICAgICAgICAgIGxpc3RlbmVyKGV2dCk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGlmICh0aGlzLm9uc3RhdGVjaGFuZ2UgIT09IG51bGwpIHtcbiAgICAgICAgICAgIHRoaXMub25zdGF0ZWNoYW5nZShldnQpO1xuICAgICAgICB9XG4gICAgfVxufVxuIiwiZXhwb3J0IGRlZmF1bHQgY2xhc3MgTUlESUNvbm5lY3Rpb25FdmVudCB7XG4gICAgY29uc3RydWN0b3IobWlkaUFjY2VzcywgcG9ydCkge1xuICAgICAgICB0aGlzLmJ1YmJsZXMgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5jYW5jZWxCdWJibGUgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5jYW5jZWxhYmxlID0gZmFsc2U7XG4gICAgICAgIHRoaXMuY3VycmVudFRhcmdldCA9IG1pZGlBY2Nlc3M7XG4gICAgICAgIHRoaXMuZGVmYXVsdFByZXZlbnRlZCA9IGZhbHNlO1xuICAgICAgICB0aGlzLmV2ZW50UGhhc2UgPSAwO1xuICAgICAgICB0aGlzLnBhdGggPSBbXTtcbiAgICAgICAgdGhpcy5wb3J0ID0gcG9ydDtcbiAgICAgICAgdGhpcy5yZXR1cm5WYWx1ZSA9IHRydWU7XG4gICAgICAgIHRoaXMuc3JjRWxlbWVudCA9IG1pZGlBY2Nlc3M7XG4gICAgICAgIHRoaXMudGFyZ2V0ID0gbWlkaUFjY2VzcztcbiAgICAgICAgdGhpcy50aW1lU3RhbXAgPSBEYXRlLm5vdygpO1xuICAgICAgICB0aGlzLnR5cGUgPSAnc3RhdGVjaGFuZ2UnO1xuICAgIH1cbn1cbiIsImV4cG9ydCBkZWZhdWx0IGNsYXNzIE1JRElNZXNzYWdlRXZlbnQge1xuICAgIGNvbnN0cnVjdG9yKHBvcnQsIGRhdGEsIHJlY2VpdmVkVGltZSkge1xuICAgICAgICB0aGlzLmJ1YmJsZXMgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5jYW5jZWxCdWJibGUgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5jYW5jZWxhYmxlID0gZmFsc2U7XG4gICAgICAgIHRoaXMuY3VycmVudFRhcmdldCA9IHBvcnQ7XG4gICAgICAgIHRoaXMuZGF0YSA9IGRhdGE7XG4gICAgICAgIHRoaXMuZGVmYXVsdFByZXZlbnRlZCA9IGZhbHNlO1xuICAgICAgICB0aGlzLmV2ZW50UGhhc2UgPSAwO1xuICAgICAgICB0aGlzLnBhdGggPSBbXTtcbiAgICAgICAgdGhpcy5yZWNlaXZlZFRpbWUgPSByZWNlaXZlZFRpbWU7XG4gICAgICAgIHRoaXMucmV0dXJuVmFsdWUgPSB0cnVlO1xuICAgICAgICB0aGlzLnNyY0VsZW1lbnQgPSBwb3J0O1xuICAgICAgICB0aGlzLnRhcmdldCA9IHBvcnQ7XG4gICAgICAgIHRoaXMudGltZVN0YW1wID0gRGF0ZS5ub3coKTtcbiAgICAgICAgdGhpcy50eXBlID0gJ21pZGltZXNzYWdlJztcbiAgICB9XG59XG4iLCIvLyBlczUgaW1wbGVtZW50YXRpb24gb2YgYm90aCBNYXAgYW5kIFNldFxuXG5sZXQgaWRJbmRleCA9IDA7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFN0b3JlIHtcbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgdGhpcy5zdG9yZSA9IHt9O1xuICAgICAgICB0aGlzLmtleXMgPSBbXTtcbiAgICB9XG4gICAgYWRkKG9iaikge1xuICAgICAgICBjb25zdCBpZCA9IGAke25ldyBEYXRlKCkuZ2V0VGltZSgpfSR7aWRJbmRleH1gO1xuICAgICAgICBpZEluZGV4ICs9IDE7XG4gICAgICAgIHRoaXMua2V5cy5wdXNoKGlkKTtcbiAgICAgICAgdGhpcy5zdG9yZVtpZF0gPSBvYmo7XG4gICAgfVxuICAgIHNldChpZCwgb2JqKSB7XG4gICAgICAgIHRoaXMua2V5cy5wdXNoKGlkKTtcbiAgICAgICAgdGhpcy5zdG9yZVtpZF0gPSBvYmo7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cbiAgICBnZXQoaWQpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuc3RvcmVbaWRdO1xuICAgIH1cbiAgICBoYXMoaWQpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMua2V5cy5pbmRleE9mKGlkKSAhPT0gLTE7XG4gICAgfVxuICAgIGRlbGV0ZShpZCkge1xuICAgICAgICBkZWxldGUgdGhpcy5zdG9yZVtpZF07XG4gICAgICAgIGNvbnN0IGluZGV4ID0gdGhpcy5rZXlzLmluZGV4T2YoaWQpO1xuICAgICAgICBpZiAoaW5kZXggPiAtMSkge1xuICAgICAgICAgICAgdGhpcy5rZXlzLnNwbGljZShpbmRleCwgMSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuICAgIHZhbHVlcygpIHtcbiAgICAgICAgY29uc3QgZWxlbWVudHMgPSBbXTtcbiAgICAgICAgY29uc3QgbCA9IHRoaXMua2V5cy5sZW5ndGg7XG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbDsgaSArPSAxKSB7XG4gICAgICAgICAgICBjb25zdCBlbGVtZW50ID0gdGhpcy5zdG9yZVt0aGlzLmtleXNbaV1dO1xuICAgICAgICAgICAgZWxlbWVudHMucHVzaChlbGVtZW50KTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZWxlbWVudHM7XG4gICAgfVxuICAgIGZvckVhY2goY2IpIHtcbiAgICAgICAgY29uc3QgbCA9IHRoaXMua2V5cy5sZW5ndGg7XG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbDsgaSArPSAxKSB7XG4gICAgICAgICAgICBjb25zdCBlbGVtZW50ID0gdGhpcy5zdG9yZVt0aGlzLmtleXNbaV1dO1xuICAgICAgICAgICAgY2IoZWxlbWVudCk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgY2xlYXIoKSB7XG4gICAgICAgIHRoaXMua2V5cyA9IFtdO1xuICAgICAgICB0aGlzLnN0b3JlID0ge307XG4gICAgfVxufVxuIiwibGV0IFNjb3BlO1xubGV0IGRldmljZSA9IG51bGw7XG5cbi8vIGNoZWNrIGlmIHdlIGFyZSBpbiBhIGJyb3dzZXIgb3IgaW4gTm9kZWpzXG5leHBvcnQgZnVuY3Rpb24gZ2V0U2NvcGUoKSB7XG4gICAgaWYgKHR5cGVvZiBTY29wZSAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgcmV0dXJuIFNjb3BlO1xuICAgIH1cbiAgICBTY29wZSA9IG51bGw7XG4gICAgaWYgKHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgIFNjb3BlID0gd2luZG93O1xuICAgIH0gZWxzZSBpZiAodHlwZW9mIGdsb2JhbCAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgU2NvcGUgPSBnbG9iYWw7XG4gICAgfVxuICAgIC8vIGNvbnNvbGUubG9nKCdzY29wZScsIHNjb3BlKTtcbiAgICByZXR1cm4gU2NvcGU7XG59XG5cblxuLy8gY2hlY2sgb24gd2hhdCB0eXBlIG9mIGRldmljZSB3ZSBhcmUgcnVubmluZywgbm90ZSB0aGF0IGluIHRoaXMgY29udGV4dFxuLy8gYSBkZXZpY2UgaXMgYSBjb21wdXRlciBub3QgYSBNSURJIGRldmljZVxuZXhwb3J0IGZ1bmN0aW9uIGdldERldmljZSgpIHtcbiAgICBjb25zdCBzY29wZSA9IGdldFNjb3BlKCk7XG4gICAgaWYgKGRldmljZSAhPT0gbnVsbCkge1xuICAgICAgICByZXR1cm4gZGV2aWNlO1xuICAgIH1cblxuICAgIGxldCBwbGF0Zm9ybSA9ICd1bmRldGVjdGVkJztcbiAgICBsZXQgYnJvd3NlciA9ICd1bmRldGVjdGVkJztcblxuICAgIGlmIChzY29wZS5uYXZpZ2F0b3Iubm9kZSA9PT0gdHJ1ZSkge1xuICAgICAgICBkZXZpY2UgPSB7XG4gICAgICAgICAgICBwbGF0Zm9ybTogcHJvY2Vzcy5wbGF0Zm9ybSxcbiAgICAgICAgICAgIG5vZGVqczogdHJ1ZSxcbiAgICAgICAgICAgIG1vYmlsZTogcGxhdGZvcm0gPT09ICdpb3MnIHx8IHBsYXRmb3JtID09PSAnYW5kcm9pZCcsXG4gICAgICAgIH07XG4gICAgICAgIHJldHVybiBkZXZpY2U7XG4gICAgfVxuXG4gICAgY29uc3QgdWEgPSBzY29wZS5uYXZpZ2F0b3IudXNlckFnZW50O1xuXG4gICAgaWYgKHVhLm1hdGNoKC8oaVBhZHxpUGhvbmV8aVBvZCkvZykpIHtcbiAgICAgICAgcGxhdGZvcm0gPSAnaW9zJztcbiAgICB9IGVsc2UgaWYgKHVhLmluZGV4T2YoJ0FuZHJvaWQnKSAhPT0gLTEpIHtcbiAgICAgICAgcGxhdGZvcm0gPSAnYW5kcm9pZCc7XG4gICAgfSBlbHNlIGlmICh1YS5pbmRleE9mKCdMaW51eCcpICE9PSAtMSkge1xuICAgICAgICBwbGF0Zm9ybSA9ICdsaW51eCc7XG4gICAgfSBlbHNlIGlmICh1YS5pbmRleE9mKCdNYWNpbnRvc2gnKSAhPT0gLTEpIHtcbiAgICAgICAgcGxhdGZvcm0gPSAnb3N4JztcbiAgICB9IGVsc2UgaWYgKHVhLmluZGV4T2YoJ1dpbmRvd3MnKSAhPT0gLTEpIHtcbiAgICAgICAgcGxhdGZvcm0gPSAnd2luZG93cyc7XG4gICAgfVxuXG4gICAgaWYgKHVhLmluZGV4T2YoJ0Nocm9tZScpICE9PSAtMSkge1xuICAgICAgICAvLyBjaHJvbWUsIGNocm9taXVtIGFuZCBjYW5hcnlcbiAgICAgICAgYnJvd3NlciA9ICdjaHJvbWUnO1xuXG4gICAgICAgIGlmICh1YS5pbmRleE9mKCdPUFInKSAhPT0gLTEpIHtcbiAgICAgICAgICAgIGJyb3dzZXIgPSAnb3BlcmEnO1xuICAgICAgICB9IGVsc2UgaWYgKHVhLmluZGV4T2YoJ0Nocm9taXVtJykgIT09IC0xKSB7XG4gICAgICAgICAgICBicm93c2VyID0gJ2Nocm9taXVtJztcbiAgICAgICAgfVxuICAgIH0gZWxzZSBpZiAodWEuaW5kZXhPZignU2FmYXJpJykgIT09IC0xKSB7XG4gICAgICAgIGJyb3dzZXIgPSAnc2FmYXJpJztcbiAgICB9IGVsc2UgaWYgKHVhLmluZGV4T2YoJ0ZpcmVmb3gnKSAhPT0gLTEpIHtcbiAgICAgICAgYnJvd3NlciA9ICdmaXJlZm94JztcbiAgICB9IGVsc2UgaWYgKHVhLmluZGV4T2YoJ1RyaWRlbnQnKSAhPT0gLTEpIHtcbiAgICAgICAgYnJvd3NlciA9ICdpZSc7XG4gICAgICAgIGlmICh1YS5pbmRleE9mKCdNU0lFIDknKSAhPT0gLTEpIHtcbiAgICAgICAgICAgIGJyb3dzZXIgPSAnaWU5JztcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGlmIChwbGF0Zm9ybSA9PT0gJ2lvcycpIHtcbiAgICAgICAgaWYgKHVhLmluZGV4T2YoJ0NyaU9TJykgIT09IC0xKSB7XG4gICAgICAgICAgICBicm93c2VyID0gJ2Nocm9tZSc7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBkZXZpY2UgPSB7XG4gICAgICAgIHBsYXRmb3JtLFxuICAgICAgICBicm93c2VyLFxuICAgICAgICBtb2JpbGU6IHBsYXRmb3JtID09PSAnaW9zJyB8fCBwbGF0Zm9ybSA9PT0gJ2FuZHJvaWQnLFxuICAgICAgICBub2RlanM6IGZhbHNlLFxuICAgIH07XG4gICAgcmV0dXJuIGRldmljZTtcbn1cblxuXG4vLyBwb2x5ZmlsbCBmb3Igd2luZG93LnBlcmZvcm1hbmNlLm5vdygpXG5jb25zdCBwb2x5ZmlsbFBlcmZvcm1hbmNlID0gKCkgPT4ge1xuICAgIGNvbnN0IHNjb3BlID0gZ2V0U2NvcGUoKTtcbiAgICBpZiAodHlwZW9mIHNjb3BlLnBlcmZvcm1hbmNlID09PSAndW5kZWZpbmVkJykge1xuICAgICAgICBzY29wZS5wZXJmb3JtYW5jZSA9IHt9O1xuICAgIH1cbiAgICBEYXRlLm5vdyA9IERhdGUubm93IHx8ICgoKSA9PiBuZXcgRGF0ZSgpLmdldFRpbWUoKSk7XG5cbiAgICBpZiAodHlwZW9mIHNjb3BlLnBlcmZvcm1hbmNlLm5vdyA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgbGV0IG5vd09mZnNldCA9IERhdGUubm93KCk7XG4gICAgICAgIGlmIChcbiAgICAgICAgICAgIHR5cGVvZiBzY29wZS5wZXJmb3JtYW5jZS50aW1pbmcgIT09ICd1bmRlZmluZWQnICYmXG4gICAgICAgICAgICB0eXBlb2Ygc2NvcGUucGVyZm9ybWFuY2UudGltaW5nLm5hdmlnYXRpb25TdGFydCAhPT0gJ3VuZGVmaW5lZCdcbiAgICAgICAgKSB7XG4gICAgICAgICAgICBub3dPZmZzZXQgPSBzY29wZS5wZXJmb3JtYW5jZS50aW1pbmcubmF2aWdhdGlvblN0YXJ0O1xuICAgICAgICB9XG4gICAgICAgIHNjb3BlLnBlcmZvcm1hbmNlLm5vdyA9IGZ1bmN0aW9uIG5vdygpIHtcbiAgICAgICAgICAgIHJldHVybiBEYXRlLm5vdygpIC0gbm93T2Zmc2V0O1xuICAgICAgICB9O1xuICAgIH1cbn1cblxuLy8gZ2VuZXJhdGVzIFVVSUQgZm9yIE1JREkgZGV2aWNlc1xuZXhwb3J0IGZ1bmN0aW9uIGdlbmVyYXRlVVVJRCgpIHtcbiAgICBsZXQgZCA9IG5ldyBEYXRlKCkuZ2V0VGltZSgpO1xuICAgIGxldCB1dWlkID0gbmV3IEFycmF5KDY0KS5qb2luKCd4Jyk7Ly8gJ3h4eHh4eHh4LXh4eHgtNHh4eC15eHh4LXh4eHh4eHh4eHh4eCc7XG4gICAgdXVpZCA9IHV1aWQucmVwbGFjZSgvW3h5XS9nLCAoYykgPT4ge1xuICAgICAgICBjb25zdCByID0gKGQgKyBNYXRoLnJhbmRvbSgpICogMTYpICUgMTYgfCAwO1xuICAgICAgICBkID0gTWF0aC5mbG9vcihkIC8gMTYpO1xuICAgICAgICByZXR1cm4gKGMgPT09ICd4JyA/IHIgOiAociAmIDB4MyB8IDB4OCkpLnRvU3RyaW5nKDE2KS50b1VwcGVyQ2FzZSgpO1xuICAgIH0pO1xuICAgIHJldHVybiB1dWlkO1xufVxuXG5cbi8vIGEgdmVyeSBzaW1wbGUgaW1wbGVtZW50YXRpb24gb2YgYSBQcm9taXNlIGZvciBJbnRlcm5ldCBFeHBsb3JlciBhbmQgTm9kZWpzXG5jb25zdCBwb2x5ZmlsbFByb21pc2UgPSAoKSA9PiB7XG4gICAgY29uc3Qgc2NvcGUgPSBnZXRTY29wZSgpO1xuICAgIGlmICh0eXBlb2Ygc2NvcGUuUHJvbWlzZSAhPT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICBzY29wZS5Qcm9taXNlID0gZnVuY3Rpb24gcHJvbWlzZShleGVjdXRvcikge1xuICAgICAgICAgICAgdGhpcy5leGVjdXRvciA9IGV4ZWN1dG9yO1xuICAgICAgICB9O1xuXG4gICAgICAgIHNjb3BlLlByb21pc2UucHJvdG90eXBlLnRoZW4gPSBmdW5jdGlvbiB0aGVuKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgICAgICAgaWYgKHR5cGVvZiByZXNvbHZlICE9PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICAgICAgcmVzb2x2ZSA9ICgpID0+IHsgfTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICh0eXBlb2YgcmVqZWN0ICE9PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICAgICAgcmVqZWN0ID0gKCkgPT4geyB9O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5leGVjdXRvcihyZXNvbHZlLCByZWplY3QpO1xuICAgICAgICB9O1xuICAgIH1cbn1cblxuXG5leHBvcnQgZnVuY3Rpb24gcG9seWZpbGwoKSB7XG4gICAgY29uc3QgZCA9IGdldERldmljZSgpO1xuICAgIC8vIGNvbnNvbGUubG9nKGRldmljZSk7XG4gICAgaWYgKGQuYnJvd3NlciA9PT0gJ2llJyB8fCBkLm5vZGVqcyA9PT0gdHJ1ZSkge1xuICAgICAgICBwb2x5ZmlsbFByb21pc2UoKTtcbiAgICB9XG4gICAgcG9seWZpbGxQZXJmb3JtYW5jZSgpO1xufVxuXG4iXX0=
