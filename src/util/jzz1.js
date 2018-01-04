/*
    This is an adapted and abbreviated version of JZZ by Sema: https://github.com/jazz-soft/JZZ
*/

function MIDI(arg) {
    var self = this instanceof MIDI ? this : self = new MIDI();
    self._from = arg instanceof MIDI ? arg._from.slice() : [];
    if (!arguments.length) return self;
    var arr = arg instanceof Array ? arg : arguments;
    for (var i = 0; i < arr.length; i++) {
        var n = arr[i];
        self.push(n);
    }
    return self;
}

MIDI.prototype = [];
MIDI.prototype.constructor = MIDI;
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

function createJzz() {
    var _version = '0.4.1';

    // _R: common root for all async objects
    function _R() {
        this._orig = this;
        this._ready = false;
        this._queue = [];
        this._err = [];
    }
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
        function F() { } F.prototype = this._orig;
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
        function pack(x) { return function () { x.engine._openOut(this, x.name); }; }
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
        function pack(x) { return function () { x.engine._openIn(this, x.name); }; }
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
            if (arr[i] == 'extension') ret.push(_tryCRX);
            else if (arr[i] == 'plugin') ret.push(_tryJazzPlugin);
        }
        ret.push(_initNONE);
        return ret;
    }

    function _filterEngineNames(opt) {
        var web = ['plugin', 'extension'];
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
                function makeHandle(x) { return function (t, a) { x.handle(t, a); }; }
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
    return JZZ;
}

module.exports = createJzz();
