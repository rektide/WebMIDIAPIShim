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

        (0, _jzz2.default)().or(function () {
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJub2RlX21vZHVsZXMvamF6ei1taWRpL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL2p6ei9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9qenovamF2YXNjcmlwdC9KWlouanMiLCJub2RlX21vZHVsZXMvcHJvY2Vzcy9icm93c2VyLmpzIiwic3JjL2luZGV4LmpzIiwic3JjL21pZGkvbWlkaV9hY2Nlc3MuanMiLCJzcmMvbWlkaS9taWRpX2lucHV0LmpzIiwic3JjL21pZGkvbWlkaV9vdXRwdXQuanMiLCJzcmMvbWlkaS9taWRpY29ubmVjdGlvbl9ldmVudC5qcyIsInNyYy9taWRpL21pZGltZXNzYWdlX2V2ZW50LmpzIiwic3JjL3V0aWwvc3RvcmUuanMiLCJzcmMvdXRpbC91dGlsLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOztBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O0FDbEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4NkNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7QUN4TEE7O0FBQ0E7O0FBR0E7O0lBQVksSzs7QUFDWjs7SUFBWSxNOztBQUNaOzs7O0FBQ0E7Ozs7Ozs7O0FBTEE7QUFDQTtBQU1BLElBQUksbUJBQUo7O0FBRUEsSUFBTSxPQUFPLFNBQVAsSUFBTyxHQUFNO0FBQ2YsUUFBSSxDQUFDLFVBQVUsaUJBQWYsRUFBa0M7QUFDOUI7QUFDQTs7QUFFQSxrQkFBVSxpQkFBVixHQUE4QixZQUFNO0FBQ2hDO0FBQ0EsZ0JBQUksZUFBZSxTQUFuQixFQUE4QjtBQUMxQiw2QkFBYSxvQ0FBYjtBQUNBO0FBQ0Esb0JBQU0sUUFBUSxxQkFBZDtBQUNBLHNCQUFNLFNBQU4sR0FBa0IsS0FBbEI7QUFDQSxzQkFBTSxVQUFOLEdBQW1CLE1BQW5CO0FBQ0Esc0JBQU0sZ0JBQU47QUFDQSxzQkFBTSxtQkFBTjtBQUNIO0FBQ0QsbUJBQU8sVUFBUDtBQUNILFNBWkQ7QUFhQSxZQUFJLHVCQUFZLE1BQVosS0FBdUIsSUFBM0IsRUFBaUM7QUFDN0Isc0JBQVUsS0FBVixHQUFrQixZQUFNO0FBQ3BCO0FBQ0E7QUFDQTtBQUNILGFBSkQ7QUFLSDtBQUNKO0FBQ0osQ0ExQkQ7O0FBNEJBOzs7Ozs7Ozs7cWpCQ3ZDQTs7Ozs7Ozs7Ozs7O1FBaURnQixZLEdBQUEsWTtRQWdCQSxnQixHQUFBLGdCO1FBOEJBLGEsR0FBQSxhO1FBWUEsa0IsR0FBQSxrQjs7QUFqR2hCOzs7O0FBQ0E7Ozs7QUFDQTs7OztBQUNBOzs7O0FBQ0E7O0FBQ0E7Ozs7Ozs7O0FBRUEsSUFBSSxtQkFBSjtBQUNBLElBQU0sWUFBWSxxQkFBbEI7QUFDQSxJQUFNLGFBQWEscUJBQW5CO0FBQ0EsSUFBTSxjQUFjLHFCQUFwQjs7SUFFTSxVO0FBQ0Ysd0JBQVksTUFBWixFQUFvQixPQUFwQixFQUE2QjtBQUFBOztBQUN6QixhQUFLLFlBQUwsR0FBb0IsSUFBcEI7QUFDQSxhQUFLLE1BQUwsR0FBYyxNQUFkO0FBQ0EsYUFBSyxPQUFMLEdBQWUsT0FBZjtBQUNIOzs7O3lDQUVnQixJLEVBQU0sUSxFQUFVO0FBQzdCLGdCQUFJLFNBQVMsYUFBYixFQUE0QjtBQUN4QjtBQUNIO0FBQ0QsZ0JBQUksVUFBVSxHQUFWLENBQWMsUUFBZCxNQUE0QixLQUFoQyxFQUF1QztBQUNuQywwQkFBVSxHQUFWLENBQWMsUUFBZDtBQUNIO0FBQ0o7Ozs0Q0FFbUIsSSxFQUFNLFEsRUFBVTtBQUNoQyxnQkFBSSxTQUFTLGFBQWIsRUFBNEI7QUFDeEI7QUFDSDtBQUNELGdCQUFJLFVBQVUsR0FBVixDQUFjLFFBQWQsTUFBNEIsSUFBaEMsRUFBc0M7QUFDbEMsMEJBQVUsTUFBVixDQUFpQixRQUFqQjtBQUNIO0FBQ0o7Ozs7OztBQUlFLFNBQVMsWUFBVCxHQUF3QjtBQUMzQixlQUFXLEtBQVg7QUFDQSxnQkFBWSxLQUFaO0FBQ0EseUJBQU0sSUFBTixHQUFhLE1BQWIsQ0FBb0IsT0FBcEIsQ0FBNEIsZ0JBQVE7QUFDaEMsWUFBSSxPQUFPLHlCQUFjLElBQWQsQ0FBWDtBQUNBLG1CQUFXLEdBQVgsQ0FBZSxLQUFLLEVBQXBCLEVBQXdCLElBQXhCO0FBQ0E7QUFDSCxLQUpEO0FBS0EseUJBQU0sSUFBTixHQUFhLE9BQWIsQ0FBcUIsT0FBckIsQ0FBNkIsZ0JBQVE7QUFDakMsWUFBSSxPQUFPLDBCQUFlLElBQWYsQ0FBWDtBQUNBLG9CQUFZLEdBQVosQ0FBZ0IsS0FBSyxFQUFyQixFQUF5QixJQUF6QjtBQUNBO0FBQ0gsS0FKRDtBQUtIOztBQUdNLFNBQVMsZ0JBQVQsR0FBNEI7QUFDL0IsV0FBTyxJQUFJLE9BQUosQ0FBYSxVQUFDLE9BQUQsRUFBVSxNQUFWLEVBQXFCO0FBQ3JDLFlBQUksT0FBTyxVQUFQLEtBQXNCLFdBQTFCLEVBQXVDO0FBQ25DLG9CQUFRLFVBQVI7QUFDQTtBQUNIOztBQUVELFlBQUksdUJBQVksT0FBWixLQUF3QixLQUE1QixFQUFtQztBQUMvQixtQkFBTyxFQUFFLFNBQVMseURBQVgsRUFBUDtBQUNBO0FBQ0g7O0FBRUQsNkJBQ0ssRUFETCxDQUNRLFlBQU07QUFDTixtQkFBTyxFQUFFLFNBQVMsb0lBQVgsRUFBUDtBQUNILFNBSEwsRUFJSyxHQUpMLENBSVMsWUFBTTtBQUNQO0FBQ0EseUJBQWEsSUFBSSxVQUFKLENBQWUsVUFBZixFQUEyQixXQUEzQixDQUFiO0FBQ0Esb0JBQVEsVUFBUjtBQUNILFNBUkwsRUFTSyxHQVRMLENBU1MsVUFBQyxHQUFELEVBQVM7QUFDVixtQkFBTyxHQUFQO0FBQ0gsU0FYTDtBQVlILEtBdkJNLENBQVA7QUF3Qkg7O0FBR0Q7QUFDQTtBQUNPLFNBQVMsYUFBVCxDQUF1QixJQUF2QixFQUE2QjtBQUNoQyxTQUFLLGFBQUwsQ0FBbUIsbUNBQXdCLElBQXhCLEVBQThCLElBQTlCLENBQW5COztBQUVBLFFBQU0sTUFBTSxtQ0FBd0IsVUFBeEIsRUFBb0MsSUFBcEMsQ0FBWjs7QUFFQSxRQUFJLE9BQU8sV0FBVyxhQUFsQixLQUFvQyxVQUF4QyxFQUFvRDtBQUNoRCxtQkFBVyxhQUFYLENBQXlCLEdBQXpCO0FBQ0g7QUFDRCxjQUFVLE9BQVYsQ0FBa0I7QUFBQSxlQUFZLFNBQVMsR0FBVCxDQUFaO0FBQUEsS0FBbEI7QUFDSDs7QUFHTSxTQUFTLGtCQUFULEdBQThCO0FBQ2pDLGVBQVcsT0FBWCxDQUFtQixVQUFDLEtBQUQsRUFBVztBQUMxQjtBQUNBLGNBQU0sYUFBTixDQUFvQixXQUFwQjtBQUNILEtBSEQ7QUFJSDs7Ozs7Ozs7O3FqQkNoSEQ7Ozs7O0FBR0E7Ozs7QUFDQTs7OztBQUNBOzs7O0FBQ0E7O0FBQ0E7O0FBQ0E7Ozs7Ozs7O0lBRXFCLFM7QUFDakIsdUJBQVksSUFBWixFQUFrQjtBQUFBOztBQUNkLGFBQUssRUFBTCxHQUFVLEtBQUssRUFBTCxJQUFXLHlCQUFyQjtBQUNBLGFBQUssSUFBTCxHQUFZLEtBQUssSUFBakI7QUFDQSxhQUFLLFlBQUwsR0FBb0IsS0FBSyxZQUF6QjtBQUNBLGFBQUssT0FBTCxHQUFlLEtBQUssT0FBcEI7QUFDQSxhQUFLLElBQUwsR0FBWSxPQUFaO0FBQ0EsYUFBSyxLQUFMLEdBQWEsV0FBYjtBQUNBLGFBQUssVUFBTCxHQUFrQixTQUFsQjtBQUNBLGFBQUssSUFBTCxHQUFZLElBQVo7O0FBRUEsYUFBSyxhQUFMLEdBQXFCLElBQXJCO0FBQ0EsYUFBSyxjQUFMLEdBQXNCLElBQXRCOztBQUVBO0FBQ0E7QUFDQSxlQUFPLGNBQVAsQ0FBc0IsSUFBdEIsRUFBNEIsZUFBNUIsRUFBNkM7QUFDekMsZUFEeUMsZUFDckMsS0FEcUMsRUFDOUI7QUFBQTs7QUFDUCxxQkFBSyxjQUFMLEdBQXNCLEtBQXRCO0FBQ0Esb0JBQUksT0FBTyxLQUFQLEtBQWlCLFVBQXJCLEVBQWlDO0FBQzdCLHdCQUFJLEtBQUssSUFBTCxLQUFjLElBQWxCLEVBQXdCO0FBQ3BCLDZCQUFLLElBQUw7QUFDSDtBQUNELHlCQUFLLElBQUwsQ0FBVSxPQUFWLENBQWtCLFVBQUMsR0FBRCxFQUFTO0FBQ3ZCLDRCQUFNLElBQUksdUNBQTJCLEdBQTNCLENBQVY7QUFDQSw4QkFBTSxDQUFOO0FBQ0gscUJBSEQ7QUFJSDtBQUNKO0FBWndDLFNBQTdDOztBQWVBLGFBQUssVUFBTCxHQUFrQixzQkFDYixHQURhLENBQ1QsYUFEUyxFQUNNLHFCQUROLEVBRWIsR0FGYSxDQUVULGFBRlMsRUFFTSxxQkFGTixDQUFsQjtBQUdIOzs7O3lDQUVnQixJLEVBQU0sUSxFQUFVO0FBQzdCLGdCQUFNLFlBQVksS0FBSyxVQUFMLENBQWdCLEdBQWhCLENBQW9CLElBQXBCLENBQWxCO0FBQ0EsZ0JBQUksT0FBTyxTQUFQLEtBQXFCLFdBQXpCLEVBQXNDO0FBQ2xDO0FBQ0g7O0FBRUQsZ0JBQUksVUFBVSxHQUFWLENBQWMsUUFBZCxNQUE0QixLQUFoQyxFQUF1QztBQUNuQywwQkFBVSxHQUFWLENBQWMsUUFBZDtBQUNIO0FBQ0o7Ozs0Q0FFbUIsSSxFQUFNLFEsRUFBVTtBQUNoQyxnQkFBTSxZQUFZLEtBQUssVUFBTCxDQUFnQixHQUFoQixDQUFvQixJQUFwQixDQUFsQjtBQUNBLGdCQUFJLE9BQU8sU0FBUCxLQUFxQixXQUF6QixFQUFzQztBQUNsQztBQUNIOztBQUVELGdCQUFJLFVBQVUsR0FBVixDQUFjLFFBQWQsTUFBNEIsSUFBaEMsRUFBc0M7QUFDbEMsMEJBQVUsTUFBVixDQUFpQixRQUFqQjtBQUNIO0FBQ0o7OztzQ0FFYSxHLEVBQUs7QUFDZixnQkFBTSxZQUFZLEtBQUssVUFBTCxDQUFnQixHQUFoQixDQUFvQixJQUFJLElBQXhCLENBQWxCO0FBQ0Esc0JBQVUsT0FBVixDQUFrQixVQUFDLFFBQUQsRUFBYztBQUM1Qix5QkFBUyxHQUFUO0FBQ0gsYUFGRDs7QUFJQSxnQkFBSSxJQUFJLElBQUosS0FBYSxhQUFqQixFQUFnQztBQUM1QixvQkFBSSxLQUFLLGNBQUwsS0FBd0IsSUFBNUIsRUFBa0M7QUFDOUIseUJBQUssY0FBTCxDQUFvQixHQUFwQjtBQUNIO0FBQ0osYUFKRCxNQUlPLElBQUksSUFBSSxJQUFKLEtBQWEsYUFBakIsRUFBZ0M7QUFDbkMsb0JBQUksS0FBSyxhQUFMLEtBQXVCLElBQTNCLEVBQWlDO0FBQzdCLHlCQUFLLGFBQUwsQ0FBbUIsR0FBbkI7QUFDSDtBQUNKO0FBQ0o7OzsrQkFFTTtBQUFBOztBQUNILGdCQUFJLEtBQUssVUFBTCxLQUFvQixNQUF4QixFQUFnQztBQUM1QjtBQUNIO0FBQ0QsaUJBQUssSUFBTCxHQUFZLHFCQUFNLFVBQU4sQ0FBaUIsS0FBSyxJQUF0QixFQUNQLEVBRE8sMkJBQ29CLEtBQUssSUFEekIsRUFFUCxHQUZPLENBRUgsWUFBTTtBQUNQLHVCQUFLLFVBQUwsR0FBa0IsTUFBbEI7QUFDQSx3REFGTyxDQUVjO0FBQ3hCLGFBTE8sQ0FBWjtBQU1IOzs7Z0NBRU87QUFBQTs7QUFDSixnQkFBSSxLQUFLLFVBQUwsS0FBb0IsUUFBeEIsRUFBa0M7QUFDOUI7QUFDSDtBQUNELGlCQUFLLElBQUwsQ0FBVSxLQUFWLEdBQ0ssRUFETCw0QkFDaUMsS0FBSyxJQUR0QyxFQUVLLEdBRkwsQ0FFUyxZQUFNO0FBQ1AsdUJBQUssVUFBTCxHQUFrQixRQUFsQjtBQUNBLHVCQUFLLElBQUwsR0FBWSxJQUFaO0FBQ0EsdUJBQUssY0FBTCxHQUFzQixJQUF0QjtBQUNBLHVCQUFLLGFBQUwsR0FBcUIsSUFBckI7QUFDQSx1QkFBSyxVQUFMLENBQWdCLEdBQWhCLENBQW9CLGFBQXBCLEVBQW1DLEtBQW5DO0FBQ0EsdUJBQUssVUFBTCxDQUFnQixHQUFoQixDQUFvQixhQUFwQixFQUFtQyxLQUFuQztBQUNBLHdEQVBPLENBT2M7QUFDeEIsYUFWTDtBQVdIOzs7Ozs7a0JBdEdnQixTOzs7Ozs7Ozs7cWpCQ1ZyQjs7Ozs7QUFHQTs7OztBQUNBOztBQUNBOzs7O0FBQ0E7Ozs7OztJQUVxQixVO0FBQ2pCLHdCQUFZLElBQVosRUFBa0I7QUFBQTs7QUFDZCxhQUFLLEVBQUwsR0FBVSxLQUFLLEVBQUwsSUFBVyx5QkFBckI7QUFDQSxhQUFLLElBQUwsR0FBWSxLQUFLLElBQWpCO0FBQ0EsYUFBSyxZQUFMLEdBQW9CLEtBQUssWUFBekI7QUFDQSxhQUFLLE9BQUwsR0FBZSxLQUFLLE9BQXBCO0FBQ0EsYUFBSyxJQUFMLEdBQVksUUFBWjtBQUNBLGFBQUssS0FBTCxHQUFhLFdBQWI7QUFDQSxhQUFLLFVBQUwsR0FBa0IsU0FBbEI7QUFDQSxhQUFLLGFBQUwsR0FBcUIsSUFBckI7QUFDQSxhQUFLLGFBQUwsR0FBcUIsSUFBckI7QUFDQSxhQUFLLElBQUwsR0FBWSxJQUFaOztBQUVBLGFBQUssVUFBTCxHQUFrQixxQkFBbEI7QUFDSDs7OzsrQkFFTTtBQUFBOztBQUNILGdCQUFJLEtBQUssVUFBTCxLQUFvQixNQUF4QixFQUFnQztBQUM1QjtBQUNIO0FBQ0QsaUJBQUssSUFBTCxHQUFZLHFCQUFNLFdBQU4sQ0FBa0IsS0FBSyxJQUF2QixFQUNQLEVBRE8sMkJBQ29CLEtBQUssSUFEekIsRUFFUCxHQUZPLENBRUgsWUFBTTtBQUNQLHNCQUFLLFVBQUwsR0FBa0IsTUFBbEI7QUFDQSx1REFGTyxDQUVjO0FBQ3hCLGFBTE8sQ0FBWjtBQU1IOzs7Z0NBRU87QUFBQTs7QUFDSixnQkFBSSxLQUFLLFVBQUwsS0FBb0IsUUFBeEIsRUFBa0M7QUFDOUI7QUFDSDtBQUNELGlCQUFLLElBQUwsQ0FBVSxLQUFWLEdBQ0ssRUFETCw2QkFDa0MsS0FBSyxJQUR2QyxFQUVLLEdBRkwsQ0FFUyxZQUFNO0FBQ1Asd0RBRE8sQ0FDYztBQUNyQix1QkFBSyxVQUFMLEdBQWtCLFFBQWxCO0FBQ0EsdUJBQUssYUFBTCxHQUFxQixJQUFyQjtBQUNBLHVCQUFLLFVBQUwsQ0FBZ0IsS0FBaEI7QUFDSCxhQVBMO0FBUUg7Ozs2QkFFSSxJLEVBQXFCO0FBQUEsZ0JBQWYsU0FBZSx1RUFBSCxDQUFHOztBQUN0QixnQkFBSSxrQkFBa0IsQ0FBdEI7QUFDQSxnQkFBSSxjQUFjLENBQWxCLEVBQXFCO0FBQ2pCLGtDQUFrQixLQUFLLEtBQUwsQ0FBVyxZQUFZLFlBQVksR0FBWixFQUF2QixDQUFsQjtBQUNIOztBQUVELGlCQUFLLElBQUwsQ0FDSyxJQURMLENBQ1UsZUFEVixFQUVLLElBRkwsQ0FFVSxJQUZWOztBQUlBLG1CQUFPLElBQVA7QUFDSDs7O2dDQUVPO0FBQ0o7QUFDSDs7O3lDQUVnQixJLEVBQU0sUSxFQUFVO0FBQzdCLGdCQUFJLFNBQVMsYUFBYixFQUE0QjtBQUN4QjtBQUNIOztBQUVELGdCQUFJLEtBQUssVUFBTCxDQUFnQixHQUFoQixDQUFvQixRQUFwQixNQUFrQyxLQUF0QyxFQUE2QztBQUN6QyxxQkFBSyxVQUFMLENBQWdCLEdBQWhCLENBQW9CLFFBQXBCO0FBQ0g7QUFDSjs7OzRDQUVtQixJLEVBQU0sUSxFQUFVO0FBQ2hDLGdCQUFJLFNBQVMsYUFBYixFQUE0QjtBQUN4QjtBQUNIOztBQUVELGdCQUFJLEtBQUssVUFBTCxDQUFnQixHQUFoQixDQUFvQixRQUFwQixNQUFrQyxJQUF0QyxFQUE0QztBQUN4QyxxQkFBSyxVQUFMLENBQWdCLE1BQWhCLENBQXVCLFFBQXZCO0FBQ0g7QUFDSjs7O3NDQUVhLEcsRUFBSztBQUNmLGlCQUFLLFVBQUwsQ0FBZ0IsT0FBaEIsQ0FBd0IsVUFBQyxRQUFELEVBQWM7QUFDbEMseUJBQVMsR0FBVDtBQUNILGFBRkQ7O0FBSUEsZ0JBQUksS0FBSyxhQUFMLEtBQXVCLElBQTNCLEVBQWlDO0FBQzdCLHFCQUFLLGFBQUwsQ0FBbUIsR0FBbkI7QUFDSDtBQUNKOzs7Ozs7a0JBdkZnQixVOzs7Ozs7Ozs7OztJQ1JBLG1CLEdBQ2pCLDZCQUFZLFVBQVosRUFBd0IsSUFBeEIsRUFBOEI7QUFBQTs7QUFDMUIsU0FBSyxPQUFMLEdBQWUsS0FBZjtBQUNBLFNBQUssWUFBTCxHQUFvQixLQUFwQjtBQUNBLFNBQUssVUFBTCxHQUFrQixLQUFsQjtBQUNBLFNBQUssYUFBTCxHQUFxQixVQUFyQjtBQUNBLFNBQUssZ0JBQUwsR0FBd0IsS0FBeEI7QUFDQSxTQUFLLFVBQUwsR0FBa0IsQ0FBbEI7QUFDQSxTQUFLLElBQUwsR0FBWSxFQUFaO0FBQ0EsU0FBSyxJQUFMLEdBQVksSUFBWjtBQUNBLFNBQUssV0FBTCxHQUFtQixJQUFuQjtBQUNBLFNBQUssVUFBTCxHQUFrQixVQUFsQjtBQUNBLFNBQUssTUFBTCxHQUFjLFVBQWQ7QUFDQSxTQUFLLFNBQUwsR0FBaUIsS0FBSyxHQUFMLEVBQWpCO0FBQ0EsU0FBSyxJQUFMLEdBQVksYUFBWjtBQUNILEM7O2tCQWZnQixtQjs7Ozs7Ozs7Ozs7SUNBQSxnQixHQUNqQiwwQkFBWSxJQUFaLEVBQWtCLElBQWxCLEVBQXdCLFlBQXhCLEVBQXNDO0FBQUE7O0FBQ2xDLFNBQUssT0FBTCxHQUFlLEtBQWY7QUFDQSxTQUFLLFlBQUwsR0FBb0IsS0FBcEI7QUFDQSxTQUFLLFVBQUwsR0FBa0IsS0FBbEI7QUFDQSxTQUFLLGFBQUwsR0FBcUIsSUFBckI7QUFDQSxTQUFLLElBQUwsR0FBWSxJQUFaO0FBQ0EsU0FBSyxnQkFBTCxHQUF3QixLQUF4QjtBQUNBLFNBQUssVUFBTCxHQUFrQixDQUFsQjtBQUNBLFNBQUssSUFBTCxHQUFZLEVBQVo7QUFDQSxTQUFLLFlBQUwsR0FBb0IsWUFBcEI7QUFDQSxTQUFLLFdBQUwsR0FBbUIsSUFBbkI7QUFDQSxTQUFLLFVBQUwsR0FBa0IsSUFBbEI7QUFDQSxTQUFLLE1BQUwsR0FBYyxJQUFkO0FBQ0EsU0FBSyxTQUFMLEdBQWlCLEtBQUssR0FBTCxFQUFqQjtBQUNBLFNBQUssSUFBTCxHQUFZLGFBQVo7QUFDSCxDOztrQkFoQmdCLGdCOzs7Ozs7Ozs7Ozs7O0FDQXJCOztBQUVBLElBQUksVUFBVSxDQUFkOztJQUVxQixLO0FBQ2pCLHFCQUFjO0FBQUE7O0FBQ1YsYUFBSyxLQUFMLEdBQWEsRUFBYjtBQUNBLGFBQUssSUFBTCxHQUFZLEVBQVo7QUFDSDs7Ozs0QkFDRyxHLEVBQUs7QUFDTCxnQkFBTSxVQUFRLElBQUksSUFBSixHQUFXLE9BQVgsRUFBUixHQUErQixPQUFyQztBQUNBLHVCQUFXLENBQVg7QUFDQSxpQkFBSyxJQUFMLENBQVUsSUFBVixDQUFlLEVBQWY7QUFDQSxpQkFBSyxLQUFMLENBQVcsRUFBWCxJQUFpQixHQUFqQjtBQUNIOzs7NEJBQ0csRSxFQUFJLEcsRUFBSztBQUNULGlCQUFLLElBQUwsQ0FBVSxJQUFWLENBQWUsRUFBZjtBQUNBLGlCQUFLLEtBQUwsQ0FBVyxFQUFYLElBQWlCLEdBQWpCO0FBQ0EsbUJBQU8sSUFBUDtBQUNIOzs7NEJBQ0csRSxFQUFJO0FBQ0osbUJBQU8sS0FBSyxLQUFMLENBQVcsRUFBWCxDQUFQO0FBQ0g7Ozs0QkFDRyxFLEVBQUk7QUFDSixtQkFBTyxLQUFLLElBQUwsQ0FBVSxPQUFWLENBQWtCLEVBQWxCLE1BQTBCLENBQUMsQ0FBbEM7QUFDSDs7O2dDQUNNLEUsRUFBSTtBQUNQLG1CQUFPLEtBQUssS0FBTCxDQUFXLEVBQVgsQ0FBUDtBQUNBLGdCQUFNLFFBQVEsS0FBSyxJQUFMLENBQVUsT0FBVixDQUFrQixFQUFsQixDQUFkO0FBQ0EsZ0JBQUksUUFBUSxDQUFDLENBQWIsRUFBZ0I7QUFDWixxQkFBSyxJQUFMLENBQVUsTUFBVixDQUFpQixLQUFqQixFQUF3QixDQUF4QjtBQUNIO0FBQ0QsbUJBQU8sSUFBUDtBQUNIOzs7aUNBQ1E7QUFDTCxnQkFBTSxXQUFXLEVBQWpCO0FBQ0EsZ0JBQU0sSUFBSSxLQUFLLElBQUwsQ0FBVSxNQUFwQjtBQUNBLGlCQUFLLElBQUksSUFBSSxDQUFiLEVBQWdCLElBQUksQ0FBcEIsRUFBdUIsS0FBSyxDQUE1QixFQUErQjtBQUMzQixvQkFBTSxVQUFVLEtBQUssS0FBTCxDQUFXLEtBQUssSUFBTCxDQUFVLENBQVYsQ0FBWCxDQUFoQjtBQUNBLHlCQUFTLElBQVQsQ0FBYyxPQUFkO0FBQ0g7QUFDRCxtQkFBTyxRQUFQO0FBQ0g7OztnQ0FDTyxFLEVBQUk7QUFDUixnQkFBTSxJQUFJLEtBQUssSUFBTCxDQUFVLE1BQXBCO0FBQ0EsaUJBQUssSUFBSSxJQUFJLENBQWIsRUFBZ0IsSUFBSSxDQUFwQixFQUF1QixLQUFLLENBQTVCLEVBQStCO0FBQzNCLG9CQUFNLFVBQVUsS0FBSyxLQUFMLENBQVcsS0FBSyxJQUFMLENBQVUsQ0FBVixDQUFYLENBQWhCO0FBQ0EsbUJBQUcsT0FBSDtBQUNIO0FBQ0o7OztnQ0FDTztBQUNKLGlCQUFLLElBQUwsR0FBWSxFQUFaO0FBQ0EsaUJBQUssS0FBTCxHQUFhLEVBQWI7QUFDSDs7Ozs7O2tCQWpEZ0IsSzs7Ozs7Ozs7O1FDQUwsUSxHQUFBLFE7UUFpQkEsUyxHQUFBLFM7UUEyRkEsWSxHQUFBLFk7UUFpQ0EsUSxHQUFBLFE7QUFqSmhCLElBQUksY0FBSjtBQUNBLElBQUksU0FBUyxJQUFiOztBQUVBO0FBQ08sU0FBUyxRQUFULEdBQW9CO0FBQ3ZCLFFBQUksT0FBTyxLQUFQLEtBQWlCLFdBQXJCLEVBQWtDO0FBQzlCLGVBQU8sS0FBUDtBQUNIO0FBQ0QsWUFBUSxJQUFSO0FBQ0EsUUFBSSxPQUFPLE1BQVAsS0FBa0IsV0FBdEIsRUFBbUM7QUFDL0IsZ0JBQVEsTUFBUjtBQUNILEtBRkQsTUFFTyxJQUFJLE9BQU8sTUFBUCxLQUFrQixXQUF0QixFQUFtQztBQUN0QyxnQkFBUSxNQUFSO0FBQ0g7QUFDRDtBQUNBLFdBQU8sS0FBUDtBQUNIOztBQUdEO0FBQ0E7QUFDTyxTQUFTLFNBQVQsR0FBcUI7QUFDeEIsUUFBTSxRQUFRLFVBQWQ7QUFDQSxRQUFJLFdBQVcsSUFBZixFQUFxQjtBQUNqQixlQUFPLE1BQVA7QUFDSDs7QUFFRCxRQUFJLFdBQVcsWUFBZjtBQUNBLFFBQUksVUFBVSxZQUFkOztBQUVBLFFBQUksTUFBTSxTQUFOLENBQWdCLElBQWhCLEtBQXlCLElBQTdCLEVBQW1DO0FBQy9CLGlCQUFTO0FBQ0wsc0JBQVUsUUFBUSxRQURiO0FBRUwsb0JBQVEsSUFGSDtBQUdMLG9CQUFRLGFBQWEsS0FBYixJQUFzQixhQUFhO0FBSHRDLFNBQVQ7QUFLQSxlQUFPLE1BQVA7QUFDSDs7QUFFRCxRQUFNLEtBQUssTUFBTSxTQUFOLENBQWdCLFNBQTNCOztBQUVBLFFBQUksR0FBRyxLQUFILENBQVMscUJBQVQsQ0FBSixFQUFxQztBQUNqQyxtQkFBVyxLQUFYO0FBQ0gsS0FGRCxNQUVPLElBQUksR0FBRyxPQUFILENBQVcsU0FBWCxNQUEwQixDQUFDLENBQS9CLEVBQWtDO0FBQ3JDLG1CQUFXLFNBQVg7QUFDSCxLQUZNLE1BRUEsSUFBSSxHQUFHLE9BQUgsQ0FBVyxPQUFYLE1BQXdCLENBQUMsQ0FBN0IsRUFBZ0M7QUFDbkMsbUJBQVcsT0FBWDtBQUNILEtBRk0sTUFFQSxJQUFJLEdBQUcsT0FBSCxDQUFXLFdBQVgsTUFBNEIsQ0FBQyxDQUFqQyxFQUFvQztBQUN2QyxtQkFBVyxLQUFYO0FBQ0gsS0FGTSxNQUVBLElBQUksR0FBRyxPQUFILENBQVcsU0FBWCxNQUEwQixDQUFDLENBQS9CLEVBQWtDO0FBQ3JDLG1CQUFXLFNBQVg7QUFDSDs7QUFFRCxRQUFJLEdBQUcsT0FBSCxDQUFXLFFBQVgsTUFBeUIsQ0FBQyxDQUE5QixFQUFpQztBQUM3QjtBQUNBLGtCQUFVLFFBQVY7O0FBRUEsWUFBSSxHQUFHLE9BQUgsQ0FBVyxLQUFYLE1BQXNCLENBQUMsQ0FBM0IsRUFBOEI7QUFDMUIsc0JBQVUsT0FBVjtBQUNILFNBRkQsTUFFTyxJQUFJLEdBQUcsT0FBSCxDQUFXLFVBQVgsTUFBMkIsQ0FBQyxDQUFoQyxFQUFtQztBQUN0QyxzQkFBVSxVQUFWO0FBQ0g7QUFDSixLQVRELE1BU08sSUFBSSxHQUFHLE9BQUgsQ0FBVyxRQUFYLE1BQXlCLENBQUMsQ0FBOUIsRUFBaUM7QUFDcEMsa0JBQVUsUUFBVjtBQUNILEtBRk0sTUFFQSxJQUFJLEdBQUcsT0FBSCxDQUFXLFNBQVgsTUFBMEIsQ0FBQyxDQUEvQixFQUFrQztBQUNyQyxrQkFBVSxTQUFWO0FBQ0gsS0FGTSxNQUVBLElBQUksR0FBRyxPQUFILENBQVcsU0FBWCxNQUEwQixDQUFDLENBQS9CLEVBQWtDO0FBQ3JDLGtCQUFVLElBQVY7QUFDQSxZQUFJLEdBQUcsT0FBSCxDQUFXLFFBQVgsTUFBeUIsQ0FBQyxDQUE5QixFQUFpQztBQUM3QixzQkFBVSxLQUFWO0FBQ0g7QUFDSjs7QUFFRCxRQUFJLGFBQWEsS0FBakIsRUFBd0I7QUFDcEIsWUFBSSxHQUFHLE9BQUgsQ0FBVyxPQUFYLE1BQXdCLENBQUMsQ0FBN0IsRUFBZ0M7QUFDNUIsc0JBQVUsUUFBVjtBQUNIO0FBQ0o7O0FBRUQsYUFBUztBQUNMLDBCQURLO0FBRUwsd0JBRks7QUFHTCxnQkFBUSxhQUFhLEtBQWIsSUFBc0IsYUFBYSxTQUh0QztBQUlMLGdCQUFRO0FBSkgsS0FBVDtBQU1BLFdBQU8sTUFBUDtBQUNIOztBQUdEO0FBQ0EsSUFBTSxzQkFBc0IsU0FBdEIsbUJBQXNCLEdBQU07QUFDOUIsUUFBTSxRQUFRLFVBQWQ7QUFDQSxRQUFJLE9BQU8sTUFBTSxXQUFiLEtBQTZCLFdBQWpDLEVBQThDO0FBQzFDLGNBQU0sV0FBTixHQUFvQixFQUFwQjtBQUNIO0FBQ0QsU0FBSyxHQUFMLEdBQVcsS0FBSyxHQUFMLElBQWE7QUFBQSxlQUFNLElBQUksSUFBSixHQUFXLE9BQVgsRUFBTjtBQUFBLEtBQXhCOztBQUVBLFFBQUksT0FBTyxNQUFNLFdBQU4sQ0FBa0IsR0FBekIsS0FBaUMsV0FBckMsRUFBa0Q7QUFDOUMsWUFBSSxZQUFZLEtBQUssR0FBTCxFQUFoQjtBQUNBLFlBQ0ksT0FBTyxNQUFNLFdBQU4sQ0FBa0IsTUFBekIsS0FBb0MsV0FBcEMsSUFDQSxPQUFPLE1BQU0sV0FBTixDQUFrQixNQUFsQixDQUF5QixlQUFoQyxLQUFvRCxXQUZ4RCxFQUdFO0FBQ0Usd0JBQVksTUFBTSxXQUFOLENBQWtCLE1BQWxCLENBQXlCLGVBQXJDO0FBQ0g7QUFDRCxjQUFNLFdBQU4sQ0FBa0IsR0FBbEIsR0FBd0IsU0FBUyxHQUFULEdBQWU7QUFDbkMsbUJBQU8sS0FBSyxHQUFMLEtBQWEsU0FBcEI7QUFDSCxTQUZEO0FBR0g7QUFDSixDQW5CRDs7QUFxQkE7QUFDTyxTQUFTLFlBQVQsR0FBd0I7QUFDM0IsUUFBSSxJQUFJLElBQUksSUFBSixHQUFXLE9BQVgsRUFBUjtBQUNBLFFBQUksT0FBTyxJQUFJLEtBQUosQ0FBVSxFQUFWLEVBQWMsSUFBZCxDQUFtQixHQUFuQixDQUFYLENBRjJCLENBRVE7QUFDbkMsV0FBTyxLQUFLLE9BQUwsQ0FBYSxPQUFiLEVBQXNCLFVBQUMsQ0FBRCxFQUFPO0FBQ2hDLFlBQU0sSUFBSSxDQUFDLElBQUksS0FBSyxNQUFMLEtBQWdCLEVBQXJCLElBQTJCLEVBQTNCLEdBQWdDLENBQTFDO0FBQ0EsWUFBSSxLQUFLLEtBQUwsQ0FBVyxJQUFJLEVBQWYsQ0FBSjtBQUNBLGVBQU8sQ0FBQyxNQUFNLEdBQU4sR0FBWSxDQUFaLEdBQWlCLElBQUksR0FBSixHQUFVLEdBQTVCLEVBQWtDLFFBQWxDLENBQTJDLEVBQTNDLEVBQStDLFdBQS9DLEVBQVA7QUFDSCxLQUpNLENBQVA7QUFLQSxXQUFPLElBQVA7QUFDSDs7QUFHRDtBQUNBLElBQU0sa0JBQWtCLFNBQWxCLGVBQWtCLEdBQU07QUFDMUIsUUFBTSxRQUFRLFVBQWQ7QUFDQSxRQUFJLE9BQU8sTUFBTSxPQUFiLEtBQXlCLFVBQTdCLEVBQXlDO0FBQ3JDLGNBQU0sT0FBTixHQUFnQixTQUFTLE9BQVQsQ0FBaUIsUUFBakIsRUFBMkI7QUFDdkMsaUJBQUssUUFBTCxHQUFnQixRQUFoQjtBQUNILFNBRkQ7O0FBSUEsY0FBTSxPQUFOLENBQWMsU0FBZCxDQUF3QixJQUF4QixHQUErQixTQUFTLElBQVQsQ0FBYyxPQUFkLEVBQXVCLE1BQXZCLEVBQStCO0FBQzFELGdCQUFJLE9BQU8sT0FBUCxLQUFtQixVQUF2QixFQUFtQztBQUMvQiwwQkFBVSxtQkFBTSxDQUFHLENBQW5CO0FBQ0g7QUFDRCxnQkFBSSxPQUFPLE1BQVAsS0FBa0IsVUFBdEIsRUFBa0M7QUFDOUIseUJBQVMsa0JBQU0sQ0FBRyxDQUFsQjtBQUNIO0FBQ0QsaUJBQUssUUFBTCxDQUFjLE9BQWQsRUFBdUIsTUFBdkI7QUFDSCxTQVJEO0FBU0g7QUFDSixDQWpCRDs7QUFvQk8sU0FBUyxRQUFULEdBQW9CO0FBQ3ZCLFFBQU0sSUFBSSxXQUFWO0FBQ0E7QUFDQSxRQUFJLEVBQUUsT0FBRixLQUFjLElBQWQsSUFBc0IsRUFBRSxNQUFGLEtBQWEsSUFBdkMsRUFBNkM7QUFDekM7QUFDSDtBQUNEO0FBQ0giLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwidmFyIHBhdGg9Jy4vYmluLyc7XHJcbnZhciB2PXByb2Nlc3MudmVyc2lvbnMubm9kZS5zcGxpdCgnLicpO1xyXG5pZiAodlswXT09MCAmJiB2WzFdPD0xMCkgcGF0aCs9JzBfMTAvJztcclxuZWxzZSBpZiAodlswXT09MCAmJiB2WzFdPD0xMikgcGF0aCs9JzBfMTIvJztcclxuZWxzZSBpZiAodlswXTw9NCkgcGF0aCs9JzRfOC8nO1xyXG5lbHNlIGlmICh2WzBdPD01KSBwYXRoKz0nNV8xMi8nO1xyXG5lbHNlIGlmICh2WzBdPD02KSBwYXRoKz0nNl8xMi8nO1xyXG5lbHNlIGlmICh2WzBdPD03KSBwYXRoKz0nN18xMC8nO1xyXG5lbHNlIGlmICh2WzBdPD04KSBwYXRoKz0nOF85Lyc7XHJcbmlmKHByb2Nlc3MucGxhdGZvcm09PVwid2luMzJcIiYmcHJvY2Vzcy5hcmNoPT1cImlhMzJcIikgcGF0aCs9J3dpbjMyL2phenonO1xyXG5lbHNlIGlmKHByb2Nlc3MucGxhdGZvcm09PVwid2luMzJcIiYmcHJvY2Vzcy5hcmNoPT1cIng2NFwiKSBwYXRoKz0nd2luNjQvamF6eic7XHJcbmVsc2UgaWYocHJvY2Vzcy5wbGF0Zm9ybT09XCJkYXJ3aW5cIiYmcHJvY2Vzcy5hcmNoPT1cIng2NFwiKSBwYXRoKz0nbWFjb3M2NC9qYXp6JztcclxuZWxzZSBpZihwcm9jZXNzLnBsYXRmb3JtPT1cImRhcndpblwiJiZwcm9jZXNzLmFyY2g9PVwiaWEzMlwiKSBwYXRoKz0nbWFjb3MzMi9qYXp6JztcclxuZWxzZSBpZihwcm9jZXNzLnBsYXRmb3JtPT1cImxpbnV4XCImJnByb2Nlc3MuYXJjaD09XCJ4NjRcIikgcGF0aCs9J2xpbnV4NjQvamF6eic7XHJcbmVsc2UgaWYocHJvY2Vzcy5wbGF0Zm9ybT09XCJsaW51eFwiJiZwcm9jZXNzLmFyY2g9PVwiaWEzMlwiKSBwYXRoKz0nbGludXgzMi9qYXp6JztcclxuZWxzZSBpZihwcm9jZXNzLnBsYXRmb3JtPT1cImxpbnV4XCImJnByb2Nlc3MuYXJjaD09XCJhcm1cIikgcGF0aCs9J2xpbnV4YTcvamF6eic7XHJcbm1vZHVsZS5leHBvcnRzPXJlcXVpcmUocGF0aCk7XHJcbm1vZHVsZS5leHBvcnRzLnBhY2thZ2U9cmVxdWlyZShfX2Rpcm5hbWUgKyAnL3BhY2thZ2UuanNvbicpO1xyXG4iLCIvKlxuLy8gVGhpcyBzY3JpcHQgaXMgZm9yIE5vZGUuanMgb25seS4gRG9uJ3QgdXNlIGl0IGluIEhUTUwhXG52YXIgSlpaO1xuZXZhbChyZXF1aXJlKCdmcycpLnJlYWRGaWxlU3luYyhyZXF1aXJlKCdwYXRoJykuam9pbihfX2Rpcm5hbWUsICdqYXZhc2NyaXB0JywgJ0paWi5qcycpKSsnJyk7XG5tb2R1bGUuZXhwb3J0cyA9IEpaWjtcbiovXG5cbmNvbnN0IGNyZWF0ZUphenogPSByZXF1aXJlKCcuL2phdmFzY3JpcHQvSlpaLmpzJyk7XG5tb2R1bGUuZXhwb3J0cyA9IGNyZWF0ZUphenooKTtcbiIsIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKCkge1xuXG4gICAgdmFyIF92ZXJzaW9uID0gJzAuNC4xJztcblxuICAgIC8vIF9SOiBjb21tb24gcm9vdCBmb3IgYWxsIGFzeW5jIG9iamVjdHNcbiAgICBmdW5jdGlvbiBfUigpIHtcbiAgICAgICAgdGhpcy5fb3JpZyA9IHRoaXM7XG4gICAgICAgIHRoaXMuX3JlYWR5ID0gZmFsc2U7XG4gICAgICAgIHRoaXMuX3F1ZXVlID0gW107XG4gICAgICAgIHRoaXMuX2VyciA9IFtdO1xuICAgIH07XG4gICAgX1IucHJvdG90eXBlLl9leGVjID0gZnVuY3Rpb24gKCkge1xuICAgICAgICB3aGlsZSAodGhpcy5fcmVhZHkgJiYgdGhpcy5fcXVldWUubGVuZ3RoKSB7XG4gICAgICAgICAgICB2YXIgeCA9IHRoaXMuX3F1ZXVlLnNoaWZ0KCk7XG4gICAgICAgICAgICBpZiAodGhpcy5fb3JpZy5fYmFkKSB7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuX29yaWcuX2hvcGUgJiYgeFswXSA9PSBfb3IpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fb3JpZy5faG9wZSA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICB4WzBdLmFwcGx5KHRoaXMsIHhbMV0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fcXVldWUgPSBbXTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fb3JpZy5faG9wZSA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKHhbMF0gIT0gX29yKSB7XG4gICAgICAgICAgICAgICAgeFswXS5hcHBseSh0aGlzLCB4WzFdKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICBfUi5wcm90b3R5cGUuX3B1c2ggPSBmdW5jdGlvbiAoZnVuYywgYXJnKSB7IHRoaXMuX3F1ZXVlLnB1c2goW2Z1bmMsIGFyZ10pOyBfUi5wcm90b3R5cGUuX2V4ZWMuYXBwbHkodGhpcyk7IH1cbiAgICBfUi5wcm90b3R5cGUuX3NsaXAgPSBmdW5jdGlvbiAoZnVuYywgYXJnKSB7IHRoaXMuX3F1ZXVlLnVuc2hpZnQoW2Z1bmMsIGFyZ10pOyB9XG4gICAgX1IucHJvdG90eXBlLl9wYXVzZSA9IGZ1bmN0aW9uICgpIHsgdGhpcy5fcmVhZHkgPSBmYWxzZTsgfVxuICAgIF9SLnByb3RvdHlwZS5fcmVzdW1lID0gZnVuY3Rpb24gKCkgeyB0aGlzLl9yZWFkeSA9IHRydWU7IF9SLnByb3RvdHlwZS5fZXhlYy5hcHBseSh0aGlzKTsgfVxuICAgIF9SLnByb3RvdHlwZS5fYnJlYWsgPSBmdW5jdGlvbiAoZXJyKSB7IHRoaXMuX29yaWcuX2JhZCA9IHRydWU7IHRoaXMuX29yaWcuX2hvcGUgPSB0cnVlOyBpZiAoZXJyKSB0aGlzLl9vcmlnLl9lcnIucHVzaChlcnIpOyB9XG4gICAgX1IucHJvdG90eXBlLl9yZXBhaXIgPSBmdW5jdGlvbiAoKSB7IHRoaXMuX29yaWcuX2JhZCA9IGZhbHNlOyB9XG4gICAgX1IucHJvdG90eXBlLl9jcmFzaCA9IGZ1bmN0aW9uIChlcnIpIHsgdGhpcy5fYnJlYWsoZXJyKTsgdGhpcy5fcmVzdW1lKCk7IH1cbiAgICBfUi5wcm90b3R5cGUuZXJyID0gZnVuY3Rpb24gKCkgeyByZXR1cm4gX2Nsb25lKHRoaXMuX2Vycik7IH1cblxuICAgIGZ1bmN0aW9uIF93YWl0KG9iaiwgZGVsYXkpIHsgc2V0VGltZW91dChmdW5jdGlvbiAoKSB7IG9iai5fcmVzdW1lKCk7IH0sIGRlbGF5KTsgfVxuICAgIF9SLnByb3RvdHlwZS53YWl0ID0gZnVuY3Rpb24gKGRlbGF5KSB7XG4gICAgICAgIGlmICghZGVsYXkpIHJldHVybiB0aGlzO1xuICAgICAgICBmdW5jdGlvbiBGKCkgeyB9OyBGLnByb3RvdHlwZSA9IHRoaXMuX29yaWc7XG4gICAgICAgIHZhciByZXQgPSBuZXcgRigpO1xuICAgICAgICByZXQuX3JlYWR5ID0gZmFsc2U7XG4gICAgICAgIHJldC5fcXVldWUgPSBbXTtcbiAgICAgICAgdGhpcy5fcHVzaChfd2FpdCwgW3JldCwgZGVsYXldKTtcbiAgICAgICAgcmV0dXJuIHJldDtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBfYW5kKHEpIHsgaWYgKHEgaW5zdGFuY2VvZiBGdW5jdGlvbikgcS5hcHBseSh0aGlzKTsgZWxzZSBjb25zb2xlLmxvZyhxKTsgfVxuICAgIF9SLnByb3RvdHlwZS5hbmQgPSBmdW5jdGlvbiAoZnVuYykgeyB0aGlzLl9wdXNoKF9hbmQsIFtmdW5jXSk7IHJldHVybiB0aGlzOyB9XG4gICAgZnVuY3Rpb24gX29yKHEpIHsgaWYgKHEgaW5zdGFuY2VvZiBGdW5jdGlvbikgcS5hcHBseSh0aGlzKTsgZWxzZSBjb25zb2xlLmxvZyhxKTsgfVxuICAgIF9SLnByb3RvdHlwZS5vciA9IGZ1bmN0aW9uIChmdW5jKSB7IHRoaXMuX3B1c2goX29yLCBbZnVuY10pOyByZXR1cm4gdGhpczsgfVxuXG4gICAgX1IucHJvdG90eXBlLl9pbmZvID0ge307XG4gICAgX1IucHJvdG90eXBlLmluZm8gPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciBpbmZvID0gX2Nsb25lKHRoaXMuX29yaWcuX2luZm8pO1xuICAgICAgICBpZiAodHlwZW9mIGluZm8uZW5naW5lID09ICd1bmRlZmluZWQnKSBpbmZvLmVuZ2luZSA9ICdub25lJztcbiAgICAgICAgaWYgKHR5cGVvZiBpbmZvLnN5c2V4ID09ICd1bmRlZmluZWQnKSBpbmZvLnN5c2V4ID0gdHJ1ZTtcbiAgICAgICAgcmV0dXJuIGluZm87XG4gICAgfVxuICAgIF9SLnByb3RvdHlwZS5uYW1lID0gZnVuY3Rpb24gKCkgeyByZXR1cm4gdGhpcy5pbmZvKCkubmFtZTsgfVxuXG4gICAgZnVuY3Rpb24gX2Nsb3NlKG9iaikge1xuICAgICAgICB0aGlzLl9icmVhaygnY2xvc2VkJyk7XG4gICAgICAgIG9iai5fcmVzdW1lKCk7XG4gICAgfVxuICAgIF9SLnByb3RvdHlwZS5jbG9zZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmFyIHJldCA9IG5ldyBfUigpO1xuICAgICAgICBpZiAodGhpcy5fY2xvc2UpIHRoaXMuX3B1c2godGhpcy5fY2xvc2UsIFtdKTtcbiAgICAgICAgdGhpcy5fcHVzaChfY2xvc2UsIFtyZXRdKTtcbiAgICAgICAgcmV0dXJuIHJldDtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBfdHJ5QW55KGFycikge1xuICAgICAgICBpZiAoIWFyci5sZW5ndGgpIHtcbiAgICAgICAgICAgIHRoaXMuX2JyZWFrKCk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgdmFyIGZ1bmMgPSBhcnIuc2hpZnQoKTtcbiAgICAgICAgaWYgKGFyci5sZW5ndGgpIHtcbiAgICAgICAgICAgIHZhciBzZWxmID0gdGhpcztcbiAgICAgICAgICAgIHRoaXMuX3NsaXAoX29yLCBbZnVuY3Rpb24gKCkgeyBfdHJ5QW55LmFwcGx5KHNlbGYsIFthcnJdKTsgfV0pO1xuICAgICAgICB9XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICB0aGlzLl9yZXBhaXIoKTtcbiAgICAgICAgICAgIGZ1bmMuYXBwbHkodGhpcyk7XG4gICAgICAgIH1cbiAgICAgICAgY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgIHRoaXMuX2JyZWFrKGUudG9TdHJpbmcoKSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiBfcHVzaChhcnIsIG9iaikge1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGFyci5sZW5ndGg7IGkrKykgaWYgKGFycltpXSA9PT0gb2JqKSByZXR1cm47XG4gICAgICAgIGFyci5wdXNoKG9iaik7XG4gICAgfVxuICAgIGZ1bmN0aW9uIF9wb3AoYXJyLCBvYmopIHtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBhcnIubGVuZ3RoOyBpKyspIGlmIChhcnJbaV0gPT09IG9iaikge1xuICAgICAgICAgICAgYXJyLnNwbGljZShpLCAxKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8vIF9KOiBKWlogb2JqZWN0XG4gICAgZnVuY3Rpb24gX0ooKSB7XG4gICAgICAgIF9SLmFwcGx5KHRoaXMpO1xuICAgIH1cbiAgICBfSi5wcm90b3R5cGUgPSBuZXcgX1IoKTtcblxuICAgIF9KLnByb3RvdHlwZS50aW1lID0gZnVuY3Rpb24gKCkgeyByZXR1cm4gMDsgfVxuICAgIGlmICh0eXBlb2YgcGVyZm9ybWFuY2UgIT0gJ3VuZGVmaW5lZCcgJiYgcGVyZm9ybWFuY2Uubm93KSBfSi5wcm90b3R5cGUuX3RpbWUgPSBmdW5jdGlvbiAoKSB7IHJldHVybiBwZXJmb3JtYW5jZS5ub3coKTsgfVxuICAgIGZ1bmN0aW9uIF9pbml0VGltZXIoKSB7XG4gICAgICAgIGlmICghX0oucHJvdG90eXBlLl90aW1lKSBfSi5wcm90b3R5cGUuX3RpbWUgPSBmdW5jdGlvbiAoKSB7IHJldHVybiBEYXRlLm5vdygpOyB9XG4gICAgICAgIF9KLnByb3RvdHlwZS5fc3RhcnRUaW1lID0gX0oucHJvdG90eXBlLl90aW1lKCk7XG4gICAgICAgIF9KLnByb3RvdHlwZS50aW1lID0gZnVuY3Rpb24gKCkgeyByZXR1cm4gX0oucHJvdG90eXBlLl90aW1lKCkgLSBfSi5wcm90b3R5cGUuX3N0YXJ0VGltZTsgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIF9jbG9uZShvYmosIGtleSwgdmFsKSB7XG4gICAgICAgIGlmICh0eXBlb2Yga2V5ID09ICd1bmRlZmluZWQnKSByZXR1cm4gX2Nsb25lKG9iaiwgW10sIFtdKTtcbiAgICAgICAgaWYgKG9iaiBpbnN0YW5jZW9mIE9iamVjdCkge1xuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBrZXkubGVuZ3RoOyBpKyspIGlmIChrZXlbaV0gPT09IG9iaikgcmV0dXJuIHZhbFtpXTtcbiAgICAgICAgICAgIHZhciByZXQ7XG4gICAgICAgICAgICBpZiAob2JqIGluc3RhbmNlb2YgQXJyYXkpIHJldCA9IFtdOyBlbHNlIHJldCA9IHt9O1xuICAgICAgICAgICAga2V5LnB1c2gob2JqKTsgdmFsLnB1c2gocmV0KTtcbiAgICAgICAgICAgIGZvciAodmFyIGsgaW4gb2JqKSBpZiAob2JqLmhhc093blByb3BlcnR5KGspKSByZXRba10gPSBfY2xvbmUob2JqW2tdLCBrZXksIHZhbCk7XG4gICAgICAgICAgICByZXR1cm4gcmV0O1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBvYmo7XG4gICAgfVxuICAgIF9KLnByb3RvdHlwZS5faW5mbyA9IHsgbmFtZTogJ0paWi5qcycsIHZlcjogX3ZlcnNpb24sIHZlcnNpb246IF92ZXJzaW9uIH07XG5cbiAgICB2YXIgX291dHMgPSBbXTtcbiAgICB2YXIgX2lucyA9IFtdO1xuXG4gICAgZnVuY3Rpb24gX3Bvc3RSZWZyZXNoKCkge1xuICAgICAgICB0aGlzLl9pbmZvLmVuZ2luZSA9IF9lbmdpbmUuX3R5cGU7XG4gICAgICAgIHRoaXMuX2luZm8udmVyc2lvbiA9IF9lbmdpbmUuX3ZlcnNpb247XG4gICAgICAgIHRoaXMuX2luZm8uc3lzZXggPSBfZW5naW5lLl9zeXNleDtcbiAgICAgICAgdGhpcy5faW5mby5pbnB1dHMgPSBbXTtcbiAgICAgICAgdGhpcy5faW5mby5vdXRwdXRzID0gW107XG4gICAgICAgIF9vdXRzID0gW107XG4gICAgICAgIF9pbnMgPSBbXTtcbiAgICAgICAgX2VuZ2luZS5fYWxsT3V0cyA9IHt9O1xuICAgICAgICBfZW5naW5lLl9hbGxJbnMgPSB7fTtcbiAgICAgICAgdmFyIGksIHg7XG4gICAgICAgIGZvciAoaSA9IDA7IGkgPCBfZW5naW5lLl9vdXRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICB4ID0gX2VuZ2luZS5fb3V0c1tpXTtcbiAgICAgICAgICAgIHguZW5naW5lID0gX2VuZ2luZTtcbiAgICAgICAgICAgIF9lbmdpbmUuX2FsbE91dHNbeC5uYW1lXSA9IHg7XG4gICAgICAgICAgICB0aGlzLl9pbmZvLm91dHB1dHMucHVzaCh7XG4gICAgICAgICAgICAgICAgbmFtZTogeC5uYW1lLFxuICAgICAgICAgICAgICAgIG1hbnVmYWN0dXJlcjogeC5tYW51ZmFjdHVyZXIsXG4gICAgICAgICAgICAgICAgdmVyc2lvbjogeC52ZXJzaW9uLFxuICAgICAgICAgICAgICAgIGVuZ2luZTogX2VuZ2luZS5fdHlwZVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBfb3V0cy5wdXNoKHgpO1xuICAgICAgICB9XG4gICAgICAgIGZvciAoaSA9IDA7IGkgPCBfdmlydHVhbC5fb3V0cy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgeCA9IF92aXJ0dWFsLl9vdXRzW2ldO1xuICAgICAgICAgICAgdGhpcy5faW5mby5vdXRwdXRzLnB1c2goe1xuICAgICAgICAgICAgICAgIG5hbWU6IHgubmFtZSxcbiAgICAgICAgICAgICAgICBtYW51ZmFjdHVyZXI6IHgubWFudWZhY3R1cmVyLFxuICAgICAgICAgICAgICAgIHZlcnNpb246IHgudmVyc2lvbixcbiAgICAgICAgICAgICAgICBlbmdpbmU6IHgudHlwZVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBfb3V0cy5wdXNoKHgpO1xuICAgICAgICB9XG4gICAgICAgIGZvciAoaSA9IDA7IGkgPCBfZW5naW5lLl9pbnMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIHggPSBfZW5naW5lLl9pbnNbaV07XG4gICAgICAgICAgICB4LmVuZ2luZSA9IF9lbmdpbmU7XG4gICAgICAgICAgICBfZW5naW5lLl9hbGxJbnNbeC5uYW1lXSA9IHg7XG4gICAgICAgICAgICB0aGlzLl9pbmZvLmlucHV0cy5wdXNoKHtcbiAgICAgICAgICAgICAgICBuYW1lOiB4Lm5hbWUsXG4gICAgICAgICAgICAgICAgbWFudWZhY3R1cmVyOiB4Lm1hbnVmYWN0dXJlcixcbiAgICAgICAgICAgICAgICB2ZXJzaW9uOiB4LnZlcnNpb24sXG4gICAgICAgICAgICAgICAgZW5naW5lOiBfZW5naW5lLl90eXBlXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIF9pbnMucHVzaCh4KTtcbiAgICAgICAgfVxuICAgICAgICBmb3IgKGkgPSAwOyBpIDwgX3ZpcnR1YWwuX2lucy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgeCA9IF92aXJ0dWFsLl9pbnNbaV07XG4gICAgICAgICAgICB0aGlzLl9pbmZvLmlucHV0cy5wdXNoKHtcbiAgICAgICAgICAgICAgICBuYW1lOiB4Lm5hbWUsXG4gICAgICAgICAgICAgICAgbWFudWZhY3R1cmVyOiB4Lm1hbnVmYWN0dXJlcixcbiAgICAgICAgICAgICAgICB2ZXJzaW9uOiB4LnZlcnNpb24sXG4gICAgICAgICAgICAgICAgZW5naW5lOiB4LnR5cGVcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgX2lucy5wdXNoKHgpO1xuICAgICAgICB9XG4gICAgfVxuICAgIGZ1bmN0aW9uIF9yZWZyZXNoKCkge1xuICAgICAgICB0aGlzLl9zbGlwKF9wb3N0UmVmcmVzaCwgW10pO1xuICAgICAgICBfZW5naW5lLl9yZWZyZXNoKCk7XG4gICAgfVxuICAgIF9KLnByb3RvdHlwZS5yZWZyZXNoID0gZnVuY3Rpb24gKCkge1xuICAgICAgICB0aGlzLl9wdXNoKF9yZWZyZXNoLCBbXSk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIF9maWx0ZXJMaXN0KHEsIGFycikge1xuICAgICAgICBpZiAodHlwZW9mIHEgPT0gJ3VuZGVmaW5lZCcpIHJldHVybiBhcnIuc2xpY2UoKTtcbiAgICAgICAgdmFyIGksIG47XG4gICAgICAgIHZhciBhID0gW107XG4gICAgICAgIGlmIChxIGluc3RhbmNlb2YgUmVnRXhwKSB7XG4gICAgICAgICAgICBmb3IgKG4gPSAwOyBuIDwgYXJyLmxlbmd0aDsgbisrKSBpZiAocS50ZXN0KGFycltuXS5uYW1lKSkgYS5wdXNoKGFycltuXSk7XG4gICAgICAgICAgICByZXR1cm4gYTtcbiAgICAgICAgfVxuICAgICAgICBpZiAocSBpbnN0YW5jZW9mIEZ1bmN0aW9uKSBxID0gcShhcnIpO1xuICAgICAgICBpZiAoIShxIGluc3RhbmNlb2YgQXJyYXkpKSBxID0gW3FdO1xuICAgICAgICBmb3IgKGkgPSAwOyBpIDwgcS5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgZm9yIChuID0gMDsgbiA8IGFyci5sZW5ndGg7IG4rKykge1xuICAgICAgICAgICAgICAgIGlmIChxW2ldICsgJycgPT09IG4gKyAnJyB8fCBxW2ldID09PSBhcnJbbl0ubmFtZSB8fCAocVtpXSBpbnN0YW5jZW9mIE9iamVjdCAmJiBxW2ldLm5hbWUgPT09IGFycltuXS5uYW1lKSkgYS5wdXNoKGFycltuXSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGE7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gX25vdEZvdW5kKHBvcnQsIHEpIHtcbiAgICAgICAgdmFyIG1zZztcbiAgICAgICAgaWYgKHEgaW5zdGFuY2VvZiBSZWdFeHApIG1zZyA9ICdQb3J0IG1hdGNoaW5nICcgKyBxICsgJyBub3QgZm91bmQnO1xuICAgICAgICBlbHNlIGlmIChxIGluc3RhbmNlb2YgT2JqZWN0IHx8IHR5cGVvZiBxID09ICd1bmRlZmluZWQnKSBtc2cgPSAnUG9ydCBub3QgZm91bmQnO1xuICAgICAgICBlbHNlIG1zZyA9ICdQb3J0IFwiJyArIHEgKyAnXCIgbm90IGZvdW5kJztcbiAgICAgICAgcG9ydC5fY3Jhc2gobXNnKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBfb3Blbk1pZGlPdXQocG9ydCwgYXJnKSB7XG4gICAgICAgIHZhciBhcnIgPSBfZmlsdGVyTGlzdChhcmcsIF9vdXRzKTtcbiAgICAgICAgaWYgKCFhcnIubGVuZ3RoKSB7IF9ub3RGb3VuZChwb3J0LCBhcmcpOyByZXR1cm47IH1cbiAgICAgICAgZnVuY3Rpb24gcGFjayh4KSB7IHJldHVybiBmdW5jdGlvbiAoKSB7IHguZW5naW5lLl9vcGVuT3V0KHRoaXMsIHgubmFtZSk7IH07IH07XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgYXJyLmxlbmd0aDsgaSsrKSBhcnJbaV0gPSBwYWNrKGFycltpXSk7XG4gICAgICAgIHBvcnQuX3NsaXAoX3RyeUFueSwgW2Fycl0pO1xuICAgICAgICBwb3J0Ll9yZXN1bWUoKTtcbiAgICB9XG4gICAgX0oucHJvdG90eXBlLm9wZW5NaWRpT3V0ID0gZnVuY3Rpb24gKGFyZykge1xuICAgICAgICB2YXIgcG9ydCA9IG5ldyBfTSgpO1xuICAgICAgICB0aGlzLl9wdXNoKF9yZWZyZXNoLCBbXSk7XG4gICAgICAgIHRoaXMuX3B1c2goX29wZW5NaWRpT3V0LCBbcG9ydCwgYXJnXSk7XG4gICAgICAgIHJldHVybiBwb3J0O1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIF9vcGVuTWlkaUluKHBvcnQsIGFyZykge1xuICAgICAgICB2YXIgYXJyID0gX2ZpbHRlckxpc3QoYXJnLCBfaW5zKTtcbiAgICAgICAgaWYgKCFhcnIubGVuZ3RoKSB7IF9ub3RGb3VuZChwb3J0LCBhcmcpOyByZXR1cm47IH1cbiAgICAgICAgZnVuY3Rpb24gcGFjayh4KSB7IHJldHVybiBmdW5jdGlvbiAoKSB7IHguZW5naW5lLl9vcGVuSW4odGhpcywgeC5uYW1lKTsgfTsgfTtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBhcnIubGVuZ3RoOyBpKyspIGFycltpXSA9IHBhY2soYXJyW2ldKTtcbiAgICAgICAgcG9ydC5fc2xpcChfdHJ5QW55LCBbYXJyXSk7XG4gICAgICAgIHBvcnQuX3Jlc3VtZSgpO1xuICAgIH1cbiAgICBfSi5wcm90b3R5cGUub3Blbk1pZGlJbiA9IGZ1bmN0aW9uIChhcmcpIHtcbiAgICAgICAgdmFyIHBvcnQgPSBuZXcgX00oKTtcbiAgICAgICAgdGhpcy5fcHVzaChfcmVmcmVzaCwgW10pO1xuICAgICAgICB0aGlzLl9wdXNoKF9vcGVuTWlkaUluLCBbcG9ydCwgYXJnXSk7XG4gICAgICAgIHJldHVybiBwb3J0O1xuICAgIH1cblxuICAgIF9KLnByb3RvdHlwZS5fY2xvc2UgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIF9lbmdpbmUuX2Nsb3NlKCk7XG4gICAgfVxuXG4gICAgLy8gX006IE1JREktSW4vT3V0IG9iamVjdFxuICAgIGZ1bmN0aW9uIF9NKCkge1xuICAgICAgICBfUi5hcHBseSh0aGlzKTtcbiAgICAgICAgdGhpcy5faGFuZGxlcyA9IFtdO1xuICAgICAgICB0aGlzLl9vdXRzID0gW107XG4gICAgfVxuICAgIF9NLnByb3RvdHlwZSA9IG5ldyBfUigpO1xuXG4gICAgX00ucHJvdG90eXBlLl9yZWNlaXZlID0gZnVuY3Rpb24gKG1zZykgeyB0aGlzLl9lbWl0KG1zZyk7IH0gLy8gb3ZlcnJpZGUhXG4gICAgZnVuY3Rpb24gX3JlY2VpdmUobXNnKSB7IHRoaXMuX3JlY2VpdmUobXNnKTsgfVxuICAgIF9NLnByb3RvdHlwZS5zZW5kID0gZnVuY3Rpb24gKCkge1xuICAgICAgICB0aGlzLl9wdXNoKF9yZWNlaXZlLCBbTUlESS5hcHBseShudWxsLCBhcmd1bWVudHMpXSk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cbiAgICBfTS5wcm90b3R5cGUubm90ZSA9IGZ1bmN0aW9uIChjLCBuLCB2LCB0KSB7XG4gICAgICAgIHRoaXMubm90ZU9uKGMsIG4sIHYpO1xuICAgICAgICBpZiAodCkgdGhpcy53YWl0KHQpLm5vdGVPZmYoYywgbik7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cbiAgICBfTS5wcm90b3R5cGUuX2VtaXQgPSBmdW5jdGlvbiAobXNnKSB7XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5faGFuZGxlcy5sZW5ndGg7IGkrKykgdGhpcy5faGFuZGxlc1tpXS5hcHBseSh0aGlzLCBbTUlESShtc2cpLl9zdGFtcCh0aGlzKV0pO1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMuX291dHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIHZhciBtID0gTUlESShtc2cpO1xuICAgICAgICAgICAgaWYgKCFtLl9zdGFtcGVkKHRoaXMuX291dHNbaV0pKSB0aGlzLl9vdXRzW2ldLnNlbmQobS5fc3RhbXAodGhpcykpO1xuICAgICAgICB9XG4gICAgfVxuICAgIGZ1bmN0aW9uIF9lbWl0KG1zZykgeyB0aGlzLl9lbWl0KG1zZyk7IH1cbiAgICBfTS5wcm90b3R5cGUuZW1pdCA9IGZ1bmN0aW9uIChtc2cpIHtcbiAgICAgICAgdGhpcy5fcHVzaChfZW1pdCwgW21zZ10pO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG4gICAgZnVuY3Rpb24gX2Nvbm5lY3QoYXJnKSB7XG4gICAgICAgIGlmIChhcmcgaW5zdGFuY2VvZiBGdW5jdGlvbikgX3B1c2godGhpcy5fb3JpZy5faGFuZGxlcywgYXJnKTtcbiAgICAgICAgZWxzZSBfcHVzaCh0aGlzLl9vcmlnLl9vdXRzLCBhcmcpO1xuICAgIH1cbiAgICBmdW5jdGlvbiBfZGlzY29ubmVjdChhcmcpIHtcbiAgICAgICAgaWYgKGFyZyBpbnN0YW5jZW9mIEZ1bmN0aW9uKSBfcG9wKHRoaXMuX29yaWcuX2hhbmRsZXMsIGFyZyk7XG4gICAgICAgIGVsc2UgX3BvcCh0aGlzLl9vcmlnLl9vdXRzLCBhcmcpO1xuICAgIH1cbiAgICBfTS5wcm90b3R5cGUuY29ubmVjdCA9IGZ1bmN0aW9uIChhcmcpIHtcbiAgICAgICAgdGhpcy5fcHVzaChfY29ubmVjdCwgW2FyZ10pO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG4gICAgX00ucHJvdG90eXBlLmRpc2Nvbm5lY3QgPSBmdW5jdGlvbiAoYXJnKSB7XG4gICAgICAgIHRoaXMuX3B1c2goX2Rpc2Nvbm5lY3QsIFthcmddKTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgdmFyIF9qeno7XG4gICAgdmFyIF9lbmdpbmUgPSB7fTtcbiAgICB2YXIgX3ZpcnR1YWwgPSB7IF9vdXRzOiBbXSwgX2luczogW10gfTtcblxuICAgIC8vIE5vZGUuanNcbiAgICBmdW5jdGlvbiBfdHJ5Tk9ERSgpIHtcbiAgICAgICAgaWYgKHR5cGVvZiBtb2R1bGUgIT0gJ3VuZGVmaW5lZCcgJiYgbW9kdWxlLmV4cG9ydHMpIHtcbiAgICAgICAgICAgIF9pbml0Tm9kZShyZXF1aXJlKCdqYXp6LW1pZGknKSk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5fYnJlYWsoKTtcbiAgICB9XG4gICAgLy8gSmF6ei1QbHVnaW5cbiAgICBmdW5jdGlvbiBfdHJ5SmF6elBsdWdpbigpIHtcbiAgICAgICAgdmFyIGRpdiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgICAgICBkaXYuc3R5bGUudmlzaWJpbGl0eSA9ICdoaWRkZW4nO1xuICAgICAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKGRpdik7XG4gICAgICAgIHZhciBvYmogPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdvYmplY3QnKTtcbiAgICAgICAgb2JqLnN0eWxlLnZpc2liaWxpdHkgPSAnaGlkZGVuJztcbiAgICAgICAgb2JqLnN0eWxlLndpZHRoID0gJzBweCc7IG9iai5zdHlsZS5oZWlnaHQgPSAnMHB4JztcbiAgICAgICAgb2JqLmNsYXNzaWQgPSAnQ0xTSUQ6MUFDRTE2MTgtMUM3RC00NTYxLUFFRTEtMzQ4NDJBQTg1RTkwJztcbiAgICAgICAgb2JqLnR5cGUgPSAnYXVkaW8veC1qYXp6JztcbiAgICAgICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChvYmopO1xuICAgICAgICBpZiAob2JqLmlzSmF6eikge1xuICAgICAgICAgICAgX2luaXRKYXp6UGx1Z2luKG9iaik7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5fYnJlYWsoKTtcbiAgICB9XG4gICAgLy8gV2ViIE1JREkgQVBJXG4gICAgZnVuY3Rpb24gX3RyeVdlYk1JREkoKSB7XG4gICAgICAgIGlmIChuYXZpZ2F0b3IucmVxdWVzdE1JRElBY2Nlc3MpIHtcbiAgICAgICAgICAgIHZhciBzZWxmID0gdGhpcztcbiAgICAgICAgICAgIGZ1bmN0aW9uIG9uR29vZChtaWRpKSB7XG4gICAgICAgICAgICAgICAgX2luaXRXZWJNSURJKG1pZGkpO1xuICAgICAgICAgICAgICAgIHNlbGYuX3Jlc3VtZSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZnVuY3Rpb24gb25CYWQobXNnKSB7XG4gICAgICAgICAgICAgICAgc2VsZi5fY3Jhc2gobXNnKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHZhciBvcHQgPSB7fTtcbiAgICAgICAgICAgIG5hdmlnYXRvci5yZXF1ZXN0TUlESUFjY2VzcyhvcHQpLnRoZW4ob25Hb29kLCBvbkJhZCk7XG4gICAgICAgICAgICB0aGlzLl9wYXVzZSgpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuX2JyZWFrKCk7XG4gICAgfVxuICAgIGZ1bmN0aW9uIF90cnlXZWJNSURJc3lzZXgoKSB7XG4gICAgICAgIGlmIChuYXZpZ2F0b3IucmVxdWVzdE1JRElBY2Nlc3MpIHtcbiAgICAgICAgICAgIHZhciBzZWxmID0gdGhpcztcbiAgICAgICAgICAgIGZ1bmN0aW9uIG9uR29vZChtaWRpKSB7XG4gICAgICAgICAgICAgICAgX2luaXRXZWJNSURJKG1pZGksIHRydWUpO1xuICAgICAgICAgICAgICAgIHNlbGYuX3Jlc3VtZSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZnVuY3Rpb24gb25CYWQobXNnKSB7XG4gICAgICAgICAgICAgICAgc2VsZi5fY3Jhc2gobXNnKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHZhciBvcHQgPSB7IHN5c2V4OiB0cnVlIH07XG4gICAgICAgICAgICBuYXZpZ2F0b3IucmVxdWVzdE1JRElBY2Nlc3Mob3B0KS50aGVuKG9uR29vZCwgb25CYWQpO1xuICAgICAgICAgICAgdGhpcy5fcGF1c2UoKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLl9icmVhaygpO1xuICAgIH1cbiAgICAvLyBXZWItZXh0ZW5zaW9uXG4gICAgZnVuY3Rpb24gX3RyeUNSWCgpIHtcbiAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgICAgICB2YXIgaW5zdDtcbiAgICAgICAgdmFyIG1zZztcbiAgICAgICAgZnVuY3Rpb24gZXZlbnRIYW5kbGUoZSkge1xuICAgICAgICAgICAgaW5zdCA9IHRydWU7XG4gICAgICAgICAgICBpZiAoIW1zZykgbXNnID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2phenotbWlkaS1tc2cnKTtcbiAgICAgICAgICAgIGlmICghbXNnKSByZXR1cm47XG4gICAgICAgICAgICB2YXIgYSA9IFtdO1xuICAgICAgICAgICAgdHJ5IHsgYSA9IEpTT04ucGFyc2UobXNnLmlubmVyVGV4dCk7IH0gY2F0Y2ggKGUpIHsgfVxuICAgICAgICAgICAgbXNnLmlubmVyVGV4dCA9ICcnO1xuICAgICAgICAgICAgZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcignamF6ei1taWRpLW1zZycsIGV2ZW50SGFuZGxlKTtcbiAgICAgICAgICAgIGlmIChhWzBdID09PSAndmVyc2lvbicpIHtcbiAgICAgICAgICAgICAgICBfaW5pdENSWChtc2csIGFbMl0pO1xuICAgICAgICAgICAgICAgIHNlbGYuX3Jlc3VtZSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgc2VsZi5fY3Jhc2goKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICB0aGlzLl9wYXVzZSgpO1xuICAgICAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdqYXp6LW1pZGktbXNnJywgZXZlbnRIYW5kbGUpO1xuICAgICAgICB0cnkgeyBkb2N1bWVudC5kaXNwYXRjaEV2ZW50KG5ldyBFdmVudCgnamF6ei1taWRpJykpOyB9IGNhdGNoIChlKSB7IH1cbiAgICAgICAgd2luZG93LnNldFRpbWVvdXQoZnVuY3Rpb24gKCkgeyBpZiAoIWluc3QpIHNlbGYuX2NyYXNoKCk7IH0sIDApO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIF96ZXJvQnJlYWsoKSB7XG4gICAgICAgIHRoaXMuX3BhdXNlKCk7XG4gICAgICAgIHZhciBzZWxmID0gdGhpcztcbiAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbiAoKSB7IHNlbGYuX2NyYXNoKCk7IH0sIDApO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIF9maWx0ZXJFbmdpbmVzKG9wdCkge1xuICAgICAgICB2YXIgcmV0ID0gW190cnlOT0RFLCBfemVyb0JyZWFrXTtcbiAgICAgICAgdmFyIGFyciA9IF9maWx0ZXJFbmdpbmVOYW1lcyhvcHQpO1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGFyci5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgaWYgKGFycltpXSA9PSAnd2VibWlkaScpIHtcbiAgICAgICAgICAgICAgICBpZiAob3B0ICYmIG9wdC5zeXNleCA9PT0gdHJ1ZSkgcmV0LnB1c2goX3RyeVdlYk1JRElzeXNleCk7XG4gICAgICAgICAgICAgICAgaWYgKCFvcHQgfHwgb3B0LnN5c2V4ICE9PSB0cnVlIHx8IG9wdC5kZWdyYWRlID09PSB0cnVlKSByZXQucHVzaChfdHJ5V2ViTUlESSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmIChhcnJbaV0gPT0gJ2V4dGVuc2lvbicpIHJldC5wdXNoKF90cnlDUlgpO1xuICAgICAgICAgICAgZWxzZSBpZiAoYXJyW2ldID09ICdwbHVnaW4nKSByZXQucHVzaChfdHJ5SmF6elBsdWdpbik7XG4gICAgICAgIH1cbiAgICAgICAgcmV0LnB1c2goX2luaXROT05FKTtcbiAgICAgICAgcmV0dXJuIHJldDtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBfZmlsdGVyRW5naW5lTmFtZXMob3B0KSB7XG4gICAgICAgIHZhciB3ZWIgPSBbJ2V4dGVuc2lvbicsICd3ZWJtaWRpJywgJ3BsdWdpbiddO1xuICAgICAgICBpZiAoIW9wdCB8fCAhb3B0LmVuZ2luZSkgcmV0dXJuIHdlYjtcbiAgICAgICAgdmFyIGFyciA9IG9wdC5lbmdpbmUgaW5zdGFuY2VvZiBBcnJheSA/IG9wdC5lbmdpbmUgOiBbb3B0LmVuZ2luZV07XG4gICAgICAgIHZhciBkdXAgPSB7fTtcbiAgICAgICAgdmFyIG5vbmU7XG4gICAgICAgIHZhciBldGM7XG4gICAgICAgIHZhciBoZWFkID0gW107XG4gICAgICAgIHZhciB0YWlsID0gW107XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgYXJyLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICB2YXIgbmFtZSA9IGFycltpXS50b1N0cmluZygpLnRvTG93ZXJDYXNlKCk7XG4gICAgICAgICAgICBpZiAoZHVwW25hbWVdKSBjb250aW51ZTtcbiAgICAgICAgICAgIGR1cFtuYW1lXSA9IHRydWU7XG4gICAgICAgICAgICBpZiAobmFtZSA9PT0gJ25vbmUnKSBub25lID0gdHJ1ZTtcbiAgICAgICAgICAgIGlmIChuYW1lID09PSAnZXRjJykgZXRjID0gdHJ1ZTtcbiAgICAgICAgICAgIGlmIChldGMpIHRhaWwucHVzaChuYW1lKTsgZWxzZSBoZWFkLnB1c2gobmFtZSk7XG4gICAgICAgICAgICBfcG9wKHdlYiwgbmFtZSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGV0YyB8fCBoZWFkLmxlbmd0aCB8fCB0YWlsLmxlbmd0aCkgbm9uZSA9IGZhbHNlO1xuICAgICAgICByZXR1cm4gbm9uZSA/IFtdIDogaGVhZC5jb25jYXQoZXRjID8gd2ViIDogdGFpbCk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gX2luaXRKWloob3B0KSB7XG4gICAgICAgIF9qenogPSBuZXcgX0ooKTtcbiAgICAgICAgX2p6ei5fb3B0aW9ucyA9IG9wdDtcbiAgICAgICAgX2p6ei5fcHVzaChfdHJ5QW55LCBbX2ZpbHRlckVuZ2luZXMob3B0KV0pO1xuICAgICAgICBfanp6LnJlZnJlc2goKTtcbiAgICAgICAgX2p6ei5fcHVzaChfaW5pdFRpbWVyLCBbXSk7XG4gICAgICAgIF9qenouX3B1c2goZnVuY3Rpb24gKCkgeyBpZiAoIV9vdXRzLmxlbmd0aCAmJiAhX2lucy5sZW5ndGgpIHRoaXMuX2JyZWFrKCk7IH0sIFtdKTtcbiAgICAgICAgX2p6ei5fcmVzdW1lKCk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gX2luaXROT05FKCkge1xuICAgICAgICBfZW5naW5lLl90eXBlID0gJ25vbmUnO1xuICAgICAgICBfZW5naW5lLl9zeXNleCA9IHRydWU7XG4gICAgICAgIF9lbmdpbmUuX3JlZnJlc2ggPSBmdW5jdGlvbiAoKSB7IF9lbmdpbmUuX291dHMgPSBbXTsgX2VuZ2luZS5faW5zID0gW107IH1cbiAgICB9XG4gICAgLy8gY29tbW9uIGluaXRpYWxpemF0aW9uIGZvciBKYXp6LVBsdWdpbiBhbmQgamF6ei1taWRpXG4gICAgZnVuY3Rpb24gX2luaXRFbmdpbmVKUCgpIHtcbiAgICAgICAgX2VuZ2luZS5faW5BcnIgPSBbXTtcbiAgICAgICAgX2VuZ2luZS5fb3V0QXJyID0gW107XG4gICAgICAgIF9lbmdpbmUuX2luTWFwID0ge307XG4gICAgICAgIF9lbmdpbmUuX291dE1hcCA9IHt9O1xuICAgICAgICBfZW5naW5lLl92ZXJzaW9uID0gX2VuZ2luZS5fbWFpbi52ZXJzaW9uO1xuICAgICAgICBfZW5naW5lLl9zeXNleCA9IHRydWU7XG4gICAgICAgIF9lbmdpbmUuX3JlZnJlc2ggPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBfZW5naW5lLl9vdXRzID0gW107XG4gICAgICAgICAgICBfZW5naW5lLl9pbnMgPSBbXTtcbiAgICAgICAgICAgIHZhciBpLCB4O1xuICAgICAgICAgICAgZm9yIChpID0gMDsgKHggPSBfZW5naW5lLl9tYWluLk1pZGlPdXRJbmZvKGkpKS5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgIF9lbmdpbmUuX291dHMucHVzaCh7IHR5cGU6IF9lbmdpbmUuX3R5cGUsIG5hbWU6IHhbMF0sIG1hbnVmYWN0dXJlcjogeFsxXSwgdmVyc2lvbjogeFsyXSB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGZvciAoaSA9IDA7ICh4ID0gX2VuZ2luZS5fbWFpbi5NaWRpSW5JbmZvKGkpKS5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgIF9lbmdpbmUuX2lucy5wdXNoKHsgdHlwZTogX2VuZ2luZS5fdHlwZSwgbmFtZTogeFswXSwgbWFudWZhY3R1cmVyOiB4WzFdLCB2ZXJzaW9uOiB4WzJdIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIF9lbmdpbmUuX29wZW5PdXQgPSBmdW5jdGlvbiAocG9ydCwgbmFtZSkge1xuICAgICAgICAgICAgdmFyIGltcGwgPSBfZW5naW5lLl9vdXRNYXBbbmFtZV07XG4gICAgICAgICAgICBpZiAoIWltcGwpIHtcbiAgICAgICAgICAgICAgICBpZiAoX2VuZ2luZS5fcG9vbC5sZW5ndGggPD0gX2VuZ2luZS5fb3V0QXJyLmxlbmd0aCkgX2VuZ2luZS5fcG9vbC5wdXNoKF9lbmdpbmUuX25ld1BsdWdpbigpKTtcbiAgICAgICAgICAgICAgICBpbXBsID0ge1xuICAgICAgICAgICAgICAgICAgICBuYW1lOiBuYW1lLFxuICAgICAgICAgICAgICAgICAgICBjbGllbnRzOiBbXSxcbiAgICAgICAgICAgICAgICAgICAgaW5mbzoge1xuICAgICAgICAgICAgICAgICAgICAgICAgbmFtZTogbmFtZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG1hbnVmYWN0dXJlcjogX2VuZ2luZS5fYWxsT3V0c1tuYW1lXS5tYW51ZmFjdHVyZXIsXG4gICAgICAgICAgICAgICAgICAgICAgICB2ZXJzaW9uOiBfZW5naW5lLl9hbGxPdXRzW25hbWVdLnZlcnNpb24sXG4gICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiAnTUlESS1vdXQnLFxuICAgICAgICAgICAgICAgICAgICAgICAgc3lzZXg6IF9lbmdpbmUuX3N5c2V4LFxuICAgICAgICAgICAgICAgICAgICAgICAgZW5naW5lOiBfZW5naW5lLl90eXBlXG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIF9jbG9zZTogZnVuY3Rpb24gKHBvcnQpIHsgX2VuZ2luZS5fY2xvc2VPdXQocG9ydCk7IH0sXG4gICAgICAgICAgICAgICAgICAgIF9yZWNlaXZlOiBmdW5jdGlvbiAoYSkgeyB0aGlzLnBsdWdpbi5NaWRpT3V0UmF3KGEuc2xpY2UoKSk7IH1cbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIHZhciBwbHVnaW4gPSBfZW5naW5lLl9wb29sW19lbmdpbmUuX291dEFyci5sZW5ndGhdO1xuICAgICAgICAgICAgICAgIGltcGwucGx1Z2luID0gcGx1Z2luO1xuICAgICAgICAgICAgICAgIF9lbmdpbmUuX291dEFyci5wdXNoKGltcGwpO1xuICAgICAgICAgICAgICAgIF9lbmdpbmUuX291dE1hcFtuYW1lXSA9IGltcGw7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoIWltcGwub3Blbikge1xuICAgICAgICAgICAgICAgIHZhciBzID0gaW1wbC5wbHVnaW4uTWlkaU91dE9wZW4obmFtZSk7XG4gICAgICAgICAgICAgICAgaWYgKHMgIT09IG5hbWUpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHMpIGltcGwucGx1Z2luLk1pZGlPdXRDbG9zZSgpO1xuICAgICAgICAgICAgICAgICAgICBwb3J0Ll9icmVhaygpOyByZXR1cm47XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGltcGwub3BlbiA9IHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBwb3J0Ll9vcmlnLl9pbXBsID0gaW1wbDtcbiAgICAgICAgICAgIF9wdXNoKGltcGwuY2xpZW50cywgcG9ydC5fb3JpZyk7XG4gICAgICAgICAgICBwb3J0Ll9pbmZvID0gaW1wbC5pbmZvO1xuICAgICAgICAgICAgcG9ydC5fcmVjZWl2ZSA9IGZ1bmN0aW9uIChhcmcpIHsgaW1wbC5fcmVjZWl2ZShhcmcpOyB9XG4gICAgICAgICAgICBwb3J0Ll9jbG9zZSA9IGZ1bmN0aW9uICgpIHsgaW1wbC5fY2xvc2UodGhpcyk7IH1cbiAgICAgICAgfVxuICAgICAgICBfZW5naW5lLl9vcGVuSW4gPSBmdW5jdGlvbiAocG9ydCwgbmFtZSkge1xuICAgICAgICAgICAgdmFyIGltcGwgPSBfZW5naW5lLl9pbk1hcFtuYW1lXTtcbiAgICAgICAgICAgIGlmICghaW1wbCkge1xuICAgICAgICAgICAgICAgIGlmIChfZW5naW5lLl9wb29sLmxlbmd0aCA8PSBfZW5naW5lLl9pbkFyci5sZW5ndGgpIF9lbmdpbmUuX3Bvb2wucHVzaChfZW5naW5lLl9uZXdQbHVnaW4oKSk7XG4gICAgICAgICAgICAgICAgaW1wbCA9IHtcbiAgICAgICAgICAgICAgICAgICAgbmFtZTogbmFtZSxcbiAgICAgICAgICAgICAgICAgICAgY2xpZW50czogW10sXG4gICAgICAgICAgICAgICAgICAgIGluZm86IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG5hbWU6IG5hbWUsXG4gICAgICAgICAgICAgICAgICAgICAgICBtYW51ZmFjdHVyZXI6IF9lbmdpbmUuX2FsbEluc1tuYW1lXS5tYW51ZmFjdHVyZXIsXG4gICAgICAgICAgICAgICAgICAgICAgICB2ZXJzaW9uOiBfZW5naW5lLl9hbGxJbnNbbmFtZV0udmVyc2lvbixcbiAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6ICdNSURJLWluJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHN5c2V4OiBfZW5naW5lLl9zeXNleCxcbiAgICAgICAgICAgICAgICAgICAgICAgIGVuZ2luZTogX2VuZ2luZS5fdHlwZVxuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICBfY2xvc2U6IGZ1bmN0aW9uIChwb3J0KSB7IF9lbmdpbmUuX2Nsb3NlSW4ocG9ydCk7IH0sXG4gICAgICAgICAgICAgICAgICAgIGhhbmRsZTogZnVuY3Rpb24gKHQsIGEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5jbGllbnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIG1zZyA9IE1JREkoYSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5jbGllbnRzW2ldLl9lbWl0KG1zZyk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIGZ1bmN0aW9uIG1ha2VIYW5kbGUoeCkgeyByZXR1cm4gZnVuY3Rpb24gKHQsIGEpIHsgeC5oYW5kbGUodCwgYSk7IH07IH07XG4gICAgICAgICAgICAgICAgaW1wbC5vbm1pZGkgPSBtYWtlSGFuZGxlKGltcGwpO1xuICAgICAgICAgICAgICAgIHZhciBwbHVnaW4gPSBfZW5naW5lLl9wb29sW19lbmdpbmUuX2luQXJyLmxlbmd0aF07XG4gICAgICAgICAgICAgICAgaW1wbC5wbHVnaW4gPSBwbHVnaW47XG4gICAgICAgICAgICAgICAgX2VuZ2luZS5faW5BcnIucHVzaChpbXBsKTtcbiAgICAgICAgICAgICAgICBfZW5naW5lLl9pbk1hcFtuYW1lXSA9IGltcGw7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoIWltcGwub3Blbikge1xuICAgICAgICAgICAgICAgIHZhciBzID0gaW1wbC5wbHVnaW4uTWlkaUluT3BlbihuYW1lLCBpbXBsLm9ubWlkaSk7XG4gICAgICAgICAgICAgICAgaWYgKHMgIT09IG5hbWUpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHMpIGltcGwucGx1Z2luLk1pZGlJbkNsb3NlKCk7XG4gICAgICAgICAgICAgICAgICAgIHBvcnQuX2JyZWFrKCk7IHJldHVybjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaW1wbC5vcGVuID0gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHBvcnQuX29yaWcuX2ltcGwgPSBpbXBsO1xuICAgICAgICAgICAgX3B1c2goaW1wbC5jbGllbnRzLCBwb3J0Ll9vcmlnKTtcbiAgICAgICAgICAgIHBvcnQuX2luZm8gPSBpbXBsLmluZm87XG4gICAgICAgICAgICBwb3J0Ll9jbG9zZSA9IGZ1bmN0aW9uICgpIHsgaW1wbC5fY2xvc2UodGhpcyk7IH1cbiAgICAgICAgfVxuICAgICAgICBfZW5naW5lLl9jbG9zZU91dCA9IGZ1bmN0aW9uIChwb3J0KSB7XG4gICAgICAgICAgICB2YXIgaW1wbCA9IHBvcnQuX2ltcGw7XG4gICAgICAgICAgICBfcG9wKGltcGwuY2xpZW50cywgcG9ydC5fb3JpZyk7XG4gICAgICAgICAgICBpZiAoIWltcGwuY2xpZW50cy5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICBpbXBsLm9wZW4gPSBmYWxzZTtcbiAgICAgICAgICAgICAgICBpbXBsLnBsdWdpbi5NaWRpT3V0Q2xvc2UoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBfZW5naW5lLl9jbG9zZUluID0gZnVuY3Rpb24gKHBvcnQpIHtcbiAgICAgICAgICAgIHZhciBpbXBsID0gcG9ydC5faW1wbDtcbiAgICAgICAgICAgIF9wb3AoaW1wbC5jbGllbnRzLCBwb3J0Ll9vcmlnKTtcbiAgICAgICAgICAgIGlmICghaW1wbC5jbGllbnRzLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgIGltcGwub3BlbiA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIGltcGwucGx1Z2luLk1pZGlJbkNsb3NlKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgX2VuZ2luZS5fY2xvc2UgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IF9lbmdpbmUuX2luQXJyLmxlbmd0aDsgaSsrKSBpZiAoX2VuZ2luZS5faW5BcnJbaV0ub3BlbikgX2VuZ2luZS5faW5BcnJbaV0ucGx1Z2luLk1pZGlJbkNsb3NlKCk7XG4gICAgICAgIH1cbiAgICAgICAgX0oucHJvdG90eXBlLl90aW1lID0gZnVuY3Rpb24gKCkgeyByZXR1cm4gX2VuZ2luZS5fbWFpbi5UaW1lKCk7IH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiBfaW5pdE5vZGUob2JqKSB7XG4gICAgICAgIF9lbmdpbmUuX3R5cGUgPSAnbm9kZSc7XG4gICAgICAgIF9lbmdpbmUuX21haW4gPSBvYmo7XG4gICAgICAgIF9lbmdpbmUuX3Bvb2wgPSBbXTtcbiAgICAgICAgX2VuZ2luZS5fbmV3UGx1Z2luID0gZnVuY3Rpb24gKCkgeyByZXR1cm4gbmV3IG9iai5NSURJKCk7IH1cbiAgICAgICAgX2luaXRFbmdpbmVKUCgpO1xuICAgIH1cbiAgICBmdW5jdGlvbiBfaW5pdEphenpQbHVnaW4ob2JqKSB7XG4gICAgICAgIF9lbmdpbmUuX3R5cGUgPSAncGx1Z2luJztcbiAgICAgICAgX2VuZ2luZS5fbWFpbiA9IG9iajtcbiAgICAgICAgX2VuZ2luZS5fcG9vbCA9IFtvYmpdO1xuICAgICAgICBfZW5naW5lLl9uZXdQbHVnaW4gPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgcGxnID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnb2JqZWN0Jyk7XG4gICAgICAgICAgICBwbGcuc3R5bGUudmlzaWJpbGl0eSA9ICdoaWRkZW4nO1xuICAgICAgICAgICAgcGxnLnN0eWxlLndpZHRoID0gJzBweCc7IG9iai5zdHlsZS5oZWlnaHQgPSAnMHB4JztcbiAgICAgICAgICAgIHBsZy5jbGFzc2lkID0gJ0NMU0lEOjFBQ0UxNjE4LTFDN0QtNDU2MS1BRUUxLTM0ODQyQUE4NUU5MCc7XG4gICAgICAgICAgICBwbGcudHlwZSA9ICdhdWRpby94LWphenonO1xuICAgICAgICAgICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChwbGcpO1xuICAgICAgICAgICAgcmV0dXJuIHBsZy5pc0phenogPyBwbGcgOiB1bmRlZmluZWQ7XG4gICAgICAgIH1cbiAgICAgICAgX2luaXRFbmdpbmVKUCgpO1xuICAgIH1cbiAgICBmdW5jdGlvbiBfaW5pdFdlYk1JREkoYWNjZXNzLCBzeXNleCkge1xuICAgICAgICBfZW5naW5lLl90eXBlID0gJ3dlYm1pZGknO1xuICAgICAgICBfZW5naW5lLl92ZXJzaW9uID0gNDM7XG4gICAgICAgIF9lbmdpbmUuX3N5c2V4ID0gISFzeXNleDtcbiAgICAgICAgX2VuZ2luZS5fYWNjZXNzID0gYWNjZXNzO1xuICAgICAgICBfZW5naW5lLl9pbk1hcCA9IHt9O1xuICAgICAgICBfZW5naW5lLl9vdXRNYXAgPSB7fTtcbiAgICAgICAgX2VuZ2luZS5fcmVmcmVzaCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIF9lbmdpbmUuX291dHMgPSBbXTtcbiAgICAgICAgICAgIF9lbmdpbmUuX2lucyA9IFtdO1xuICAgICAgICAgICAgX2VuZ2luZS5fYWNjZXNzLm91dHB1dHMuZm9yRWFjaChmdW5jdGlvbiAocG9ydCwga2V5KSB7XG4gICAgICAgICAgICAgICAgX2VuZ2luZS5fb3V0cy5wdXNoKHsgdHlwZTogX2VuZ2luZS5fdHlwZSwgbmFtZTogcG9ydC5uYW1lLCBtYW51ZmFjdHVyZXI6IHBvcnQubWFudWZhY3R1cmVyLCB2ZXJzaW9uOiBwb3J0LnZlcnNpb24gfSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIF9lbmdpbmUuX2FjY2Vzcy5pbnB1dHMuZm9yRWFjaChmdW5jdGlvbiAocG9ydCwga2V5KSB7XG4gICAgICAgICAgICAgICAgX2VuZ2luZS5faW5zLnB1c2goeyB0eXBlOiBfZW5naW5lLl90eXBlLCBuYW1lOiBwb3J0Lm5hbWUsIG1hbnVmYWN0dXJlcjogcG9ydC5tYW51ZmFjdHVyZXIsIHZlcnNpb246IHBvcnQudmVyc2lvbiB9KTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIF9lbmdpbmUuX29wZW5PdXQgPSBmdW5jdGlvbiAocG9ydCwgbmFtZSkge1xuICAgICAgICAgICAgdmFyIGltcGwgPSBfZW5naW5lLl9vdXRNYXBbbmFtZV07XG4gICAgICAgICAgICBpZiAoIWltcGwpIHtcbiAgICAgICAgICAgICAgICBpbXBsID0ge1xuICAgICAgICAgICAgICAgICAgICBuYW1lOiBuYW1lLFxuICAgICAgICAgICAgICAgICAgICBjbGllbnRzOiBbXSxcbiAgICAgICAgICAgICAgICAgICAgaW5mbzoge1xuICAgICAgICAgICAgICAgICAgICAgICAgbmFtZTogbmFtZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG1hbnVmYWN0dXJlcjogX2VuZ2luZS5fYWxsT3V0c1tuYW1lXS5tYW51ZmFjdHVyZXIsXG4gICAgICAgICAgICAgICAgICAgICAgICB2ZXJzaW9uOiBfZW5naW5lLl9hbGxPdXRzW25hbWVdLnZlcnNpb24sXG4gICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiAnTUlESS1vdXQnLFxuICAgICAgICAgICAgICAgICAgICAgICAgc3lzZXg6IF9lbmdpbmUuX3N5c2V4LFxuICAgICAgICAgICAgICAgICAgICAgICAgZW5naW5lOiBfZW5naW5lLl90eXBlXG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIF9jbG9zZTogZnVuY3Rpb24gKHBvcnQpIHsgX2VuZ2luZS5fY2xvc2VPdXQocG9ydCk7IH0sXG4gICAgICAgICAgICAgICAgICAgIF9yZWNlaXZlOiBmdW5jdGlvbiAoYSkgeyB0aGlzLmRldi5zZW5kKGEuc2xpY2UoKSk7IH1cbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIHZhciBpZCwgZGV2O1xuICAgICAgICAgICAgICAgIF9lbmdpbmUuX2FjY2Vzcy5vdXRwdXRzLmZvckVhY2goZnVuY3Rpb24gKGRldiwga2V5KSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChkZXYubmFtZSA9PT0gbmFtZSkgaW1wbC5kZXYgPSBkZXY7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgaWYgKGltcGwuZGV2KSB7XG4gICAgICAgICAgICAgICAgICAgIF9lbmdpbmUuX291dE1hcFtuYW1lXSA9IGltcGw7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2UgaW1wbCA9IHVuZGVmaW5lZDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChpbXBsKSB7XG4gICAgICAgICAgICAgICAgaWYgKGltcGwuZGV2Lm9wZW4pIGltcGwuZGV2Lm9wZW4oKTtcbiAgICAgICAgICAgICAgICBwb3J0Ll9vcmlnLl9pbXBsID0gaW1wbDtcbiAgICAgICAgICAgICAgICBfcHVzaChpbXBsLmNsaWVudHMsIHBvcnQuX29yaWcpO1xuICAgICAgICAgICAgICAgIHBvcnQuX2luZm8gPSBpbXBsLmluZm87XG4gICAgICAgICAgICAgICAgcG9ydC5fcmVjZWl2ZSA9IGZ1bmN0aW9uIChhcmcpIHsgaW1wbC5fcmVjZWl2ZShhcmcpOyB9XG4gICAgICAgICAgICAgICAgcG9ydC5fY2xvc2UgPSBmdW5jdGlvbiAoKSB7IGltcGwuX2Nsb3NlKHRoaXMpOyB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHBvcnQuX2JyZWFrKCk7XG4gICAgICAgIH1cbiAgICAgICAgX2VuZ2luZS5fb3BlbkluID0gZnVuY3Rpb24gKHBvcnQsIG5hbWUpIHtcbiAgICAgICAgICAgIHZhciBpbXBsID0gX2VuZ2luZS5faW5NYXBbbmFtZV07XG4gICAgICAgICAgICBpZiAoIWltcGwpIHtcbiAgICAgICAgICAgICAgICBpbXBsID0ge1xuICAgICAgICAgICAgICAgICAgICBuYW1lOiBuYW1lLFxuICAgICAgICAgICAgICAgICAgICBjbGllbnRzOiBbXSxcbiAgICAgICAgICAgICAgICAgICAgaW5mbzoge1xuICAgICAgICAgICAgICAgICAgICAgICAgbmFtZTogbmFtZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG1hbnVmYWN0dXJlcjogX2VuZ2luZS5fYWxsSW5zW25hbWVdLm1hbnVmYWN0dXJlcixcbiAgICAgICAgICAgICAgICAgICAgICAgIHZlcnNpb246IF9lbmdpbmUuX2FsbEluc1tuYW1lXS52ZXJzaW9uLFxuICAgICAgICAgICAgICAgICAgICAgICAgdHlwZTogJ01JREktaW4nLFxuICAgICAgICAgICAgICAgICAgICAgICAgc3lzZXg6IF9lbmdpbmUuX3N5c2V4LFxuICAgICAgICAgICAgICAgICAgICAgICAgZW5naW5lOiBfZW5naW5lLl90eXBlXG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIF9jbG9zZTogZnVuY3Rpb24gKHBvcnQpIHsgX2VuZ2luZS5fY2xvc2VJbihwb3J0KTsgfSxcbiAgICAgICAgICAgICAgICAgICAgaGFuZGxlOiBmdW5jdGlvbiAoZXZ0KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMuY2xpZW50cy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBtc2cgPSBNSURJKFtdLnNsaWNlLmNhbGwoZXZ0LmRhdGEpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmNsaWVudHNbaV0uX2VtaXQobXNnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgdmFyIGlkLCBkZXY7XG4gICAgICAgICAgICAgICAgX2VuZ2luZS5fYWNjZXNzLmlucHV0cy5mb3JFYWNoKGZ1bmN0aW9uIChkZXYsIGtleSkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoZGV2Lm5hbWUgPT09IG5hbWUpIGltcGwuZGV2ID0gZGV2O1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIGlmIChpbXBsLmRldikge1xuICAgICAgICAgICAgICAgICAgICBmdW5jdGlvbiBtYWtlSGFuZGxlKHgpIHsgcmV0dXJuIGZ1bmN0aW9uIChldnQpIHsgeC5oYW5kbGUoZXZ0KTsgfTsgfTtcbiAgICAgICAgICAgICAgICAgICAgaW1wbC5kZXYub25taWRpbWVzc2FnZSA9IG1ha2VIYW5kbGUoaW1wbCk7XG4gICAgICAgICAgICAgICAgICAgIF9lbmdpbmUuX2luTWFwW25hbWVdID0gaW1wbDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSBpbXBsID0gdW5kZWZpbmVkO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGltcGwpIHtcbiAgICAgICAgICAgICAgICBpZiAoaW1wbC5kZXYub3BlbikgaW1wbC5kZXYub3BlbigpO1xuICAgICAgICAgICAgICAgIHBvcnQuX29yaWcuX2ltcGwgPSBpbXBsO1xuICAgICAgICAgICAgICAgIF9wdXNoKGltcGwuY2xpZW50cywgcG9ydC5fb3JpZyk7XG4gICAgICAgICAgICAgICAgcG9ydC5faW5mbyA9IGltcGwuaW5mbztcbiAgICAgICAgICAgICAgICBwb3J0Ll9jbG9zZSA9IGZ1bmN0aW9uICgpIHsgaW1wbC5fY2xvc2UodGhpcyk7IH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgcG9ydC5fYnJlYWsoKTtcbiAgICAgICAgfVxuICAgICAgICBfZW5naW5lLl9jbG9zZU91dCA9IGZ1bmN0aW9uIChwb3J0KSB7XG4gICAgICAgICAgICB2YXIgaW1wbCA9IHBvcnQuX2ltcGw7XG4gICAgICAgICAgICBpZiAoIWltcGwuY2xpZW50cy5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICBpZiAoaW1wbC5kZXYuY2xvc2UpIGltcGwuZGV2LmNsb3NlKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBfcG9wKGltcGwuY2xpZW50cywgcG9ydC5fb3JpZyk7XG4gICAgICAgIH1cbiAgICAgICAgX2VuZ2luZS5fY2xvc2VJbiA9IGZ1bmN0aW9uIChwb3J0KSB7XG4gICAgICAgICAgICB2YXIgaW1wbCA9IHBvcnQuX2ltcGw7XG4gICAgICAgICAgICBfcG9wKGltcGwuY2xpZW50cywgcG9ydC5fb3JpZyk7XG4gICAgICAgICAgICBpZiAoIWltcGwuY2xpZW50cy5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICBpZiAoaW1wbC5kZXYuY2xvc2UpIGltcGwuZGV2LmNsb3NlKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgX2VuZ2luZS5fY2xvc2UgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIH1cbiAgICB9XG4gICAgZnVuY3Rpb24gX2luaXRDUlgobXNnLCB2ZXIpIHtcbiAgICAgICAgX2VuZ2luZS5fdHlwZSA9ICdleHRlbnNpb24nO1xuICAgICAgICBfZW5naW5lLl92ZXJzaW9uID0gdmVyO1xuICAgICAgICBfZW5naW5lLl9zeXNleCA9IHRydWU7XG4gICAgICAgIF9lbmdpbmUuX3Bvb2wgPSBbXTtcbiAgICAgICAgX2VuZ2luZS5faW5BcnIgPSBbXTtcbiAgICAgICAgX2VuZ2luZS5fb3V0QXJyID0gW107XG4gICAgICAgIF9lbmdpbmUuX2luTWFwID0ge307XG4gICAgICAgIF9lbmdpbmUuX291dE1hcCA9IHt9O1xuICAgICAgICBfZW5naW5lLl9tc2cgPSBtc2c7XG4gICAgICAgIF9lbmdpbmUuX25ld1BsdWdpbiA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHZhciBwbHVnaW4gPSB7IGlkOiBfZW5naW5lLl9wb29sLmxlbmd0aCB9O1xuICAgICAgICAgICAgaWYgKCFwbHVnaW4uaWQpIHBsdWdpbi5yZWFkeSA9IHRydWU7XG4gICAgICAgICAgICBlbHNlIGRvY3VtZW50LmRpc3BhdGNoRXZlbnQobmV3IEN1c3RvbUV2ZW50KCdqYXp6LW1pZGknLCB7IGRldGFpbDogWyduZXcnXSB9KSk7XG4gICAgICAgICAgICBfZW5naW5lLl9wb29sLnB1c2gocGx1Z2luKTtcbiAgICAgICAgfVxuICAgICAgICBfZW5naW5lLl9uZXdQbHVnaW4oKTtcbiAgICAgICAgX2VuZ2luZS5fcmVmcmVzaCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIF9lbmdpbmUuX291dHMgPSBbXTtcbiAgICAgICAgICAgIF9lbmdpbmUuX2lucyA9IFtdO1xuICAgICAgICAgICAgX2p6ei5fcGF1c2UoKTtcbiAgICAgICAgICAgIGRvY3VtZW50LmRpc3BhdGNoRXZlbnQobmV3IEN1c3RvbUV2ZW50KCdqYXp6LW1pZGknLCB7IGRldGFpbDogWydyZWZyZXNoJ10gfSkpO1xuICAgICAgICB9XG4gICAgICAgIF9lbmdpbmUuX29wZW5PdXQgPSBmdW5jdGlvbiAocG9ydCwgbmFtZSkge1xuICAgICAgICAgICAgdmFyIGltcGwgPSBfZW5naW5lLl9vdXRNYXBbbmFtZV07XG4gICAgICAgICAgICBpZiAoIWltcGwpIHtcbiAgICAgICAgICAgICAgICBpZiAoX2VuZ2luZS5fcG9vbC5sZW5ndGggPD0gX2VuZ2luZS5fb3V0QXJyLmxlbmd0aCkgX2VuZ2luZS5fbmV3UGx1Z2luKCk7XG4gICAgICAgICAgICAgICAgdmFyIHBsdWdpbiA9IF9lbmdpbmUuX3Bvb2xbX2VuZ2luZS5fb3V0QXJyLmxlbmd0aF07XG4gICAgICAgICAgICAgICAgaW1wbCA9IHtcbiAgICAgICAgICAgICAgICAgICAgbmFtZTogbmFtZSxcbiAgICAgICAgICAgICAgICAgICAgY2xpZW50czogW10sXG4gICAgICAgICAgICAgICAgICAgIGluZm86IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG5hbWU6IG5hbWUsXG4gICAgICAgICAgICAgICAgICAgICAgICBtYW51ZmFjdHVyZXI6IF9lbmdpbmUuX2FsbE91dHNbbmFtZV0ubWFudWZhY3R1cmVyLFxuICAgICAgICAgICAgICAgICAgICAgICAgdmVyc2lvbjogX2VuZ2luZS5fYWxsT3V0c1tuYW1lXS52ZXJzaW9uLFxuICAgICAgICAgICAgICAgICAgICAgICAgdHlwZTogJ01JREktb3V0JyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHN5c2V4OiBfZW5naW5lLl9zeXNleCxcbiAgICAgICAgICAgICAgICAgICAgICAgIGVuZ2luZTogX2VuZ2luZS5fdHlwZVxuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICBfc3RhcnQ6IGZ1bmN0aW9uICgpIHsgZG9jdW1lbnQuZGlzcGF0Y2hFdmVudChuZXcgQ3VzdG9tRXZlbnQoJ2phenotbWlkaScsIHsgZGV0YWlsOiBbJ29wZW5vdXQnLCBwbHVnaW4uaWQsIG5hbWVdIH0pKTsgfSxcbiAgICAgICAgICAgICAgICAgICAgX2Nsb3NlOiBmdW5jdGlvbiAocG9ydCkgeyBfZW5naW5lLl9jbG9zZU91dChwb3J0KTsgfSxcbiAgICAgICAgICAgICAgICAgICAgX3JlY2VpdmU6IGZ1bmN0aW9uIChhKSB7IHZhciB2ID0gYS5zbGljZSgpOyB2LnNwbGljZSgwLCAwLCAncGxheScsIHBsdWdpbi5pZCk7IGRvY3VtZW50LmRpc3BhdGNoRXZlbnQobmV3IEN1c3RvbUV2ZW50KCdqYXp6LW1pZGknLCB7IGRldGFpbDogdiB9KSk7IH1cbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIGltcGwucGx1Z2luID0gcGx1Z2luO1xuICAgICAgICAgICAgICAgIHBsdWdpbi5vdXRwdXQgPSBpbXBsO1xuICAgICAgICAgICAgICAgIF9lbmdpbmUuX291dEFyci5wdXNoKGltcGwpO1xuICAgICAgICAgICAgICAgIF9lbmdpbmUuX291dE1hcFtuYW1lXSA9IGltcGw7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBwb3J0Ll9vcmlnLl9pbXBsID0gaW1wbDtcbiAgICAgICAgICAgIF9wdXNoKGltcGwuY2xpZW50cywgcG9ydC5fb3JpZyk7XG4gICAgICAgICAgICBwb3J0Ll9pbmZvID0gaW1wbC5pbmZvO1xuICAgICAgICAgICAgcG9ydC5fcmVjZWl2ZSA9IGZ1bmN0aW9uIChhcmcpIHsgaW1wbC5fcmVjZWl2ZShhcmcpOyB9XG4gICAgICAgICAgICBwb3J0Ll9jbG9zZSA9IGZ1bmN0aW9uICgpIHsgaW1wbC5fY2xvc2UodGhpcyk7IH1cbiAgICAgICAgICAgIGlmICghaW1wbC5vcGVuKSB7XG4gICAgICAgICAgICAgICAgaWYgKGltcGwucGx1Z2luLnJlYWR5KSBpbXBsLl9zdGFydCgpO1xuICAgICAgICAgICAgICAgIHBvcnQuX3BhdXNlKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgX2VuZ2luZS5fb3BlbkluID0gZnVuY3Rpb24gKHBvcnQsIG5hbWUpIHtcbiAgICAgICAgICAgIHZhciBpbXBsID0gX2VuZ2luZS5faW5NYXBbbmFtZV07XG4gICAgICAgICAgICBpZiAoIWltcGwpIHtcbiAgICAgICAgICAgICAgICBpZiAoX2VuZ2luZS5fcG9vbC5sZW5ndGggPD0gX2VuZ2luZS5faW5BcnIubGVuZ3RoKSBfZW5naW5lLl9uZXdQbHVnaW4oKTtcbiAgICAgICAgICAgICAgICB2YXIgcGx1Z2luID0gX2VuZ2luZS5fcG9vbFtfZW5naW5lLl9pbkFyci5sZW5ndGhdO1xuICAgICAgICAgICAgICAgIGltcGwgPSB7XG4gICAgICAgICAgICAgICAgICAgIG5hbWU6IG5hbWUsXG4gICAgICAgICAgICAgICAgICAgIGNsaWVudHM6IFtdLFxuICAgICAgICAgICAgICAgICAgICBpbmZvOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBuYW1lOiBuYW1lLFxuICAgICAgICAgICAgICAgICAgICAgICAgbWFudWZhY3R1cmVyOiBfZW5naW5lLl9hbGxJbnNbbmFtZV0ubWFudWZhY3R1cmVyLFxuICAgICAgICAgICAgICAgICAgICAgICAgdmVyc2lvbjogX2VuZ2luZS5fYWxsSW5zW25hbWVdLnZlcnNpb24sXG4gICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiAnTUlESS1pbicsXG4gICAgICAgICAgICAgICAgICAgICAgICBzeXNleDogX2VuZ2luZS5fc3lzZXgsXG4gICAgICAgICAgICAgICAgICAgICAgICBlbmdpbmU6IF9lbmdpbmUuX3R5cGVcbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgX3N0YXJ0OiBmdW5jdGlvbiAoKSB7IGRvY3VtZW50LmRpc3BhdGNoRXZlbnQobmV3IEN1c3RvbUV2ZW50KCdqYXp6LW1pZGknLCB7IGRldGFpbDogWydvcGVuaW4nLCBwbHVnaW4uaWQsIG5hbWVdIH0pKTsgfSxcbiAgICAgICAgICAgICAgICAgICAgX2Nsb3NlOiBmdW5jdGlvbiAocG9ydCkgeyBfZW5naW5lLl9jbG9zZUluKHBvcnQpOyB9XG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICBpbXBsLnBsdWdpbiA9IHBsdWdpbjtcbiAgICAgICAgICAgICAgICBwbHVnaW4uaW5wdXQgPSBpbXBsO1xuICAgICAgICAgICAgICAgIF9lbmdpbmUuX2luQXJyLnB1c2goaW1wbCk7XG4gICAgICAgICAgICAgICAgX2VuZ2luZS5faW5NYXBbbmFtZV0gPSBpbXBsO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcG9ydC5fb3JpZy5faW1wbCA9IGltcGw7XG4gICAgICAgICAgICBfcHVzaChpbXBsLmNsaWVudHMsIHBvcnQuX29yaWcpO1xuICAgICAgICAgICAgcG9ydC5faW5mbyA9IGltcGwuaW5mbztcbiAgICAgICAgICAgIHBvcnQuX2Nsb3NlID0gZnVuY3Rpb24gKCkgeyBpbXBsLl9jbG9zZSh0aGlzKTsgfVxuICAgICAgICAgICAgaWYgKCFpbXBsLm9wZW4pIHtcbiAgICAgICAgICAgICAgICBpZiAoaW1wbC5wbHVnaW4ucmVhZHkpIGltcGwuX3N0YXJ0KCk7XG4gICAgICAgICAgICAgICAgcG9ydC5fcGF1c2UoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBfZW5naW5lLl9jbG9zZU91dCA9IGZ1bmN0aW9uIChwb3J0KSB7XG4gICAgICAgICAgICB2YXIgaW1wbCA9IHBvcnQuX2ltcGw7XG4gICAgICAgICAgICBfcG9wKGltcGwuY2xpZW50cywgcG9ydC5fb3JpZyk7XG4gICAgICAgICAgICBpZiAoIWltcGwuY2xpZW50cy5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICBpbXBsLm9wZW4gPSBmYWxzZTtcbiAgICAgICAgICAgICAgICBkb2N1bWVudC5kaXNwYXRjaEV2ZW50KG5ldyBDdXN0b21FdmVudCgnamF6ei1taWRpJywgeyBkZXRhaWw6IFsnY2xvc2VvdXQnLCBpbXBsLnBsdWdpbi5pZF0gfSkpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIF9lbmdpbmUuX2Nsb3NlSW4gPSBmdW5jdGlvbiAocG9ydCkge1xuICAgICAgICAgICAgdmFyIGltcGwgPSBwb3J0Ll9pbXBsO1xuICAgICAgICAgICAgX3BvcChpbXBsLmNsaWVudHMsIHBvcnQuX29yaWcpO1xuICAgICAgICAgICAgaWYgKCFpbXBsLmNsaWVudHMubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgaW1wbC5vcGVuID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgZG9jdW1lbnQuZGlzcGF0Y2hFdmVudChuZXcgQ3VzdG9tRXZlbnQoJ2phenotbWlkaScsIHsgZGV0YWlsOiBbJ2Nsb3NlaW4nLCBpbXBsLnBsdWdpbi5pZF0gfSkpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIF9lbmdpbmUuX2Nsb3NlID0gZnVuY3Rpb24gKCkge1xuICAgICAgICB9XG4gICAgICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2phenotbWlkaS1tc2cnLCBmdW5jdGlvbiAoZSkge1xuICAgICAgICAgICAgdmFyIHYgPSBfZW5naW5lLl9tc2cuaW5uZXJUZXh0LnNwbGl0KCdcXG4nKTtcbiAgICAgICAgICAgIF9lbmdpbmUuX21zZy5pbm5lclRleHQgPSAnJztcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdi5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgIHZhciBhID0gW107XG4gICAgICAgICAgICAgICAgdHJ5IHsgYSA9IEpTT04ucGFyc2UodltpXSk7IH0gY2F0Y2ggKGUpIHsgfVxuICAgICAgICAgICAgICAgIGlmICghYS5sZW5ndGgpIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgIGlmIChhWzBdID09PSAncmVmcmVzaCcpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGFbMV0uaW5zKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBmb3IgKHZhciBqID0gMDsgaSA8IGFbMV0uaW5zOyBpKyspIGFbMV0uaW5zW2pdLnR5cGUgPSBfZW5naW5lLl90eXBlO1xuICAgICAgICAgICAgICAgICAgICAgICAgX2VuZ2luZS5faW5zID0gYVsxXS5pbnM7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgaWYgKGFbMV0ub3V0cykge1xuICAgICAgICAgICAgICAgICAgICAgICAgZm9yICh2YXIgaiA9IDA7IGkgPCBhWzFdLm91dHM7IGkrKykgYVsxXS5vdXRzW2pdLnR5cGUgPSBfZW5naW5lLl90eXBlO1xuICAgICAgICAgICAgICAgICAgICAgICAgX2VuZ2luZS5fb3V0cyA9IGFbMV0ub3V0cztcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBfanp6Ll9yZXN1bWUoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSBpZiAoYVswXSA9PT0gJ3ZlcnNpb24nKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBwbHVnaW4gPSBfZW5naW5lLl9wb29sW2FbMV1dO1xuICAgICAgICAgICAgICAgICAgICBpZiAocGx1Z2luKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBwbHVnaW4ucmVhZHkgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHBsdWdpbi5pbnB1dCkgcGx1Z2luLmlucHV0Ll9zdGFydCgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHBsdWdpbi5vdXRwdXQpIHBsdWdpbi5vdXRwdXQuX3N0YXJ0KCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSBpZiAoYVswXSA9PT0gJ29wZW5vdXQnKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBpbXBsID0gX2VuZ2luZS5fcG9vbFthWzFdXS5vdXRwdXQ7XG4gICAgICAgICAgICAgICAgICAgIGlmIChpbXBsKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoYVsyXSA9PSBpbXBsLm5hbWUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbXBsLm9wZW4gPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChpbXBsLmNsaWVudHMpIGZvciAodmFyIGkgPSAwOyBpIDwgaW1wbC5jbGllbnRzLmxlbmd0aDsgaSsrKSBpbXBsLmNsaWVudHNbaV0uX3Jlc3VtZSgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgZWxzZSBpZiAoaW1wbC5jbGllbnRzKSBmb3IgKHZhciBpID0gMDsgaSA8IGltcGwuY2xpZW50cy5sZW5ndGg7IGkrKykgaW1wbC5jbGllbnRzW2ldLl9jcmFzaCgpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2UgaWYgKGFbMF0gPT09ICdvcGVuaW4nKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBpbXBsID0gX2VuZ2luZS5fcG9vbFthWzFdXS5pbnB1dDtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGltcGwpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChhWzJdID09IGltcGwubmFtZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGltcGwub3BlbiA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGltcGwuY2xpZW50cykgZm9yICh2YXIgaSA9IDA7IGkgPCBpbXBsLmNsaWVudHMubGVuZ3RoOyBpKyspIGltcGwuY2xpZW50c1tpXS5fcmVzdW1lKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBlbHNlIGlmIChpbXBsLmNsaWVudHMpIGZvciAodmFyIGkgPSAwOyBpIDwgaW1wbC5jbGllbnRzLmxlbmd0aDsgaSsrKSBpbXBsLmNsaWVudHNbaV0uX2NyYXNoKCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSBpZiAoYVswXSA9PT0gJ21pZGknKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBpbXBsID0gX2VuZ2luZS5fcG9vbFthWzFdXS5pbnB1dDtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGltcGwgJiYgaW1wbC5jbGllbnRzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGltcGwuY2xpZW50cy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBtc2cgPSBNSURJKGEuc2xpY2UoMykpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGltcGwuY2xpZW50c1tpXS5fZW1pdChtc2cpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICB2YXIgSlpaID0gZnVuY3Rpb24gKG9wdCkge1xuICAgICAgICBpZiAoIV9qenopIF9pbml0SlpaKG9wdCk7XG4gICAgICAgIHJldHVybiBfanp6O1xuICAgIH1cbiAgICBKWlouaW5mbyA9IGZ1bmN0aW9uICgpIHsgcmV0dXJuIF9KLnByb3RvdHlwZS5pbmZvKCk7IH1cbiAgICBKWlouY3JlYXRlTmV3ID0gZnVuY3Rpb24gKGFyZykge1xuICAgICAgICB2YXIgb2JqID0gbmV3IF9NKCk7XG4gICAgICAgIGlmIChhcmcgaW5zdGFuY2VvZiBPYmplY3QpIGZvciAodmFyIGsgaW4gYXJnKSBpZiAoYXJnLmhhc093blByb3BlcnR5KGspKSBvYmpba10gPSBhcmdba107XG4gICAgICAgIG9iai5fcmVzdW1lKCk7XG4gICAgICAgIHJldHVybiBvYmo7XG4gICAgfVxuICAgIF9KLnByb3RvdHlwZS5jcmVhdGVOZXcgPSBKWlouY3JlYXRlTmV3O1xuXG4gICAgLy8gSlpaLlNNUFRFXG5cbiAgICBmdW5jdGlvbiBTTVBURSgpIHtcbiAgICAgICAgdmFyIHNlbGYgPSB0aGlzIGluc3RhbmNlb2YgU01QVEUgPyB0aGlzIDogc2VsZiA9IG5ldyBTTVBURSgpO1xuICAgICAgICBTTVBURS5wcm90b3R5cGUucmVzZXQuYXBwbHkoc2VsZiwgYXJndW1lbnRzKTtcbiAgICAgICAgcmV0dXJuIHNlbGY7XG4gICAgfVxuICAgIFNNUFRFLnByb3RvdHlwZS5yZXNldCA9IGZ1bmN0aW9uIChhcmcpIHtcbiAgICAgICAgaWYgKGFyZyBpbnN0YW5jZW9mIFNNUFRFKSB7XG4gICAgICAgICAgICB0aGlzLnNldFR5cGUoYXJnLmdldFR5cGUoKSk7XG4gICAgICAgICAgICB0aGlzLnNldEhvdXIoYXJnLmdldEhvdXIoKSk7XG4gICAgICAgICAgICB0aGlzLnNldE1pbnV0ZShhcmcuZ2V0TWludXRlKCkpO1xuICAgICAgICAgICAgdGhpcy5zZXRTZWNvbmQoYXJnLmdldFNlY29uZCgpKTtcbiAgICAgICAgICAgIHRoaXMuc2V0RnJhbWUoYXJnLmdldEZyYW1lKCkpO1xuICAgICAgICAgICAgdGhpcy5zZXRRdWFydGVyKGFyZy5nZXRRdWFydGVyKCkpO1xuICAgICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgIH1cbiAgICAgICAgdmFyIGFyciA9IGFyZyBpbnN0YW5jZW9mIEFycmF5ID8gYXJnIDogYXJndW1lbnRzO1xuICAgICAgICB0aGlzLnNldFR5cGUoYXJyWzBdKTtcbiAgICAgICAgdGhpcy5zZXRIb3VyKGFyclsxXSk7XG4gICAgICAgIHRoaXMuc2V0TWludXRlKGFyclsyXSk7XG4gICAgICAgIHRoaXMuc2V0U2Vjb25kKGFyclszXSk7XG4gICAgICAgIHRoaXMuc2V0RnJhbWUoYXJyWzRdKTtcbiAgICAgICAgdGhpcy5zZXRRdWFydGVyKGFycls1XSk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cbiAgICBmdW5jdGlvbiBfZml4RHJvcEZyYW1lKCkgeyBpZiAodGhpcy50eXBlID09IDI5Ljk3ICYmICF0aGlzLnNlY29uZCAmJiB0aGlzLmZyYW1lIDwgMiAmJiB0aGlzLm1pbnV0ZSAlIDEwKSB0aGlzLmZyYW1lID0gMjsgfVxuICAgIFNNUFRFLnByb3RvdHlwZS5pc0Z1bGxGcmFtZSA9IGZ1bmN0aW9uICgpIHsgcmV0dXJuIHRoaXMucXVhcnRlciA9PSAwIHx8IHRoaXMucXVhcnRlciA9PSA0OyB9XG4gICAgU01QVEUucHJvdG90eXBlLmdldFR5cGUgPSBmdW5jdGlvbiAoKSB7IHJldHVybiB0aGlzLnR5cGU7IH1cbiAgICBTTVBURS5wcm90b3R5cGUuZ2V0SG91ciA9IGZ1bmN0aW9uICgpIHsgcmV0dXJuIHRoaXMuaG91cjsgfVxuICAgIFNNUFRFLnByb3RvdHlwZS5nZXRNaW51dGUgPSBmdW5jdGlvbiAoKSB7IHJldHVybiB0aGlzLm1pbnV0ZTsgfVxuICAgIFNNUFRFLnByb3RvdHlwZS5nZXRTZWNvbmQgPSBmdW5jdGlvbiAoKSB7IHJldHVybiB0aGlzLnNlY29uZDsgfVxuICAgIFNNUFRFLnByb3RvdHlwZS5nZXRGcmFtZSA9IGZ1bmN0aW9uICgpIHsgcmV0dXJuIHRoaXMuZnJhbWU7IH1cbiAgICBTTVBURS5wcm90b3R5cGUuZ2V0UXVhcnRlciA9IGZ1bmN0aW9uICgpIHsgcmV0dXJuIHRoaXMucXVhcnRlcjsgfVxuICAgIFNNUFRFLnByb3RvdHlwZS5zZXRUeXBlID0gZnVuY3Rpb24gKHgpIHtcbiAgICAgICAgaWYgKHR5cGVvZiB4ID09ICd1bmRlZmluZWQnIHx8IHggPT0gMjQpIHRoaXMudHlwZSA9IDI0O1xuICAgICAgICBlbHNlIGlmICh4ID09IDI1KSB0aGlzLnR5cGUgPSAyNTtcbiAgICAgICAgZWxzZSBpZiAoeCA9PSAyOS45NykgeyB0aGlzLnR5cGUgPSAyOS45NzsgX2ZpeERyb3BGcmFtZS5hcHBseSh0aGlzKTsgfVxuICAgICAgICBlbHNlIGlmICh4ID09IDMwKSB0aGlzLnR5cGUgPSAzMDtcbiAgICAgICAgZWxzZSB0aHJvdyBSYW5nZUVycm9yKCdCYWQgU01QVEUgZnJhbWUgcmF0ZTogJyArIHgpO1xuICAgICAgICBpZiAodGhpcy5mcmFtZSA+PSB0aGlzLnR5cGUpIHRoaXMuZnJhbWUgPSB0aGlzLnR5cGUgPT0gMjkuOTcgPyAyOSA6IHRoaXMudHlwZSAtIDE7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cbiAgICBTTVBURS5wcm90b3R5cGUuc2V0SG91ciA9IGZ1bmN0aW9uICh4KSB7XG4gICAgICAgIGlmICh0eXBlb2YgeCA9PSAndW5kZWZpbmVkJykgeCA9IDA7XG4gICAgICAgIGlmICh4ICE9IHBhcnNlSW50KHgpIHx8IHggPCAwIHx8IHggPj0gMjQpIHRocm93IFJhbmdlRXJyb3IoJ0JhZCBTTVBURSBob3VycyB2YWx1ZTogJyArIHgpO1xuICAgICAgICB0aGlzLmhvdXIgPSB4O1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG4gICAgU01QVEUucHJvdG90eXBlLnNldE1pbnV0ZSA9IGZ1bmN0aW9uICh4KSB7XG4gICAgICAgIGlmICh0eXBlb2YgeCA9PSAndW5kZWZpbmVkJykgeCA9IDA7XG4gICAgICAgIGlmICh4ICE9IHBhcnNlSW50KHgpIHx8IHggPCAwIHx8IHggPj0gNjApIHRocm93IFJhbmdlRXJyb3IoJ0JhZCBTTVBURSBtaW51dGVzIHZhbHVlOiAnICsgeCk7XG4gICAgICAgIHRoaXMubWludXRlID0geDtcbiAgICAgICAgX2ZpeERyb3BGcmFtZS5hcHBseSh0aGlzKTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuICAgIFNNUFRFLnByb3RvdHlwZS5zZXRTZWNvbmQgPSBmdW5jdGlvbiAoeCkge1xuICAgICAgICBpZiAodHlwZW9mIHggPT0gJ3VuZGVmaW5lZCcpIHggPSAwO1xuICAgICAgICBpZiAoeCAhPSBwYXJzZUludCh4KSB8fCB4IDwgMCB8fCB4ID49IDYwKSB0aHJvdyBSYW5nZUVycm9yKCdCYWQgU01QVEUgc2Vjb25kcyB2YWx1ZTogJyArIHgpO1xuICAgICAgICB0aGlzLnNlY29uZCA9IHg7XG4gICAgICAgIF9maXhEcm9wRnJhbWUuYXBwbHkodGhpcyk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cbiAgICBTTVBURS5wcm90b3R5cGUuc2V0RnJhbWUgPSBmdW5jdGlvbiAoeCkge1xuICAgICAgICBpZiAodHlwZW9mIHggPT0gJ3VuZGVmaW5lZCcpIHggPSAwO1xuICAgICAgICBpZiAoeCAhPSBwYXJzZUludCh4KSB8fCB4IDwgMCB8fCB4ID49IHRoaXMudHlwZSkgdGhyb3cgUmFuZ2VFcnJvcignQmFkIFNNUFRFIGZyYW1lIG51bWJlcjogJyArIHgpO1xuICAgICAgICB0aGlzLmZyYW1lID0geDtcbiAgICAgICAgX2ZpeERyb3BGcmFtZS5hcHBseSh0aGlzKTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuICAgIFNNUFRFLnByb3RvdHlwZS5zZXRRdWFydGVyID0gZnVuY3Rpb24gKHgpIHtcbiAgICAgICAgaWYgKHR5cGVvZiB4ID09ICd1bmRlZmluZWQnKSB4ID0gMDtcbiAgICAgICAgaWYgKHggIT0gcGFyc2VJbnQoeCkgfHwgeCA8IDAgfHwgeCA+PSA4KSB0aHJvdyBSYW5nZUVycm9yKCdCYWQgU01QVEUgcXVhcnRlciBmcmFtZTogJyArIHgpO1xuICAgICAgICB0aGlzLnF1YXJ0ZXIgPSB4O1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG4gICAgU01QVEUucHJvdG90eXBlLmluY3JGcmFtZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdGhpcy5mcmFtZSsrO1xuICAgICAgICBpZiAodGhpcy5mcmFtZSA+PSB0aGlzLnR5cGUpIHtcbiAgICAgICAgICAgIHRoaXMuZnJhbWUgPSAwO1xuICAgICAgICAgICAgdGhpcy5zZWNvbmQrKztcbiAgICAgICAgICAgIGlmICh0aGlzLnNlY29uZCA+PSA2MCkge1xuICAgICAgICAgICAgICAgIHRoaXMuc2Vjb25kID0gMDtcbiAgICAgICAgICAgICAgICB0aGlzLm1pbnV0ZSsrO1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLm1pbnV0ZSA+PSA2MCkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLm1pbnV0ZSA9IDA7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuaG91ciA9IHRoaXMuaG91ciA+PSAyMyA/IDAgOiB0aGlzLmhvdXIgKyAxO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBfZml4RHJvcEZyYW1lLmFwcGx5KHRoaXMpO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG4gICAgU01QVEUucHJvdG90eXBlLmRlY3JGcmFtZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgaWYgKCF0aGlzLnNlY29uZCAmJiB0aGlzLmZyYW1lID09IDIgJiYgdGhpcy50eXBlID09IDI5Ljk3ICYmIHRoaXMubWludXRlICUgMTApIHRoaXMuZnJhbWUgPSAwOyAvLyBkcm9wLWZyYW1lXG4gICAgICAgIHRoaXMuZnJhbWUtLTtcbiAgICAgICAgaWYgKHRoaXMuZnJhbWUgPCAwKSB7XG4gICAgICAgICAgICB0aGlzLmZyYW1lID0gdGhpcy50eXBlID09IDI5Ljk3ID8gMjkgOiB0aGlzLnR5cGUgLSAxO1xuICAgICAgICAgICAgdGhpcy5zZWNvbmQtLTtcbiAgICAgICAgICAgIGlmICh0aGlzLnNlY29uZCA8IDApIHtcbiAgICAgICAgICAgICAgICB0aGlzLnNlY29uZCA9IDU5O1xuICAgICAgICAgICAgICAgIHRoaXMubWludXRlLS07XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMubWludXRlIDwgMCkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLm1pbnV0ZSA9IDU5O1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmhvdXIgPSB0aGlzLmhvdXIgPyB0aGlzLmhvdXIgLSAxIDogMjM7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cbiAgICBTTVBURS5wcm90b3R5cGUuaW5jclFGID0gZnVuY3Rpb24gKCkge1xuICAgICAgICB0aGlzLmJhY2t3YXJkcyA9IGZhbHNlO1xuICAgICAgICB0aGlzLnF1YXJ0ZXIgPSAodGhpcy5xdWFydGVyICsgMSkgJiA3O1xuICAgICAgICBpZiAodGhpcy5xdWFydGVyID09IDAgfHwgdGhpcy5xdWFydGVyID09IDQpIHRoaXMuaW5jckZyYW1lKCk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cbiAgICBTTVBURS5wcm90b3R5cGUuZGVjclFGID0gZnVuY3Rpb24gKCkge1xuICAgICAgICB0aGlzLmJhY2t3YXJkcyA9IHRydWU7XG4gICAgICAgIHRoaXMucXVhcnRlciA9ICh0aGlzLnF1YXJ0ZXIgKyA3KSAmIDc7XG4gICAgICAgIGlmICh0aGlzLnF1YXJ0ZXIgPT0gMyB8fCB0aGlzLnF1YXJ0ZXIgPT0gNykgdGhpcy5kZWNyRnJhbWUoKTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuICAgIGZ1bmN0aW9uIF84MjUoYSkgeyByZXR1cm4gW1syNCwgMjUsIDI5Ljk3LCAzMF1bKGFbN10gPj4gMSkgJiAzXSwgKChhWzddICYgMSkgPDwgNCkgfCBhWzZdLCAoYVs1XSA8PCA0KSB8IGFbNF0sIChhWzNdIDw8IDQpIHwgYVsyXSwgKGFbMV0gPDwgNCkgfCBhWzBdXTsgfVxuICAgIFNNUFRFLnByb3RvdHlwZS5yZWFkID0gZnVuY3Rpb24gKG0pIHtcbiAgICAgICAgaWYgKCEobSBpbnN0YW5jZW9mIE1JREkpKSBtID0gTUlESS5hcHBseShudWxsLCBhcmd1bWVudHMpO1xuICAgICAgICBpZiAobVswXSA9PSAweGYwICYmIG1bMV0gPT0gMHg3ZiAmJiBtWzNdID09IDEgJiYgbVs0XSA9PSAxICYmIG1bOV0gPT0gMHhmNykge1xuICAgICAgICAgICAgdGhpcy50eXBlID0gWzI0LCAyNSwgMjkuOTcsIDMwXVsobVs1XSA+PiA1KSAmIDNdO1xuICAgICAgICAgICAgdGhpcy5ob3VyID0gbVs1XSAmIDMxO1xuICAgICAgICAgICAgdGhpcy5taW51dGUgPSBtWzZdO1xuICAgICAgICAgICAgdGhpcy5zZWNvbmQgPSBtWzddO1xuICAgICAgICAgICAgdGhpcy5mcmFtZSA9IG1bOF07XG4gICAgICAgICAgICB0aGlzLnF1YXJ0ZXIgPSAwO1xuICAgICAgICAgICAgdGhpcy5fID0gdW5kZWZpbmVkO1xuICAgICAgICAgICAgdGhpcy5fYiA9IHVuZGVmaW5lZDtcbiAgICAgICAgICAgIHRoaXMuX2YgPSB1bmRlZmluZWQ7XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgICBpZiAobVswXSA9PSAweGYxICYmIHR5cGVvZiBtWzFdICE9ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgICB2YXIgcSA9IG1bMV0gPj4gNDtcbiAgICAgICAgICAgIHZhciBuID0gbVsxXSAmIDE1O1xuICAgICAgICAgICAgaWYgKHEgPT0gMCkge1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLl8gPT0gNykge1xuICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5fZiA9PSA3KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnJlc2V0KF84MjUodGhpcy5fYSkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5pbmNyRnJhbWUoKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB0aGlzLmluY3JGcmFtZSgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKHEgPT0gMykge1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLl8gPT0gNCkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmRlY3JGcmFtZSgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKHEgPT0gNCkge1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLl8gPT0gMykge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmluY3JGcmFtZSgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKHEgPT0gNykge1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLl8gPT09IDApIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMuX2IgPT09IDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucmVzZXQoXzgyNSh0aGlzLl9hKSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmRlY3JGcmFtZSgpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZGVjckZyYW1lKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKCF0aGlzLl9hKSB0aGlzLl9hID0gW107XG4gICAgICAgICAgICB0aGlzLl9hW3FdID0gbjtcbiAgICAgICAgICAgIHRoaXMuX2YgPSB0aGlzLl9mID09PSBxIC0gMSB8fCBxID09IDAgPyBxIDogdW5kZWZpbmVkO1xuICAgICAgICAgICAgdGhpcy5fYiA9IHRoaXMuX2IgPT09IHEgKyAxIHx8IHEgPT0gNyA/IHEgOiB1bmRlZmluZWQ7XG4gICAgICAgICAgICB0aGlzLl8gPSBxO1xuICAgICAgICAgICAgdGhpcy5xdWFydGVyID0gcTtcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgZnVuY3Rpb24gX210Yyh0KSB7XG4gICAgICAgIGlmICghdC5iYWNrd2FyZHMgJiYgdC5xdWFydGVyID49IDQpIHQuZGVjckZyYW1lKCk7IC8vIGNvbnRpbnVlIGVuY29kaW5nIHByZXZpb3VzIGZyYW1lXG4gICAgICAgIGVsc2UgaWYgKHQuYmFja3dhcmRzICYmIHQucXVhcnRlciA8IDQpIHQuaW5jckZyYW1lKCk7XG4gICAgICAgIHZhciByZXQ7XG4gICAgICAgIHN3aXRjaCAodC5xdWFydGVyID4+IDEpIHtcbiAgICAgICAgICAgIGNhc2UgMDogcmV0ID0gdC5mcmFtZTsgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIDE6IHJldCA9IHQuc2Vjb25kOyBicmVhaztcbiAgICAgICAgICAgIGNhc2UgMjogcmV0ID0gdC5taW51dGU7IGJyZWFrO1xuICAgICAgICAgICAgZGVmYXVsdDogcmV0ID0gdC5ob3VyO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0LnF1YXJ0ZXIgJiAxKSByZXQgPj49IDQ7XG4gICAgICAgIGVsc2UgcmV0ICY9IDE1O1xuICAgICAgICBpZiAodC5xdWFydGVyID09IDcpIHtcbiAgICAgICAgICAgIGlmICh0LnR5cGUgPT0gMjUpIHJldCB8PSAyO1xuICAgICAgICAgICAgZWxzZSBpZiAodC50eXBlID09IDI5Ljk3KSByZXQgfD0gNDtcbiAgICAgICAgICAgIGVsc2UgaWYgKHQudHlwZSA9PSAzMCkgcmV0IHw9IDY7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCF0LmJhY2t3YXJkcyAmJiB0LnF1YXJ0ZXIgPj0gNCkgdC5pbmNyRnJhbWUoKTtcbiAgICAgICAgZWxzZSBpZiAodC5iYWNrd2FyZHMgJiYgdC5xdWFydGVyIDwgNCkgdC5kZWNyRnJhbWUoKTtcbiAgICAgICAgcmV0dXJuIHJldCB8ICh0LnF1YXJ0ZXIgPDwgNCk7XG4gICAgfVxuICAgIGZ1bmN0aW9uIF9ocnR5cGUodCkge1xuICAgICAgICBpZiAodC50eXBlID09IDI1KSByZXR1cm4gdC5ob3VyIHwgMHgyMDtcbiAgICAgICAgaWYgKHQudHlwZSA9PSAyOS45NykgcmV0dXJuIHQuaG91ciB8IDB4NDA7XG4gICAgICAgIGlmICh0LnR5cGUgPT0gMzApIHJldHVybiB0LmhvdXIgfCAweDYwO1xuICAgICAgICByZXR1cm4gdC5ob3VyO1xuICAgIH1cbiAgICBmdW5jdGlvbiBfZGVjKHgpIHsgcmV0dXJuIHggPCAxMCA/ICcwJyArIHggOiB4OyB9XG4gICAgU01QVEUucHJvdG90eXBlLnRvU3RyaW5nID0gZnVuY3Rpb24gKCkgeyByZXR1cm4gW19kZWModGhpcy5ob3VyKSwgX2RlYyh0aGlzLm1pbnV0ZSksIF9kZWModGhpcy5zZWNvbmQpLCBfZGVjKHRoaXMuZnJhbWUpXS5qb2luKCc6Jyk7IH1cbiAgICBKWlouU01QVEUgPSBTTVBURTtcblxuICAgIC8vIEpaWi5NSURJXG5cbiAgICBmdW5jdGlvbiBNSURJKGFyZykge1xuICAgICAgICB2YXIgc2VsZiA9IHRoaXMgaW5zdGFuY2VvZiBNSURJID8gdGhpcyA6IHNlbGYgPSBuZXcgTUlESSgpO1xuICAgICAgICBzZWxmLl9mcm9tID0gYXJnIGluc3RhbmNlb2YgTUlESSA/IGFyZy5fZnJvbS5zbGljZSgpIDogW107XG4gICAgICAgIGlmICghYXJndW1lbnRzLmxlbmd0aCkgcmV0dXJuIHNlbGY7XG4gICAgICAgIHZhciBhcnIgPSBhcmcgaW5zdGFuY2VvZiBBcnJheSA/IGFyZyA6IGFyZ3VtZW50cztcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBhcnIubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIHZhciBuID0gYXJyW2ldO1xuICAgICAgICAgICAgaWYgKGkgPT0gMSAmJiBzZWxmWzBdID49IDB4ODAgJiYgc2VsZlswXSA8PSAweEFGKSBuID0gTUlESS5ub3RlVmFsdWUobik7XG4gICAgICAgICAgICBpZiAobiAhPSBwYXJzZUludChuKSB8fCBuIDwgMCB8fCBuID4gMjU1KSBfdGhyb3coYXJyW2ldKTtcbiAgICAgICAgICAgIHNlbGYucHVzaChuKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gc2VsZjtcbiAgICB9XG4gICAgTUlESS5wcm90b3R5cGUgPSBbXTtcbiAgICBNSURJLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IE1JREk7XG4gICAgdmFyIF9ub3RlTnVtID0ge307XG4gICAgTUlESS5ub3RlVmFsdWUgPSBmdW5jdGlvbiAoeCkgeyByZXR1cm4gX25vdGVOdW1beC50b1N0cmluZygpLnRvTG93ZXJDYXNlKCldOyB9XG5cbiAgICB2YXIgX25vdGVNYXAgPSB7IGM6IDAsIGQ6IDIsIGU6IDQsIGY6IDUsIGc6IDcsIGE6IDksIGI6IDExLCBoOiAxMSB9O1xuICAgIGZvciAodmFyIGsgaW4gX25vdGVNYXApIHtcbiAgICAgICAgaWYgKCFfbm90ZU1hcC5oYXNPd25Qcm9wZXJ0eShrKSkgY29udGludWU7XG4gICAgICAgIGZvciAodmFyIG4gPSAwOyBuIDwgMTI7IG4rKykge1xuICAgICAgICAgICAgdmFyIG0gPSBfbm90ZU1hcFtrXSArIG4gKiAxMjtcbiAgICAgICAgICAgIGlmIChtID4gMTI3KSBicmVhaztcbiAgICAgICAgICAgIF9ub3RlTnVtW2sgKyBuXSA9IG07XG4gICAgICAgICAgICBpZiAobSA+IDApIHsgX25vdGVOdW1bayArICdiJyArIG5dID0gbSAtIDE7IF9ub3RlTnVtW2sgKyAnYmInICsgbl0gPSBtIC0gMjsgfVxuICAgICAgICAgICAgaWYgKG0gPCAxMjcpIHsgX25vdGVOdW1bayArICcjJyArIG5dID0gbSArIDE7IF9ub3RlTnVtW2sgKyAnIyMnICsgbl0gPSBtICsgMjsgfVxuICAgICAgICB9XG4gICAgfVxuICAgIGZvciAodmFyIG4gPSAwOyBuIDwgMTI4OyBuKyspIF9ub3RlTnVtW25dID0gbjtcbiAgICBmdW5jdGlvbiBfdGhyb3coeCkgeyB0aHJvdyBSYW5nZUVycm9yKCdCYWQgTUlESSB2YWx1ZTogJyArIHgpOyB9XG4gICAgZnVuY3Rpb24gX2NoKG4pIHsgaWYgKG4gIT0gcGFyc2VJbnQobikgfHwgbiA8IDAgfHwgbiA+IDB4ZikgX3Rocm93KG4pOyByZXR1cm4gbjsgfVxuICAgIGZ1bmN0aW9uIF83YihuKSB7IGlmIChuICE9IHBhcnNlSW50KG4pIHx8IG4gPCAwIHx8IG4gPiAweDdmKSBfdGhyb3cobik7IHJldHVybiBuOyB9XG4gICAgZnVuY3Rpb24gX2xzYihuKSB7IGlmIChuICE9IHBhcnNlSW50KG4pIHx8IG4gPCAwIHx8IG4gPiAweDNmZmYpIF90aHJvdyhuKTsgcmV0dXJuIG4gJiAweDdmOyB9XG4gICAgZnVuY3Rpb24gX21zYihuKSB7IGlmIChuICE9IHBhcnNlSW50KG4pIHx8IG4gPCAwIHx8IG4gPiAweDNmZmYpIF90aHJvdyhuKTsgcmV0dXJuIG4gPj4gNzsgfVxuICAgIHZhciBfaGVscGVyID0ge1xuICAgICAgICBub3RlT2ZmOiBmdW5jdGlvbiAoYywgbikgeyByZXR1cm4gWzB4ODAgKyBfY2goYyksIF83YihNSURJLm5vdGVWYWx1ZShuKSksIDBdOyB9LFxuICAgICAgICBub3RlT246IGZ1bmN0aW9uIChjLCBuLCB2KSB7IHJldHVybiBbMHg5MCArIF9jaChjKSwgXzdiKE1JREkubm90ZVZhbHVlKG4pKSwgXzdiKHYpXTsgfSxcbiAgICAgICAgYWZ0ZXJ0b3VjaDogZnVuY3Rpb24gKGMsIG4sIHYpIHsgcmV0dXJuIFsweEEwICsgX2NoKGMpLCBfN2IoTUlESS5ub3RlVmFsdWUobikpLCBfN2IodildOyB9LFxuICAgICAgICBjb250cm9sOiBmdW5jdGlvbiAoYywgbiwgdikgeyByZXR1cm4gWzB4QjAgKyBfY2goYyksIF83YihuKSwgXzdiKHYpXTsgfSxcbiAgICAgICAgcHJvZ3JhbTogZnVuY3Rpb24gKGMsIG4pIHsgcmV0dXJuIFsweEMwICsgX2NoKGMpLCBfN2IobildOyB9LFxuICAgICAgICBwcmVzc3VyZTogZnVuY3Rpb24gKGMsIG4pIHsgcmV0dXJuIFsweEQwICsgX2NoKGMpLCBfN2IobildOyB9LFxuICAgICAgICBwaXRjaEJlbmQ6IGZ1bmN0aW9uIChjLCBuKSB7IHJldHVybiBbMHhFMCArIF9jaChjKSwgX2xzYihuKSwgX21zYihuKV07IH0sXG4gICAgICAgIGJhbmtNU0I6IGZ1bmN0aW9uIChjLCBuKSB7IHJldHVybiBbMHhCMCArIF9jaChjKSwgMHgwMCwgXzdiKG4pXTsgfSxcbiAgICAgICAgYmFua0xTQjogZnVuY3Rpb24gKGMsIG4pIHsgcmV0dXJuIFsweEIwICsgX2NoKGMpLCAweDIwLCBfN2IobildOyB9LFxuICAgICAgICBtb2RNU0I6IGZ1bmN0aW9uIChjLCBuKSB7IHJldHVybiBbMHhCMCArIF9jaChjKSwgMHgwMSwgXzdiKG4pXTsgfSxcbiAgICAgICAgbW9kTFNCOiBmdW5jdGlvbiAoYywgbikgeyByZXR1cm4gWzB4QjAgKyBfY2goYyksIDB4MjEsIF83YihuKV07IH0sXG4gICAgICAgIGJyZWF0aE1TQjogZnVuY3Rpb24gKGMsIG4pIHsgcmV0dXJuIFsweEIwICsgX2NoKGMpLCAweDAyLCBfN2IobildOyB9LFxuICAgICAgICBicmVhdGhMU0I6IGZ1bmN0aW9uIChjLCBuKSB7IHJldHVybiBbMHhCMCArIF9jaChjKSwgMHgyMiwgXzdiKG4pXTsgfSxcbiAgICAgICAgZm9vdE1TQjogZnVuY3Rpb24gKGMsIG4pIHsgcmV0dXJuIFsweEIwICsgX2NoKGMpLCAweDA0LCBfN2IobildOyB9LFxuICAgICAgICBmb290TFNCOiBmdW5jdGlvbiAoYywgbikgeyByZXR1cm4gWzB4QjAgKyBfY2goYyksIDB4MjQsIF83YihuKV07IH0sXG4gICAgICAgIHBvcnRhbWVudG9NU0I6IGZ1bmN0aW9uIChjLCBuKSB7IHJldHVybiBbMHhCMCArIF9jaChjKSwgMHgwNSwgXzdiKG4pXTsgfSxcbiAgICAgICAgcG9ydGFtZW50b0xTQjogZnVuY3Rpb24gKGMsIG4pIHsgcmV0dXJuIFsweEIwICsgX2NoKGMpLCAweDI1LCBfN2IobildOyB9LFxuICAgICAgICB2b2x1bWVNU0I6IGZ1bmN0aW9uIChjLCBuKSB7IHJldHVybiBbMHhCMCArIF9jaChjKSwgMHgwNywgXzdiKG4pXTsgfSxcbiAgICAgICAgdm9sdW1lTFNCOiBmdW5jdGlvbiAoYywgbikgeyByZXR1cm4gWzB4QjAgKyBfY2goYyksIDB4MjcsIF83YihuKV07IH0sXG4gICAgICAgIGJhbGFuY2VNU0I6IGZ1bmN0aW9uIChjLCBuKSB7IHJldHVybiBbMHhCMCArIF9jaChjKSwgMHgwOCwgXzdiKG4pXTsgfSxcbiAgICAgICAgYmFsYW5jZUxTQjogZnVuY3Rpb24gKGMsIG4pIHsgcmV0dXJuIFsweEIwICsgX2NoKGMpLCAweDI4LCBfN2IobildOyB9LFxuICAgICAgICBwYW5NU0I6IGZ1bmN0aW9uIChjLCBuKSB7IHJldHVybiBbMHhCMCArIF9jaChjKSwgMHgwQSwgXzdiKG4pXTsgfSxcbiAgICAgICAgcGFuTFNCOiBmdW5jdGlvbiAoYywgbikgeyByZXR1cm4gWzB4QjAgKyBfY2goYyksIDB4MkEsIF83YihuKV07IH0sXG4gICAgICAgIGV4cHJlc3Npb25NU0I6IGZ1bmN0aW9uIChjLCBuKSB7IHJldHVybiBbMHhCMCArIF9jaChjKSwgMHgwQiwgXzdiKG4pXTsgfSxcbiAgICAgICAgZXhwcmVzc2lvbkxTQjogZnVuY3Rpb24gKGMsIG4pIHsgcmV0dXJuIFsweEIwICsgX2NoKGMpLCAweDJCLCBfN2IobildOyB9LFxuICAgICAgICBkYW1wZXI6IGZ1bmN0aW9uIChjLCBiKSB7IHJldHVybiBbMHhCMCArIF9jaChjKSwgMHg0MCwgYiA/IDEyNyA6IDBdOyB9LFxuICAgICAgICBwb3J0YW1lbnRvOiBmdW5jdGlvbiAoYywgYikgeyByZXR1cm4gWzB4QjAgKyBfY2goYyksIDB4NDEsIGIgPyAxMjcgOiAwXTsgfSxcbiAgICAgICAgc29zdGVudXRvOiBmdW5jdGlvbiAoYywgYikgeyByZXR1cm4gWzB4QjAgKyBfY2goYyksIDB4NDIsIGIgPyAxMjcgOiAwXTsgfSxcbiAgICAgICAgc29mdDogZnVuY3Rpb24gKGMsIGIpIHsgcmV0dXJuIFsweEIwICsgX2NoKGMpLCAweDQzLCBiID8gMTI3IDogMF07IH0sXG4gICAgICAgIGFsbFNvdW5kT2ZmOiBmdW5jdGlvbiAoYykgeyByZXR1cm4gWzB4QjAgKyBfY2goYyksIDB4NzgsIDBdOyB9LFxuICAgICAgICBhbGxOb3Rlc09mZjogZnVuY3Rpb24gKGMpIHsgcmV0dXJuIFsweEIwICsgX2NoKGMpLCAweDdiLCAwXTsgfSxcbiAgICAgICAgbXRjOiBmdW5jdGlvbiAodCkgeyByZXR1cm4gWzB4RjEsIF9tdGModCldOyB9LFxuICAgICAgICBzb25nUG9zaXRpb246IGZ1bmN0aW9uIChuKSB7IHJldHVybiBbMHhGMiwgX2xzYihuKSwgX21zYihuKV07IH0sXG4gICAgICAgIHNvbmdTZWxlY3Q6IGZ1bmN0aW9uIChuKSB7IHJldHVybiBbMHhGMywgXzdiKG4pXTsgfSxcbiAgICAgICAgdHVuZTogZnVuY3Rpb24gKCkgeyByZXR1cm4gWzB4RjZdOyB9LFxuICAgICAgICBjbG9jazogZnVuY3Rpb24gKCkgeyByZXR1cm4gWzB4RjhdOyB9LFxuICAgICAgICBzdGFydDogZnVuY3Rpb24gKCkgeyByZXR1cm4gWzB4RkFdOyB9LFxuICAgICAgICBjb250aW51ZTogZnVuY3Rpb24gKCkgeyByZXR1cm4gWzB4RkJdOyB9LFxuICAgICAgICBzdG9wOiBmdW5jdGlvbiAoKSB7IHJldHVybiBbMHhGQ107IH0sXG4gICAgICAgIGFjdGl2ZTogZnVuY3Rpb24gKCkgeyByZXR1cm4gWzB4RkVdOyB9LFxuICAgICAgICBzeElkUmVxdWVzdDogZnVuY3Rpb24gKCkgeyByZXR1cm4gWzB4RjAsIDB4N0UsIDB4N0YsIDB4MDYsIDB4MDEsIDB4RjddOyB9LFxuICAgICAgICBzeEZ1bGxGcmFtZTogZnVuY3Rpb24gKHQpIHsgcmV0dXJuIFsweEYwLCAweDdGLCAweDdGLCAweDAxLCAweDAxLCBfaHJ0eXBlKHQpLCB0LmdldE1pbnV0ZSgpLCB0LmdldFNlY29uZCgpLCB0LmdldEZyYW1lKCksIDB4RjddOyB9LFxuICAgICAgICByZXNldDogZnVuY3Rpb24gKCkgeyByZXR1cm4gWzB4RkZdOyB9XG4gICAgfTtcbiAgICBmdW5jdGlvbiBfY29weUhlbHBlcihuYW1lLCBmdW5jKSB7XG4gICAgICAgIE1JRElbbmFtZV0gPSBmdW5jdGlvbiAoKSB7IHJldHVybiBuZXcgTUlESShmdW5jLmFwcGx5KDAsIGFyZ3VtZW50cykpOyB9O1xuICAgICAgICBfTS5wcm90b3R5cGVbbmFtZV0gPSBmdW5jdGlvbiAoKSB7IHRoaXMuc2VuZChmdW5jLmFwcGx5KDAsIGFyZ3VtZW50cykpOyByZXR1cm4gdGhpczsgfTtcbiAgICB9XG4gICAgZm9yICh2YXIgayBpbiBfaGVscGVyKSBpZiAoX2hlbHBlci5oYXNPd25Qcm9wZXJ0eShrKSkgX2NvcHlIZWxwZXIoaywgX2hlbHBlcltrXSk7XG5cbiAgICB2YXIgX2NoYW5uZWxNYXAgPSB7IGE6IDEwLCBiOiAxMSwgYzogMTIsIGQ6IDEzLCBlOiAxNCwgZjogMTUsIEE6IDEwLCBCOiAxMSwgQzogMTIsIEQ6IDEzLCBFOiAxNCwgRjogMTUgfTtcbiAgICBmb3IgKHZhciBrID0gMDsgayA8IDE2OyBrKyspIF9jaGFubmVsTWFwW2tdID0gaztcbiAgICBNSURJLnByb3RvdHlwZS5nZXRDaGFubmVsID0gZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgYyA9IHRoaXNbMF07XG4gICAgICAgIGlmICh0eXBlb2YgYyA9PSAndW5kZWZpbmVkJyB8fCBjIDwgMHg4MCB8fCBjID4gMHhlZikgcmV0dXJuO1xuICAgICAgICByZXR1cm4gYyAmIDE1O1xuICAgIH1cbiAgICBNSURJLnByb3RvdHlwZS5zZXRDaGFubmVsID0gZnVuY3Rpb24gKHgpIHtcbiAgICAgICAgdmFyIGMgPSB0aGlzWzBdO1xuICAgICAgICBpZiAodHlwZW9mIGMgPT0gJ3VuZGVmaW5lZCcgfHwgYyA8IDB4ODAgfHwgYyA+IDB4ZWYpIHJldHVybiB0aGlzO1xuICAgICAgICB4ID0gX2NoYW5uZWxNYXBbeF07XG4gICAgICAgIGlmICh0eXBlb2YgeCAhPSAndW5kZWZpbmVkJykgdGhpc1swXSA9IChjICYgMHhmMCkgfCB4O1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG4gICAgTUlESS5wcm90b3R5cGUuZ2V0Tm90ZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmFyIGMgPSB0aGlzWzBdO1xuICAgICAgICBpZiAodHlwZW9mIGMgPT0gJ3VuZGVmaW5lZCcgfHwgYyA8IDB4ODAgfHwgYyA+IDB4YWYpIHJldHVybjtcbiAgICAgICAgcmV0dXJuIHRoaXNbMV07XG4gICAgfVxuICAgIE1JREkucHJvdG90eXBlLnNldE5vdGUgPSBmdW5jdGlvbiAoeCkge1xuICAgICAgICB2YXIgYyA9IHRoaXNbMF07XG4gICAgICAgIGlmICh0eXBlb2YgYyA9PSAndW5kZWZpbmVkJyB8fCBjIDwgMHg4MCB8fCBjID4gMHhhZikgcmV0dXJuIHRoaXM7XG4gICAgICAgIHggPSBNSURJLm5vdGVWYWx1ZSh4KTtcbiAgICAgICAgaWYgKHR5cGVvZiB4ICE9ICd1bmRlZmluZWQnKSB0aGlzWzFdID0geDtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuICAgIE1JREkucHJvdG90eXBlLmdldFZlbG9jaXR5ID0gZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgYyA9IHRoaXNbMF07XG4gICAgICAgIGlmICh0eXBlb2YgYyA9PSAndW5kZWZpbmVkJyB8fCBjIDwgMHg5MCB8fCBjID4gMHg5ZikgcmV0dXJuO1xuICAgICAgICByZXR1cm4gdGhpc1syXTtcbiAgICB9XG4gICAgTUlESS5wcm90b3R5cGUuc2V0VmVsb2NpdHkgPSBmdW5jdGlvbiAoeCkge1xuICAgICAgICB2YXIgYyA9IHRoaXNbMF07XG4gICAgICAgIGlmICh0eXBlb2YgYyA9PSAndW5kZWZpbmVkJyB8fCBjIDwgMHg5MCB8fCBjID4gMHg5ZikgcmV0dXJuIHRoaXM7XG4gICAgICAgIHggPSBwYXJzZUludCh4KTtcbiAgICAgICAgaWYgKHggPj0gMCAmJiB4IDwgMTI4KSB0aGlzWzJdID0geDtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuICAgIE1JREkucHJvdG90eXBlLmdldFN5c0V4Q2hhbm5lbCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgaWYgKHRoaXNbMF0gPT0gMHhmMCkgcmV0dXJuIHRoaXNbMl07XG4gICAgfVxuICAgIE1JREkucHJvdG90eXBlLnNldFN5c0V4Q2hhbm5lbCA9IGZ1bmN0aW9uICh4KSB7XG4gICAgICAgIGlmICh0aGlzWzBdID09IDB4ZjAgJiYgdGhpcy5sZW5ndGggPiAyKSB7XG4gICAgICAgICAgICB4ID0gcGFyc2VJbnQoeCk7XG4gICAgICAgICAgICBpZiAoeCA+PSAwICYmIHggPCAxMjgpIHRoaXNbMl0gPSB4O1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cbiAgICBNSURJLnByb3RvdHlwZS5pc05vdGVPbiA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmFyIGMgPSB0aGlzWzBdO1xuICAgICAgICBpZiAodHlwZW9mIGMgPT0gJ3VuZGVmaW5lZCcgfHwgYyA8IDB4OTAgfHwgYyA+IDB4OWYpIHJldHVybiBmYWxzZTtcbiAgICAgICAgcmV0dXJuIHRoaXNbMl0gPiAwID8gdHJ1ZSA6IGZhbHNlO1xuICAgIH1cbiAgICBNSURJLnByb3RvdHlwZS5pc05vdGVPZmYgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciBjID0gdGhpc1swXTtcbiAgICAgICAgaWYgKHR5cGVvZiBjID09ICd1bmRlZmluZWQnIHx8IGMgPCAweDgwIHx8IGMgPiAweDlmKSByZXR1cm4gZmFsc2U7XG4gICAgICAgIGlmIChjIDwgMHg5MCkgcmV0dXJuIHRydWU7XG4gICAgICAgIHJldHVybiB0aGlzWzJdID09IDAgPyB0cnVlIDogZmFsc2U7XG4gICAgfVxuICAgIE1JREkucHJvdG90eXBlLmlzU3lzRXggPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiB0aGlzWzBdID09IDB4ZjA7XG4gICAgfVxuICAgIE1JREkucHJvdG90eXBlLmlzRnVsbFN5c0V4ID0gZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gdGhpc1swXSA9PSAweGYwICYmIHRoaXNbdGhpcy5sZW5ndGggLSAxXSA9PSAweGY3O1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIF9oZXgoeCkge1xuICAgICAgICB2YXIgYSA9IFtdO1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHgubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGFbaV0gPSAoeFtpXSA8IDE2ID8gJzAnIDogJycpICsgeFtpXS50b1N0cmluZygxNik7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGEuam9pbignICcpO1xuICAgIH1cbiAgICBNSURJLnByb3RvdHlwZS50b1N0cmluZyA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgaWYgKCF0aGlzLmxlbmd0aCkgcmV0dXJuICdlbXB0eSc7XG4gICAgICAgIHZhciBzID0gX2hleCh0aGlzKTtcbiAgICAgICAgaWYgKHRoaXNbMF0gPCAweDgwKSByZXR1cm4gcztcbiAgICAgICAgdmFyIHNzID0ge1xuICAgICAgICAgICAgMjQxOiAnTUlESSBUaW1lIENvZGUnLFxuICAgICAgICAgICAgMjQyOiAnU29uZyBQb3NpdGlvbicsXG4gICAgICAgICAgICAyNDM6ICdTb25nIFNlbGVjdCcsXG4gICAgICAgICAgICAyNDQ6ICdVbmRlZmluZWQnLFxuICAgICAgICAgICAgMjQ1OiAnVW5kZWZpbmVkJyxcbiAgICAgICAgICAgIDI0NjogJ1R1bmUgcmVxdWVzdCcsXG4gICAgICAgICAgICAyNDg6ICdUaW1pbmcgY2xvY2snLFxuICAgICAgICAgICAgMjQ5OiAnVW5kZWZpbmVkJyxcbiAgICAgICAgICAgIDI1MDogJ1N0YXJ0JyxcbiAgICAgICAgICAgIDI1MTogJ0NvbnRpbnVlJyxcbiAgICAgICAgICAgIDI1MjogJ1N0b3AnLFxuICAgICAgICAgICAgMjUzOiAnVW5kZWZpbmVkJyxcbiAgICAgICAgICAgIDI1NDogJ0FjdGl2ZSBTZW5zaW5nJyxcbiAgICAgICAgICAgIDI1NTogJ1Jlc2V0J1xuICAgICAgICB9W3RoaXNbMF1dO1xuICAgICAgICBpZiAoc3MpIHJldHVybiBzICsgJyAtLSAnICsgc3M7XG4gICAgICAgIHZhciBjID0gdGhpc1swXSA+PiA0O1xuICAgICAgICBzcyA9IHsgODogJ05vdGUgT2ZmJywgMTA6ICdBZnRlcnRvdWNoJywgMTI6ICdQcm9ncmFtIENoYW5nZScsIDEzOiAnQ2hhbm5lbCBBZnRlcnRvdWNoJywgMTQ6ICdQaXRjaCBXaGVlbCcgfVtjXTtcbiAgICAgICAgaWYgKHNzKSByZXR1cm4gcyArICcgLS0gJyArIHNzO1xuICAgICAgICBpZiAoYyA9PSA5KSByZXR1cm4gcyArICcgLS0gJyArICh0aGlzWzJdID8gJ05vdGUgT24nIDogJ05vdGUgT2ZmJyk7XG4gICAgICAgIGlmIChjICE9IDExKSByZXR1cm4gcztcbiAgICAgICAgc3MgPSB7XG4gICAgICAgICAgICAwOiAnQmFuayBTZWxlY3QgTVNCJyxcbiAgICAgICAgICAgIDE6ICdNb2R1bGF0aW9uIFdoZWVsIE1TQicsXG4gICAgICAgICAgICAyOiAnQnJlYXRoIENvbnRyb2xsZXIgTVNCJyxcbiAgICAgICAgICAgIDQ6ICdGb290IENvbnRyb2xsZXIgTVNCJyxcbiAgICAgICAgICAgIDU6ICdQb3J0YW1lbnRvIFRpbWUgTVNCJyxcbiAgICAgICAgICAgIDY6ICdEYXRhIEVudHJ5IE1TQicsXG4gICAgICAgICAgICA3OiAnQ2hhbm5lbCBWb2x1bWUgTVNCJyxcbiAgICAgICAgICAgIDg6ICdCYWxhbmNlIE1TQicsXG4gICAgICAgICAgICAxMDogJ1BhbiBNU0InLFxuICAgICAgICAgICAgMTE6ICdFeHByZXNzaW9uIENvbnRyb2xsZXIgTVNCJyxcbiAgICAgICAgICAgIDEyOiAnRWZmZWN0IENvbnRyb2wgMSBNU0InLFxuICAgICAgICAgICAgMTM6ICdFZmZlY3QgQ29udHJvbCAyIE1TQicsXG4gICAgICAgICAgICAxNjogJ0dlbmVyYWwgUHVycG9zZSBDb250cm9sbGVyIDEgTVNCJyxcbiAgICAgICAgICAgIDE3OiAnR2VuZXJhbCBQdXJwb3NlIENvbnRyb2xsZXIgMiBNU0InLFxuICAgICAgICAgICAgMTg6ICdHZW5lcmFsIFB1cnBvc2UgQ29udHJvbGxlciAzIE1TQicsXG4gICAgICAgICAgICAxOTogJ0dlbmVyYWwgUHVycG9zZSBDb250cm9sbGVyIDQgTVNCJyxcbiAgICAgICAgICAgIDMyOiAnQmFuayBTZWxlY3QgTFNCJyxcbiAgICAgICAgICAgIDMzOiAnTW9kdWxhdGlvbiBXaGVlbCBMU0InLFxuICAgICAgICAgICAgMzQ6ICdCcmVhdGggQ29udHJvbGxlciBMU0InLFxuICAgICAgICAgICAgMzY6ICdGb290IENvbnRyb2xsZXIgTFNCJyxcbiAgICAgICAgICAgIDM3OiAnUG9ydGFtZW50byBUaW1lIExTQicsXG4gICAgICAgICAgICAzODogJ0RhdGEgRW50cnkgTFNCJyxcbiAgICAgICAgICAgIDM5OiAnQ2hhbm5lbCBWb2x1bWUgTFNCJyxcbiAgICAgICAgICAgIDQwOiAnQmFsYW5jZSBMU0InLFxuICAgICAgICAgICAgNDI6ICdQYW4gTFNCJyxcbiAgICAgICAgICAgIDQzOiAnRXhwcmVzc2lvbiBDb250cm9sbGVyIExTQicsXG4gICAgICAgICAgICA0NDogJ0VmZmVjdCBjb250cm9sIDEgTFNCJyxcbiAgICAgICAgICAgIDQ1OiAnRWZmZWN0IGNvbnRyb2wgMiBMU0InLFxuICAgICAgICAgICAgNDg6ICdHZW5lcmFsIFB1cnBvc2UgQ29udHJvbGxlciAxIExTQicsXG4gICAgICAgICAgICA0OTogJ0dlbmVyYWwgUHVycG9zZSBDb250cm9sbGVyIDIgTFNCJyxcbiAgICAgICAgICAgIDUwOiAnR2VuZXJhbCBQdXJwb3NlIENvbnRyb2xsZXIgMyBMU0InLFxuICAgICAgICAgICAgNTE6ICdHZW5lcmFsIFB1cnBvc2UgQ29udHJvbGxlciA0IExTQicsXG4gICAgICAgICAgICA2NDogJ0RhbXBlciBQZWRhbCBPbi9PZmYnLFxuICAgICAgICAgICAgNjU6ICdQb3J0YW1lbnRvIE9uL09mZicsXG4gICAgICAgICAgICA2NjogJ1Nvc3RlbnV0byBPbi9PZmYnLFxuICAgICAgICAgICAgNjc6ICdTb2Z0IFBlZGFsIE9uL09mZicsXG4gICAgICAgICAgICA2ODogJ0xlZ2F0byBGb290c3dpdGNoJyxcbiAgICAgICAgICAgIDY5OiAnSG9sZCAyJyxcbiAgICAgICAgICAgIDcwOiAnU291bmQgQ29udHJvbGxlciAxJyxcbiAgICAgICAgICAgIDcxOiAnU291bmQgQ29udHJvbGxlciAyJyxcbiAgICAgICAgICAgIDcyOiAnU291bmQgQ29udHJvbGxlciAzJyxcbiAgICAgICAgICAgIDczOiAnU291bmQgQ29udHJvbGxlciA0JyxcbiAgICAgICAgICAgIDc0OiAnU291bmQgQ29udHJvbGxlciA1JyxcbiAgICAgICAgICAgIDc1OiAnU291bmQgQ29udHJvbGxlciA2JyxcbiAgICAgICAgICAgIDc2OiAnU291bmQgQ29udHJvbGxlciA3JyxcbiAgICAgICAgICAgIDc3OiAnU291bmQgQ29udHJvbGxlciA4JyxcbiAgICAgICAgICAgIDc4OiAnU291bmQgQ29udHJvbGxlciA5JyxcbiAgICAgICAgICAgIDc5OiAnU291bmQgQ29udHJvbGxlciAxMCcsXG4gICAgICAgICAgICA4MDogJ0dlbmVyYWwgUHVycG9zZSBDb250cm9sbGVyIDUnLFxuICAgICAgICAgICAgODE6ICdHZW5lcmFsIFB1cnBvc2UgQ29udHJvbGxlciA2JyxcbiAgICAgICAgICAgIDgyOiAnR2VuZXJhbCBQdXJwb3NlIENvbnRyb2xsZXIgNycsXG4gICAgICAgICAgICA4MzogJ0dlbmVyYWwgUHVycG9zZSBDb250cm9sbGVyIDgnLFxuICAgICAgICAgICAgODQ6ICdQb3J0YW1lbnRvIENvbnRyb2wnLFxuICAgICAgICAgICAgODg6ICdIaWdoIFJlc29sdXRpb24gVmVsb2NpdHkgUHJlZml4JyxcbiAgICAgICAgICAgIDkxOiAnRWZmZWN0cyAxIERlcHRoJyxcbiAgICAgICAgICAgIDkyOiAnRWZmZWN0cyAyIERlcHRoJyxcbiAgICAgICAgICAgIDkzOiAnRWZmZWN0cyAzIERlcHRoJyxcbiAgICAgICAgICAgIDk0OiAnRWZmZWN0cyA0IERlcHRoJyxcbiAgICAgICAgICAgIDk1OiAnRWZmZWN0cyA1IERlcHRoJyxcbiAgICAgICAgICAgIDk2OiAnRGF0YSBJbmNyZW1lbnQnLFxuICAgICAgICAgICAgOTc6ICdEYXRhIERlY3JlbWVudCcsXG4gICAgICAgICAgICA5ODogJ05vbi1SZWdpc3RlcmVkIFBhcmFtZXRlciBOdW1iZXIgTFNCJyxcbiAgICAgICAgICAgIDk5OiAnTm9uLVJlZ2lzdGVyZWQgUGFyYW1ldGVyIE51bWJlciBNU0InLFxuICAgICAgICAgICAgMTAwOiAnUmVnaXN0ZXJlZCBQYXJhbWV0ZXIgTnVtYmVyIExTQicsXG4gICAgICAgICAgICAxMDE6ICdSZWdpc3RlcmVkIFBhcmFtZXRlciBOdW1iZXIgTVNCJyxcbiAgICAgICAgICAgIDEyMDogJ0FsbCBTb3VuZCBPZmYnLFxuICAgICAgICAgICAgMTIxOiAnUmVzZXQgQWxsIENvbnRyb2xsZXJzJyxcbiAgICAgICAgICAgIDEyMjogJ0xvY2FsIENvbnRyb2wgT24vT2ZmJyxcbiAgICAgICAgICAgIDEyMzogJ0FsbCBOb3RlcyBPZmYnLFxuICAgICAgICAgICAgMTI0OiAnT21uaSBNb2RlIE9mZicsXG4gICAgICAgICAgICAxMjU6ICdPbW5pIE1vZGUgT24nLFxuICAgICAgICAgICAgMTI2OiAnTW9ubyBNb2RlIE9uJyxcbiAgICAgICAgICAgIDEyNzogJ1BvbHkgTW9kZSBPbidcbiAgICAgICAgfVt0aGlzWzFdXTtcbiAgICAgICAgaWYgKCFzcykgc3MgPSAnVW5kZWZpbmVkJztcbiAgICAgICAgcmV0dXJuIHMgKyAnIC0tICcgKyBzcztcbiAgICB9XG4gICAgTUlESS5wcm90b3R5cGUuX3N0YW1wID0gZnVuY3Rpb24gKG9iaikgeyB0aGlzLl9mcm9tLnB1c2gob2JqLl9vcmlnID8gb2JqLl9vcmlnIDogb2JqKTsgcmV0dXJuIHRoaXM7IH1cbiAgICBNSURJLnByb3RvdHlwZS5fdW5zdGFtcCA9IGZ1bmN0aW9uIChvYmopIHtcbiAgICAgICAgaWYgKHR5cGVvZiBvYmogPT0gJ3VuZGVmaW5lZCcpIHRoaXMuX2Zyb20gPSBbXTtcbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBpZiAob2JqLl9vcmlnKSBvYmogPSBvYmouX29yaWc7XG4gICAgICAgICAgICB2YXIgaSA9IHRoaXMuX2Zyb20uaW5kZXhPZihvYmopO1xuICAgICAgICAgICAgaWYgKGkgPiAtMSkgdGhpcy5fZnJvbS5zcGxpY2UoaSwgMSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuICAgIE1JREkucHJvdG90eXBlLl9zdGFtcGVkID0gZnVuY3Rpb24gKG9iaikge1xuICAgICAgICBpZiAob2JqLl9vcmlnKSBvYmogPSBvYmouX29yaWc7XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5fZnJvbS5sZW5ndGg7IGkrKykgaWYgKHRoaXMuX2Zyb21baV0gPT0gb2JqKSByZXR1cm4gdHJ1ZTtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIEpaWi5NSURJID0gTUlESTtcblxuICAgIEpaWi5saWIgPSB7fTtcbiAgICBKWloubGliLm9wZW5NaWRpT3V0ID0gZnVuY3Rpb24gKG5hbWUsIGVuZ2luZSkge1xuICAgICAgICB2YXIgcG9ydCA9IG5ldyBfTSgpO1xuICAgICAgICBlbmdpbmUuX29wZW5PdXQocG9ydCwgbmFtZSk7XG4gICAgICAgIHJldHVybiBwb3J0O1xuICAgIH1cbiAgICBKWloubGliLm9wZW5NaWRpSW4gPSBmdW5jdGlvbiAobmFtZSwgZW5naW5lKSB7XG4gICAgICAgIHZhciBwb3J0ID0gbmV3IF9NKCk7XG4gICAgICAgIGVuZ2luZS5fb3BlbkluKHBvcnQsIG5hbWUpO1xuICAgICAgICByZXR1cm4gcG9ydDtcbiAgICB9XG4gICAgSlpaLmxpYi5yZWdpc3Rlck1pZGlPdXQgPSBmdW5jdGlvbiAobmFtZSwgZW5naW5lKSB7XG4gICAgICAgIHZhciB4ID0gZW5naW5lLl9pbmZvKG5hbWUpO1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IF92aXJ0dWFsLl9vdXRzLmxlbmd0aDsgaSsrKSBpZiAoX3ZpcnR1YWwuX291dHNbaV0ubmFtZSA9PSB4Lm5hbWUpIHJldHVybiBmYWxzZTtcbiAgICAgICAgeC5lbmdpbmUgPSBlbmdpbmU7XG4gICAgICAgIF92aXJ0dWFsLl9vdXRzLnB1c2goeCk7XG4gICAgICAgIGlmIChfanp6ICYmIF9qenouX2JhZCkgeyBfanp6Ll9yZXBhaXIoKTsgX2p6ei5fcmVzdW1lKCk7IH1cbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICAgIEpaWi5saWIucmVnaXN0ZXJNaWRpSW4gPSBmdW5jdGlvbiAobmFtZSwgZW5naW5lKSB7XG4gICAgICAgIHZhciB4ID0gZW5naW5lLl9pbmZvKG5hbWUpO1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IF92aXJ0dWFsLl9pbnMubGVuZ3RoOyBpKyspIGlmIChfdmlydHVhbC5faW5zW2ldLm5hbWUgPT0geC5uYW1lKSByZXR1cm4gZmFsc2U7XG4gICAgICAgIHguZW5naW5lID0gZW5naW5lO1xuICAgICAgICBfdmlydHVhbC5faW5zLnB1c2goeCk7XG4gICAgICAgIGlmIChfanp6ICYmIF9qenouX2JhZCkgeyBfanp6Ll9yZXBhaXIoKTsgX2p6ei5fcmVzdW1lKCk7IH1cbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICAgIHZhciBfYWM7XG4gICAgSlpaLmxpYi5nZXRBdWRpb0NvbnRleHQgPSBmdW5jdGlvbiAoKSB7IHJldHVybiBfYWM7IH1cbiAgICBpZiAod2luZG93KSB7XG4gICAgICAgIHZhciBBdWRpb0NvbnRleHQgPSB3aW5kb3cuQXVkaW9Db250ZXh0IHx8IHdpbmRvdy53ZWJraXRBdWRpb0NvbnRleHQ7XG4gICAgICAgIGlmIChBdWRpb0NvbnRleHQpIF9hYyA9IG5ldyBBdWRpb0NvbnRleHQoKTtcbiAgICAgICAgaWYgKF9hYyAmJiAhX2FjLmNyZWF0ZUdhaW4pIF9hYy5jcmVhdGVHYWluID0gX2FjLmNyZWF0ZUdhaW5Ob2RlO1xuICAgICAgICBmdW5jdGlvbiBfYWN0aXZhdGVBdWRpb0NvbnRleHQoKSB7XG4gICAgICAgICAgICBpZiAoX2FjLnN0YXRlICE9ICdydW5uaW5nJykge1xuICAgICAgICAgICAgICAgIF9hYy5yZXN1bWUoKTtcbiAgICAgICAgICAgICAgICB2YXIgb3NjID0gX2FjLmNyZWF0ZU9zY2lsbGF0b3IoKTtcbiAgICAgICAgICAgICAgICB2YXIgZ2FpbiA9IF9hYy5jcmVhdGVHYWluKCk7XG4gICAgICAgICAgICAgICAgZ2Fpbi5nYWluLnNldFRhcmdldEF0VGltZSgwLCBfYWMuY3VycmVudFRpbWUsIDAuMDEpO1xuICAgICAgICAgICAgICAgIG9zYy5jb25uZWN0KGdhaW4pO1xuICAgICAgICAgICAgICAgIGdhaW4uY29ubmVjdChfYWMuZGVzdGluYXRpb24pO1xuICAgICAgICAgICAgICAgIGlmICghb3NjLnN0YXJ0KSBvc2Muc3RhcnQgPSBvc2Mubm90ZU9uO1xuICAgICAgICAgICAgICAgIGlmICghb3NjLnN0b3ApIG9zYy5zdG9wID0gb3NjLm5vdGVPZmY7XG4gICAgICAgICAgICAgICAgb3NjLnN0YXJ0KC4xKTsgb3NjLnN0b3AoMC4xMSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICBkb2N1bWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCd0b3VjaGVuZCcsIF9hY3RpdmF0ZUF1ZGlvQ29udGV4dCk7XG4gICAgICAgICAgICAgICAgZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcignbW91c2Vkb3duJywgX2FjdGl2YXRlQXVkaW9Db250ZXh0KTtcbiAgICAgICAgICAgICAgICBkb2N1bWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCdrZXlkb3duJywgX2FjdGl2YXRlQXVkaW9Db250ZXh0KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCd0b3VjaGVuZCcsIF9hY3RpdmF0ZUF1ZGlvQ29udGV4dCk7XG4gICAgICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlZG93bicsIF9hY3RpdmF0ZUF1ZGlvQ29udGV4dCk7XG4gICAgICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCBfYWN0aXZhdGVBdWRpb0NvbnRleHQpO1xuICAgICAgICBfYWN0aXZhdGVBdWRpb0NvbnRleHQoKTtcbiAgICB9XG5cbiAgICBKWloudXRpbCA9IHt9O1xuICAgIEpaWi51dGlsLmlvc1NvdW5kID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAvLyBkZXByZWNhdGVkLiB3aWxsIGJlIHJlbW92ZWQgaW4gbmV4dCB2ZXJzaW9uXG4gICAgfVxuICAgIHJldHVybiBKWlo7XG59XG4iLCIvLyBzaGltIGZvciB1c2luZyBwcm9jZXNzIGluIGJyb3dzZXJcbnZhciBwcm9jZXNzID0gbW9kdWxlLmV4cG9ydHMgPSB7fTtcblxuLy8gY2FjaGVkIGZyb20gd2hhdGV2ZXIgZ2xvYmFsIGlzIHByZXNlbnQgc28gdGhhdCB0ZXN0IHJ1bm5lcnMgdGhhdCBzdHViIGl0XG4vLyBkb24ndCBicmVhayB0aGluZ3MuICBCdXQgd2UgbmVlZCB0byB3cmFwIGl0IGluIGEgdHJ5IGNhdGNoIGluIGNhc2UgaXQgaXNcbi8vIHdyYXBwZWQgaW4gc3RyaWN0IG1vZGUgY29kZSB3aGljaCBkb2Vzbid0IGRlZmluZSBhbnkgZ2xvYmFscy4gIEl0J3MgaW5zaWRlIGFcbi8vIGZ1bmN0aW9uIGJlY2F1c2UgdHJ5L2NhdGNoZXMgZGVvcHRpbWl6ZSBpbiBjZXJ0YWluIGVuZ2luZXMuXG5cbnZhciBjYWNoZWRTZXRUaW1lb3V0O1xudmFyIGNhY2hlZENsZWFyVGltZW91dDtcblxuZnVuY3Rpb24gZGVmYXVsdFNldFRpbW91dCgpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3NldFRpbWVvdXQgaGFzIG5vdCBiZWVuIGRlZmluZWQnKTtcbn1cbmZ1bmN0aW9uIGRlZmF1bHRDbGVhclRpbWVvdXQgKCkge1xuICAgIHRocm93IG5ldyBFcnJvcignY2xlYXJUaW1lb3V0IGhhcyBub3QgYmVlbiBkZWZpbmVkJyk7XG59XG4oZnVuY3Rpb24gKCkge1xuICAgIHRyeSB7XG4gICAgICAgIGlmICh0eXBlb2Ygc2V0VGltZW91dCA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgY2FjaGVkU2V0VGltZW91dCA9IHNldFRpbWVvdXQ7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjYWNoZWRTZXRUaW1lb3V0ID0gZGVmYXVsdFNldFRpbW91dDtcbiAgICAgICAgfVxuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgY2FjaGVkU2V0VGltZW91dCA9IGRlZmF1bHRTZXRUaW1vdXQ7XG4gICAgfVxuICAgIHRyeSB7XG4gICAgICAgIGlmICh0eXBlb2YgY2xlYXJUaW1lb3V0ID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICBjYWNoZWRDbGVhclRpbWVvdXQgPSBjbGVhclRpbWVvdXQ7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjYWNoZWRDbGVhclRpbWVvdXQgPSBkZWZhdWx0Q2xlYXJUaW1lb3V0O1xuICAgICAgICB9XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgICBjYWNoZWRDbGVhclRpbWVvdXQgPSBkZWZhdWx0Q2xlYXJUaW1lb3V0O1xuICAgIH1cbn0gKCkpXG5mdW5jdGlvbiBydW5UaW1lb3V0KGZ1bikge1xuICAgIGlmIChjYWNoZWRTZXRUaW1lb3V0ID09PSBzZXRUaW1lb3V0KSB7XG4gICAgICAgIC8vbm9ybWFsIGVudmlyb21lbnRzIGluIHNhbmUgc2l0dWF0aW9uc1xuICAgICAgICByZXR1cm4gc2V0VGltZW91dChmdW4sIDApO1xuICAgIH1cbiAgICAvLyBpZiBzZXRUaW1lb3V0IHdhc24ndCBhdmFpbGFibGUgYnV0IHdhcyBsYXR0ZXIgZGVmaW5lZFxuICAgIGlmICgoY2FjaGVkU2V0VGltZW91dCA9PT0gZGVmYXVsdFNldFRpbW91dCB8fCAhY2FjaGVkU2V0VGltZW91dCkgJiYgc2V0VGltZW91dCkge1xuICAgICAgICBjYWNoZWRTZXRUaW1lb3V0ID0gc2V0VGltZW91dDtcbiAgICAgICAgcmV0dXJuIHNldFRpbWVvdXQoZnVuLCAwKTtcbiAgICB9XG4gICAgdHJ5IHtcbiAgICAgICAgLy8gd2hlbiB3aGVuIHNvbWVib2R5IGhhcyBzY3Jld2VkIHdpdGggc2V0VGltZW91dCBidXQgbm8gSS5FLiBtYWRkbmVzc1xuICAgICAgICByZXR1cm4gY2FjaGVkU2V0VGltZW91dChmdW4sIDApO1xuICAgIH0gY2F0Y2goZSl7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICAvLyBXaGVuIHdlIGFyZSBpbiBJLkUuIGJ1dCB0aGUgc2NyaXB0IGhhcyBiZWVuIGV2YWxlZCBzbyBJLkUuIGRvZXNuJ3QgdHJ1c3QgdGhlIGdsb2JhbCBvYmplY3Qgd2hlbiBjYWxsZWQgbm9ybWFsbHlcbiAgICAgICAgICAgIHJldHVybiBjYWNoZWRTZXRUaW1lb3V0LmNhbGwobnVsbCwgZnVuLCAwKTtcbiAgICAgICAgfSBjYXRjaChlKXtcbiAgICAgICAgICAgIC8vIHNhbWUgYXMgYWJvdmUgYnV0IHdoZW4gaXQncyBhIHZlcnNpb24gb2YgSS5FLiB0aGF0IG11c3QgaGF2ZSB0aGUgZ2xvYmFsIG9iamVjdCBmb3IgJ3RoaXMnLCBob3BmdWxseSBvdXIgY29udGV4dCBjb3JyZWN0IG90aGVyd2lzZSBpdCB3aWxsIHRocm93IGEgZ2xvYmFsIGVycm9yXG4gICAgICAgICAgICByZXR1cm4gY2FjaGVkU2V0VGltZW91dC5jYWxsKHRoaXMsIGZ1biwgMCk7XG4gICAgICAgIH1cbiAgICB9XG5cblxufVxuZnVuY3Rpb24gcnVuQ2xlYXJUaW1lb3V0KG1hcmtlcikge1xuICAgIGlmIChjYWNoZWRDbGVhclRpbWVvdXQgPT09IGNsZWFyVGltZW91dCkge1xuICAgICAgICAvL25vcm1hbCBlbnZpcm9tZW50cyBpbiBzYW5lIHNpdHVhdGlvbnNcbiAgICAgICAgcmV0dXJuIGNsZWFyVGltZW91dChtYXJrZXIpO1xuICAgIH1cbiAgICAvLyBpZiBjbGVhclRpbWVvdXQgd2Fzbid0IGF2YWlsYWJsZSBidXQgd2FzIGxhdHRlciBkZWZpbmVkXG4gICAgaWYgKChjYWNoZWRDbGVhclRpbWVvdXQgPT09IGRlZmF1bHRDbGVhclRpbWVvdXQgfHwgIWNhY2hlZENsZWFyVGltZW91dCkgJiYgY2xlYXJUaW1lb3V0KSB7XG4gICAgICAgIGNhY2hlZENsZWFyVGltZW91dCA9IGNsZWFyVGltZW91dDtcbiAgICAgICAgcmV0dXJuIGNsZWFyVGltZW91dChtYXJrZXIpO1xuICAgIH1cbiAgICB0cnkge1xuICAgICAgICAvLyB3aGVuIHdoZW4gc29tZWJvZHkgaGFzIHNjcmV3ZWQgd2l0aCBzZXRUaW1lb3V0IGJ1dCBubyBJLkUuIG1hZGRuZXNzXG4gICAgICAgIHJldHVybiBjYWNoZWRDbGVhclRpbWVvdXQobWFya2VyKTtcbiAgICB9IGNhdGNoIChlKXtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIC8vIFdoZW4gd2UgYXJlIGluIEkuRS4gYnV0IHRoZSBzY3JpcHQgaGFzIGJlZW4gZXZhbGVkIHNvIEkuRS4gZG9lc24ndCAgdHJ1c3QgdGhlIGdsb2JhbCBvYmplY3Qgd2hlbiBjYWxsZWQgbm9ybWFsbHlcbiAgICAgICAgICAgIHJldHVybiBjYWNoZWRDbGVhclRpbWVvdXQuY2FsbChudWxsLCBtYXJrZXIpO1xuICAgICAgICB9IGNhdGNoIChlKXtcbiAgICAgICAgICAgIC8vIHNhbWUgYXMgYWJvdmUgYnV0IHdoZW4gaXQncyBhIHZlcnNpb24gb2YgSS5FLiB0aGF0IG11c3QgaGF2ZSB0aGUgZ2xvYmFsIG9iamVjdCBmb3IgJ3RoaXMnLCBob3BmdWxseSBvdXIgY29udGV4dCBjb3JyZWN0IG90aGVyd2lzZSBpdCB3aWxsIHRocm93IGEgZ2xvYmFsIGVycm9yLlxuICAgICAgICAgICAgLy8gU29tZSB2ZXJzaW9ucyBvZiBJLkUuIGhhdmUgZGlmZmVyZW50IHJ1bGVzIGZvciBjbGVhclRpbWVvdXQgdnMgc2V0VGltZW91dFxuICAgICAgICAgICAgcmV0dXJuIGNhY2hlZENsZWFyVGltZW91dC5jYWxsKHRoaXMsIG1hcmtlcik7XG4gICAgICAgIH1cbiAgICB9XG5cblxuXG59XG52YXIgcXVldWUgPSBbXTtcbnZhciBkcmFpbmluZyA9IGZhbHNlO1xudmFyIGN1cnJlbnRRdWV1ZTtcbnZhciBxdWV1ZUluZGV4ID0gLTE7XG5cbmZ1bmN0aW9uIGNsZWFuVXBOZXh0VGljaygpIHtcbiAgICBpZiAoIWRyYWluaW5nIHx8ICFjdXJyZW50UXVldWUpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBkcmFpbmluZyA9IGZhbHNlO1xuICAgIGlmIChjdXJyZW50UXVldWUubGVuZ3RoKSB7XG4gICAgICAgIHF1ZXVlID0gY3VycmVudFF1ZXVlLmNvbmNhdChxdWV1ZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgcXVldWVJbmRleCA9IC0xO1xuICAgIH1cbiAgICBpZiAocXVldWUubGVuZ3RoKSB7XG4gICAgICAgIGRyYWluUXVldWUoKTtcbiAgICB9XG59XG5cbmZ1bmN0aW9uIGRyYWluUXVldWUoKSB7XG4gICAgaWYgKGRyYWluaW5nKSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdmFyIHRpbWVvdXQgPSBydW5UaW1lb3V0KGNsZWFuVXBOZXh0VGljayk7XG4gICAgZHJhaW5pbmcgPSB0cnVlO1xuXG4gICAgdmFyIGxlbiA9IHF1ZXVlLmxlbmd0aDtcbiAgICB3aGlsZShsZW4pIHtcbiAgICAgICAgY3VycmVudFF1ZXVlID0gcXVldWU7XG4gICAgICAgIHF1ZXVlID0gW107XG4gICAgICAgIHdoaWxlICgrK3F1ZXVlSW5kZXggPCBsZW4pIHtcbiAgICAgICAgICAgIGlmIChjdXJyZW50UXVldWUpIHtcbiAgICAgICAgICAgICAgICBjdXJyZW50UXVldWVbcXVldWVJbmRleF0ucnVuKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcXVldWVJbmRleCA9IC0xO1xuICAgICAgICBsZW4gPSBxdWV1ZS5sZW5ndGg7XG4gICAgfVxuICAgIGN1cnJlbnRRdWV1ZSA9IG51bGw7XG4gICAgZHJhaW5pbmcgPSBmYWxzZTtcbiAgICBydW5DbGVhclRpbWVvdXQodGltZW91dCk7XG59XG5cbnByb2Nlc3MubmV4dFRpY2sgPSBmdW5jdGlvbiAoZnVuKSB7XG4gICAgdmFyIGFyZ3MgPSBuZXcgQXJyYXkoYXJndW1lbnRzLmxlbmd0aCAtIDEpO1xuICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID4gMSkge1xuICAgICAgICBmb3IgKHZhciBpID0gMTsgaSA8IGFyZ3VtZW50cy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgYXJnc1tpIC0gMV0gPSBhcmd1bWVudHNbaV07XG4gICAgICAgIH1cbiAgICB9XG4gICAgcXVldWUucHVzaChuZXcgSXRlbShmdW4sIGFyZ3MpKTtcbiAgICBpZiAocXVldWUubGVuZ3RoID09PSAxICYmICFkcmFpbmluZykge1xuICAgICAgICBydW5UaW1lb3V0KGRyYWluUXVldWUpO1xuICAgIH1cbn07XG5cbi8vIHY4IGxpa2VzIHByZWRpY3RpYmxlIG9iamVjdHNcbmZ1bmN0aW9uIEl0ZW0oZnVuLCBhcnJheSkge1xuICAgIHRoaXMuZnVuID0gZnVuO1xuICAgIHRoaXMuYXJyYXkgPSBhcnJheTtcbn1cbkl0ZW0ucHJvdG90eXBlLnJ1biA9IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLmZ1bi5hcHBseShudWxsLCB0aGlzLmFycmF5KTtcbn07XG5wcm9jZXNzLnRpdGxlID0gJ2Jyb3dzZXInO1xucHJvY2Vzcy5icm93c2VyID0gdHJ1ZTtcbnByb2Nlc3MuZW52ID0ge307XG5wcm9jZXNzLmFyZ3YgPSBbXTtcbnByb2Nlc3MudmVyc2lvbiA9ICcnOyAvLyBlbXB0eSBzdHJpbmcgdG8gYXZvaWQgcmVnZXhwIGlzc3Vlc1xucHJvY2Vzcy52ZXJzaW9ucyA9IHt9O1xuXG5mdW5jdGlvbiBub29wKCkge31cblxucHJvY2Vzcy5vbiA9IG5vb3A7XG5wcm9jZXNzLmFkZExpc3RlbmVyID0gbm9vcDtcbnByb2Nlc3Mub25jZSA9IG5vb3A7XG5wcm9jZXNzLm9mZiA9IG5vb3A7XG5wcm9jZXNzLnJlbW92ZUxpc3RlbmVyID0gbm9vcDtcbnByb2Nlc3MucmVtb3ZlQWxsTGlzdGVuZXJzID0gbm9vcDtcbnByb2Nlc3MuZW1pdCA9IG5vb3A7XG5wcm9jZXNzLnByZXBlbmRMaXN0ZW5lciA9IG5vb3A7XG5wcm9jZXNzLnByZXBlbmRPbmNlTGlzdGVuZXIgPSBub29wO1xuXG5wcm9jZXNzLmxpc3RlbmVycyA9IGZ1bmN0aW9uIChuYW1lKSB7IHJldHVybiBbXSB9XG5cbnByb2Nlc3MuYmluZGluZyA9IGZ1bmN0aW9uIChuYW1lKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdwcm9jZXNzLmJpbmRpbmcgaXMgbm90IHN1cHBvcnRlZCcpO1xufTtcblxucHJvY2Vzcy5jd2QgPSBmdW5jdGlvbiAoKSB7IHJldHVybiAnLycgfTtcbnByb2Nlc3MuY2hkaXIgPSBmdW5jdGlvbiAoZGlyKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdwcm9jZXNzLmNoZGlyIGlzIG5vdCBzdXBwb3J0ZWQnKTtcbn07XG5wcm9jZXNzLnVtYXNrID0gZnVuY3Rpb24oKSB7IHJldHVybiAwOyB9O1xuIiwiaW1wb3J0IHsgY3JlYXRlTUlESUFjY2VzcywgY2xvc2VBbGxNSURJSW5wdXRzIH0gZnJvbSAnLi9taWRpL21pZGlfYWNjZXNzJztcbmltcG9ydCB7IHBvbHlmaWxsLCBnZXREZXZpY2UsIGdldFNjb3BlIH0gZnJvbSAnLi91dGlsL3V0aWwnO1xuLy8gaW1wb3J0IE1JRElJbnB1dCBmcm9tICcuL21pZGkvbWlkaV9pbnB1dCc7XG4vLyBpbXBvcnQgTUlESU91dHB1dCBmcm9tICcuL21pZGkvbWlkaV9vdXRwdXQnO1xuaW1wb3J0ICogYXMgSW5wdXQgZnJvbSAnLi9taWRpL21pZGlfaW5wdXQnO1xuaW1wb3J0ICogYXMgT3V0cHV0IGZyb20gJy4vbWlkaS9taWRpX291dHB1dCc7XG5pbXBvcnQgTUlESU1lc3NhZ2VFdmVudCBmcm9tICcuL21pZGkvbWlkaW1lc3NhZ2VfZXZlbnQnO1xuaW1wb3J0IE1JRElDb25uZWN0aW9uRXZlbnQgZnJvbSAnLi9taWRpL21pZGljb25uZWN0aW9uX2V2ZW50JztcblxubGV0IG1pZGlBY2Nlc3M7XG5cbmNvbnN0IGluaXQgPSAoKSA9PiB7XG4gICAgaWYgKCFuYXZpZ2F0b3IucmVxdWVzdE1JRElBY2Nlc3MpIHtcbiAgICAgICAgLy8gQWRkIHNvbWUgZnVuY3Rpb25hbGl0eSB0byBvbGRlciBicm93c2Vyc1xuICAgICAgICBwb2x5ZmlsbCgpO1xuXG4gICAgICAgIG5hdmlnYXRvci5yZXF1ZXN0TUlESUFjY2VzcyA9ICgpID0+IHtcbiAgICAgICAgICAgIC8vIFNpbmdsZXRvbi1pc2gsIG5vIG5lZWQgdG8gY3JlYXRlIG11bHRpcGxlIGluc3RhbmNlcyBvZiBNSURJQWNjZXNzXG4gICAgICAgICAgICBpZiAobWlkaUFjY2VzcyA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgbWlkaUFjY2VzcyA9IGNyZWF0ZU1JRElBY2Nlc3MoKTtcbiAgICAgICAgICAgICAgICAvLyBBZGQgZ2xvYmFsIHZhcnMgdGhhdCBtaW1pYyBXZWJNSURJIEFQSSBuYXRpdmUgZ2xvYmFsc1xuICAgICAgICAgICAgICAgIGNvbnN0IHNjb3BlID0gZ2V0U2NvcGUoKTtcbiAgICAgICAgICAgICAgICBzY29wZS5NSURJSW5wdXQgPSBJbnB1dDtcbiAgICAgICAgICAgICAgICBzY29wZS5NSURJT3V0cHV0ID0gT3V0cHV0O1xuICAgICAgICAgICAgICAgIHNjb3BlLk1JRElNZXNzYWdlRXZlbnQgPSBNSURJTWVzc2FnZUV2ZW50O1xuICAgICAgICAgICAgICAgIHNjb3BlLk1JRElDb25uZWN0aW9uRXZlbnQgPSBNSURJQ29ubmVjdGlvbkV2ZW50O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIG1pZGlBY2Nlc3M7XG4gICAgICAgIH07XG4gICAgICAgIGlmIChnZXREZXZpY2UoKS5ub2RlanMgPT09IHRydWUpIHtcbiAgICAgICAgICAgIG5hdmlnYXRvci5jbG9zZSA9ICgpID0+IHtcbiAgICAgICAgICAgICAgICAvLyBGb3IgTm9kZWpzIGFwcGxpY2F0aW9ucyB3ZSBuZWVkIHRvIGFkZCBhIG1ldGhvZCB0aGF0IGNsb3NlcyBhbGwgTUlESSBpbnB1dCBwb3J0cyxcbiAgICAgICAgICAgICAgICAvLyBvdGhlcndpc2UgTm9kZWpzIHdpbGwgd2FpdCBmb3IgTUlESSBpbnB1dCBmb3JldmVyLlxuICAgICAgICAgICAgICAgIGNsb3NlQWxsTUlESUlucHV0cygpO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgIH1cbn07XG5cbmluaXQoKTtcbiIsIi8qXG4gIENyZWF0ZXMgYSBNSURJQWNjZXNzIGluc3RhbmNlOlxuICAtIENyZWF0ZXMgTUlESUlucHV0IGFuZCBNSURJT3V0cHV0IGluc3RhbmNlcyBmb3IgdGhlIGluaXRpYWxseSBjb25uZWN0ZWQgTUlESSBkZXZpY2VzLlxuICAtIEtlZXBzIHRyYWNrIG9mIG5ld2x5IGNvbm5lY3RlZCBkZXZpY2VzIGFuZCBjcmVhdGVzIHRoZSBuZWNlc3NhcnkgaW5zdGFuY2VzIG9mIE1JRElJbnB1dCBhbmQgTUlESU91dHB1dC5cbiAgLSBLZWVwcyB0cmFjayBvZiBkaXNjb25uZWN0ZWQgZGV2aWNlcyBhbmQgcmVtb3ZlcyB0aGVtIGZyb20gdGhlIGlucHV0cyBhbmQvb3Igb3V0cHV0cyBtYXAuXG4gIC0gQ3JlYXRlcyBhIHVuaXF1ZSBpZCBmb3IgZXZlcnkgZGV2aWNlIGFuZCBzdG9yZXMgdGhlc2UgaWRzIGJ5IHRoZSBuYW1lIG9mIHRoZSBkZXZpY2U6XG4gICAgc28gd2hlbiBhIGRldmljZSBnZXRzIGRpc2Nvbm5lY3RlZCBhbmQgcmVjb25uZWN0ZWQgYWdhaW4sIGl0IHdpbGwgc3RpbGwgaGF2ZSB0aGUgc2FtZSBpZC4gVGhpc1xuICAgIGlzIGluIGxpbmUgd2l0aCB0aGUgYmVoYXZpb3Igb2YgdGhlIG5hdGl2ZSBNSURJQWNjZXNzIG9iamVjdC5cblxuKi9cbmltcG9ydCBKenogZnJvbSAnanp6JztcbmltcG9ydCBNSURJSW5wdXQgZnJvbSAnLi9taWRpX2lucHV0JztcbmltcG9ydCBNSURJT3V0cHV0IGZyb20gJy4vbWlkaV9vdXRwdXQnO1xuaW1wb3J0IE1JRElDb25uZWN0aW9uRXZlbnQgZnJvbSAnLi9taWRpY29ubmVjdGlvbl9ldmVudCc7XG5pbXBvcnQgeyBnZXREZXZpY2UgfSBmcm9tICcuLi91dGlsL3V0aWwnO1xuaW1wb3J0IFN0b3JlIGZyb20gJy4uL3V0aWwvc3RvcmUnO1xuXG5sZXQgbWlkaUFjY2VzcztcbmNvbnN0IGxpc3RlbmVycyA9IG5ldyBTdG9yZSgpO1xuY29uc3QgbWlkaUlucHV0cyA9IG5ldyBTdG9yZSgpO1xuY29uc3QgbWlkaU91dHB1dHMgPSBuZXcgU3RvcmUoKTtcblxuY2xhc3MgTUlESUFjY2VzcyB7XG4gICAgY29uc3RydWN0b3IoaW5wdXRzLCBvdXRwdXRzKSB7XG4gICAgICAgIHRoaXMuc3lzZXhFbmFibGVkID0gdHJ1ZTtcbiAgICAgICAgdGhpcy5pbnB1dHMgPSBpbnB1dHM7XG4gICAgICAgIHRoaXMub3V0cHV0cyA9IG91dHB1dHM7XG4gICAgfVxuXG4gICAgYWRkRXZlbnRMaXN0ZW5lcih0eXBlLCBsaXN0ZW5lcikge1xuICAgICAgICBpZiAodHlwZSAhPT0gJ3N0YXRlY2hhbmdlJykge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGlmIChsaXN0ZW5lcnMuaGFzKGxpc3RlbmVyKSA9PT0gZmFsc2UpIHtcbiAgICAgICAgICAgIGxpc3RlbmVycy5hZGQobGlzdGVuZXIpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcmVtb3ZlRXZlbnRMaXN0ZW5lcih0eXBlLCBsaXN0ZW5lcikge1xuICAgICAgICBpZiAodHlwZSAhPT0gJ3N0YXRlY2hhbmdlJykge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGlmIChsaXN0ZW5lcnMuaGFzKGxpc3RlbmVyKSA9PT0gdHJ1ZSkge1xuICAgICAgICAgICAgbGlzdGVuZXJzLmRlbGV0ZShsaXN0ZW5lcik7XG4gICAgICAgIH1cbiAgICB9XG59XG5cblxuZXhwb3J0IGZ1bmN0aW9uIGdldE1JRElQb3J0cygpIHtcbiAgICBtaWRpSW5wdXRzLmNsZWFyKCk7XG4gICAgbWlkaU91dHB1dHMuY2xlYXIoKTtcbiAgICBKenooKS5pbmZvKCkuaW5wdXRzLmZvckVhY2goaW5mbyA9PiB7XG4gICAgICAgIGxldCBwb3J0ID0gbmV3IE1JRElJbnB1dChpbmZvKTtcbiAgICAgICAgbWlkaUlucHV0cy5zZXQocG9ydC5pZCwgcG9ydCk7XG4gICAgICAgIC8vIG1pZGlJbnB1dElkcy5zZXQocG9ydC5uYW1lLCBwb3J0LmlkKTtcbiAgICB9KTtcbiAgICBKenooKS5pbmZvKCkub3V0cHV0cy5mb3JFYWNoKGluZm8gPT4ge1xuICAgICAgICBsZXQgcG9ydCA9IG5ldyBNSURJT3V0cHV0KGluZm8pO1xuICAgICAgICBtaWRpT3V0cHV0cy5zZXQocG9ydC5pZCwgcG9ydCk7XG4gICAgICAgIC8vIG1pZGlPdXRwdXRJZHMuc2V0KHBvcnQubmFtZSwgcG9ydC5pZCk7XG4gICAgfSk7XG59XG5cblxuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZU1JRElBY2Nlc3MoKSB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKCgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgIGlmICh0eXBlb2YgbWlkaUFjY2VzcyAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICAgIHJlc29sdmUobWlkaUFjY2Vzcyk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoZ2V0RGV2aWNlKCkuYnJvd3NlciA9PT0gJ2llOScpIHtcbiAgICAgICAgICAgIHJlamVjdCh7IG1lc3NhZ2U6ICdXZWJNSURJQVBJU2hpbSBzdXBwb3J0cyBJbnRlcm5ldCBFeHBsb3JlciAxMCBhbmQgYWJvdmUuJyB9KTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIEp6eigpXG4gICAgICAgICAgICAub3IoKCkgPT4ge1xuICAgICAgICAgICAgICAgIHJlamVjdCh7IG1lc3NhZ2U6ICdObyBhY2Nlc3MgdG8gTUlESSBkZXZpY2VzOiB5b3VyIGJyb3dzZXIgZG9lcyBub3Qgc3VwcG9ydCB0aGUgV2ViTUlESSBBUEkgYW5kIHRoZSBKYXp6IGV4dGVuc2lvbiAob3IgSmF6eiBwbHVnaW4pIGlzIG5vdCBpbnN0YWxsZWQuJyB9KTtcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAuYW5kKCgpID0+IHtcbiAgICAgICAgICAgICAgICBnZXRNSURJUG9ydHMoKTtcbiAgICAgICAgICAgICAgICBtaWRpQWNjZXNzID0gbmV3IE1JRElBY2Nlc3MobWlkaUlucHV0cywgbWlkaU91dHB1dHMpO1xuICAgICAgICAgICAgICAgIHJlc29sdmUobWlkaUFjY2Vzcyk7XG4gICAgICAgICAgICB9KVxuICAgICAgICAgICAgLmVycigobXNnKSA9PiB7XG4gICAgICAgICAgICAgICAgcmVqZWN0KG1zZyk7XG4gICAgICAgICAgICB9KVxuICAgIH0pKTtcbn1cblxuXG4vLyB3aGVuIGEgZGV2aWNlIGdldHMgY29ubmVjdGVkL2Rpc2Nvbm5lY3RlZCBib3RoIHRoZSBwb3J0IGFuZCBNSURJQWNjZXNzIGRpc3BhdGNoIGEgTUlESUNvbm5lY3Rpb25FdmVudFxuLy8gdGhlcmVmb3Igd2UgY2FsbCB0aGUgcG9ydHMgZGlzcGF0Y2hFdmVudCBmdW5jdGlvbiBoZXJlIGFzIHdlbGxcbmV4cG9ydCBmdW5jdGlvbiBkaXNwYXRjaEV2ZW50KHBvcnQpIHtcbiAgICBwb3J0LmRpc3BhdGNoRXZlbnQobmV3IE1JRElDb25uZWN0aW9uRXZlbnQocG9ydCwgcG9ydCkpO1xuXG4gICAgY29uc3QgZXZ0ID0gbmV3IE1JRElDb25uZWN0aW9uRXZlbnQobWlkaUFjY2VzcywgcG9ydCk7XG5cbiAgICBpZiAodHlwZW9mIG1pZGlBY2Nlc3Mub25zdGF0ZWNoYW5nZSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICBtaWRpQWNjZXNzLm9uc3RhdGVjaGFuZ2UoZXZ0KTtcbiAgICB9XG4gICAgbGlzdGVuZXJzLmZvckVhY2gobGlzdGVuZXIgPT4gbGlzdGVuZXIoZXZ0KSk7XG59XG5cblxuZXhwb3J0IGZ1bmN0aW9uIGNsb3NlQWxsTUlESUlucHV0cygpIHtcbiAgICBtaWRpSW5wdXRzLmZvckVhY2goKGlucHV0KSA9PiB7XG4gICAgICAgIC8vIGlucHV0LmNsb3NlKCk7XG4gICAgICAgIGlucHV0Ll9qYXp6SW5zdGFuY2UuTWlkaUluQ2xvc2UoKTtcbiAgICB9KTtcbn1cbiIsIi8qXG4gIE1JRElJbnB1dCBpcyBhIHdyYXBwZXIgYXJvdW5kIGFuIGlucHV0IG9mIGEgSmF6eiBpbnN0YW5jZVxuKi9cbmltcG9ydCBKenogZnJvbSAnanp6JztcbmltcG9ydCBNSURJTWVzc2FnZUV2ZW50IGZyb20gJy4vbWlkaW1lc3NhZ2VfZXZlbnQnO1xuaW1wb3J0IE1JRElDb25uZWN0aW9uRXZlbnQgZnJvbSAnLi9taWRpY29ubmVjdGlvbl9ldmVudCc7XG5pbXBvcnQgeyBkaXNwYXRjaEV2ZW50IH0gZnJvbSAnLi9taWRpX2FjY2Vzcyc7XG5pbXBvcnQgeyBnZW5lcmF0ZVVVSUQgfSBmcm9tICcuLi91dGlsL3V0aWwnO1xuaW1wb3J0IFN0b3JlIGZyb20gJy4uL3V0aWwvc3RvcmUnO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBNSURJSW5wdXQge1xuICAgIGNvbnN0cnVjdG9yKGluZm8pIHtcbiAgICAgICAgdGhpcy5pZCA9IGluZm8uaWQgfHwgZ2VuZXJhdGVVVUlEKCk7XG4gICAgICAgIHRoaXMubmFtZSA9IGluZm8ubmFtZTtcbiAgICAgICAgdGhpcy5tYW51ZmFjdHVyZXIgPSBpbmZvLm1hbnVmYWN0dXJlcjtcbiAgICAgICAgdGhpcy52ZXJzaW9uID0gaW5mby52ZXJzaW9uO1xuICAgICAgICB0aGlzLnR5cGUgPSAnaW5wdXQnO1xuICAgICAgICB0aGlzLnN0YXRlID0gJ2Nvbm5lY3RlZCc7XG4gICAgICAgIHRoaXMuY29ubmVjdGlvbiA9ICdwZW5kaW5nJztcbiAgICAgICAgdGhpcy5wb3J0ID0gbnVsbDtcblxuICAgICAgICB0aGlzLm9uc3RhdGVjaGFuZ2UgPSBudWxsO1xuICAgICAgICB0aGlzLl9vbm1pZGltZXNzYWdlID0gbnVsbDtcblxuICAgICAgICAvLyBiZWNhdXNlIHdlIG5lZWQgdG8gaW1wbGljaXRseSBvcGVuIHRoZSBkZXZpY2Ugd2hlbiBhbiBvbm1pZGltZXNzYWdlIGhhbmRsZXIgZ2V0cyBhZGRlZFxuICAgICAgICAvLyB3ZSBkZWZpbmUgYSBzZXR0ZXIgdGhhdCBvcGVucyB0aGUgZGV2aWNlIGlmIHRoZSBzZXQgdmFsdWUgaXMgYSBmdW5jdGlvblxuICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkodGhpcywgJ29ubWlkaW1lc3NhZ2UnLCB7XG4gICAgICAgICAgICBzZXQodmFsdWUpIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9vbm1pZGltZXNzYWdlID0gdmFsdWU7XG4gICAgICAgICAgICAgICAgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5wb3J0ID09PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLm9wZW4oKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB0aGlzLnBvcnQuY29ubmVjdCgobXNnKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBtID0gbmV3IE1JRElNZXNzYWdlRXZlbnQodGhpcywgbXNnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlKG0pO1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHRoaXMuX2xpc3RlbmVycyA9IG5ldyBTdG9yZSgpXG4gICAgICAgICAgICAuc2V0KCdtaWRpbWVzc2FnZScsIG5ldyBTdG9yZSgpKVxuICAgICAgICAgICAgLnNldCgnc3RhdGVjaGFuZ2UnLCBuZXcgU3RvcmUoKSk7XG4gICAgfVxuXG4gICAgYWRkRXZlbnRMaXN0ZW5lcih0eXBlLCBsaXN0ZW5lcikge1xuICAgICAgICBjb25zdCBsaXN0ZW5lcnMgPSB0aGlzLl9saXN0ZW5lcnMuZ2V0KHR5cGUpO1xuICAgICAgICBpZiAodHlwZW9mIGxpc3RlbmVycyA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChsaXN0ZW5lcnMuaGFzKGxpc3RlbmVyKSA9PT0gZmFsc2UpIHtcbiAgICAgICAgICAgIGxpc3RlbmVycy5hZGQobGlzdGVuZXIpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcmVtb3ZlRXZlbnRMaXN0ZW5lcih0eXBlLCBsaXN0ZW5lcikge1xuICAgICAgICBjb25zdCBsaXN0ZW5lcnMgPSB0aGlzLl9saXN0ZW5lcnMuZ2V0KHR5cGUpO1xuICAgICAgICBpZiAodHlwZW9mIGxpc3RlbmVycyA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChsaXN0ZW5lcnMuaGFzKGxpc3RlbmVyKSA9PT0gdHJ1ZSkge1xuICAgICAgICAgICAgbGlzdGVuZXJzLmRlbGV0ZShsaXN0ZW5lcik7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBkaXNwYXRjaEV2ZW50KGV2dCkge1xuICAgICAgICBjb25zdCBsaXN0ZW5lcnMgPSB0aGlzLl9saXN0ZW5lcnMuZ2V0KGV2dC50eXBlKTtcbiAgICAgICAgbGlzdGVuZXJzLmZvckVhY2goKGxpc3RlbmVyKSA9PiB7XG4gICAgICAgICAgICBsaXN0ZW5lcihldnQpO1xuICAgICAgICB9KTtcblxuICAgICAgICBpZiAoZXZ0LnR5cGUgPT09ICdtaWRpbWVzc2FnZScpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLl9vbm1pZGltZXNzYWdlICE9PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fb25taWRpbWVzc2FnZShldnQpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2UgaWYgKGV2dC50eXBlID09PSAnc3RhdGVjaGFuZ2UnKSB7XG4gICAgICAgICAgICBpZiAodGhpcy5vbnN0YXRlY2hhbmdlICE9PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5vbnN0YXRlY2hhbmdlKGV2dCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBvcGVuKCkge1xuICAgICAgICBpZiAodGhpcy5jb25uZWN0aW9uID09PSAnb3BlbicpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLnBvcnQgPSBKenooKS5vcGVuTWlkaUluKHRoaXMubmFtZSlcbiAgICAgICAgICAgIC5vcihgQ291bGQgbm90IG9wZW4gaW5wdXQgJHt0aGlzLm5hbWV9YClcbiAgICAgICAgICAgIC5hbmQoKCkgPT4ge1xuICAgICAgICAgICAgICAgIHRoaXMuY29ubmVjdGlvbiA9ICdvcGVuJztcbiAgICAgICAgICAgICAgICBkaXNwYXRjaEV2ZW50KHRoaXMpOyAvLyBkaXNwYXRjaCBNSURJQ29ubmVjdGlvbkV2ZW50IHZpYSBNSURJQWNjZXNzXG4gICAgICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBjbG9zZSgpIHtcbiAgICAgICAgaWYgKHRoaXMuY29ubmVjdGlvbiA9PT0gJ2Nsb3NlZCcpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLnBvcnQuY2xvc2UoKVxuICAgICAgICAgICAgLm9yKGBDb3VsZCBub3QgY2xvc2UgaW5wdXQgJHt0aGlzLm5hbWV9YClcbiAgICAgICAgICAgIC5hbmQoKCkgPT4ge1xuICAgICAgICAgICAgICAgIHRoaXMuY29ubmVjdGlvbiA9ICdjbG9zZWQnO1xuICAgICAgICAgICAgICAgIHRoaXMucG9ydCA9IG51bGw7XG4gICAgICAgICAgICAgICAgdGhpcy5fb25taWRpbWVzc2FnZSA9IG51bGw7XG4gICAgICAgICAgICAgICAgdGhpcy5vbnN0YXRlY2hhbmdlID0gbnVsbDtcbiAgICAgICAgICAgICAgICB0aGlzLl9saXN0ZW5lcnMuZ2V0KCdtaWRpbWVzc2FnZScpLmNsZWFyKCk7XG4gICAgICAgICAgICAgICAgdGhpcy5fbGlzdGVuZXJzLmdldCgnc3RhdGVjaGFuZ2UnKS5jbGVhcigpO1xuICAgICAgICAgICAgICAgIGRpc3BhdGNoRXZlbnQodGhpcyk7IC8vIGRpc3BhdGNoIE1JRElDb25uZWN0aW9uRXZlbnQgdmlhIE1JRElBY2Nlc3NcbiAgICAgICAgICAgIH0pO1xuICAgIH1cbn1cbiIsIi8qXG4gIE1JRElPdXRwdXQgaXMgYSB3cmFwcGVyIGFyb3VuZCBhbiBvdXRwdXQgb2YgYSBKYXp6IGluc3RhbmNlXG4qL1xuaW1wb3J0IEp6eiBmcm9tICdqenonO1xuaW1wb3J0IHsgZ2VuZXJhdGVVVUlEIH0gZnJvbSAnLi4vdXRpbC91dGlsJztcbmltcG9ydCBTdG9yZSBmcm9tICcuLi91dGlsL3N0b3JlJztcbmltcG9ydCB7IGRpc3BhdGNoRXZlbnQgfSBmcm9tICcuL21pZGlfYWNjZXNzJztcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgTUlESU91dHB1dCB7XG4gICAgY29uc3RydWN0b3IoaW5mbykge1xuICAgICAgICB0aGlzLmlkID0gaW5mby5pZCB8fCBnZW5lcmF0ZVVVSUQoKTtcbiAgICAgICAgdGhpcy5uYW1lID0gaW5mby5uYW1lO1xuICAgICAgICB0aGlzLm1hbnVmYWN0dXJlciA9IGluZm8ubWFudWZhY3R1cmVyO1xuICAgICAgICB0aGlzLnZlcnNpb24gPSBpbmZvLnZlcnNpb247XG4gICAgICAgIHRoaXMudHlwZSA9ICdvdXRwdXQnO1xuICAgICAgICB0aGlzLnN0YXRlID0gJ2Nvbm5lY3RlZCc7XG4gICAgICAgIHRoaXMuY29ubmVjdGlvbiA9ICdwZW5kaW5nJztcbiAgICAgICAgdGhpcy5vbm1pZGltZXNzYWdlID0gbnVsbDtcbiAgICAgICAgdGhpcy5vbnN0YXRlY2hhbmdlID0gbnVsbDtcbiAgICAgICAgdGhpcy5wb3J0ID0gbnVsbDtcblxuICAgICAgICB0aGlzLl9saXN0ZW5lcnMgPSBuZXcgU3RvcmUoKTtcbiAgICB9XG5cbiAgICBvcGVuKCkge1xuICAgICAgICBpZiAodGhpcy5jb25uZWN0aW9uID09PSAnb3BlbicpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLnBvcnQgPSBKenooKS5vcGVuTWlkaU91dCh0aGlzLm5hbWUpXG4gICAgICAgICAgICAub3IoYENvdWxkIG5vdCBvcGVuIGlucHV0ICR7dGhpcy5uYW1lfWApXG4gICAgICAgICAgICAuYW5kKCgpID0+IHtcbiAgICAgICAgICAgICAgICB0aGlzLmNvbm5lY3Rpb24gPSAnb3Blbic7XG4gICAgICAgICAgICAgICAgZGlzcGF0Y2hFdmVudCh0aGlzKTsgLy8gZGlzcGF0Y2ggTUlESUNvbm5lY3Rpb25FdmVudCB2aWEgTUlESUFjY2Vzc1xuICAgICAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgY2xvc2UoKSB7XG4gICAgICAgIGlmICh0aGlzLmNvbm5lY3Rpb24gPT09ICdjbG9zZWQnKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5wb3J0LmNsb3NlKClcbiAgICAgICAgICAgIC5vcihgQ291bGQgbm90IGNsb3NlIG91dHB1dCAke3RoaXMubmFtZX1gKVxuICAgICAgICAgICAgLmFuZCgoKSA9PiB7XG4gICAgICAgICAgICAgICAgZGlzcGF0Y2hFdmVudCh0aGlzKTsgLy8gZGlzcGF0Y2ggTUlESUNvbm5lY3Rpb25FdmVudCB2aWEgTUlESUFjY2Vzc1xuICAgICAgICAgICAgICAgIHRoaXMuY29ubmVjdGlvbiA9ICdjbG9zZWQnO1xuICAgICAgICAgICAgICAgIHRoaXMub25zdGF0ZWNoYW5nZSA9IG51bGw7XG4gICAgICAgICAgICAgICAgdGhpcy5fbGlzdGVuZXJzLmNsZWFyKCk7XG4gICAgICAgICAgICB9KVxuICAgIH1cblxuICAgIHNlbmQoZGF0YSwgdGltZXN0YW1wID0gMCkge1xuICAgICAgICBsZXQgZGVsYXlCZWZvcmVTZW5kID0gMDtcbiAgICAgICAgaWYgKHRpbWVzdGFtcCAhPT0gMCkge1xuICAgICAgICAgICAgZGVsYXlCZWZvcmVTZW5kID0gTWF0aC5mbG9vcih0aW1lc3RhbXAgLSBwZXJmb3JtYW5jZS5ub3coKSk7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLnBvcnRcbiAgICAgICAgICAgIC53YWl0KGRlbGF5QmVmb3JlU2VuZClcbiAgICAgICAgICAgIC5zZW5kKGRhdGEpO1xuXG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cblxuICAgIGNsZWFyKCkge1xuICAgICAgICAvLyB0byBiZSBpbXBsZW1lbnRlZFxuICAgIH1cblxuICAgIGFkZEV2ZW50TGlzdGVuZXIodHlwZSwgbGlzdGVuZXIpIHtcbiAgICAgICAgaWYgKHR5cGUgIT09ICdzdGF0ZWNoYW5nZScpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0aGlzLl9saXN0ZW5lcnMuaGFzKGxpc3RlbmVyKSA9PT0gZmFsc2UpIHtcbiAgICAgICAgICAgIHRoaXMuX2xpc3RlbmVycy5hZGQobGlzdGVuZXIpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcmVtb3ZlRXZlbnRMaXN0ZW5lcih0eXBlLCBsaXN0ZW5lcikge1xuICAgICAgICBpZiAodHlwZSAhPT0gJ3N0YXRlY2hhbmdlJykge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHRoaXMuX2xpc3RlbmVycy5oYXMobGlzdGVuZXIpID09PSB0cnVlKSB7XG4gICAgICAgICAgICB0aGlzLl9saXN0ZW5lcnMuZGVsZXRlKGxpc3RlbmVyKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGRpc3BhdGNoRXZlbnQoZXZ0KSB7XG4gICAgICAgIHRoaXMuX2xpc3RlbmVycy5mb3JFYWNoKChsaXN0ZW5lcikgPT4ge1xuICAgICAgICAgICAgbGlzdGVuZXIoZXZ0KTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgaWYgKHRoaXMub25zdGF0ZWNoYW5nZSAhPT0gbnVsbCkge1xuICAgICAgICAgICAgdGhpcy5vbnN0YXRlY2hhbmdlKGV2dCk7XG4gICAgICAgIH1cbiAgICB9XG59XG4iLCJleHBvcnQgZGVmYXVsdCBjbGFzcyBNSURJQ29ubmVjdGlvbkV2ZW50IHtcbiAgICBjb25zdHJ1Y3RvcihtaWRpQWNjZXNzLCBwb3J0KSB7XG4gICAgICAgIHRoaXMuYnViYmxlcyA9IGZhbHNlO1xuICAgICAgICB0aGlzLmNhbmNlbEJ1YmJsZSA9IGZhbHNlO1xuICAgICAgICB0aGlzLmNhbmNlbGFibGUgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5jdXJyZW50VGFyZ2V0ID0gbWlkaUFjY2VzcztcbiAgICAgICAgdGhpcy5kZWZhdWx0UHJldmVudGVkID0gZmFsc2U7XG4gICAgICAgIHRoaXMuZXZlbnRQaGFzZSA9IDA7XG4gICAgICAgIHRoaXMucGF0aCA9IFtdO1xuICAgICAgICB0aGlzLnBvcnQgPSBwb3J0O1xuICAgICAgICB0aGlzLnJldHVyblZhbHVlID0gdHJ1ZTtcbiAgICAgICAgdGhpcy5zcmNFbGVtZW50ID0gbWlkaUFjY2VzcztcbiAgICAgICAgdGhpcy50YXJnZXQgPSBtaWRpQWNjZXNzO1xuICAgICAgICB0aGlzLnRpbWVTdGFtcCA9IERhdGUubm93KCk7XG4gICAgICAgIHRoaXMudHlwZSA9ICdzdGF0ZWNoYW5nZSc7XG4gICAgfVxufVxuIiwiZXhwb3J0IGRlZmF1bHQgY2xhc3MgTUlESU1lc3NhZ2VFdmVudCB7XG4gICAgY29uc3RydWN0b3IocG9ydCwgZGF0YSwgcmVjZWl2ZWRUaW1lKSB7XG4gICAgICAgIHRoaXMuYnViYmxlcyA9IGZhbHNlO1xuICAgICAgICB0aGlzLmNhbmNlbEJ1YmJsZSA9IGZhbHNlO1xuICAgICAgICB0aGlzLmNhbmNlbGFibGUgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5jdXJyZW50VGFyZ2V0ID0gcG9ydDtcbiAgICAgICAgdGhpcy5kYXRhID0gZGF0YTtcbiAgICAgICAgdGhpcy5kZWZhdWx0UHJldmVudGVkID0gZmFsc2U7XG4gICAgICAgIHRoaXMuZXZlbnRQaGFzZSA9IDA7XG4gICAgICAgIHRoaXMucGF0aCA9IFtdO1xuICAgICAgICB0aGlzLnJlY2VpdmVkVGltZSA9IHJlY2VpdmVkVGltZTtcbiAgICAgICAgdGhpcy5yZXR1cm5WYWx1ZSA9IHRydWU7XG4gICAgICAgIHRoaXMuc3JjRWxlbWVudCA9IHBvcnQ7XG4gICAgICAgIHRoaXMudGFyZ2V0ID0gcG9ydDtcbiAgICAgICAgdGhpcy50aW1lU3RhbXAgPSBEYXRlLm5vdygpO1xuICAgICAgICB0aGlzLnR5cGUgPSAnbWlkaW1lc3NhZ2UnO1xuICAgIH1cbn1cbiIsIi8vIGVzNSBpbXBsZW1lbnRhdGlvbiBvZiBib3RoIE1hcCBhbmQgU2V0XG5cbmxldCBpZEluZGV4ID0gMDtcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgU3RvcmUge1xuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICB0aGlzLnN0b3JlID0ge307XG4gICAgICAgIHRoaXMua2V5cyA9IFtdO1xuICAgIH1cbiAgICBhZGQob2JqKSB7XG4gICAgICAgIGNvbnN0IGlkID0gYCR7bmV3IERhdGUoKS5nZXRUaW1lKCl9JHtpZEluZGV4fWA7XG4gICAgICAgIGlkSW5kZXggKz0gMTtcbiAgICAgICAgdGhpcy5rZXlzLnB1c2goaWQpO1xuICAgICAgICB0aGlzLnN0b3JlW2lkXSA9IG9iajtcbiAgICB9XG4gICAgc2V0KGlkLCBvYmopIHtcbiAgICAgICAgdGhpcy5rZXlzLnB1c2goaWQpO1xuICAgICAgICB0aGlzLnN0b3JlW2lkXSA9IG9iajtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuICAgIGdldChpZCkge1xuICAgICAgICByZXR1cm4gdGhpcy5zdG9yZVtpZF07XG4gICAgfVxuICAgIGhhcyhpZCkge1xuICAgICAgICByZXR1cm4gdGhpcy5rZXlzLmluZGV4T2YoaWQpICE9PSAtMTtcbiAgICB9XG4gICAgZGVsZXRlKGlkKSB7XG4gICAgICAgIGRlbGV0ZSB0aGlzLnN0b3JlW2lkXTtcbiAgICAgICAgY29uc3QgaW5kZXggPSB0aGlzLmtleXMuaW5kZXhPZihpZCk7XG4gICAgICAgIGlmIChpbmRleCA+IC0xKSB7XG4gICAgICAgICAgICB0aGlzLmtleXMuc3BsaWNlKGluZGV4LCAxKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG4gICAgdmFsdWVzKCkge1xuICAgICAgICBjb25zdCBlbGVtZW50cyA9IFtdO1xuICAgICAgICBjb25zdCBsID0gdGhpcy5rZXlzLmxlbmd0aDtcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBsOyBpICs9IDEpIHtcbiAgICAgICAgICAgIGNvbnN0IGVsZW1lbnQgPSB0aGlzLnN0b3JlW3RoaXMua2V5c1tpXV07XG4gICAgICAgICAgICBlbGVtZW50cy5wdXNoKGVsZW1lbnQpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBlbGVtZW50cztcbiAgICB9XG4gICAgZm9yRWFjaChjYikge1xuICAgICAgICBjb25zdCBsID0gdGhpcy5rZXlzLmxlbmd0aDtcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBsOyBpICs9IDEpIHtcbiAgICAgICAgICAgIGNvbnN0IGVsZW1lbnQgPSB0aGlzLnN0b3JlW3RoaXMua2V5c1tpXV07XG4gICAgICAgICAgICBjYihlbGVtZW50KTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBjbGVhcigpIHtcbiAgICAgICAgdGhpcy5rZXlzID0gW107XG4gICAgICAgIHRoaXMuc3RvcmUgPSB7fTtcbiAgICB9XG59XG4iLCJsZXQgU2NvcGU7XG5sZXQgZGV2aWNlID0gbnVsbDtcblxuLy8gY2hlY2sgaWYgd2UgYXJlIGluIGEgYnJvd3NlciBvciBpbiBOb2RlanNcbmV4cG9ydCBmdW5jdGlvbiBnZXRTY29wZSgpIHtcbiAgICBpZiAodHlwZW9mIFNjb3BlICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgICByZXR1cm4gU2NvcGU7XG4gICAgfVxuICAgIFNjb3BlID0gbnVsbDtcbiAgICBpZiAodHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgU2NvcGUgPSB3aW5kb3c7XG4gICAgfSBlbHNlIGlmICh0eXBlb2YgZ2xvYmFsICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgICBTY29wZSA9IGdsb2JhbDtcbiAgICB9XG4gICAgLy8gY29uc29sZS5sb2coJ3Njb3BlJywgc2NvcGUpO1xuICAgIHJldHVybiBTY29wZTtcbn1cblxuXG4vLyBjaGVjayBvbiB3aGF0IHR5cGUgb2YgZGV2aWNlIHdlIGFyZSBydW5uaW5nLCBub3RlIHRoYXQgaW4gdGhpcyBjb250ZXh0XG4vLyBhIGRldmljZSBpcyBhIGNvbXB1dGVyIG5vdCBhIE1JREkgZGV2aWNlXG5leHBvcnQgZnVuY3Rpb24gZ2V0RGV2aWNlKCkge1xuICAgIGNvbnN0IHNjb3BlID0gZ2V0U2NvcGUoKTtcbiAgICBpZiAoZGV2aWNlICE9PSBudWxsKSB7XG4gICAgICAgIHJldHVybiBkZXZpY2U7XG4gICAgfVxuXG4gICAgbGV0IHBsYXRmb3JtID0gJ3VuZGV0ZWN0ZWQnO1xuICAgIGxldCBicm93c2VyID0gJ3VuZGV0ZWN0ZWQnO1xuXG4gICAgaWYgKHNjb3BlLm5hdmlnYXRvci5ub2RlID09PSB0cnVlKSB7XG4gICAgICAgIGRldmljZSA9IHtcbiAgICAgICAgICAgIHBsYXRmb3JtOiBwcm9jZXNzLnBsYXRmb3JtLFxuICAgICAgICAgICAgbm9kZWpzOiB0cnVlLFxuICAgICAgICAgICAgbW9iaWxlOiBwbGF0Zm9ybSA9PT0gJ2lvcycgfHwgcGxhdGZvcm0gPT09ICdhbmRyb2lkJyxcbiAgICAgICAgfTtcbiAgICAgICAgcmV0dXJuIGRldmljZTtcbiAgICB9XG5cbiAgICBjb25zdCB1YSA9IHNjb3BlLm5hdmlnYXRvci51c2VyQWdlbnQ7XG5cbiAgICBpZiAodWEubWF0Y2goLyhpUGFkfGlQaG9uZXxpUG9kKS9nKSkge1xuICAgICAgICBwbGF0Zm9ybSA9ICdpb3MnO1xuICAgIH0gZWxzZSBpZiAodWEuaW5kZXhPZignQW5kcm9pZCcpICE9PSAtMSkge1xuICAgICAgICBwbGF0Zm9ybSA9ICdhbmRyb2lkJztcbiAgICB9IGVsc2UgaWYgKHVhLmluZGV4T2YoJ0xpbnV4JykgIT09IC0xKSB7XG4gICAgICAgIHBsYXRmb3JtID0gJ2xpbnV4JztcbiAgICB9IGVsc2UgaWYgKHVhLmluZGV4T2YoJ01hY2ludG9zaCcpICE9PSAtMSkge1xuICAgICAgICBwbGF0Zm9ybSA9ICdvc3gnO1xuICAgIH0gZWxzZSBpZiAodWEuaW5kZXhPZignV2luZG93cycpICE9PSAtMSkge1xuICAgICAgICBwbGF0Zm9ybSA9ICd3aW5kb3dzJztcbiAgICB9XG5cbiAgICBpZiAodWEuaW5kZXhPZignQ2hyb21lJykgIT09IC0xKSB7XG4gICAgICAgIC8vIGNocm9tZSwgY2hyb21pdW0gYW5kIGNhbmFyeVxuICAgICAgICBicm93c2VyID0gJ2Nocm9tZSc7XG5cbiAgICAgICAgaWYgKHVhLmluZGV4T2YoJ09QUicpICE9PSAtMSkge1xuICAgICAgICAgICAgYnJvd3NlciA9ICdvcGVyYSc7XG4gICAgICAgIH0gZWxzZSBpZiAodWEuaW5kZXhPZignQ2hyb21pdW0nKSAhPT0gLTEpIHtcbiAgICAgICAgICAgIGJyb3dzZXIgPSAnY2hyb21pdW0nO1xuICAgICAgICB9XG4gICAgfSBlbHNlIGlmICh1YS5pbmRleE9mKCdTYWZhcmknKSAhPT0gLTEpIHtcbiAgICAgICAgYnJvd3NlciA9ICdzYWZhcmknO1xuICAgIH0gZWxzZSBpZiAodWEuaW5kZXhPZignRmlyZWZveCcpICE9PSAtMSkge1xuICAgICAgICBicm93c2VyID0gJ2ZpcmVmb3gnO1xuICAgIH0gZWxzZSBpZiAodWEuaW5kZXhPZignVHJpZGVudCcpICE9PSAtMSkge1xuICAgICAgICBicm93c2VyID0gJ2llJztcbiAgICAgICAgaWYgKHVhLmluZGV4T2YoJ01TSUUgOScpICE9PSAtMSkge1xuICAgICAgICAgICAgYnJvd3NlciA9ICdpZTknO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgaWYgKHBsYXRmb3JtID09PSAnaW9zJykge1xuICAgICAgICBpZiAodWEuaW5kZXhPZignQ3JpT1MnKSAhPT0gLTEpIHtcbiAgICAgICAgICAgIGJyb3dzZXIgPSAnY2hyb21lJztcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGRldmljZSA9IHtcbiAgICAgICAgcGxhdGZvcm0sXG4gICAgICAgIGJyb3dzZXIsXG4gICAgICAgIG1vYmlsZTogcGxhdGZvcm0gPT09ICdpb3MnIHx8IHBsYXRmb3JtID09PSAnYW5kcm9pZCcsXG4gICAgICAgIG5vZGVqczogZmFsc2UsXG4gICAgfTtcbiAgICByZXR1cm4gZGV2aWNlO1xufVxuXG5cbi8vIHBvbHlmaWxsIGZvciB3aW5kb3cucGVyZm9ybWFuY2Uubm93KClcbmNvbnN0IHBvbHlmaWxsUGVyZm9ybWFuY2UgPSAoKSA9PiB7XG4gICAgY29uc3Qgc2NvcGUgPSBnZXRTY29wZSgpO1xuICAgIGlmICh0eXBlb2Ygc2NvcGUucGVyZm9ybWFuY2UgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgIHNjb3BlLnBlcmZvcm1hbmNlID0ge307XG4gICAgfVxuICAgIERhdGUubm93ID0gRGF0ZS5ub3cgfHwgKCgpID0+IG5ldyBEYXRlKCkuZ2V0VGltZSgpKTtcblxuICAgIGlmICh0eXBlb2Ygc2NvcGUucGVyZm9ybWFuY2Uubm93ID09PSAndW5kZWZpbmVkJykge1xuICAgICAgICBsZXQgbm93T2Zmc2V0ID0gRGF0ZS5ub3coKTtcbiAgICAgICAgaWYgKFxuICAgICAgICAgICAgdHlwZW9mIHNjb3BlLnBlcmZvcm1hbmNlLnRpbWluZyAhPT0gJ3VuZGVmaW5lZCcgJiZcbiAgICAgICAgICAgIHR5cGVvZiBzY29wZS5wZXJmb3JtYW5jZS50aW1pbmcubmF2aWdhdGlvblN0YXJ0ICE9PSAndW5kZWZpbmVkJ1xuICAgICAgICApIHtcbiAgICAgICAgICAgIG5vd09mZnNldCA9IHNjb3BlLnBlcmZvcm1hbmNlLnRpbWluZy5uYXZpZ2F0aW9uU3RhcnQ7XG4gICAgICAgIH1cbiAgICAgICAgc2NvcGUucGVyZm9ybWFuY2Uubm93ID0gZnVuY3Rpb24gbm93KCkge1xuICAgICAgICAgICAgcmV0dXJuIERhdGUubm93KCkgLSBub3dPZmZzZXQ7XG4gICAgICAgIH07XG4gICAgfVxufVxuXG4vLyBnZW5lcmF0ZXMgVVVJRCBmb3IgTUlESSBkZXZpY2VzXG5leHBvcnQgZnVuY3Rpb24gZ2VuZXJhdGVVVUlEKCkge1xuICAgIGxldCBkID0gbmV3IERhdGUoKS5nZXRUaW1lKCk7XG4gICAgbGV0IHV1aWQgPSBuZXcgQXJyYXkoNjQpLmpvaW4oJ3gnKTsvLyAneHh4eHh4eHgteHh4eC00eHh4LXl4eHgteHh4eHh4eHh4eHh4JztcbiAgICB1dWlkID0gdXVpZC5yZXBsYWNlKC9beHldL2csIChjKSA9PiB7XG4gICAgICAgIGNvbnN0IHIgPSAoZCArIE1hdGgucmFuZG9tKCkgKiAxNikgJSAxNiB8IDA7XG4gICAgICAgIGQgPSBNYXRoLmZsb29yKGQgLyAxNik7XG4gICAgICAgIHJldHVybiAoYyA9PT0gJ3gnID8gciA6IChyICYgMHgzIHwgMHg4KSkudG9TdHJpbmcoMTYpLnRvVXBwZXJDYXNlKCk7XG4gICAgfSk7XG4gICAgcmV0dXJuIHV1aWQ7XG59XG5cblxuLy8gYSB2ZXJ5IHNpbXBsZSBpbXBsZW1lbnRhdGlvbiBvZiBhIFByb21pc2UgZm9yIEludGVybmV0IEV4cGxvcmVyIGFuZCBOb2RlanNcbmNvbnN0IHBvbHlmaWxsUHJvbWlzZSA9ICgpID0+IHtcbiAgICBjb25zdCBzY29wZSA9IGdldFNjb3BlKCk7XG4gICAgaWYgKHR5cGVvZiBzY29wZS5Qcm9taXNlICE9PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIHNjb3BlLlByb21pc2UgPSBmdW5jdGlvbiBwcm9taXNlKGV4ZWN1dG9yKSB7XG4gICAgICAgICAgICB0aGlzLmV4ZWN1dG9yID0gZXhlY3V0b3I7XG4gICAgICAgIH07XG5cbiAgICAgICAgc2NvcGUuUHJvbWlzZS5wcm90b3R5cGUudGhlbiA9IGZ1bmN0aW9uIHRoZW4ocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgICAgICAgICBpZiAodHlwZW9mIHJlc29sdmUgIT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgICAgICByZXNvbHZlID0gKCkgPT4geyB9O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHR5cGVvZiByZWplY3QgIT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgICAgICByZWplY3QgPSAoKSA9PiB7IH07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLmV4ZWN1dG9yKHJlc29sdmUsIHJlamVjdCk7XG4gICAgICAgIH07XG4gICAgfVxufVxuXG5cbmV4cG9ydCBmdW5jdGlvbiBwb2x5ZmlsbCgpIHtcbiAgICBjb25zdCBkID0gZ2V0RGV2aWNlKCk7XG4gICAgLy8gY29uc29sZS5sb2coZGV2aWNlKTtcbiAgICBpZiAoZC5icm93c2VyID09PSAnaWUnIHx8IGQubm9kZWpzID09PSB0cnVlKSB7XG4gICAgICAgIHBvbHlmaWxsUHJvbWlzZSgpO1xuICAgIH1cbiAgICBwb2x5ZmlsbFBlcmZvcm1hbmNlKCk7XG59XG5cbiJdfQ==
