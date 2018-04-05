(function(){function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s}return e})()({1:[function(require,module,exports){
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
},{"_process":2}],2:[function(require,module,exports){
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

},{}],3:[function(require,module,exports){
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

},{"./midi/midi_access":4,"./midi/midi_input":5,"./midi/midi_output":6,"./midi/midiconnection_event":7,"./midi/midimessage_event":8,"./util/util":11}],4:[function(require,module,exports){
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

var _jzz = require('../util/jzz');

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
    });
    (0, _jzz2.default)().info().outputs.forEach(function (info) {
        var port = new _midi_output2.default(info);
        midiOutputs.set(port.id, port);
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

},{"../util/jzz":9,"../util/store":10,"../util/util":11,"./midi_input":5,"./midi_output":6,"./midiconnection_event":7}],5:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }(); /*
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       MIDIInput is a wrapper around an input of a Jazz instance
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     */


var _jzz = require('../util/jzz');

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
        this._inLongSysexMessage = false;
        this._sysexBuffer = new Uint8Array();
        this._midiProc = midiProc.bind(this);

        this.onstatechange = null;
        this._onmidimessage = null;

        // because we need to implicitly open the device when an onmidimessage handler gets added
        // we define a setter that opens the device if the set value is a function
        Object.defineProperty(this, 'onmidimessage', {
            set: function set(value) {
                this._onmidimessage = value;
                if (typeof value === 'function') {
                    if (this.port === null) {
                        this.open();
                    }
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
            var _this = this;

            if (this.connection === 'open') {
                return;
            }
            this.port = (0, _jzz2.default)().openMidiIn(this.name)
            // .or(`Could not open input ${this.name}`)
            .and(function () {
                _this.connection = 'open';
                (0, _midi_access.dispatchEvent)(_this); // dispatch MIDIConnectionEvent via MIDIAccess
            }).connect(function (msg) {
                _this._midiProc(0, msg);
            }).err(function (err) {
                console.log(err);
            });
        }
    }, {
        key: 'close',
        value: function close() {
            var _this2 = this;

            if (this.connection === 'closed') {
                return;
            }
            this.port.close().or('Could not close input ' + this.name).and(function () {
                _this2.connection = 'closed';
                (0, _midi_access.dispatchEvent)(_this2); // dispatch MIDIConnectionEvent via MIDIAccess
                _this2.port = null;
                _this2._onmidimessage = null;
                _this2.onstatechange = null;
                _this2._listeners.get('midimessage').clear();
                _this2._listeners.get('statechange').clear();
            });
        }
    }, {
        key: '_appendToSysexBuffer',
        value: function _appendToSysexBuffer(data) {
            var oldLength = this._sysexBuffer.length;
            var tmpBuffer = new Uint8Array(oldLength + data.length);
            tmpBuffer.set(this._sysexBuffer);
            tmpBuffer.set(data, oldLength);
            this._sysexBuffer = tmpBuffer;
        }
    }, {
        key: '_bufferLongSysex',
        value: function _bufferLongSysex(data, initialOffset) {
            var j = initialOffset;
            while (j < data.length) {
                if (data[j] == 0xF7) {
                    // end of sysex!
                    j += 1;
                    this._appendToSysexBuffer(data.slice(initialOffset, j));
                    return j;
                }
                j += 1;
            }
            // didn't reach the end; just tack it on.
            this._appendToSysexBuffer(data.slice(initialOffset, j));
            this._inLongSysexMessage = true;
            return j;
        }
    }]);

    return MIDIInput;
}();

exports.default = MIDIInput;


function midiProc(timestamp, data) {
    var length = 0;
    var i = void 0;
    var isSysexMessage = false;

    //console.log(timestamp, data);

    // Jazz sometimes passes us multiple messages at once, so we need to parse them out and pass them one at a time.

    for (i = 0; i < data.length; i += length) {
        var isValidMessage = true;
        if (this._inLongSysexMessage) {
            i = this._bufferLongSysex(data, i);
            if (data[i - 1] != 0xf7) {
                // ran off the end without hitting the end of the sysex message
                return;
            }
            isSysexMessage = true;
        } else {
            isSysexMessage = false;
            switch (data[i] & 0xF0) {
                case 0x00:
                    // Chew up spurious 0x00 bytes.  Fixes a Windows problem.
                    length = 1;
                    isValidMessage = false;
                    break;

                case 0x80: // note off
                case 0x90: // note on
                case 0xA0: // polyphonic aftertouch
                case 0xB0: // control change
                case 0xE0:
                    // channel mode
                    length = 3;
                    break;

                case 0xC0: // program change
                case 0xD0:
                    // channel aftertouch
                    length = 2;
                    break;

                case 0xF0:
                    switch (data[i]) {
                        case 0xf0:
                            // letiable-length sysex.
                            i = this._bufferLongSysex(data, i);
                            if (data[i - 1] != 0xf7) {
                                // ran off the end without hitting the end of the sysex message
                                return;
                            }
                            isSysexMessage = true;
                            break;

                        case 0xF1: // MTC quarter frame
                        case 0xF3:
                            // song select
                            length = 2;
                            break;

                        case 0xF2:
                            // song position pointer
                            length = 3;
                            break;

                        default:
                            length = 1;
                            break;
                    }
                    break;
            }
        }
        if (!isValidMessage) {
            continue;
        }

        var evt = {};
        // evt.receivedTime = parseFloat(timestamp.toString()) + this._jazzInstance._perfTimeZero;

        if (isSysexMessage || this._inLongSysexMessage) {
            evt.data = new Uint8Array(this._sysexBuffer);
            this._sysexBuffer = new Uint8Array(0);
            this._inLongSysexMessage = false;
        } else {
            evt.data = new Uint8Array(data.slice(i, length + i));
        }

        var e = new _midimessage_event2.default(this, evt.data, evt.receivedTime);
        this.dispatchEvent(e);
    }
}

},{"../util/jzz":9,"../util/store":10,"../util/util":11,"./midi_access":4,"./midiconnection_event":7,"./midimessage_event":8}],6:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }(); /*
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       MIDIOutput is a wrapper around an output of a Jazz instance
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     */


var _jzz = require('../util/jzz');

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
            this.port = (0, _jzz2.default)().openMidiOut(this.name).or('Could not open output ' + this.name).and(function () {
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
                _this2.connection = 'closed';
                (0, _midi_access.dispatchEvent)(_this2); // dispatch MIDIConnectionEvent via MIDIAccess
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

},{"../util/jzz":9,"../util/store":10,"../util/util":11,"./midi_access":4}],7:[function(require,module,exports){
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

},{}],8:[function(require,module,exports){
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

},{}],9:[function(require,module,exports){
'use strict';

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
                } else {
                    this._queue = [];
                    this._orig._hope = false;
                }
            } else if (x[0] != _or) {
                x[0].apply(this, x[1]);
            }
        }
    };
    _R.prototype._push = function (func, arg) {
        this._queue.push([func, arg]);_R.prototype._exec.apply(this);
    };
    _R.prototype._slip = function (func, arg) {
        this._queue.unshift([func, arg]);
    };
    _R.prototype._pause = function () {
        this._ready = false;
    };
    _R.prototype._resume = function () {
        this._ready = true;_R.prototype._exec.apply(this);
    };
    _R.prototype._break = function (err) {
        this._orig._bad = true;this._orig._hope = true;if (err) this._orig._err.push(err);
    };
    _R.prototype._repair = function () {
        this._orig._bad = false;
    };
    _R.prototype._crash = function (err) {
        this._break(err);this._resume();
    };
    _R.prototype.err = function () {
        return _clone(this._err);
    };

    function _wait(obj, delay) {
        setTimeout(function () {
            obj._resume();
        }, delay);
    }
    _R.prototype.wait = function (delay) {
        if (!delay) return this;
        function F() {}F.prototype = this._orig;
        var ret = new F();
        ret._ready = false;
        ret._queue = [];
        this._push(_wait, [ret, delay]);
        return ret;
    };

    function _and(q) {
        if (q instanceof Function) q.apply(this);else console.log(q);
    }
    _R.prototype.and = function (func) {
        this._push(_and, [func]);return this;
    };
    function _or(q) {
        if (q instanceof Function) q.apply(this);else console.log(q);
    }
    _R.prototype.or = function (func) {
        this._push(_or, [func]);return this;
    };

    _R.prototype._info = {};
    _R.prototype.info = function () {
        var info = _clone(this._orig._info);
        if (typeof info.engine == 'undefined') info.engine = 'none';
        if (typeof info.sysex == 'undefined') info.sysex = true;
        return info;
    };
    _R.prototype.name = function () {
        return this.info().name;
    };

    function _close(obj) {
        this._break('closed');
        obj._resume();
    }
    _R.prototype.close = function () {
        var ret = new _R();
        if (this._close) this._push(this._close, []);
        this._push(_close, [ret]);
        return ret;
    };

    function _tryAny(arr) {
        if (!arr.length) {
            this._break();
            return;
        }
        var func = arr.shift();
        if (arr.length) {
            var self = this;
            this._slip(_or, [function () {
                _tryAny.apply(self, [arr]);
            }]);
        }
        try {
            this._repair();
            func.apply(this);
        } catch (e) {
            this._break(e.toString());
        }
    }

    function _push(arr, obj) {
        for (var i = 0; i < arr.length; i++) {
            if (arr[i] === obj) return;
        }arr.push(obj);
    }
    function _pop(arr, obj) {
        for (var i = 0; i < arr.length; i++) {
            if (arr[i] === obj) {
                arr.splice(i, 1);
                return;
            }
        }
    }

    // _J: JZZ object
    function _J() {
        _R.apply(this);
    }
    _J.prototype = new _R();

    _J.prototype.time = function () {
        return 0;
    };
    if (typeof performance != 'undefined' && performance.now) _J.prototype._time = function () {
        return performance.now();
    };
    function _initTimer() {
        if (!_J.prototype._time) _J.prototype._time = function () {
            return Date.now();
        };
        _J.prototype._startTime = _J.prototype._time();
        _J.prototype.time = function () {
            return _J.prototype._time() - _J.prototype._startTime;
        };
    }

    function _clone(obj, key, val) {
        if (typeof key == 'undefined') return _clone(obj, [], []);
        if (obj instanceof Object) {
            for (var i = 0; i < key.length; i++) {
                if (key[i] === obj) return val[i];
            }var ret;
            if (obj instanceof Array) ret = [];else ret = {};
            key.push(obj);val.push(ret);
            for (var k in obj) {
                if (obj.hasOwnProperty(k)) ret[k] = _clone(obj[k], key, val);
            }return ret;
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
    };

    function _filterList(q, arr) {
        if (typeof q == 'undefined') return arr.slice();
        var i, n;
        var a = [];
        if (q instanceof RegExp) {
            for (n = 0; n < arr.length; n++) {
                if (q.test(arr[n].name)) a.push(arr[n]);
            }return a;
        }
        if (q instanceof Function) q = q(arr);
        if (!(q instanceof Array)) q = [q];
        for (i = 0; i < q.length; i++) {
            for (n = 0; n < arr.length; n++) {
                if (q[i] + '' === n + '' || q[i] === arr[n].name || q[i] instanceof Object && q[i].name === arr[n].name) a.push(arr[n]);
            }
        }
        return a;
    }

    function _notFound(port, q) {
        var msg;
        if (q instanceof RegExp) msg = 'Port matching ' + q + ' not found';else if (q instanceof Object || typeof q == 'undefined') msg = 'Port not found';else msg = 'Port "' + q + '" not found';
        port._crash(msg);
    }

    function _openMidiOut(port, arg) {
        var arr = _filterList(arg, _outs);
        if (!arr.length) {
            _notFound(port, arg);return;
        }
        function pack(x) {
            return function () {
                x.engine._openOut(this, x.name);
            };
        }
        for (var i = 0; i < arr.length; i++) {
            arr[i] = pack(arr[i]);
        }port._slip(_tryAny, [arr]);
        port._resume();
    }
    _J.prototype.openMidiOut = function (arg) {
        var port = new _M();
        this._push(_refresh, []);
        this._push(_openMidiOut, [port, arg]);
        return port;
    };

    function _openMidiIn(port, arg) {
        var arr = _filterList(arg, _ins);
        if (!arr.length) {
            _notFound(port, arg);return;
        }
        function pack(x) {
            return function () {
                x.engine._openIn(this, x.name);
            };
        }
        for (var i = 0; i < arr.length; i++) {
            arr[i] = pack(arr[i]);
        }port._slip(_tryAny, [arr]);
        port._resume();
    }
    _J.prototype.openMidiIn = function (arg) {
        var port = new _M();
        this._push(_refresh, []);
        this._push(_openMidiIn, [port, arg]);
        return port;
    };

    _J.prototype._close = function () {
        _engine._close();
    };

    // _M: MIDI-In/Out object
    function _M() {
        _R.apply(this);
        this._handles = [];
        this._outs = [];
    }
    _M.prototype = new _R();

    _M.prototype._receive = function (msg) {
        this._emit(msg);
    }; // override!
    function _receive(msg) {
        this._receive(msg);
    }
    _M.prototype.send = function () {
        this._push(_receive, [MIDI.apply(null, arguments)]);
        return this;
    };
    _M.prototype.note = function (c, n, v, t) {
        this.noteOn(c, n, v);
        if (t) this.wait(t).noteOff(c, n);
        return this;
    };
    _M.prototype._emit = function (msg) {
        for (var i = 0; i < this._handles.length; i++) {
            this._handles[i].apply(this, [MIDI(msg)._stamp(this)]);
        }for (var i = 0; i < this._outs.length; i++) {
            var m = MIDI(msg);
            if (!m._stamped(this._outs[i])) this._outs[i].send(m._stamp(this));
        }
    };
    function _emit(msg) {
        this._emit(msg);
    }
    _M.prototype.emit = function (msg) {
        this._push(_emit, [msg]);
        return this;
    };
    function _connect(arg) {
        if (arg instanceof Function) _push(this._orig._handles, arg);else _push(this._orig._outs, arg);
    }
    function _disconnect(arg) {
        if (arg instanceof Function) _pop(this._orig._handles, arg);else _pop(this._orig._outs, arg);
    }
    _M.prototype.connect = function (arg) {
        this._push(_connect, [arg]);
        return this;
    };
    _M.prototype.disconnect = function (arg) {
        this._push(_disconnect, [arg]);
        return this;
    };

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
        obj.style.width = '0px';obj.style.height = '0px';
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
            try {
                a = JSON.parse(msg.innerText);
            } catch (e) {}
            msg.innerText = '';
            document.removeEventListener('jazz-midi-msg', eventHandle);
            if (a[0] === 'version') {
                _initCRX(msg, a[2]);
                self._resume();
            } else {
                self._crash();
            }
        }
        this._pause();
        document.addEventListener('jazz-midi-msg', eventHandle);
        try {
            document.dispatchEvent(new Event('jazz-midi'));
        } catch (e) {}
        setTimeout(function () {
            if (!inst) self._crash();
        }, 0);
    }

    function _zeroBreak() {
        this._pause();
        var self = this;
        setTimeout(function () {
            self._crash();
        }, 0);
    }

    function _filterEngines(opt) {
        var ret = [_tryNODE, _zeroBreak];
        var arr = _filterEngineNames(opt);
        for (var i = 0; i < arr.length; i++) {
            if (arr[i] == 'webmidi') {
                if (opt && opt.sysex === true) ret.push(_tryWebMIDIsysex);
                if (!opt || opt.sysex !== true || opt.degrade === true) ret.push(_tryWebMIDI);
            } else if (arr[i] == 'extension') ret.push(_tryCRX);else if (arr[i] == 'plugin') ret.push(_tryJazzPlugin);
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
            if (etc) tail.push(name);else head.push(name);
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
        _jzz._push(function () {
            if (!_outs.length && !_ins.length) this._break();
        }, []);
        _jzz._resume();
    }

    function _initNONE() {
        _engine._type = 'none';
        _engine._sysex = true;
        _engine._refresh = function () {
            _engine._outs = [];_engine._ins = [];
        };
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
        };
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
                    _close: function _close(port) {
                        _engine._closeOut(port);
                    },
                    _receive: function _receive(a) {
                        this.plugin.MidiOutRaw(a.slice());
                    }
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
                    port._break();return;
                }
                impl.open = true;
            }
            port._orig._impl = impl;
            _push(impl.clients, port._orig);
            port._info = impl.info;
            port._receive = function (arg) {
                impl._receive(arg);
            };
            port._close = function () {
                impl._close(this);
            };
        };
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
                    _close: function _close(port) {
                        _engine._closeIn(port);
                    },
                    handle: function handle(t, a) {
                        for (var i = 0; i < this.clients.length; i++) {
                            var msg = MIDI(a);
                            this.clients[i]._emit(msg);
                        }
                    }
                };
                function makeHandle(x) {
                    return function (t, a) {
                        x.handle(t, a);
                    };
                }
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
                    port._break();return;
                }
                impl.open = true;
            }
            port._orig._impl = impl;
            _push(impl.clients, port._orig);
            port._info = impl.info;
            port._close = function () {
                impl._close(this);
            };
        };
        _engine._closeOut = function (port) {
            var impl = port._impl;
            _pop(impl.clients, port._orig);
            if (!impl.clients.length) {
                impl.open = false;
                impl.plugin.MidiOutClose();
            }
        };
        _engine._closeIn = function (port) {
            var impl = port._impl;
            _pop(impl.clients, port._orig);
            if (!impl.clients.length) {
                impl.open = false;
                impl.plugin.MidiInClose();
            }
        };
        _engine._close = function () {
            for (var i = 0; i < _engine._inArr.length; i++) {
                if (_engine._inArr[i].open) _engine._inArr[i].plugin.MidiInClose();
            }
        };
        _J.prototype._time = function () {
            return _engine._main.Time();
        };
    }

    function _initNode(obj) {
        _engine._type = 'node';
        _engine._main = obj;
        _engine._pool = [];
        _engine._newPlugin = function () {
            return new obj.MIDI();
        };
        _initEngineJP();
    }
    function _initJazzPlugin(obj) {
        _engine._type = 'plugin';
        _engine._main = obj;
        _engine._pool = [obj];
        _engine._newPlugin = function () {
            var plg = document.createElement('object');
            plg.style.visibility = 'hidden';
            plg.style.width = '0px';obj.style.height = '0px';
            plg.classid = 'CLSID:1ACE1618-1C7D-4561-AEE1-34842AA85E90';
            plg.type = 'audio/x-jazz';
            document.body.appendChild(plg);
            return plg.isJazz ? plg : undefined;
        };
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
        };
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
                    _close: function _close(port) {
                        _engine._closeOut(port);
                    },
                    _receive: function _receive(a) {
                        this.dev.send(a.slice());
                    }
                };
                var id, dev;
                _engine._access.outputs.forEach(function (dev, key) {
                    if (dev.name === name) impl.dev = dev;
                });
                if (impl.dev) {
                    _engine._outMap[name] = impl;
                } else impl = undefined;
            }
            if (impl) {
                if (impl.dev.open) impl.dev.open();
                port._orig._impl = impl;
                _push(impl.clients, port._orig);
                port._info = impl.info;
                port._receive = function (arg) {
                    impl._receive(arg);
                };
                port._close = function () {
                    impl._close(this);
                };
            } else port._break();
        };
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
                    _close: function _close(port) {
                        _engine._closeIn(port);
                    },
                    handle: function handle(evt) {
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
                    function makeHandle(x) {
                        return function (evt) {
                            x.handle(evt);
                        };
                    }
                    impl.dev.onmidimessage = makeHandle(impl);
                    _engine._inMap[name] = impl;
                } else impl = undefined;
            }
            if (impl) {
                if (impl.dev.open) impl.dev.open();
                port._orig._impl = impl;
                _push(impl.clients, port._orig);
                port._info = impl.info;
                port._close = function () {
                    impl._close(this);
                };
            } else port._break();
        };
        _engine._closeOut = function (port) {
            var impl = port._impl;
            if (!impl.clients.length) {
                if (impl.dev.close) impl.dev.close();
            }
            _pop(impl.clients, port._orig);
        };
        _engine._closeIn = function (port) {
            var impl = port._impl;
            _pop(impl.clients, port._orig);
            if (!impl.clients.length) {
                if (impl.dev.close) impl.dev.close();
            }
        };
        _engine._close = function () {};
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
            if (!plugin.id) plugin.ready = true;else document.dispatchEvent(new CustomEvent('jazz-midi', { detail: ['new'] }));
            _engine._pool.push(plugin);
        };
        _engine._newPlugin();
        _engine._refresh = function () {
            _engine._outs = [];
            _engine._ins = [];
            _jzz._pause();
            document.dispatchEvent(new CustomEvent('jazz-midi', { detail: ['refresh'] }));
        };
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
                    _start: function _start() {
                        document.dispatchEvent(new CustomEvent('jazz-midi', { detail: ['openout', plugin.id, name] }));
                    },
                    _close: function _close(port) {
                        _engine._closeOut(port);
                    },
                    _receive: function _receive(a) {
                        var v = a.slice();v.splice(0, 0, 'play', plugin.id);document.dispatchEvent(new CustomEvent('jazz-midi', { detail: v }));
                    }
                };
                impl.plugin = plugin;
                plugin.output = impl;
                _engine._outArr.push(impl);
                _engine._outMap[name] = impl;
            }
            port._orig._impl = impl;
            _push(impl.clients, port._orig);
            port._info = impl.info;
            port._receive = function (arg) {
                impl._receive(arg);
            };
            port._close = function () {
                impl._close(this);
            };
            if (!impl.open) {
                if (impl.plugin.ready) impl._start();
                port._pause();
            }
        };
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
                    _start: function _start() {
                        document.dispatchEvent(new CustomEvent('jazz-midi', { detail: ['openin', plugin.id, name] }));
                    },
                    _close: function _close(port) {
                        _engine._closeIn(port);
                    }
                };
                impl.plugin = plugin;
                plugin.input = impl;
                _engine._inArr.push(impl);
                _engine._inMap[name] = impl;
            }
            port._orig._impl = impl;
            _push(impl.clients, port._orig);
            port._info = impl.info;
            port._close = function () {
                impl._close(this);
            };
            if (!impl.open) {
                if (impl.plugin.ready) impl._start();
                port._pause();
            }
        };
        _engine._closeOut = function (port) {
            var impl = port._impl;
            _pop(impl.clients, port._orig);
            if (!impl.clients.length) {
                impl.open = false;
                document.dispatchEvent(new CustomEvent('jazz-midi', { detail: ['closeout', impl.plugin.id] }));
            }
        };
        _engine._closeIn = function (port) {
            var impl = port._impl;
            _pop(impl.clients, port._orig);
            if (!impl.clients.length) {
                impl.open = false;
                document.dispatchEvent(new CustomEvent('jazz-midi', { detail: ['closein', impl.plugin.id] }));
            }
        };
        _engine._close = function () {};
        document.addEventListener('jazz-midi-msg', function (e) {
            var v = _engine._msg.innerText.split('\n');
            _engine._msg.innerText = '';
            for (var i = 0; i < v.length; i++) {
                var a = [];
                try {
                    a = JSON.parse(v[i]);
                } catch (e) {}
                if (!a.length) continue;
                if (a[0] === 'refresh') {
                    if (a[1].ins) {
                        for (var j = 0; i < a[1].ins; i++) {
                            a[1].ins[j].type = _engine._type;
                        }_engine._ins = a[1].ins;
                    }
                    if (a[1].outs) {
                        for (var j = 0; i < a[1].outs; i++) {
                            a[1].outs[j].type = _engine._type;
                        }_engine._outs = a[1].outs;
                    }
                    _jzz._resume();
                } else if (a[0] === 'version') {
                    var plugin = _engine._pool[a[1]];
                    if (plugin) {
                        plugin.ready = true;
                        if (plugin.input) plugin.input._start();
                        if (plugin.output) plugin.output._start();
                    }
                } else if (a[0] === 'openout') {
                    var impl = _engine._pool[a[1]].output;
                    if (impl) {
                        if (a[2] == impl.name) {
                            impl.open = true;
                            if (impl.clients) for (var i = 0; i < impl.clients.length; i++) {
                                impl.clients[i]._resume();
                            }
                        } else if (impl.clients) for (var i = 0; i < impl.clients.length; i++) {
                            impl.clients[i]._crash();
                        }
                    }
                } else if (a[0] === 'openin') {
                    var impl = _engine._pool[a[1]].input;
                    if (impl) {
                        if (a[2] == impl.name) {
                            impl.open = true;
                            if (impl.clients) for (var i = 0; i < impl.clients.length; i++) {
                                impl.clients[i]._resume();
                            }
                        } else if (impl.clients) for (var i = 0; i < impl.clients.length; i++) {
                            impl.clients[i]._crash();
                        }
                    }
                } else if (a[0] === 'midi') {
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

    var JZZ = function JZZ(opt) {
        if (!_jzz) _initJZZ(opt);
        return _jzz;
    };
    JZZ.info = function () {
        return _J.prototype.info();
    };
    JZZ.createNew = function (arg) {
        var obj = new _M();
        if (arg instanceof Object) for (var k in arg) {
            if (arg.hasOwnProperty(k)) obj[k] = arg[k];
        }obj._resume();
        return obj;
    };
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
    };
    function _fixDropFrame() {
        if (this.type == 29.97 && !this.second && this.frame < 2 && this.minute % 10) this.frame = 2;
    }
    SMPTE.prototype.isFullFrame = function () {
        return this.quarter == 0 || this.quarter == 4;
    };
    SMPTE.prototype.getType = function () {
        return this.type;
    };
    SMPTE.prototype.getHour = function () {
        return this.hour;
    };
    SMPTE.prototype.getMinute = function () {
        return this.minute;
    };
    SMPTE.prototype.getSecond = function () {
        return this.second;
    };
    SMPTE.prototype.getFrame = function () {
        return this.frame;
    };
    SMPTE.prototype.getQuarter = function () {
        return this.quarter;
    };
    SMPTE.prototype.setType = function (x) {
        if (typeof x == 'undefined' || x == 24) this.type = 24;else if (x == 25) this.type = 25;else if (x == 29.97) {
            this.type = 29.97;_fixDropFrame.apply(this);
        } else if (x == 30) this.type = 30;else throw RangeError('Bad SMPTE frame rate: ' + x);
        if (this.frame >= this.type) this.frame = this.type == 29.97 ? 29 : this.type - 1;
        return this;
    };
    SMPTE.prototype.setHour = function (x) {
        if (typeof x == 'undefined') x = 0;
        if (x != parseInt(x) || x < 0 || x >= 24) throw RangeError('Bad SMPTE hours value: ' + x);
        this.hour = x;
        return this;
    };
    SMPTE.prototype.setMinute = function (x) {
        if (typeof x == 'undefined') x = 0;
        if (x != parseInt(x) || x < 0 || x >= 60) throw RangeError('Bad SMPTE minutes value: ' + x);
        this.minute = x;
        _fixDropFrame.apply(this);
        return this;
    };
    SMPTE.prototype.setSecond = function (x) {
        if (typeof x == 'undefined') x = 0;
        if (x != parseInt(x) || x < 0 || x >= 60) throw RangeError('Bad SMPTE seconds value: ' + x);
        this.second = x;
        _fixDropFrame.apply(this);
        return this;
    };
    SMPTE.prototype.setFrame = function (x) {
        if (typeof x == 'undefined') x = 0;
        if (x != parseInt(x) || x < 0 || x >= this.type) throw RangeError('Bad SMPTE frame number: ' + x);
        this.frame = x;
        _fixDropFrame.apply(this);
        return this;
    };
    SMPTE.prototype.setQuarter = function (x) {
        if (typeof x == 'undefined') x = 0;
        if (x != parseInt(x) || x < 0 || x >= 8) throw RangeError('Bad SMPTE quarter frame: ' + x);
        this.quarter = x;
        return this;
    };
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
    };
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
    };
    SMPTE.prototype.incrQF = function () {
        this.backwards = false;
        this.quarter = this.quarter + 1 & 7;
        if (this.quarter == 0 || this.quarter == 4) this.incrFrame();
        return this;
    };
    SMPTE.prototype.decrQF = function () {
        this.backwards = true;
        this.quarter = this.quarter + 7 & 7;
        if (this.quarter == 3 || this.quarter == 7) this.decrFrame();
        return this;
    };
    function _825(a) {
        return [[24, 25, 29.97, 30][a[7] >> 1 & 3], (a[7] & 1) << 4 | a[6], a[5] << 4 | a[4], a[3] << 4 | a[2], a[1] << 4 | a[0]];
    }
    SMPTE.prototype.read = function (m) {
        if (!(m instanceof MIDI)) m = MIDI.apply(null, arguments);
        if (m[0] == 0xf0 && m[1] == 0x7f && m[3] == 1 && m[4] == 1 && m[9] == 0xf7) {
            this.type = [24, 25, 29.97, 30][m[5] >> 5 & 3];
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
            } else if (q == 3) {
                if (this._ == 4) {
                    this.decrFrame();
                }
            } else if (q == 4) {
                if (this._ == 3) {
                    this.incrFrame();
                }
            } else if (q == 7) {
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
    };
    function _mtc(t) {
        if (!t.backwards && t.quarter >= 4) t.decrFrame(); // continue encoding previous frame
        else if (t.backwards && t.quarter < 4) t.incrFrame();
        var ret;
        switch (t.quarter >> 1) {
            case 0:
                ret = t.frame;break;
            case 1:
                ret = t.second;break;
            case 2:
                ret = t.minute;break;
            default:
                ret = t.hour;
        }
        if (t.quarter & 1) ret >>= 4;else ret &= 15;
        if (t.quarter == 7) {
            if (t.type == 25) ret |= 2;else if (t.type == 29.97) ret |= 4;else if (t.type == 30) ret |= 6;
        }
        if (!t.backwards && t.quarter >= 4) t.incrFrame();else if (t.backwards && t.quarter < 4) t.decrFrame();
        return ret | t.quarter << 4;
    }
    function _hrtype(t) {
        if (t.type == 25) return t.hour | 0x20;
        if (t.type == 29.97) return t.hour | 0x40;
        if (t.type == 30) return t.hour | 0x60;
        return t.hour;
    }
    function _dec(x) {
        return x < 10 ? '0' + x : x;
    }
    SMPTE.prototype.toString = function () {
        return [_dec(this.hour), _dec(this.minute), _dec(this.second), _dec(this.frame)].join(':');
    };
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
    MIDI.noteValue = function (x) {
        return _noteNum[x.toString().toLowerCase()];
    };

    var _noteMap = { c: 0, d: 2, e: 4, f: 5, g: 7, a: 9, b: 11, h: 11 };
    for (var k in _noteMap) {
        if (!_noteMap.hasOwnProperty(k)) continue;
        for (var n = 0; n < 12; n++) {
            var m = _noteMap[k] + n * 12;
            if (m > 127) break;
            _noteNum[k + n] = m;
            if (m > 0) {
                _noteNum[k + 'b' + n] = m - 1;_noteNum[k + 'bb' + n] = m - 2;
            }
            if (m < 127) {
                _noteNum[k + '#' + n] = m + 1;_noteNum[k + '##' + n] = m + 2;
            }
        }
    }
    for (var n = 0; n < 128; n++) {
        _noteNum[n] = n;
    }function _throw(x) {
        throw RangeError('Bad MIDI value: ' + x);
    }
    function _ch(n) {
        if (n != parseInt(n) || n < 0 || n > 0xf) _throw(n);return n;
    }
    function _7b(n) {
        if (n != parseInt(n) || n < 0 || n > 0x7f) _throw(n);return n;
    }
    function _lsb(n) {
        if (n != parseInt(n) || n < 0 || n > 0x3fff) _throw(n);return n & 0x7f;
    }
    function _msb(n) {
        if (n != parseInt(n) || n < 0 || n > 0x3fff) _throw(n);return n >> 7;
    }
    var _helper = {
        noteOff: function noteOff(c, n) {
            return [0x80 + _ch(c), _7b(MIDI.noteValue(n)), 0];
        },
        noteOn: function noteOn(c, n, v) {
            return [0x90 + _ch(c), _7b(MIDI.noteValue(n)), _7b(v)];
        },
        aftertouch: function aftertouch(c, n, v) {
            return [0xA0 + _ch(c), _7b(MIDI.noteValue(n)), _7b(v)];
        },
        control: function control(c, n, v) {
            return [0xB0 + _ch(c), _7b(n), _7b(v)];
        },
        program: function program(c, n) {
            return [0xC0 + _ch(c), _7b(n)];
        },
        pressure: function pressure(c, n) {
            return [0xD0 + _ch(c), _7b(n)];
        },
        pitchBend: function pitchBend(c, n) {
            return [0xE0 + _ch(c), _lsb(n), _msb(n)];
        },
        bankMSB: function bankMSB(c, n) {
            return [0xB0 + _ch(c), 0x00, _7b(n)];
        },
        bankLSB: function bankLSB(c, n) {
            return [0xB0 + _ch(c), 0x20, _7b(n)];
        },
        modMSB: function modMSB(c, n) {
            return [0xB0 + _ch(c), 0x01, _7b(n)];
        },
        modLSB: function modLSB(c, n) {
            return [0xB0 + _ch(c), 0x21, _7b(n)];
        },
        breathMSB: function breathMSB(c, n) {
            return [0xB0 + _ch(c), 0x02, _7b(n)];
        },
        breathLSB: function breathLSB(c, n) {
            return [0xB0 + _ch(c), 0x22, _7b(n)];
        },
        footMSB: function footMSB(c, n) {
            return [0xB0 + _ch(c), 0x04, _7b(n)];
        },
        footLSB: function footLSB(c, n) {
            return [0xB0 + _ch(c), 0x24, _7b(n)];
        },
        portamentoMSB: function portamentoMSB(c, n) {
            return [0xB0 + _ch(c), 0x05, _7b(n)];
        },
        portamentoLSB: function portamentoLSB(c, n) {
            return [0xB0 + _ch(c), 0x25, _7b(n)];
        },
        volumeMSB: function volumeMSB(c, n) {
            return [0xB0 + _ch(c), 0x07, _7b(n)];
        },
        volumeLSB: function volumeLSB(c, n) {
            return [0xB0 + _ch(c), 0x27, _7b(n)];
        },
        balanceMSB: function balanceMSB(c, n) {
            return [0xB0 + _ch(c), 0x08, _7b(n)];
        },
        balanceLSB: function balanceLSB(c, n) {
            return [0xB0 + _ch(c), 0x28, _7b(n)];
        },
        panMSB: function panMSB(c, n) {
            return [0xB0 + _ch(c), 0x0A, _7b(n)];
        },
        panLSB: function panLSB(c, n) {
            return [0xB0 + _ch(c), 0x2A, _7b(n)];
        },
        expressionMSB: function expressionMSB(c, n) {
            return [0xB0 + _ch(c), 0x0B, _7b(n)];
        },
        expressionLSB: function expressionLSB(c, n) {
            return [0xB0 + _ch(c), 0x2B, _7b(n)];
        },
        damper: function damper(c, b) {
            return [0xB0 + _ch(c), 0x40, b ? 127 : 0];
        },
        portamento: function portamento(c, b) {
            return [0xB0 + _ch(c), 0x41, b ? 127 : 0];
        },
        sostenuto: function sostenuto(c, b) {
            return [0xB0 + _ch(c), 0x42, b ? 127 : 0];
        },
        soft: function soft(c, b) {
            return [0xB0 + _ch(c), 0x43, b ? 127 : 0];
        },
        allSoundOff: function allSoundOff(c) {
            return [0xB0 + _ch(c), 0x78, 0];
        },
        allNotesOff: function allNotesOff(c) {
            return [0xB0 + _ch(c), 0x7b, 0];
        },
        mtc: function mtc(t) {
            return [0xF1, _mtc(t)];
        },
        songPosition: function songPosition(n) {
            return [0xF2, _lsb(n), _msb(n)];
        },
        songSelect: function songSelect(n) {
            return [0xF3, _7b(n)];
        },
        tune: function tune() {
            return [0xF6];
        },
        clock: function clock() {
            return [0xF8];
        },
        start: function start() {
            return [0xFA];
        },
        continue: function _continue() {
            return [0xFB];
        },
        stop: function stop() {
            return [0xFC];
        },
        active: function active() {
            return [0xFE];
        },
        sxIdRequest: function sxIdRequest() {
            return [0xF0, 0x7E, 0x7F, 0x06, 0x01, 0xF7];
        },
        sxFullFrame: function sxFullFrame(t) {
            return [0xF0, 0x7F, 0x7F, 0x01, 0x01, _hrtype(t), t.getMinute(), t.getSecond(), t.getFrame(), 0xF7];
        },
        reset: function reset() {
            return [0xFF];
        }
    };
    function _copyHelper(name, func) {
        MIDI[name] = function () {
            return new MIDI(func.apply(0, arguments));
        };
        _M.prototype[name] = function () {
            this.send(func.apply(0, arguments));return this;
        };
    }
    for (var k in _helper) {
        if (_helper.hasOwnProperty(k)) _copyHelper(k, _helper[k]);
    }var _channelMap = { a: 10, b: 11, c: 12, d: 13, e: 14, f: 15, A: 10, B: 11, C: 12, D: 13, E: 14, F: 15 };
    for (var k = 0; k < 16; k++) {
        _channelMap[k] = k;
    }MIDI.prototype.getChannel = function () {
        var c = this[0];
        if (typeof c == 'undefined' || c < 0x80 || c > 0xef) return;
        return c & 15;
    };
    MIDI.prototype.setChannel = function (x) {
        var c = this[0];
        if (typeof c == 'undefined' || c < 0x80 || c > 0xef) return this;
        x = _channelMap[x];
        if (typeof x != 'undefined') this[0] = c & 0xf0 | x;
        return this;
    };
    MIDI.prototype.getNote = function () {
        var c = this[0];
        if (typeof c == 'undefined' || c < 0x80 || c > 0xaf) return;
        return this[1];
    };
    MIDI.prototype.setNote = function (x) {
        var c = this[0];
        if (typeof c == 'undefined' || c < 0x80 || c > 0xaf) return this;
        x = MIDI.noteValue(x);
        if (typeof x != 'undefined') this[1] = x;
        return this;
    };
    MIDI.prototype.getVelocity = function () {
        var c = this[0];
        if (typeof c == 'undefined' || c < 0x90 || c > 0x9f) return;
        return this[2];
    };
    MIDI.prototype.setVelocity = function (x) {
        var c = this[0];
        if (typeof c == 'undefined' || c < 0x90 || c > 0x9f) return this;
        x = parseInt(x);
        if (x >= 0 && x < 128) this[2] = x;
        return this;
    };
    MIDI.prototype.getSysExChannel = function () {
        if (this[0] == 0xf0) return this[2];
    };
    MIDI.prototype.setSysExChannel = function (x) {
        if (this[0] == 0xf0 && this.length > 2) {
            x = parseInt(x);
            if (x >= 0 && x < 128) this[2] = x;
        }
        return this;
    };
    MIDI.prototype.isNoteOn = function () {
        var c = this[0];
        if (typeof c == 'undefined' || c < 0x90 || c > 0x9f) return false;
        return this[2] > 0 ? true : false;
    };
    MIDI.prototype.isNoteOff = function () {
        var c = this[0];
        if (typeof c == 'undefined' || c < 0x80 || c > 0x9f) return false;
        if (c < 0x90) return true;
        return this[2] == 0 ? true : false;
    };
    MIDI.prototype.isSysEx = function () {
        return this[0] == 0xf0;
    };
    MIDI.prototype.isFullSysEx = function () {
        return this[0] == 0xf0 && this[this.length - 1] == 0xf7;
    };

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
    };
    MIDI.prototype._stamp = function (obj) {
        this._from.push(obj._orig ? obj._orig : obj);return this;
    };
    MIDI.prototype._unstamp = function (obj) {
        if (typeof obj == 'undefined') this._from = [];else {
            if (obj._orig) obj = obj._orig;
            var i = this._from.indexOf(obj);
            if (i > -1) this._from.splice(i, 1);
        }
        return this;
    };
    MIDI.prototype._stamped = function (obj) {
        if (obj._orig) obj = obj._orig;
        for (var i = 0; i < this._from.length; i++) {
            if (this._from[i] == obj) return true;
        }return false;
    };

    JZZ.MIDI = MIDI;

    JZZ.lib = {};
    JZZ.lib.openMidiOut = function (name, engine) {
        var port = new _M();
        engine._openOut(port, name);
        return port;
    };
    JZZ.lib.openMidiIn = function (name, engine) {
        var port = new _M();
        engine._openIn(port, name);
        return port;
    };
    JZZ.lib.registerMidiOut = function (name, engine) {
        var x = engine._info(name);
        for (var i = 0; i < _virtual._outs.length; i++) {
            if (_virtual._outs[i].name == x.name) return false;
        }x.engine = engine;
        _virtual._outs.push(x);
        if (_jzz && _jzz._bad) {
            _jzz._repair();_jzz._resume();
        }
        return true;
    };
    JZZ.lib.registerMidiIn = function (name, engine) {
        var x = engine._info(name);
        for (var i = 0; i < _virtual._ins.length; i++) {
            if (_virtual._ins[i].name == x.name) return false;
        }x.engine = engine;
        _virtual._ins.push(x);
        if (_jzz && _jzz._bad) {
            _jzz._repair();_jzz._resume();
        }
        return true;
    };
    var _ac;
    JZZ.lib.getAudioContext = function () {
        return _ac;
    };
    if (typeof window !== "undefined") {
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
                osc.start(.1);osc.stop(0.11);
            } else {
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
    };
    return JZZ;
}

module.exports = createJzz();

},{"jazz-midi":1}],10:[function(require,module,exports){
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
        this._keys = [];
    }

    _createClass(Store, [{
        key: "keys",
        value: function keys() {
            return this._keys[Symbol.iterator]();
        }
    }, {
        key: "add",
        value: function add(obj) {
            var id = "" + new Date().getTime() + idIndex;
            idIndex += 1;
            this._keys.push(id);
            this.store[id] = obj;
        }
    }, {
        key: "set",
        value: function set(id, obj) {
            this._keys.push(id);
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
            return this._keys.indexOf(id) !== -1;
        }
    }, {
        key: "delete",
        value: function _delete(id) {
            delete this.store[id];
            var index = this._keys.indexOf(id);
            if (index > -1) {
                this._keys.splice(index, 1);
            }
            return this;
        }
    }, {
        key: "values",
        value: function values() {
            var elements = [];
            var l = this._keys.length;
            for (var i = 0; i < l; i += 1) {
                var element = this.store[this._keys[i]];
                elements.push(element);
            }
            return elements;
        }
    }, {
        key: "forEach",
        value: function forEach(cb) {
            var l = this._keys.length;
            for (var i = 0; i < l; i += 1) {
                var element = this.store[this._keys[i]];
                cb(element);
            }
        }
    }, {
        key: "clear",
        value: function clear() {
            this._keys = [];
            this.store = {};
        }
    }]);

    return Store;
}();

exports.default = Store;

},{}],11:[function(require,module,exports){
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
},{"_process":2}]},{},[3]);
