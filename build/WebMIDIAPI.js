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

var nodejs = (0, _util.getDevice)().nodejs;

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
                var _this = this;

                this._onmidimessage = value;
                if (typeof value === 'function') {
                    // if (this.port === null) {
                    //     this.open();
                    // }
                    (0, _jzz2.default)().midiInOpen(this.name).connect(function (msg) {
                        _this._midiProc(0, msg);
                        // const m = new MIDIMessageEvent(this, msg);
                        // value(m);
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
            this.port = (0, _jzz2.default)().openMidiIn(this.name)
            // .or(`Could not open input ${this.name}`)
            .and(function () {
                _this2.connection = 'open';
                (0, _midi_access.dispatchEvent)(_this2); // dispatch MIDIConnectionEvent via MIDIAccess
            }).err(function (err) {
                console.log(err);
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
                (0, _midi_access.dispatchEvent)(_this3); // dispatch MIDIConnectionEvent via MIDIAccess
                _this3.port = null;
                _this3._onmidimessage = null;
                _this3.onstatechange = null;
                _this3._listeners.get('midimessage').clear();
                _this3._listeners.get('statechange').clear();
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

    console.log(timestamp, data);

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

        if (nodejs) {
            if (this._onmidimessage) {
                this._onmidimessage(evt);
            }
        } else {
            var e = new _midimessage_event2.default(this, evt.data, evt.receivedTime);
            this.dispatchEvent(e);
        }
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
        window.setTimeout(function () {
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

},{"_process":2}]},{},[3])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJub2RlX21vZHVsZXMvamF6ei1taWRpL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL3Byb2Nlc3MvYnJvd3Nlci5qcyIsInNyYy9pbmRleC5qcyIsInNyYy9taWRpL21pZGlfYWNjZXNzLmpzIiwic3JjL21pZGkvbWlkaV9pbnB1dC5qcyIsInNyYy9taWRpL21pZGlfb3V0cHV0LmpzIiwic3JjL21pZGkvbWlkaWNvbm5lY3Rpb25fZXZlbnQuanMiLCJzcmMvbWlkaS9taWRpbWVzc2FnZV9ldmVudC5qcyIsInNyYy91dGlsL2p6ei5qcyIsInNyYy91dGlsL3N0b3JlLmpzIiwic3JjL3V0aWwvdXRpbC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztBQ2xCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFD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OztBQUlBLGNBQU0sT0FBTixDQUFjLFNBQWQsQ0FBd0IsSUFBeEIsR0FBK0IsU0FBUyxJQUFULENBQWMsT0FBZCxFQUF1QixNQUF2QixFQUErQjtBQUMxRCxnQkFBSSxPQUFPLE9BQVAsS0FBbUIsVUFBdkIsRUFBbUM7QUFDL0IsMEJBQVUsbUJBQU0sQ0FBRyxDQUFuQjtBQUNIO0FBQ0QsZ0JBQUksT0FBTyxNQUFQLEtBQWtCLFVBQXRCLEVBQWtDO0FBQzlCLHlCQUFTLGtCQUFNLENBQUcsQ0FBbEI7QUFDSDtBQUNELGlCQUFLLFFBQUwsQ0FBYyxPQUFkLEVBQXVCLE1BQXZCO0FBQ0gsU0FSRDtBQVNIO0FBQ0osQ0FqQkQ7O0FBb0JPLFNBQVMsUUFBVCxHQUFvQjtBQUN2QixRQUFNLElBQUksV0FBVjtBQUNBO0FBQ0EsUUFBSSxFQUFFLE9BQUYsS0FBYyxJQUFkLElBQXNCLEVBQUUsTUFBRixLQUFhLElBQXZDLEVBQTZDO0FBQ3pDO0FBQ0g7QUFDRDtBQUNIIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsInZhciBwYXRoPScuL2Jpbi8nO1xyXG52YXIgdj1wcm9jZXNzLnZlcnNpb25zLm5vZGUuc3BsaXQoJy4nKTtcclxuaWYgKHZbMF09PTAgJiYgdlsxXTw9MTApIHBhdGgrPScwXzEwLyc7XHJcbmVsc2UgaWYgKHZbMF09PTAgJiYgdlsxXTw9MTIpIHBhdGgrPScwXzEyLyc7XHJcbmVsc2UgaWYgKHZbMF08PTQpIHBhdGgrPSc0XzgvJztcclxuZWxzZSBpZiAodlswXTw9NSkgcGF0aCs9JzVfMTIvJztcclxuZWxzZSBpZiAodlswXTw9NikgcGF0aCs9JzZfMTIvJztcclxuZWxzZSBpZiAodlswXTw9NykgcGF0aCs9JzdfMTAvJztcclxuZWxzZSBpZiAodlswXTw9OCkgcGF0aCs9JzhfOS8nO1xyXG5pZihwcm9jZXNzLnBsYXRmb3JtPT1cIndpbjMyXCImJnByb2Nlc3MuYXJjaD09XCJpYTMyXCIpIHBhdGgrPSd3aW4zMi9qYXp6JztcclxuZWxzZSBpZihwcm9jZXNzLnBsYXRmb3JtPT1cIndpbjMyXCImJnByb2Nlc3MuYXJjaD09XCJ4NjRcIikgcGF0aCs9J3dpbjY0L2phenonO1xyXG5lbHNlIGlmKHByb2Nlc3MucGxhdGZvcm09PVwiZGFyd2luXCImJnByb2Nlc3MuYXJjaD09XCJ4NjRcIikgcGF0aCs9J21hY29zNjQvamF6eic7XHJcbmVsc2UgaWYocHJvY2Vzcy5wbGF0Zm9ybT09XCJkYXJ3aW5cIiYmcHJvY2Vzcy5hcmNoPT1cImlhMzJcIikgcGF0aCs9J21hY29zMzIvamF6eic7XHJcbmVsc2UgaWYocHJvY2Vzcy5wbGF0Zm9ybT09XCJsaW51eFwiJiZwcm9jZXNzLmFyY2g9PVwieDY0XCIpIHBhdGgrPSdsaW51eDY0L2phenonO1xyXG5lbHNlIGlmKHByb2Nlc3MucGxhdGZvcm09PVwibGludXhcIiYmcHJvY2Vzcy5hcmNoPT1cImlhMzJcIikgcGF0aCs9J2xpbnV4MzIvamF6eic7XHJcbmVsc2UgaWYocHJvY2Vzcy5wbGF0Zm9ybT09XCJsaW51eFwiJiZwcm9jZXNzLmFyY2g9PVwiYXJtXCIpIHBhdGgrPSdsaW51eGE3L2phenonO1xyXG5tb2R1bGUuZXhwb3J0cz1yZXF1aXJlKHBhdGgpO1xyXG5tb2R1bGUuZXhwb3J0cy5wYWNrYWdlPXJlcXVpcmUoX19kaXJuYW1lICsgJy9wYWNrYWdlLmpzb24nKTtcclxuIiwiLy8gc2hpbSBmb3IgdXNpbmcgcHJvY2VzcyBpbiBicm93c2VyXG52YXIgcHJvY2VzcyA9IG1vZHVsZS5leHBvcnRzID0ge307XG5cbi8vIGNhY2hlZCBmcm9tIHdoYXRldmVyIGdsb2JhbCBpcyBwcmVzZW50IHNvIHRoYXQgdGVzdCBydW5uZXJzIHRoYXQgc3R1YiBpdFxuLy8gZG9uJ3QgYnJlYWsgdGhpbmdzLiAgQnV0IHdlIG5lZWQgdG8gd3JhcCBpdCBpbiBhIHRyeSBjYXRjaCBpbiBjYXNlIGl0IGlzXG4vLyB3cmFwcGVkIGluIHN0cmljdCBtb2RlIGNvZGUgd2hpY2ggZG9lc24ndCBkZWZpbmUgYW55IGdsb2JhbHMuICBJdCdzIGluc2lkZSBhXG4vLyBmdW5jdGlvbiBiZWNhdXNlIHRyeS9jYXRjaGVzIGRlb3B0aW1pemUgaW4gY2VydGFpbiBlbmdpbmVzLlxuXG52YXIgY2FjaGVkU2V0VGltZW91dDtcbnZhciBjYWNoZWRDbGVhclRpbWVvdXQ7XG5cbmZ1bmN0aW9uIGRlZmF1bHRTZXRUaW1vdXQoKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdzZXRUaW1lb3V0IGhhcyBub3QgYmVlbiBkZWZpbmVkJyk7XG59XG5mdW5jdGlvbiBkZWZhdWx0Q2xlYXJUaW1lb3V0ICgpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ2NsZWFyVGltZW91dCBoYXMgbm90IGJlZW4gZGVmaW5lZCcpO1xufVxuKGZ1bmN0aW9uICgpIHtcbiAgICB0cnkge1xuICAgICAgICBpZiAodHlwZW9mIHNldFRpbWVvdXQgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgIGNhY2hlZFNldFRpbWVvdXQgPSBzZXRUaW1lb3V0O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY2FjaGVkU2V0VGltZW91dCA9IGRlZmF1bHRTZXRUaW1vdXQ7XG4gICAgICAgIH1cbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIGNhY2hlZFNldFRpbWVvdXQgPSBkZWZhdWx0U2V0VGltb3V0O1xuICAgIH1cbiAgICB0cnkge1xuICAgICAgICBpZiAodHlwZW9mIGNsZWFyVGltZW91dCA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgY2FjaGVkQ2xlYXJUaW1lb3V0ID0gY2xlYXJUaW1lb3V0O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY2FjaGVkQ2xlYXJUaW1lb3V0ID0gZGVmYXVsdENsZWFyVGltZW91dDtcbiAgICAgICAgfVxuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgY2FjaGVkQ2xlYXJUaW1lb3V0ID0gZGVmYXVsdENsZWFyVGltZW91dDtcbiAgICB9XG59ICgpKVxuZnVuY3Rpb24gcnVuVGltZW91dChmdW4pIHtcbiAgICBpZiAoY2FjaGVkU2V0VGltZW91dCA9PT0gc2V0VGltZW91dCkge1xuICAgICAgICAvL25vcm1hbCBlbnZpcm9tZW50cyBpbiBzYW5lIHNpdHVhdGlvbnNcbiAgICAgICAgcmV0dXJuIHNldFRpbWVvdXQoZnVuLCAwKTtcbiAgICB9XG4gICAgLy8gaWYgc2V0VGltZW91dCB3YXNuJ3QgYXZhaWxhYmxlIGJ1dCB3YXMgbGF0dGVyIGRlZmluZWRcbiAgICBpZiAoKGNhY2hlZFNldFRpbWVvdXQgPT09IGRlZmF1bHRTZXRUaW1vdXQgfHwgIWNhY2hlZFNldFRpbWVvdXQpICYmIHNldFRpbWVvdXQpIHtcbiAgICAgICAgY2FjaGVkU2V0VGltZW91dCA9IHNldFRpbWVvdXQ7XG4gICAgICAgIHJldHVybiBzZXRUaW1lb3V0KGZ1biwgMCk7XG4gICAgfVxuICAgIHRyeSB7XG4gICAgICAgIC8vIHdoZW4gd2hlbiBzb21lYm9keSBoYXMgc2NyZXdlZCB3aXRoIHNldFRpbWVvdXQgYnV0IG5vIEkuRS4gbWFkZG5lc3NcbiAgICAgICAgcmV0dXJuIGNhY2hlZFNldFRpbWVvdXQoZnVuLCAwKTtcbiAgICB9IGNhdGNoKGUpe1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgLy8gV2hlbiB3ZSBhcmUgaW4gSS5FLiBidXQgdGhlIHNjcmlwdCBoYXMgYmVlbiBldmFsZWQgc28gSS5FLiBkb2Vzbid0IHRydXN0IHRoZSBnbG9iYWwgb2JqZWN0IHdoZW4gY2FsbGVkIG5vcm1hbGx5XG4gICAgICAgICAgICByZXR1cm4gY2FjaGVkU2V0VGltZW91dC5jYWxsKG51bGwsIGZ1biwgMCk7XG4gICAgICAgIH0gY2F0Y2goZSl7XG4gICAgICAgICAgICAvLyBzYW1lIGFzIGFib3ZlIGJ1dCB3aGVuIGl0J3MgYSB2ZXJzaW9uIG9mIEkuRS4gdGhhdCBtdXN0IGhhdmUgdGhlIGdsb2JhbCBvYmplY3QgZm9yICd0aGlzJywgaG9wZnVsbHkgb3VyIGNvbnRleHQgY29ycmVjdCBvdGhlcndpc2UgaXQgd2lsbCB0aHJvdyBhIGdsb2JhbCBlcnJvclxuICAgICAgICAgICAgcmV0dXJuIGNhY2hlZFNldFRpbWVvdXQuY2FsbCh0aGlzLCBmdW4sIDApO1xuICAgICAgICB9XG4gICAgfVxuXG5cbn1cbmZ1bmN0aW9uIHJ1bkNsZWFyVGltZW91dChtYXJrZXIpIHtcbiAgICBpZiAoY2FjaGVkQ2xlYXJUaW1lb3V0ID09PSBjbGVhclRpbWVvdXQpIHtcbiAgICAgICAgLy9ub3JtYWwgZW52aXJvbWVudHMgaW4gc2FuZSBzaXR1YXRpb25zXG4gICAgICAgIHJldHVybiBjbGVhclRpbWVvdXQobWFya2VyKTtcbiAgICB9XG4gICAgLy8gaWYgY2xlYXJUaW1lb3V0IHdhc24ndCBhdmFpbGFibGUgYnV0IHdhcyBsYXR0ZXIgZGVmaW5lZFxuICAgIGlmICgoY2FjaGVkQ2xlYXJUaW1lb3V0ID09PSBkZWZhdWx0Q2xlYXJUaW1lb3V0IHx8ICFjYWNoZWRDbGVhclRpbWVvdXQpICYmIGNsZWFyVGltZW91dCkge1xuICAgICAgICBjYWNoZWRDbGVhclRpbWVvdXQgPSBjbGVhclRpbWVvdXQ7XG4gICAgICAgIHJldHVybiBjbGVhclRpbWVvdXQobWFya2VyKTtcbiAgICB9XG4gICAgdHJ5IHtcbiAgICAgICAgLy8gd2hlbiB3aGVuIHNvbWVib2R5IGhhcyBzY3Jld2VkIHdpdGggc2V0VGltZW91dCBidXQgbm8gSS5FLiBtYWRkbmVzc1xuICAgICAgICByZXR1cm4gY2FjaGVkQ2xlYXJUaW1lb3V0KG1hcmtlcik7XG4gICAgfSBjYXRjaCAoZSl7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICAvLyBXaGVuIHdlIGFyZSBpbiBJLkUuIGJ1dCB0aGUgc2NyaXB0IGhhcyBiZWVuIGV2YWxlZCBzbyBJLkUuIGRvZXNuJ3QgIHRydXN0IHRoZSBnbG9iYWwgb2JqZWN0IHdoZW4gY2FsbGVkIG5vcm1hbGx5XG4gICAgICAgICAgICByZXR1cm4gY2FjaGVkQ2xlYXJUaW1lb3V0LmNhbGwobnVsbCwgbWFya2VyKTtcbiAgICAgICAgfSBjYXRjaCAoZSl7XG4gICAgICAgICAgICAvLyBzYW1lIGFzIGFib3ZlIGJ1dCB3aGVuIGl0J3MgYSB2ZXJzaW9uIG9mIEkuRS4gdGhhdCBtdXN0IGhhdmUgdGhlIGdsb2JhbCBvYmplY3QgZm9yICd0aGlzJywgaG9wZnVsbHkgb3VyIGNvbnRleHQgY29ycmVjdCBvdGhlcndpc2UgaXQgd2lsbCB0aHJvdyBhIGdsb2JhbCBlcnJvci5cbiAgICAgICAgICAgIC8vIFNvbWUgdmVyc2lvbnMgb2YgSS5FLiBoYXZlIGRpZmZlcmVudCBydWxlcyBmb3IgY2xlYXJUaW1lb3V0IHZzIHNldFRpbWVvdXRcbiAgICAgICAgICAgIHJldHVybiBjYWNoZWRDbGVhclRpbWVvdXQuY2FsbCh0aGlzLCBtYXJrZXIpO1xuICAgICAgICB9XG4gICAgfVxuXG5cblxufVxudmFyIHF1ZXVlID0gW107XG52YXIgZHJhaW5pbmcgPSBmYWxzZTtcbnZhciBjdXJyZW50UXVldWU7XG52YXIgcXVldWVJbmRleCA9IC0xO1xuXG5mdW5jdGlvbiBjbGVhblVwTmV4dFRpY2soKSB7XG4gICAgaWYgKCFkcmFpbmluZyB8fCAhY3VycmVudFF1ZXVlKSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgZHJhaW5pbmcgPSBmYWxzZTtcbiAgICBpZiAoY3VycmVudFF1ZXVlLmxlbmd0aCkge1xuICAgICAgICBxdWV1ZSA9IGN1cnJlbnRRdWV1ZS5jb25jYXQocXVldWUpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHF1ZXVlSW5kZXggPSAtMTtcbiAgICB9XG4gICAgaWYgKHF1ZXVlLmxlbmd0aCkge1xuICAgICAgICBkcmFpblF1ZXVlKCk7XG4gICAgfVxufVxuXG5mdW5jdGlvbiBkcmFpblF1ZXVlKCkge1xuICAgIGlmIChkcmFpbmluZykge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIHZhciB0aW1lb3V0ID0gcnVuVGltZW91dChjbGVhblVwTmV4dFRpY2spO1xuICAgIGRyYWluaW5nID0gdHJ1ZTtcblxuICAgIHZhciBsZW4gPSBxdWV1ZS5sZW5ndGg7XG4gICAgd2hpbGUobGVuKSB7XG4gICAgICAgIGN1cnJlbnRRdWV1ZSA9IHF1ZXVlO1xuICAgICAgICBxdWV1ZSA9IFtdO1xuICAgICAgICB3aGlsZSAoKytxdWV1ZUluZGV4IDwgbGVuKSB7XG4gICAgICAgICAgICBpZiAoY3VycmVudFF1ZXVlKSB7XG4gICAgICAgICAgICAgICAgY3VycmVudFF1ZXVlW3F1ZXVlSW5kZXhdLnJ1bigpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHF1ZXVlSW5kZXggPSAtMTtcbiAgICAgICAgbGVuID0gcXVldWUubGVuZ3RoO1xuICAgIH1cbiAgICBjdXJyZW50UXVldWUgPSBudWxsO1xuICAgIGRyYWluaW5nID0gZmFsc2U7XG4gICAgcnVuQ2xlYXJUaW1lb3V0KHRpbWVvdXQpO1xufVxuXG5wcm9jZXNzLm5leHRUaWNrID0gZnVuY3Rpb24gKGZ1bikge1xuICAgIHZhciBhcmdzID0gbmV3IEFycmF5KGFyZ3VtZW50cy5sZW5ndGggLSAxKTtcbiAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA+IDEpIHtcbiAgICAgICAgZm9yICh2YXIgaSA9IDE7IGkgPCBhcmd1bWVudHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGFyZ3NbaSAtIDFdID0gYXJndW1lbnRzW2ldO1xuICAgICAgICB9XG4gICAgfVxuICAgIHF1ZXVlLnB1c2gobmV3IEl0ZW0oZnVuLCBhcmdzKSk7XG4gICAgaWYgKHF1ZXVlLmxlbmd0aCA9PT0gMSAmJiAhZHJhaW5pbmcpIHtcbiAgICAgICAgcnVuVGltZW91dChkcmFpblF1ZXVlKTtcbiAgICB9XG59O1xuXG4vLyB2OCBsaWtlcyBwcmVkaWN0aWJsZSBvYmplY3RzXG5mdW5jdGlvbiBJdGVtKGZ1biwgYXJyYXkpIHtcbiAgICB0aGlzLmZ1biA9IGZ1bjtcbiAgICB0aGlzLmFycmF5ID0gYXJyYXk7XG59XG5JdGVtLnByb3RvdHlwZS5ydW4gPSBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy5mdW4uYXBwbHkobnVsbCwgdGhpcy5hcnJheSk7XG59O1xucHJvY2Vzcy50aXRsZSA9ICdicm93c2VyJztcbnByb2Nlc3MuYnJvd3NlciA9IHRydWU7XG5wcm9jZXNzLmVudiA9IHt9O1xucHJvY2Vzcy5hcmd2ID0gW107XG5wcm9jZXNzLnZlcnNpb24gPSAnJzsgLy8gZW1wdHkgc3RyaW5nIHRvIGF2b2lkIHJlZ2V4cCBpc3N1ZXNcbnByb2Nlc3MudmVyc2lvbnMgPSB7fTtcblxuZnVuY3Rpb24gbm9vcCgpIHt9XG5cbnByb2Nlc3Mub24gPSBub29wO1xucHJvY2Vzcy5hZGRMaXN0ZW5lciA9IG5vb3A7XG5wcm9jZXNzLm9uY2UgPSBub29wO1xucHJvY2Vzcy5vZmYgPSBub29wO1xucHJvY2Vzcy5yZW1vdmVMaXN0ZW5lciA9IG5vb3A7XG5wcm9jZXNzLnJlbW92ZUFsbExpc3RlbmVycyA9IG5vb3A7XG5wcm9jZXNzLmVtaXQgPSBub29wO1xucHJvY2Vzcy5wcmVwZW5kTGlzdGVuZXIgPSBub29wO1xucHJvY2Vzcy5wcmVwZW5kT25jZUxpc3RlbmVyID0gbm9vcDtcblxucHJvY2Vzcy5saXN0ZW5lcnMgPSBmdW5jdGlvbiAobmFtZSkgeyByZXR1cm4gW10gfVxuXG5wcm9jZXNzLmJpbmRpbmcgPSBmdW5jdGlvbiAobmFtZSkge1xuICAgIHRocm93IG5ldyBFcnJvcigncHJvY2Vzcy5iaW5kaW5nIGlzIG5vdCBzdXBwb3J0ZWQnKTtcbn07XG5cbnByb2Nlc3MuY3dkID0gZnVuY3Rpb24gKCkgeyByZXR1cm4gJy8nIH07XG5wcm9jZXNzLmNoZGlyID0gZnVuY3Rpb24gKGRpcikge1xuICAgIHRocm93IG5ldyBFcnJvcigncHJvY2Vzcy5jaGRpciBpcyBub3Qgc3VwcG9ydGVkJyk7XG59O1xucHJvY2Vzcy51bWFzayA9IGZ1bmN0aW9uKCkgeyByZXR1cm4gMDsgfTtcbiIsImltcG9ydCB7IGNyZWF0ZU1JRElBY2Nlc3MsIGNsb3NlQWxsTUlESUlucHV0cyB9IGZyb20gJy4vbWlkaS9taWRpX2FjY2Vzcyc7XG5pbXBvcnQgeyBwb2x5ZmlsbCwgZ2V0RGV2aWNlLCBnZXRTY29wZSB9IGZyb20gJy4vdXRpbC91dGlsJztcbi8vIGltcG9ydCBNSURJSW5wdXQgZnJvbSAnLi9taWRpL21pZGlfaW5wdXQnO1xuLy8gaW1wb3J0IE1JRElPdXRwdXQgZnJvbSAnLi9taWRpL21pZGlfb3V0cHV0JztcbmltcG9ydCAqIGFzIElucHV0IGZyb20gJy4vbWlkaS9taWRpX2lucHV0JztcbmltcG9ydCAqIGFzIE91dHB1dCBmcm9tICcuL21pZGkvbWlkaV9vdXRwdXQnO1xuaW1wb3J0IE1JRElNZXNzYWdlRXZlbnQgZnJvbSAnLi9taWRpL21pZGltZXNzYWdlX2V2ZW50JztcbmltcG9ydCBNSURJQ29ubmVjdGlvbkV2ZW50IGZyb20gJy4vbWlkaS9taWRpY29ubmVjdGlvbl9ldmVudCc7XG5cbmxldCBtaWRpQWNjZXNzO1xuXG5jb25zdCBpbml0ID0gKCkgPT4ge1xuICAgIGlmICghbmF2aWdhdG9yLnJlcXVlc3RNSURJQWNjZXNzKSB7XG4gICAgICAgIC8vIEFkZCBzb21lIGZ1bmN0aW9uYWxpdHkgdG8gb2xkZXIgYnJvd3NlcnNcbiAgICAgICAgcG9seWZpbGwoKTtcblxuICAgICAgICBuYXZpZ2F0b3IucmVxdWVzdE1JRElBY2Nlc3MgPSAoKSA9PiB7XG4gICAgICAgICAgICAvLyBTaW5nbGV0b24taXNoLCBubyBuZWVkIHRvIGNyZWF0ZSBtdWx0aXBsZSBpbnN0YW5jZXMgb2YgTUlESUFjY2Vzc1xuICAgICAgICAgICAgaWYgKG1pZGlBY2Nlc3MgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgIG1pZGlBY2Nlc3MgPSBjcmVhdGVNSURJQWNjZXNzKCk7XG4gICAgICAgICAgICAgICAgLy8gQWRkIGdsb2JhbCB2YXJzIHRoYXQgbWltaWMgV2ViTUlESSBBUEkgbmF0aXZlIGdsb2JhbHNcbiAgICAgICAgICAgICAgICBjb25zdCBzY29wZSA9IGdldFNjb3BlKCk7XG4gICAgICAgICAgICAgICAgc2NvcGUuTUlESUlucHV0ID0gSW5wdXQ7XG4gICAgICAgICAgICAgICAgc2NvcGUuTUlESU91dHB1dCA9IE91dHB1dDtcbiAgICAgICAgICAgICAgICBzY29wZS5NSURJTWVzc2FnZUV2ZW50ID0gTUlESU1lc3NhZ2VFdmVudDtcbiAgICAgICAgICAgICAgICBzY29wZS5NSURJQ29ubmVjdGlvbkV2ZW50ID0gTUlESUNvbm5lY3Rpb25FdmVudDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBtaWRpQWNjZXNzO1xuICAgICAgICB9O1xuICAgICAgICBpZiAoZ2V0RGV2aWNlKCkubm9kZWpzID09PSB0cnVlKSB7XG4gICAgICAgICAgICBuYXZpZ2F0b3IuY2xvc2UgPSAoKSA9PiB7XG4gICAgICAgICAgICAgICAgLy8gRm9yIE5vZGVqcyBhcHBsaWNhdGlvbnMgd2UgbmVlZCB0byBhZGQgYSBtZXRob2QgdGhhdCBjbG9zZXMgYWxsIE1JREkgaW5wdXQgcG9ydHMsXG4gICAgICAgICAgICAgICAgLy8gb3RoZXJ3aXNlIE5vZGVqcyB3aWxsIHdhaXQgZm9yIE1JREkgaW5wdXQgZm9yZXZlci5cbiAgICAgICAgICAgICAgICBjbG9zZUFsbE1JRElJbnB1dHMoKTtcbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICB9XG59O1xuXG5pbml0KCk7XG4iLCIvKlxuICBDcmVhdGVzIGEgTUlESUFjY2VzcyBpbnN0YW5jZTpcbiAgLSBDcmVhdGVzIE1JRElJbnB1dCBhbmQgTUlESU91dHB1dCBpbnN0YW5jZXMgZm9yIHRoZSBpbml0aWFsbHkgY29ubmVjdGVkIE1JREkgZGV2aWNlcy5cbiAgLSBLZWVwcyB0cmFjayBvZiBuZXdseSBjb25uZWN0ZWQgZGV2aWNlcyBhbmQgY3JlYXRlcyB0aGUgbmVjZXNzYXJ5IGluc3RhbmNlcyBvZiBNSURJSW5wdXQgYW5kIE1JRElPdXRwdXQuXG4gIC0gS2VlcHMgdHJhY2sgb2YgZGlzY29ubmVjdGVkIGRldmljZXMgYW5kIHJlbW92ZXMgdGhlbSBmcm9tIHRoZSBpbnB1dHMgYW5kL29yIG91dHB1dHMgbWFwLlxuICAtIENyZWF0ZXMgYSB1bmlxdWUgaWQgZm9yIGV2ZXJ5IGRldmljZSBhbmQgc3RvcmVzIHRoZXNlIGlkcyBieSB0aGUgbmFtZSBvZiB0aGUgZGV2aWNlOlxuICAgIHNvIHdoZW4gYSBkZXZpY2UgZ2V0cyBkaXNjb25uZWN0ZWQgYW5kIHJlY29ubmVjdGVkIGFnYWluLCBpdCB3aWxsIHN0aWxsIGhhdmUgdGhlIHNhbWUgaWQuIFRoaXNcbiAgICBpcyBpbiBsaW5lIHdpdGggdGhlIGJlaGF2aW9yIG9mIHRoZSBuYXRpdmUgTUlESUFjY2VzcyBvYmplY3QuXG5cbiovXG5pbXBvcnQgSnp6IGZyb20gJy4uL3V0aWwvanp6JztcbmltcG9ydCBNSURJSW5wdXQgZnJvbSAnLi9taWRpX2lucHV0JztcbmltcG9ydCBNSURJT3V0cHV0IGZyb20gJy4vbWlkaV9vdXRwdXQnO1xuaW1wb3J0IE1JRElDb25uZWN0aW9uRXZlbnQgZnJvbSAnLi9taWRpY29ubmVjdGlvbl9ldmVudCc7XG5pbXBvcnQgeyBnZXREZXZpY2UgfSBmcm9tICcuLi91dGlsL3V0aWwnO1xuaW1wb3J0IFN0b3JlIGZyb20gJy4uL3V0aWwvc3RvcmUnO1xuXG5sZXQgbWlkaUFjY2VzcztcbmNvbnN0IGxpc3RlbmVycyA9IG5ldyBTdG9yZSgpO1xuY29uc3QgbWlkaUlucHV0cyA9IG5ldyBTdG9yZSgpO1xuY29uc3QgbWlkaU91dHB1dHMgPSBuZXcgU3RvcmUoKTtcblxuY2xhc3MgTUlESUFjY2VzcyB7XG4gICAgY29uc3RydWN0b3IoaW5wdXRzLCBvdXRwdXRzKSB7XG4gICAgICAgIHRoaXMuc3lzZXhFbmFibGVkID0gdHJ1ZTtcbiAgICAgICAgdGhpcy5pbnB1dHMgPSBpbnB1dHM7XG4gICAgICAgIHRoaXMub3V0cHV0cyA9IG91dHB1dHM7XG4gICAgfVxuXG4gICAgYWRkRXZlbnRMaXN0ZW5lcih0eXBlLCBsaXN0ZW5lcikge1xuICAgICAgICBpZiAodHlwZSAhPT0gJ3N0YXRlY2hhbmdlJykge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGlmIChsaXN0ZW5lcnMuaGFzKGxpc3RlbmVyKSA9PT0gZmFsc2UpIHtcbiAgICAgICAgICAgIGxpc3RlbmVycy5hZGQobGlzdGVuZXIpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcmVtb3ZlRXZlbnRMaXN0ZW5lcih0eXBlLCBsaXN0ZW5lcikge1xuICAgICAgICBpZiAodHlwZSAhPT0gJ3N0YXRlY2hhbmdlJykge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGlmIChsaXN0ZW5lcnMuaGFzKGxpc3RlbmVyKSA9PT0gdHJ1ZSkge1xuICAgICAgICAgICAgbGlzdGVuZXJzLmRlbGV0ZShsaXN0ZW5lcik7XG4gICAgICAgIH1cbiAgICB9XG59XG5cblxuZXhwb3J0IGZ1bmN0aW9uIGdldE1JRElQb3J0cygpIHtcbiAgICBtaWRpSW5wdXRzLmNsZWFyKCk7XG4gICAgbWlkaU91dHB1dHMuY2xlYXIoKTtcbiAgICBKenooKS5pbmZvKCkuaW5wdXRzLmZvckVhY2goaW5mbyA9PiB7XG4gICAgICAgIGxldCBwb3J0ID0gbmV3IE1JRElJbnB1dChpbmZvKTtcbiAgICAgICAgbWlkaUlucHV0cy5zZXQocG9ydC5pZCwgcG9ydCk7XG4gICAgfSk7XG4gICAgSnp6KCkuaW5mbygpLm91dHB1dHMuZm9yRWFjaChpbmZvID0+IHtcbiAgICAgICAgbGV0IHBvcnQgPSBuZXcgTUlESU91dHB1dChpbmZvKTtcbiAgICAgICAgbWlkaU91dHB1dHMuc2V0KHBvcnQuaWQsIHBvcnQpO1xuICAgIH0pO1xufVxuXG5cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVNSURJQWNjZXNzKCkge1xuICAgIHJldHVybiBuZXcgUHJvbWlzZSgoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICBpZiAodHlwZW9mIG1pZGlBY2Nlc3MgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgICByZXNvbHZlKG1pZGlBY2Nlc3MpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGdldERldmljZSgpLmJyb3dzZXIgPT09ICdpZTknKSB7XG4gICAgICAgICAgICByZWplY3QoeyBtZXNzYWdlOiAnV2ViTUlESUFQSVNoaW0gc3VwcG9ydHMgSW50ZXJuZXQgRXhwbG9yZXIgMTAgYW5kIGFib3ZlLicgfSk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgSnp6KClcbiAgICAgICAgICAgIC5vcigoKSA9PiB7XG4gICAgICAgICAgICAgICAgcmVqZWN0KHsgbWVzc2FnZTogJ05vIGFjY2VzcyB0byBNSURJIGRldmljZXM6IHlvdXIgYnJvd3NlciBkb2VzIG5vdCBzdXBwb3J0IHRoZSBXZWJNSURJIEFQSSBhbmQgdGhlIEphenogZXh0ZW5zaW9uIChvciBKYXp6IHBsdWdpbikgaXMgbm90IGluc3RhbGxlZC4nIH0pO1xuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIC5hbmQoKCkgPT4ge1xuICAgICAgICAgICAgICAgIGdldE1JRElQb3J0cygpO1xuICAgICAgICAgICAgICAgIG1pZGlBY2Nlc3MgPSBuZXcgTUlESUFjY2VzcyhtaWRpSW5wdXRzLCBtaWRpT3V0cHV0cyk7XG4gICAgICAgICAgICAgICAgcmVzb2x2ZShtaWRpQWNjZXNzKTtcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAuZXJyKChtc2cpID0+IHtcbiAgICAgICAgICAgICAgICByZWplY3QobXNnKTtcbiAgICAgICAgICAgIH0pXG4gICAgfSkpO1xufVxuXG5cbi8vIHdoZW4gYSBkZXZpY2UgZ2V0cyBjb25uZWN0ZWQvZGlzY29ubmVjdGVkIGJvdGggdGhlIHBvcnQgYW5kIE1JRElBY2Nlc3MgZGlzcGF0Y2ggYSBNSURJQ29ubmVjdGlvbkV2ZW50XG4vLyB0aGVyZWZvciB3ZSBjYWxsIHRoZSBwb3J0cyBkaXNwYXRjaEV2ZW50IGZ1bmN0aW9uIGhlcmUgYXMgd2VsbFxuZXhwb3J0IGZ1bmN0aW9uIGRpc3BhdGNoRXZlbnQocG9ydCkge1xuICAgIHBvcnQuZGlzcGF0Y2hFdmVudChuZXcgTUlESUNvbm5lY3Rpb25FdmVudChwb3J0LCBwb3J0KSk7XG5cbiAgICBjb25zdCBldnQgPSBuZXcgTUlESUNvbm5lY3Rpb25FdmVudChtaWRpQWNjZXNzLCBwb3J0KTtcblxuICAgIGlmICh0eXBlb2YgbWlkaUFjY2Vzcy5vbnN0YXRlY2hhbmdlID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIG1pZGlBY2Nlc3Mub25zdGF0ZWNoYW5nZShldnQpO1xuICAgIH1cbiAgICBsaXN0ZW5lcnMuZm9yRWFjaChsaXN0ZW5lciA9PiBsaXN0ZW5lcihldnQpKTtcbn1cbiIsIi8qXG4gIE1JRElJbnB1dCBpcyBhIHdyYXBwZXIgYXJvdW5kIGFuIGlucHV0IG9mIGEgSmF6eiBpbnN0YW5jZVxuKi9cbmltcG9ydCBKenogZnJvbSAnLi4vdXRpbC9qenonO1xuaW1wb3J0IE1JRElNZXNzYWdlRXZlbnQgZnJvbSAnLi9taWRpbWVzc2FnZV9ldmVudCc7XG5pbXBvcnQgTUlESUNvbm5lY3Rpb25FdmVudCBmcm9tICcuL21pZGljb25uZWN0aW9uX2V2ZW50JztcbmltcG9ydCB7IGRpc3BhdGNoRXZlbnQgfSBmcm9tICcuL21pZGlfYWNjZXNzJztcbmltcG9ydCB7IGdlbmVyYXRlVVVJRCwgZ2V0RGV2aWNlIH0gZnJvbSAnLi4vdXRpbC91dGlsJztcbmltcG9ydCBTdG9yZSBmcm9tICcuLi91dGlsL3N0b3JlJztcblxuY29uc3Qgbm9kZWpzID0gZ2V0RGV2aWNlKCkubm9kZWpzXG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIE1JRElJbnB1dCB7XG4gICAgY29uc3RydWN0b3IoaW5mbykge1xuICAgICAgICB0aGlzLmlkID0gaW5mby5pZCB8fCBnZW5lcmF0ZVVVSUQoKTtcbiAgICAgICAgdGhpcy5uYW1lID0gaW5mby5uYW1lO1xuICAgICAgICB0aGlzLm1hbnVmYWN0dXJlciA9IGluZm8ubWFudWZhY3R1cmVyO1xuICAgICAgICB0aGlzLnZlcnNpb24gPSBpbmZvLnZlcnNpb247XG4gICAgICAgIHRoaXMudHlwZSA9ICdpbnB1dCc7XG4gICAgICAgIHRoaXMuc3RhdGUgPSAnY29ubmVjdGVkJztcbiAgICAgICAgdGhpcy5jb25uZWN0aW9uID0gJ3BlbmRpbmcnO1xuICAgICAgICB0aGlzLnBvcnQgPSBudWxsO1xuICAgICAgICB0aGlzLl9pbkxvbmdTeXNleE1lc3NhZ2UgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5fc3lzZXhCdWZmZXIgPSBuZXcgVWludDhBcnJheSgpO1xuICAgICAgICB0aGlzLl9taWRpUHJvYyA9IG1pZGlQcm9jLmJpbmQodGhpcyk7XG5cbiAgICAgICAgdGhpcy5vbnN0YXRlY2hhbmdlID0gbnVsbDtcbiAgICAgICAgdGhpcy5fb25taWRpbWVzc2FnZSA9IG51bGw7XG5cbiAgICAgICAgLy8gYmVjYXVzZSB3ZSBuZWVkIHRvIGltcGxpY2l0bHkgb3BlbiB0aGUgZGV2aWNlIHdoZW4gYW4gb25taWRpbWVzc2FnZSBoYW5kbGVyIGdldHMgYWRkZWRcbiAgICAgICAgLy8gd2UgZGVmaW5lIGEgc2V0dGVyIHRoYXQgb3BlbnMgdGhlIGRldmljZSBpZiB0aGUgc2V0IHZhbHVlIGlzIGEgZnVuY3Rpb25cbiAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRoaXMsICdvbm1pZGltZXNzYWdlJywge1xuICAgICAgICAgICAgc2V0KHZhbHVlKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fb25taWRpbWVzc2FnZSA9IHZhbHVlO1xuICAgICAgICAgICAgICAgIGlmICh0eXBlb2YgdmFsdWUgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gaWYgKHRoaXMucG9ydCA9PT0gbnVsbCkge1xuICAgICAgICAgICAgICAgICAgICAvLyAgICAgdGhpcy5vcGVuKCk7XG4gICAgICAgICAgICAgICAgICAgIC8vIH1cbiAgICAgICAgICAgICAgICAgICAgSnp6KCkubWlkaUluT3Blbih0aGlzLm5hbWUpLmNvbm5lY3QoKG1zZykgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5fbWlkaVByb2MoMCwgbXNnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIGNvbnN0IG0gPSBuZXcgTUlESU1lc3NhZ2VFdmVudCh0aGlzLCBtc2cpO1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gdmFsdWUobSk7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cbiAgICAgICAgdGhpcy5fbGlzdGVuZXJzID0gbmV3IFN0b3JlKClcbiAgICAgICAgICAgIC5zZXQoJ21pZGltZXNzYWdlJywgbmV3IFN0b3JlKCkpXG4gICAgICAgICAgICAuc2V0KCdzdGF0ZWNoYW5nZScsIG5ldyBTdG9yZSgpKTtcbiAgICB9XG5cbiAgICBhZGRFdmVudExpc3RlbmVyKHR5cGUsIGxpc3RlbmVyKSB7XG4gICAgICAgIGNvbnN0IGxpc3RlbmVycyA9IHRoaXMuX2xpc3RlbmVycy5nZXQodHlwZSk7XG4gICAgICAgIGlmICh0eXBlb2YgbGlzdGVuZXJzID09PSAndW5kZWZpbmVkJykge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGxpc3RlbmVycy5oYXMobGlzdGVuZXIpID09PSBmYWxzZSkge1xuICAgICAgICAgICAgbGlzdGVuZXJzLmFkZChsaXN0ZW5lcik7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZW1vdmVFdmVudExpc3RlbmVyKHR5cGUsIGxpc3RlbmVyKSB7XG4gICAgICAgIGNvbnN0IGxpc3RlbmVycyA9IHRoaXMuX2xpc3RlbmVycy5nZXQodHlwZSk7XG4gICAgICAgIGlmICh0eXBlb2YgbGlzdGVuZXJzID09PSAndW5kZWZpbmVkJykge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGxpc3RlbmVycy5oYXMobGlzdGVuZXIpID09PSB0cnVlKSB7XG4gICAgICAgICAgICBsaXN0ZW5lcnMuZGVsZXRlKGxpc3RlbmVyKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGRpc3BhdGNoRXZlbnQoZXZ0KSB7XG4gICAgICAgIGNvbnN0IGxpc3RlbmVycyA9IHRoaXMuX2xpc3RlbmVycy5nZXQoZXZ0LnR5cGUpO1xuICAgICAgICBsaXN0ZW5lcnMuZm9yRWFjaCgobGlzdGVuZXIpID0+IHtcbiAgICAgICAgICAgIGxpc3RlbmVyKGV2dCk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGlmIChldnQudHlwZSA9PT0gJ21pZGltZXNzYWdlJykge1xuICAgICAgICAgICAgaWYgKHRoaXMuX29ubWlkaW1lc3NhZ2UgIT09IG51bGwpIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9vbm1pZGltZXNzYWdlKGV2dCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSBpZiAoZXZ0LnR5cGUgPT09ICdzdGF0ZWNoYW5nZScpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLm9uc3RhdGVjaGFuZ2UgIT09IG51bGwpIHtcbiAgICAgICAgICAgICAgICB0aGlzLm9uc3RhdGVjaGFuZ2UoZXZ0KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIG9wZW4oKSB7XG4gICAgICAgIGlmICh0aGlzLmNvbm5lY3Rpb24gPT09ICdvcGVuJykge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMucG9ydCA9IEp6eigpLm9wZW5NaWRpSW4odGhpcy5uYW1lKVxuICAgICAgICAgICAgLy8gLm9yKGBDb3VsZCBub3Qgb3BlbiBpbnB1dCAke3RoaXMubmFtZX1gKVxuICAgICAgICAgICAgLmFuZCgoKSA9PiB7XG4gICAgICAgICAgICAgICAgdGhpcy5jb25uZWN0aW9uID0gJ29wZW4nO1xuICAgICAgICAgICAgICAgIGRpc3BhdGNoRXZlbnQodGhpcyk7IC8vIGRpc3BhdGNoIE1JRElDb25uZWN0aW9uRXZlbnQgdmlhIE1JRElBY2Nlc3NcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAuZXJyKChlcnIpID0+IHsgY29uc29sZS5sb2coZXJyKTsgfSlcbiAgICB9XG5cbiAgICBjbG9zZSgpIHtcbiAgICAgICAgaWYgKHRoaXMuY29ubmVjdGlvbiA9PT0gJ2Nsb3NlZCcpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLnBvcnQuY2xvc2UoKVxuICAgICAgICAgICAgLm9yKGBDb3VsZCBub3QgY2xvc2UgaW5wdXQgJHt0aGlzLm5hbWV9YClcbiAgICAgICAgICAgIC5hbmQoKCkgPT4ge1xuICAgICAgICAgICAgICAgIHRoaXMuY29ubmVjdGlvbiA9ICdjbG9zZWQnO1xuICAgICAgICAgICAgICAgIGRpc3BhdGNoRXZlbnQodGhpcyk7IC8vIGRpc3BhdGNoIE1JRElDb25uZWN0aW9uRXZlbnQgdmlhIE1JRElBY2Nlc3NcbiAgICAgICAgICAgICAgICB0aGlzLnBvcnQgPSBudWxsO1xuICAgICAgICAgICAgICAgIHRoaXMuX29ubWlkaW1lc3NhZ2UgPSBudWxsO1xuICAgICAgICAgICAgICAgIHRoaXMub25zdGF0ZWNoYW5nZSA9IG51bGw7XG4gICAgICAgICAgICAgICAgdGhpcy5fbGlzdGVuZXJzLmdldCgnbWlkaW1lc3NhZ2UnKS5jbGVhcigpO1xuICAgICAgICAgICAgICAgIHRoaXMuX2xpc3RlbmVycy5nZXQoJ3N0YXRlY2hhbmdlJykuY2xlYXIoKTtcbiAgICAgICAgICAgIH0pO1xuICAgIH1cblxuICAgIF9hcHBlbmRUb1N5c2V4QnVmZmVyKGRhdGEpIHtcbiAgICAgICAgY29uc3Qgb2xkTGVuZ3RoID0gdGhpcy5fc3lzZXhCdWZmZXIubGVuZ3RoO1xuICAgICAgICBjb25zdCB0bXBCdWZmZXIgPSBuZXcgVWludDhBcnJheShvbGRMZW5ndGggKyBkYXRhLmxlbmd0aCk7XG4gICAgICAgIHRtcEJ1ZmZlci5zZXQodGhpcy5fc3lzZXhCdWZmZXIpO1xuICAgICAgICB0bXBCdWZmZXIuc2V0KGRhdGEsIG9sZExlbmd0aCk7XG4gICAgICAgIHRoaXMuX3N5c2V4QnVmZmVyID0gdG1wQnVmZmVyO1xuICAgIH1cblxuICAgIF9idWZmZXJMb25nU3lzZXgoZGF0YSwgaW5pdGlhbE9mZnNldCkge1xuICAgICAgICBsZXQgaiA9IGluaXRpYWxPZmZzZXQ7XG4gICAgICAgIHdoaWxlIChqIDwgZGF0YS5sZW5ndGgpIHtcbiAgICAgICAgICAgIGlmIChkYXRhW2pdID09IDB4RjcpIHtcbiAgICAgICAgICAgICAgICAvLyBlbmQgb2Ygc3lzZXghXG4gICAgICAgICAgICAgICAgaiArPSAxO1xuICAgICAgICAgICAgICAgIHRoaXMuX2FwcGVuZFRvU3lzZXhCdWZmZXIoZGF0YS5zbGljZShpbml0aWFsT2Zmc2V0LCBqKSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGo7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBqICs9IDE7XG4gICAgICAgIH1cbiAgICAgICAgLy8gZGlkbid0IHJlYWNoIHRoZSBlbmQ7IGp1c3QgdGFjayBpdCBvbi5cbiAgICAgICAgdGhpcy5fYXBwZW5kVG9TeXNleEJ1ZmZlcihkYXRhLnNsaWNlKGluaXRpYWxPZmZzZXQsIGopKTtcbiAgICAgICAgdGhpcy5faW5Mb25nU3lzZXhNZXNzYWdlID0gdHJ1ZTtcbiAgICAgICAgcmV0dXJuIGo7XG4gICAgfVxufVxuXG5cbmZ1bmN0aW9uIG1pZGlQcm9jKHRpbWVzdGFtcCwgZGF0YSkge1xuICAgIGxldCBsZW5ndGggPSAwO1xuICAgIGxldCBpO1xuICAgIGxldCBpc1N5c2V4TWVzc2FnZSA9IGZhbHNlO1xuXG4gICAgY29uc29sZS5sb2codGltZXN0YW1wLCBkYXRhKTtcblxuICAgIC8vIEphenogc29tZXRpbWVzIHBhc3NlcyB1cyBtdWx0aXBsZSBtZXNzYWdlcyBhdCBvbmNlLCBzbyB3ZSBuZWVkIHRvIHBhcnNlIHRoZW0gb3V0IGFuZCBwYXNzIHRoZW0gb25lIGF0IGEgdGltZS5cblxuICAgIGZvciAoaSA9IDA7IGkgPCBkYXRhLmxlbmd0aDsgaSArPSBsZW5ndGgpIHtcbiAgICAgICAgbGV0IGlzVmFsaWRNZXNzYWdlID0gdHJ1ZTtcbiAgICAgICAgaWYgKHRoaXMuX2luTG9uZ1N5c2V4TWVzc2FnZSkge1xuICAgICAgICAgICAgaSA9IHRoaXMuX2J1ZmZlckxvbmdTeXNleChkYXRhLCBpKTtcbiAgICAgICAgICAgIGlmIChkYXRhW2kgLSAxXSAhPSAweGY3KSB7XG4gICAgICAgICAgICAgICAgLy8gcmFuIG9mZiB0aGUgZW5kIHdpdGhvdXQgaGl0dGluZyB0aGUgZW5kIG9mIHRoZSBzeXNleCBtZXNzYWdlXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaXNTeXNleE1lc3NhZ2UgPSB0cnVlO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgaXNTeXNleE1lc3NhZ2UgPSBmYWxzZTtcbiAgICAgICAgICAgIHN3aXRjaCAoZGF0YVtpXSAmIDB4RjApIHtcbiAgICAgICAgICAgIGNhc2UgMHgwMDogLy8gQ2hldyB1cCBzcHVyaW91cyAweDAwIGJ5dGVzLiAgRml4ZXMgYSBXaW5kb3dzIHByb2JsZW0uXG4gICAgICAgICAgICAgICAgbGVuZ3RoID0gMTtcbiAgICAgICAgICAgICAgICBpc1ZhbGlkTWVzc2FnZSA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgICAgICBjYXNlIDB4ODA6IC8vIG5vdGUgb2ZmXG4gICAgICAgICAgICBjYXNlIDB4OTA6IC8vIG5vdGUgb25cbiAgICAgICAgICAgIGNhc2UgMHhBMDogLy8gcG9seXBob25pYyBhZnRlcnRvdWNoXG4gICAgICAgICAgICBjYXNlIDB4QjA6IC8vIGNvbnRyb2wgY2hhbmdlXG4gICAgICAgICAgICBjYXNlIDB4RTA6IC8vIGNoYW5uZWwgbW9kZVxuICAgICAgICAgICAgICAgIGxlbmd0aCA9IDM7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgICAgIGNhc2UgMHhDMDogLy8gcHJvZ3JhbSBjaGFuZ2VcbiAgICAgICAgICAgIGNhc2UgMHhEMDogLy8gY2hhbm5lbCBhZnRlcnRvdWNoXG4gICAgICAgICAgICAgICAgbGVuZ3RoID0gMjtcbiAgICAgICAgICAgICAgICBicmVhaztcblxuICAgICAgICAgICAgY2FzZSAweEYwOlxuICAgICAgICAgICAgICAgIHN3aXRjaCAoZGF0YVtpXSkge1xuICAgICAgICAgICAgICAgIGNhc2UgMHhmMDogLy8gbGV0aWFibGUtbGVuZ3RoIHN5c2V4LlxuICAgICAgICAgICAgICAgICAgICBpID0gdGhpcy5fYnVmZmVyTG9uZ1N5c2V4KGRhdGEsIGkpO1xuICAgICAgICAgICAgICAgICAgICBpZiAoZGF0YVtpIC0gMV0gIT0gMHhmNykge1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gcmFuIG9mZiB0aGUgZW5kIHdpdGhvdXQgaGl0dGluZyB0aGUgZW5kIG9mIHRoZSBzeXNleCBtZXNzYWdlXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgaXNTeXNleE1lc3NhZ2UgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcblxuICAgICAgICAgICAgICAgIGNhc2UgMHhGMTogLy8gTVRDIHF1YXJ0ZXIgZnJhbWVcbiAgICAgICAgICAgICAgICBjYXNlIDB4RjM6IC8vIHNvbmcgc2VsZWN0XG4gICAgICAgICAgICAgICAgICAgIGxlbmd0aCA9IDI7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgICAgICAgICAgY2FzZSAweEYyOiAvLyBzb25nIHBvc2l0aW9uIHBvaW50ZXJcbiAgICAgICAgICAgICAgICAgICAgbGVuZ3RoID0gMztcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgICAgICBsZW5ndGggPSAxO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCFpc1ZhbGlkTWVzc2FnZSkge1xuICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBldnQgPSB7fTtcbiAgICAgICAgLy8gZXZ0LnJlY2VpdmVkVGltZSA9IHBhcnNlRmxvYXQodGltZXN0YW1wLnRvU3RyaW5nKCkpICsgdGhpcy5famF6ekluc3RhbmNlLl9wZXJmVGltZVplcm87XG5cbiAgICAgICAgaWYgKGlzU3lzZXhNZXNzYWdlIHx8IHRoaXMuX2luTG9uZ1N5c2V4TWVzc2FnZSkge1xuICAgICAgICAgICAgZXZ0LmRhdGEgPSBuZXcgVWludDhBcnJheSh0aGlzLl9zeXNleEJ1ZmZlcik7XG4gICAgICAgICAgICB0aGlzLl9zeXNleEJ1ZmZlciA9IG5ldyBVaW50OEFycmF5KDApO1xuICAgICAgICAgICAgdGhpcy5faW5Mb25nU3lzZXhNZXNzYWdlID0gZmFsc2U7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBldnQuZGF0YSA9IG5ldyBVaW50OEFycmF5KGRhdGEuc2xpY2UoaSwgbGVuZ3RoICsgaSkpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKG5vZGVqcykge1xuICAgICAgICAgICAgaWYgKHRoaXMuX29ubWlkaW1lc3NhZ2UpIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9vbm1pZGltZXNzYWdlKGV2dCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjb25zdCBlID0gbmV3IE1JRElNZXNzYWdlRXZlbnQodGhpcywgZXZ0LmRhdGEsIGV2dC5yZWNlaXZlZFRpbWUpO1xuICAgICAgICAgICAgdGhpcy5kaXNwYXRjaEV2ZW50KGUpO1xuICAgICAgICB9XG4gICAgfVxufVxuIiwiLypcbiAgTUlESU91dHB1dCBpcyBhIHdyYXBwZXIgYXJvdW5kIGFuIG91dHB1dCBvZiBhIEphenogaW5zdGFuY2VcbiovXG5pbXBvcnQgSnp6IGZyb20gJy4uL3V0aWwvanp6JztcbmltcG9ydCB7IGdlbmVyYXRlVVVJRCB9IGZyb20gJy4uL3V0aWwvdXRpbCc7XG5pbXBvcnQgU3RvcmUgZnJvbSAnLi4vdXRpbC9zdG9yZSc7XG5pbXBvcnQgeyBkaXNwYXRjaEV2ZW50IH0gZnJvbSAnLi9taWRpX2FjY2Vzcyc7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIE1JRElPdXRwdXQge1xuICAgIGNvbnN0cnVjdG9yKGluZm8pIHtcbiAgICAgICAgdGhpcy5pZCA9IGluZm8uaWQgfHwgZ2VuZXJhdGVVVUlEKCk7XG4gICAgICAgIHRoaXMubmFtZSA9IGluZm8ubmFtZTtcbiAgICAgICAgdGhpcy5tYW51ZmFjdHVyZXIgPSBpbmZvLm1hbnVmYWN0dXJlcjtcbiAgICAgICAgdGhpcy52ZXJzaW9uID0gaW5mby52ZXJzaW9uO1xuICAgICAgICB0aGlzLnR5cGUgPSAnb3V0cHV0JztcbiAgICAgICAgdGhpcy5zdGF0ZSA9ICdjb25uZWN0ZWQnO1xuICAgICAgICB0aGlzLmNvbm5lY3Rpb24gPSAncGVuZGluZyc7XG4gICAgICAgIHRoaXMub25taWRpbWVzc2FnZSA9IG51bGw7XG4gICAgICAgIHRoaXMub25zdGF0ZWNoYW5nZSA9IG51bGw7XG4gICAgICAgIHRoaXMucG9ydCA9IG51bGw7XG5cbiAgICAgICAgdGhpcy5fbGlzdGVuZXJzID0gbmV3IFN0b3JlKCk7XG4gICAgfVxuXG4gICAgb3BlbigpIHtcbiAgICAgICAgaWYgKHRoaXMuY29ubmVjdGlvbiA9PT0gJ29wZW4nKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5wb3J0ID0gSnp6KCkub3Blbk1pZGlPdXQodGhpcy5uYW1lKVxuICAgICAgICAgICAgLm9yKGBDb3VsZCBub3Qgb3BlbiBvdXRwdXQgJHt0aGlzLm5hbWV9YClcbiAgICAgICAgICAgIC5hbmQoKCkgPT4ge1xuICAgICAgICAgICAgICAgIHRoaXMuY29ubmVjdGlvbiA9ICdvcGVuJztcbiAgICAgICAgICAgICAgICBkaXNwYXRjaEV2ZW50KHRoaXMpOyAvLyBkaXNwYXRjaCBNSURJQ29ubmVjdGlvbkV2ZW50IHZpYSBNSURJQWNjZXNzXG4gICAgICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBjbG9zZSgpIHtcbiAgICAgICAgaWYgKHRoaXMuY29ubmVjdGlvbiA9PT0gJ2Nsb3NlZCcpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLnBvcnQuY2xvc2UoKVxuICAgICAgICAgICAgLm9yKGBDb3VsZCBub3QgY2xvc2Ugb3V0cHV0ICR7dGhpcy5uYW1lfWApXG4gICAgICAgICAgICAuYW5kKCgpID0+IHtcbiAgICAgICAgICAgICAgICB0aGlzLmNvbm5lY3Rpb24gPSAnY2xvc2VkJztcbiAgICAgICAgICAgICAgICBkaXNwYXRjaEV2ZW50KHRoaXMpOyAvLyBkaXNwYXRjaCBNSURJQ29ubmVjdGlvbkV2ZW50IHZpYSBNSURJQWNjZXNzXG4gICAgICAgICAgICAgICAgdGhpcy5vbnN0YXRlY2hhbmdlID0gbnVsbDtcbiAgICAgICAgICAgICAgICB0aGlzLl9saXN0ZW5lcnMuY2xlYXIoKTtcbiAgICAgICAgICAgIH0pXG4gICAgfVxuXG4gICAgc2VuZChkYXRhLCB0aW1lc3RhbXAgPSAwKSB7XG4gICAgICAgIGxldCBkZWxheUJlZm9yZVNlbmQgPSAwO1xuICAgICAgICBpZiAodGltZXN0YW1wICE9PSAwKSB7XG4gICAgICAgICAgICBkZWxheUJlZm9yZVNlbmQgPSBNYXRoLmZsb29yKHRpbWVzdGFtcCAtIHBlcmZvcm1hbmNlLm5vdygpKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMucG9ydFxuICAgICAgICAgICAgLndhaXQoZGVsYXlCZWZvcmVTZW5kKVxuICAgICAgICAgICAgLnNlbmQoZGF0YSk7XG5cbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuXG4gICAgY2xlYXIoKSB7XG4gICAgICAgIC8vIHRvIGJlIGltcGxlbWVudGVkXG4gICAgfVxuXG4gICAgYWRkRXZlbnRMaXN0ZW5lcih0eXBlLCBsaXN0ZW5lcikge1xuICAgICAgICBpZiAodHlwZSAhPT0gJ3N0YXRlY2hhbmdlJykge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHRoaXMuX2xpc3RlbmVycy5oYXMobGlzdGVuZXIpID09PSBmYWxzZSkge1xuICAgICAgICAgICAgdGhpcy5fbGlzdGVuZXJzLmFkZChsaXN0ZW5lcik7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZW1vdmVFdmVudExpc3RlbmVyKHR5cGUsIGxpc3RlbmVyKSB7XG4gICAgICAgIGlmICh0eXBlICE9PSAnc3RhdGVjaGFuZ2UnKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodGhpcy5fbGlzdGVuZXJzLmhhcyhsaXN0ZW5lcikgPT09IHRydWUpIHtcbiAgICAgICAgICAgIHRoaXMuX2xpc3RlbmVycy5kZWxldGUobGlzdGVuZXIpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgZGlzcGF0Y2hFdmVudChldnQpIHtcbiAgICAgICAgdGhpcy5fbGlzdGVuZXJzLmZvckVhY2goKGxpc3RlbmVyKSA9PiB7XG4gICAgICAgICAgICBsaXN0ZW5lcihldnQpO1xuICAgICAgICB9KTtcblxuICAgICAgICBpZiAodGhpcy5vbnN0YXRlY2hhbmdlICE9PSBudWxsKSB7XG4gICAgICAgICAgICB0aGlzLm9uc3RhdGVjaGFuZ2UoZXZ0KTtcbiAgICAgICAgfVxuICAgIH1cbn1cbiIsImV4cG9ydCBkZWZhdWx0IGNsYXNzIE1JRElDb25uZWN0aW9uRXZlbnQge1xuICAgIGNvbnN0cnVjdG9yKG1pZGlBY2Nlc3MsIHBvcnQpIHtcbiAgICAgICAgdGhpcy5idWJibGVzID0gZmFsc2U7XG4gICAgICAgIHRoaXMuY2FuY2VsQnViYmxlID0gZmFsc2U7XG4gICAgICAgIHRoaXMuY2FuY2VsYWJsZSA9IGZhbHNlO1xuICAgICAgICB0aGlzLmN1cnJlbnRUYXJnZXQgPSBtaWRpQWNjZXNzO1xuICAgICAgICB0aGlzLmRlZmF1bHRQcmV2ZW50ZWQgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5ldmVudFBoYXNlID0gMDtcbiAgICAgICAgdGhpcy5wYXRoID0gW107XG4gICAgICAgIHRoaXMucG9ydCA9IHBvcnQ7XG4gICAgICAgIHRoaXMucmV0dXJuVmFsdWUgPSB0cnVlO1xuICAgICAgICB0aGlzLnNyY0VsZW1lbnQgPSBtaWRpQWNjZXNzO1xuICAgICAgICB0aGlzLnRhcmdldCA9IG1pZGlBY2Nlc3M7XG4gICAgICAgIHRoaXMudGltZVN0YW1wID0gRGF0ZS5ub3coKTtcbiAgICAgICAgdGhpcy50eXBlID0gJ3N0YXRlY2hhbmdlJztcbiAgICB9XG59XG4iLCJleHBvcnQgZGVmYXVsdCBjbGFzcyBNSURJTWVzc2FnZUV2ZW50IHtcbiAgICBjb25zdHJ1Y3Rvcihwb3J0LCBkYXRhLCByZWNlaXZlZFRpbWUpIHtcbiAgICAgICAgdGhpcy5idWJibGVzID0gZmFsc2U7XG4gICAgICAgIHRoaXMuY2FuY2VsQnViYmxlID0gZmFsc2U7XG4gICAgICAgIHRoaXMuY2FuY2VsYWJsZSA9IGZhbHNlO1xuICAgICAgICB0aGlzLmN1cnJlbnRUYXJnZXQgPSBwb3J0O1xuICAgICAgICB0aGlzLmRhdGEgPSBkYXRhO1xuICAgICAgICB0aGlzLmRlZmF1bHRQcmV2ZW50ZWQgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5ldmVudFBoYXNlID0gMDtcbiAgICAgICAgdGhpcy5wYXRoID0gW107XG4gICAgICAgIHRoaXMucmVjZWl2ZWRUaW1lID0gcmVjZWl2ZWRUaW1lO1xuICAgICAgICB0aGlzLnJldHVyblZhbHVlID0gdHJ1ZTtcbiAgICAgICAgdGhpcy5zcmNFbGVtZW50ID0gcG9ydDtcbiAgICAgICAgdGhpcy50YXJnZXQgPSBwb3J0O1xuICAgICAgICB0aGlzLnRpbWVTdGFtcCA9IERhdGUubm93KCk7XG4gICAgICAgIHRoaXMudHlwZSA9ICdtaWRpbWVzc2FnZSc7XG4gICAgfVxufVxuIiwiZnVuY3Rpb24gY3JlYXRlSnp6KCkge1xuICAgIHZhciBfdmVyc2lvbiA9ICcwLjQuMSc7XG5cbiAgICAvLyBfUjogY29tbW9uIHJvb3QgZm9yIGFsbCBhc3luYyBvYmplY3RzXG4gICAgZnVuY3Rpb24gX1IoKSB7XG4gICAgICAgIHRoaXMuX29yaWcgPSB0aGlzO1xuICAgICAgICB0aGlzLl9yZWFkeSA9IGZhbHNlO1xuICAgICAgICB0aGlzLl9xdWV1ZSA9IFtdO1xuICAgICAgICB0aGlzLl9lcnIgPSBbXTtcbiAgICB9XG4gICAgX1IucHJvdG90eXBlLl9leGVjID0gZnVuY3Rpb24gKCkge1xuICAgICAgICB3aGlsZSAodGhpcy5fcmVhZHkgJiYgdGhpcy5fcXVldWUubGVuZ3RoKSB7XG4gICAgICAgICAgICB2YXIgeCA9IHRoaXMuX3F1ZXVlLnNoaWZ0KCk7XG4gICAgICAgICAgICBpZiAodGhpcy5fb3JpZy5fYmFkKSB7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuX29yaWcuX2hvcGUgJiYgeFswXSA9PSBfb3IpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fb3JpZy5faG9wZSA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICB4WzBdLmFwcGx5KHRoaXMsIHhbMV0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fcXVldWUgPSBbXTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fb3JpZy5faG9wZSA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKHhbMF0gIT0gX29yKSB7XG4gICAgICAgICAgICAgICAgeFswXS5hcHBseSh0aGlzLCB4WzFdKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICBfUi5wcm90b3R5cGUuX3B1c2ggPSBmdW5jdGlvbiAoZnVuYywgYXJnKSB7IHRoaXMuX3F1ZXVlLnB1c2goW2Z1bmMsIGFyZ10pOyBfUi5wcm90b3R5cGUuX2V4ZWMuYXBwbHkodGhpcyk7IH1cbiAgICBfUi5wcm90b3R5cGUuX3NsaXAgPSBmdW5jdGlvbiAoZnVuYywgYXJnKSB7IHRoaXMuX3F1ZXVlLnVuc2hpZnQoW2Z1bmMsIGFyZ10pOyB9XG4gICAgX1IucHJvdG90eXBlLl9wYXVzZSA9IGZ1bmN0aW9uICgpIHsgdGhpcy5fcmVhZHkgPSBmYWxzZTsgfVxuICAgIF9SLnByb3RvdHlwZS5fcmVzdW1lID0gZnVuY3Rpb24gKCkgeyB0aGlzLl9yZWFkeSA9IHRydWU7IF9SLnByb3RvdHlwZS5fZXhlYy5hcHBseSh0aGlzKTsgfVxuICAgIF9SLnByb3RvdHlwZS5fYnJlYWsgPSBmdW5jdGlvbiAoZXJyKSB7IHRoaXMuX29yaWcuX2JhZCA9IHRydWU7IHRoaXMuX29yaWcuX2hvcGUgPSB0cnVlOyBpZiAoZXJyKSB0aGlzLl9vcmlnLl9lcnIucHVzaChlcnIpOyB9XG4gICAgX1IucHJvdG90eXBlLl9yZXBhaXIgPSBmdW5jdGlvbiAoKSB7IHRoaXMuX29yaWcuX2JhZCA9IGZhbHNlOyB9XG4gICAgX1IucHJvdG90eXBlLl9jcmFzaCA9IGZ1bmN0aW9uIChlcnIpIHsgdGhpcy5fYnJlYWsoZXJyKTsgdGhpcy5fcmVzdW1lKCk7IH1cbiAgICBfUi5wcm90b3R5cGUuZXJyID0gZnVuY3Rpb24gKCkgeyByZXR1cm4gX2Nsb25lKHRoaXMuX2Vycik7IH1cblxuICAgIGZ1bmN0aW9uIF93YWl0KG9iaiwgZGVsYXkpIHsgc2V0VGltZW91dChmdW5jdGlvbiAoKSB7IG9iai5fcmVzdW1lKCk7IH0sIGRlbGF5KTsgfVxuICAgIF9SLnByb3RvdHlwZS53YWl0ID0gZnVuY3Rpb24gKGRlbGF5KSB7XG4gICAgICAgIGlmICghZGVsYXkpIHJldHVybiB0aGlzO1xuICAgICAgICBmdW5jdGlvbiBGKCkgeyB9IEYucHJvdG90eXBlID0gdGhpcy5fb3JpZztcbiAgICAgICAgdmFyIHJldCA9IG5ldyBGKCk7XG4gICAgICAgIHJldC5fcmVhZHkgPSBmYWxzZTtcbiAgICAgICAgcmV0Ll9xdWV1ZSA9IFtdO1xuICAgICAgICB0aGlzLl9wdXNoKF93YWl0LCBbcmV0LCBkZWxheV0pO1xuICAgICAgICByZXR1cm4gcmV0O1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIF9hbmQocSkgeyBpZiAocSBpbnN0YW5jZW9mIEZ1bmN0aW9uKSBxLmFwcGx5KHRoaXMpOyBlbHNlIGNvbnNvbGUubG9nKHEpOyB9XG4gICAgX1IucHJvdG90eXBlLmFuZCA9IGZ1bmN0aW9uIChmdW5jKSB7IHRoaXMuX3B1c2goX2FuZCwgW2Z1bmNdKTsgcmV0dXJuIHRoaXM7IH1cbiAgICBmdW5jdGlvbiBfb3IocSkgeyBpZiAocSBpbnN0YW5jZW9mIEZ1bmN0aW9uKSBxLmFwcGx5KHRoaXMpOyBlbHNlIGNvbnNvbGUubG9nKHEpOyB9XG4gICAgX1IucHJvdG90eXBlLm9yID0gZnVuY3Rpb24gKGZ1bmMpIHsgdGhpcy5fcHVzaChfb3IsIFtmdW5jXSk7IHJldHVybiB0aGlzOyB9XG5cbiAgICBfUi5wcm90b3R5cGUuX2luZm8gPSB7fTtcbiAgICBfUi5wcm90b3R5cGUuaW5mbyA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmFyIGluZm8gPSBfY2xvbmUodGhpcy5fb3JpZy5faW5mbyk7XG4gICAgICAgIGlmICh0eXBlb2YgaW5mby5lbmdpbmUgPT0gJ3VuZGVmaW5lZCcpIGluZm8uZW5naW5lID0gJ25vbmUnO1xuICAgICAgICBpZiAodHlwZW9mIGluZm8uc3lzZXggPT0gJ3VuZGVmaW5lZCcpIGluZm8uc3lzZXggPSB0cnVlO1xuICAgICAgICByZXR1cm4gaW5mbztcbiAgICB9XG4gICAgX1IucHJvdG90eXBlLm5hbWUgPSBmdW5jdGlvbiAoKSB7IHJldHVybiB0aGlzLmluZm8oKS5uYW1lOyB9XG5cbiAgICBmdW5jdGlvbiBfY2xvc2Uob2JqKSB7XG4gICAgICAgIHRoaXMuX2JyZWFrKCdjbG9zZWQnKTtcbiAgICAgICAgb2JqLl9yZXN1bWUoKTtcbiAgICB9XG4gICAgX1IucHJvdG90eXBlLmNsb3NlID0gZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgcmV0ID0gbmV3IF9SKCk7XG4gICAgICAgIGlmICh0aGlzLl9jbG9zZSkgdGhpcy5fcHVzaCh0aGlzLl9jbG9zZSwgW10pO1xuICAgICAgICB0aGlzLl9wdXNoKF9jbG9zZSwgW3JldF0pO1xuICAgICAgICByZXR1cm4gcmV0O1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIF90cnlBbnkoYXJyKSB7XG4gICAgICAgIGlmICghYXJyLmxlbmd0aCkge1xuICAgICAgICAgICAgdGhpcy5fYnJlYWsoKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICB2YXIgZnVuYyA9IGFyci5zaGlmdCgpO1xuICAgICAgICBpZiAoYXJyLmxlbmd0aCkge1xuICAgICAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgICAgICAgICAgdGhpcy5fc2xpcChfb3IsIFtmdW5jdGlvbiAoKSB7IF90cnlBbnkuYXBwbHkoc2VsZiwgW2Fycl0pOyB9XSk7XG4gICAgICAgIH1cbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIHRoaXMuX3JlcGFpcigpO1xuICAgICAgICAgICAgZnVuYy5hcHBseSh0aGlzKTtcbiAgICAgICAgfVxuICAgICAgICBjYXRjaCAoZSkge1xuICAgICAgICAgICAgdGhpcy5fYnJlYWsoZS50b1N0cmluZygpKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIF9wdXNoKGFyciwgb2JqKSB7XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgYXJyLmxlbmd0aDsgaSsrKSBpZiAoYXJyW2ldID09PSBvYmopIHJldHVybjtcbiAgICAgICAgYXJyLnB1c2gob2JqKTtcbiAgICB9XG4gICAgZnVuY3Rpb24gX3BvcChhcnIsIG9iaikge1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGFyci5sZW5ndGg7IGkrKykgaWYgKGFycltpXSA9PT0gb2JqKSB7XG4gICAgICAgICAgICBhcnIuc3BsaWNlKGksIDEpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLy8gX0o6IEpaWiBvYmplY3RcbiAgICBmdW5jdGlvbiBfSigpIHtcbiAgICAgICAgX1IuYXBwbHkodGhpcyk7XG4gICAgfVxuICAgIF9KLnByb3RvdHlwZSA9IG5ldyBfUigpO1xuXG4gICAgX0oucHJvdG90eXBlLnRpbWUgPSBmdW5jdGlvbiAoKSB7IHJldHVybiAwOyB9XG4gICAgaWYgKHR5cGVvZiBwZXJmb3JtYW5jZSAhPSAndW5kZWZpbmVkJyAmJiBwZXJmb3JtYW5jZS5ub3cpIF9KLnByb3RvdHlwZS5fdGltZSA9IGZ1bmN0aW9uICgpIHsgcmV0dXJuIHBlcmZvcm1hbmNlLm5vdygpOyB9XG4gICAgZnVuY3Rpb24gX2luaXRUaW1lcigpIHtcbiAgICAgICAgaWYgKCFfSi5wcm90b3R5cGUuX3RpbWUpIF9KLnByb3RvdHlwZS5fdGltZSA9IGZ1bmN0aW9uICgpIHsgcmV0dXJuIERhdGUubm93KCk7IH1cbiAgICAgICAgX0oucHJvdG90eXBlLl9zdGFydFRpbWUgPSBfSi5wcm90b3R5cGUuX3RpbWUoKTtcbiAgICAgICAgX0oucHJvdG90eXBlLnRpbWUgPSBmdW5jdGlvbiAoKSB7IHJldHVybiBfSi5wcm90b3R5cGUuX3RpbWUoKSAtIF9KLnByb3RvdHlwZS5fc3RhcnRUaW1lOyB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gX2Nsb25lKG9iaiwga2V5LCB2YWwpIHtcbiAgICAgICAgaWYgKHR5cGVvZiBrZXkgPT0gJ3VuZGVmaW5lZCcpIHJldHVybiBfY2xvbmUob2JqLCBbXSwgW10pO1xuICAgICAgICBpZiAob2JqIGluc3RhbmNlb2YgT2JqZWN0KSB7XG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGtleS5sZW5ndGg7IGkrKykgaWYgKGtleVtpXSA9PT0gb2JqKSByZXR1cm4gdmFsW2ldO1xuICAgICAgICAgICAgdmFyIHJldDtcbiAgICAgICAgICAgIGlmIChvYmogaW5zdGFuY2VvZiBBcnJheSkgcmV0ID0gW107IGVsc2UgcmV0ID0ge307XG4gICAgICAgICAgICBrZXkucHVzaChvYmopOyB2YWwucHVzaChyZXQpO1xuICAgICAgICAgICAgZm9yICh2YXIgayBpbiBvYmopIGlmIChvYmouaGFzT3duUHJvcGVydHkoaykpIHJldFtrXSA9IF9jbG9uZShvYmpba10sIGtleSwgdmFsKTtcbiAgICAgICAgICAgIHJldHVybiByZXQ7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG9iajtcbiAgICB9XG4gICAgX0oucHJvdG90eXBlLl9pbmZvID0geyBuYW1lOiAnSlpaLmpzJywgdmVyOiBfdmVyc2lvbiwgdmVyc2lvbjogX3ZlcnNpb24gfTtcblxuICAgIHZhciBfb3V0cyA9IFtdO1xuICAgIHZhciBfaW5zID0gW107XG5cbiAgICBmdW5jdGlvbiBfcG9zdFJlZnJlc2goKSB7XG4gICAgICAgIHRoaXMuX2luZm8uZW5naW5lID0gX2VuZ2luZS5fdHlwZTtcbiAgICAgICAgdGhpcy5faW5mby52ZXJzaW9uID0gX2VuZ2luZS5fdmVyc2lvbjtcbiAgICAgICAgdGhpcy5faW5mby5zeXNleCA9IF9lbmdpbmUuX3N5c2V4O1xuICAgICAgICB0aGlzLl9pbmZvLmlucHV0cyA9IFtdO1xuICAgICAgICB0aGlzLl9pbmZvLm91dHB1dHMgPSBbXTtcbiAgICAgICAgX291dHMgPSBbXTtcbiAgICAgICAgX2lucyA9IFtdO1xuICAgICAgICBfZW5naW5lLl9hbGxPdXRzID0ge307XG4gICAgICAgIF9lbmdpbmUuX2FsbElucyA9IHt9O1xuICAgICAgICB2YXIgaSwgeDtcbiAgICAgICAgZm9yIChpID0gMDsgaSA8IF9lbmdpbmUuX291dHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIHggPSBfZW5naW5lLl9vdXRzW2ldO1xuICAgICAgICAgICAgeC5lbmdpbmUgPSBfZW5naW5lO1xuICAgICAgICAgICAgX2VuZ2luZS5fYWxsT3V0c1t4Lm5hbWVdID0geDtcbiAgICAgICAgICAgIHRoaXMuX2luZm8ub3V0cHV0cy5wdXNoKHtcbiAgICAgICAgICAgICAgICBuYW1lOiB4Lm5hbWUsXG4gICAgICAgICAgICAgICAgbWFudWZhY3R1cmVyOiB4Lm1hbnVmYWN0dXJlcixcbiAgICAgICAgICAgICAgICB2ZXJzaW9uOiB4LnZlcnNpb24sXG4gICAgICAgICAgICAgICAgZW5naW5lOiBfZW5naW5lLl90eXBlXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIF9vdXRzLnB1c2goeCk7XG4gICAgICAgIH1cbiAgICAgICAgZm9yIChpID0gMDsgaSA8IF92aXJ0dWFsLl9vdXRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICB4ID0gX3ZpcnR1YWwuX291dHNbaV07XG4gICAgICAgICAgICB0aGlzLl9pbmZvLm91dHB1dHMucHVzaCh7XG4gICAgICAgICAgICAgICAgbmFtZTogeC5uYW1lLFxuICAgICAgICAgICAgICAgIG1hbnVmYWN0dXJlcjogeC5tYW51ZmFjdHVyZXIsXG4gICAgICAgICAgICAgICAgdmVyc2lvbjogeC52ZXJzaW9uLFxuICAgICAgICAgICAgICAgIGVuZ2luZTogeC50eXBlXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIF9vdXRzLnB1c2goeCk7XG4gICAgICAgIH1cbiAgICAgICAgZm9yIChpID0gMDsgaSA8IF9lbmdpbmUuX2lucy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgeCA9IF9lbmdpbmUuX2luc1tpXTtcbiAgICAgICAgICAgIHguZW5naW5lID0gX2VuZ2luZTtcbiAgICAgICAgICAgIF9lbmdpbmUuX2FsbEluc1t4Lm5hbWVdID0geDtcbiAgICAgICAgICAgIHRoaXMuX2luZm8uaW5wdXRzLnB1c2goe1xuICAgICAgICAgICAgICAgIG5hbWU6IHgubmFtZSxcbiAgICAgICAgICAgICAgICBtYW51ZmFjdHVyZXI6IHgubWFudWZhY3R1cmVyLFxuICAgICAgICAgICAgICAgIHZlcnNpb246IHgudmVyc2lvbixcbiAgICAgICAgICAgICAgICBlbmdpbmU6IF9lbmdpbmUuX3R5cGVcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgX2lucy5wdXNoKHgpO1xuICAgICAgICB9XG4gICAgICAgIGZvciAoaSA9IDA7IGkgPCBfdmlydHVhbC5faW5zLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICB4ID0gX3ZpcnR1YWwuX2luc1tpXTtcbiAgICAgICAgICAgIHRoaXMuX2luZm8uaW5wdXRzLnB1c2goe1xuICAgICAgICAgICAgICAgIG5hbWU6IHgubmFtZSxcbiAgICAgICAgICAgICAgICBtYW51ZmFjdHVyZXI6IHgubWFudWZhY3R1cmVyLFxuICAgICAgICAgICAgICAgIHZlcnNpb246IHgudmVyc2lvbixcbiAgICAgICAgICAgICAgICBlbmdpbmU6IHgudHlwZVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBfaW5zLnB1c2goeCk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgZnVuY3Rpb24gX3JlZnJlc2goKSB7XG4gICAgICAgIHRoaXMuX3NsaXAoX3Bvc3RSZWZyZXNoLCBbXSk7XG4gICAgICAgIF9lbmdpbmUuX3JlZnJlc2goKTtcbiAgICB9XG4gICAgX0oucHJvdG90eXBlLnJlZnJlc2ggPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHRoaXMuX3B1c2goX3JlZnJlc2gsIFtdKTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gX2ZpbHRlckxpc3QocSwgYXJyKSB7XG4gICAgICAgIGlmICh0eXBlb2YgcSA9PSAndW5kZWZpbmVkJykgcmV0dXJuIGFyci5zbGljZSgpO1xuICAgICAgICB2YXIgaSwgbjtcbiAgICAgICAgdmFyIGEgPSBbXTtcbiAgICAgICAgaWYgKHEgaW5zdGFuY2VvZiBSZWdFeHApIHtcbiAgICAgICAgICAgIGZvciAobiA9IDA7IG4gPCBhcnIubGVuZ3RoOyBuKyspIGlmIChxLnRlc3QoYXJyW25dLm5hbWUpKSBhLnB1c2goYXJyW25dKTtcbiAgICAgICAgICAgIHJldHVybiBhO1xuICAgICAgICB9XG4gICAgICAgIGlmIChxIGluc3RhbmNlb2YgRnVuY3Rpb24pIHEgPSBxKGFycik7XG4gICAgICAgIGlmICghKHEgaW5zdGFuY2VvZiBBcnJheSkpIHEgPSBbcV07XG4gICAgICAgIGZvciAoaSA9IDA7IGkgPCBxLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBmb3IgKG4gPSAwOyBuIDwgYXJyLmxlbmd0aDsgbisrKSB7XG4gICAgICAgICAgICAgICAgaWYgKHFbaV0gKyAnJyA9PT0gbiArICcnIHx8IHFbaV0gPT09IGFycltuXS5uYW1lIHx8IChxW2ldIGluc3RhbmNlb2YgT2JqZWN0ICYmIHFbaV0ubmFtZSA9PT0gYXJyW25dLm5hbWUpKSBhLnB1c2goYXJyW25dKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gYTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBfbm90Rm91bmQocG9ydCwgcSkge1xuICAgICAgICB2YXIgbXNnO1xuICAgICAgICBpZiAocSBpbnN0YW5jZW9mIFJlZ0V4cCkgbXNnID0gJ1BvcnQgbWF0Y2hpbmcgJyArIHEgKyAnIG5vdCBmb3VuZCc7XG4gICAgICAgIGVsc2UgaWYgKHEgaW5zdGFuY2VvZiBPYmplY3QgfHwgdHlwZW9mIHEgPT0gJ3VuZGVmaW5lZCcpIG1zZyA9ICdQb3J0IG5vdCBmb3VuZCc7XG4gICAgICAgIGVsc2UgbXNnID0gJ1BvcnQgXCInICsgcSArICdcIiBub3QgZm91bmQnO1xuICAgICAgICBwb3J0Ll9jcmFzaChtc2cpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIF9vcGVuTWlkaU91dChwb3J0LCBhcmcpIHtcbiAgICAgICAgdmFyIGFyciA9IF9maWx0ZXJMaXN0KGFyZywgX291dHMpO1xuICAgICAgICBpZiAoIWFyci5sZW5ndGgpIHsgX25vdEZvdW5kKHBvcnQsIGFyZyk7IHJldHVybjsgfVxuICAgICAgICBmdW5jdGlvbiBwYWNrKHgpIHsgcmV0dXJuIGZ1bmN0aW9uICgpIHsgeC5lbmdpbmUuX29wZW5PdXQodGhpcywgeC5uYW1lKTsgfTsgfVxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGFyci5sZW5ndGg7IGkrKykgYXJyW2ldID0gcGFjayhhcnJbaV0pO1xuICAgICAgICBwb3J0Ll9zbGlwKF90cnlBbnksIFthcnJdKTtcbiAgICAgICAgcG9ydC5fcmVzdW1lKCk7XG4gICAgfVxuICAgIF9KLnByb3RvdHlwZS5vcGVuTWlkaU91dCA9IGZ1bmN0aW9uIChhcmcpIHtcbiAgICAgICAgdmFyIHBvcnQgPSBuZXcgX00oKTtcbiAgICAgICAgdGhpcy5fcHVzaChfcmVmcmVzaCwgW10pO1xuICAgICAgICB0aGlzLl9wdXNoKF9vcGVuTWlkaU91dCwgW3BvcnQsIGFyZ10pO1xuICAgICAgICByZXR1cm4gcG9ydDtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBfb3Blbk1pZGlJbihwb3J0LCBhcmcpIHtcbiAgICAgICAgdmFyIGFyciA9IF9maWx0ZXJMaXN0KGFyZywgX2lucyk7XG4gICAgICAgIGlmICghYXJyLmxlbmd0aCkgeyBfbm90Rm91bmQocG9ydCwgYXJnKTsgcmV0dXJuOyB9XG4gICAgICAgIGZ1bmN0aW9uIHBhY2soeCkgeyByZXR1cm4gZnVuY3Rpb24gKCkgeyB4LmVuZ2luZS5fb3BlbkluKHRoaXMsIHgubmFtZSk7IH07IH1cbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBhcnIubGVuZ3RoOyBpKyspIGFycltpXSA9IHBhY2soYXJyW2ldKTtcbiAgICAgICAgcG9ydC5fc2xpcChfdHJ5QW55LCBbYXJyXSk7XG4gICAgICAgIHBvcnQuX3Jlc3VtZSgpO1xuICAgIH1cbiAgICBfSi5wcm90b3R5cGUub3Blbk1pZGlJbiA9IGZ1bmN0aW9uIChhcmcpIHtcbiAgICAgICAgdmFyIHBvcnQgPSBuZXcgX00oKTtcbiAgICAgICAgdGhpcy5fcHVzaChfcmVmcmVzaCwgW10pO1xuICAgICAgICB0aGlzLl9wdXNoKF9vcGVuTWlkaUluLCBbcG9ydCwgYXJnXSk7XG4gICAgICAgIHJldHVybiBwb3J0O1xuICAgIH1cblxuICAgIF9KLnByb3RvdHlwZS5fY2xvc2UgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIF9lbmdpbmUuX2Nsb3NlKCk7XG4gICAgfVxuXG4gICAgLy8gX006IE1JREktSW4vT3V0IG9iamVjdFxuICAgIGZ1bmN0aW9uIF9NKCkge1xuICAgICAgICBfUi5hcHBseSh0aGlzKTtcbiAgICAgICAgdGhpcy5faGFuZGxlcyA9IFtdO1xuICAgICAgICB0aGlzLl9vdXRzID0gW107XG4gICAgfVxuICAgIF9NLnByb3RvdHlwZSA9IG5ldyBfUigpO1xuXG4gICAgX00ucHJvdG90eXBlLl9yZWNlaXZlID0gZnVuY3Rpb24gKG1zZykgeyB0aGlzLl9lbWl0KG1zZyk7IH0gLy8gb3ZlcnJpZGUhXG4gICAgZnVuY3Rpb24gX3JlY2VpdmUobXNnKSB7IHRoaXMuX3JlY2VpdmUobXNnKTsgfVxuICAgIF9NLnByb3RvdHlwZS5zZW5kID0gZnVuY3Rpb24gKCkge1xuICAgICAgICB0aGlzLl9wdXNoKF9yZWNlaXZlLCBbTUlESS5hcHBseShudWxsLCBhcmd1bWVudHMpXSk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cbiAgICBfTS5wcm90b3R5cGUubm90ZSA9IGZ1bmN0aW9uIChjLCBuLCB2LCB0KSB7XG4gICAgICAgIHRoaXMubm90ZU9uKGMsIG4sIHYpO1xuICAgICAgICBpZiAodCkgdGhpcy53YWl0KHQpLm5vdGVPZmYoYywgbik7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cbiAgICBfTS5wcm90b3R5cGUuX2VtaXQgPSBmdW5jdGlvbiAobXNnKSB7XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5faGFuZGxlcy5sZW5ndGg7IGkrKykgdGhpcy5faGFuZGxlc1tpXS5hcHBseSh0aGlzLCBbTUlESShtc2cpLl9zdGFtcCh0aGlzKV0pO1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMuX291dHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIHZhciBtID0gTUlESShtc2cpO1xuICAgICAgICAgICAgaWYgKCFtLl9zdGFtcGVkKHRoaXMuX291dHNbaV0pKSB0aGlzLl9vdXRzW2ldLnNlbmQobS5fc3RhbXAodGhpcykpO1xuICAgICAgICB9XG4gICAgfVxuICAgIGZ1bmN0aW9uIF9lbWl0KG1zZykgeyB0aGlzLl9lbWl0KG1zZyk7IH1cbiAgICBfTS5wcm90b3R5cGUuZW1pdCA9IGZ1bmN0aW9uIChtc2cpIHtcbiAgICAgICAgdGhpcy5fcHVzaChfZW1pdCwgW21zZ10pO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG4gICAgZnVuY3Rpb24gX2Nvbm5lY3QoYXJnKSB7XG4gICAgICAgIGlmIChhcmcgaW5zdGFuY2VvZiBGdW5jdGlvbikgX3B1c2godGhpcy5fb3JpZy5faGFuZGxlcywgYXJnKTtcbiAgICAgICAgZWxzZSBfcHVzaCh0aGlzLl9vcmlnLl9vdXRzLCBhcmcpO1xuICAgIH1cbiAgICBmdW5jdGlvbiBfZGlzY29ubmVjdChhcmcpIHtcbiAgICAgICAgaWYgKGFyZyBpbnN0YW5jZW9mIEZ1bmN0aW9uKSBfcG9wKHRoaXMuX29yaWcuX2hhbmRsZXMsIGFyZyk7XG4gICAgICAgIGVsc2UgX3BvcCh0aGlzLl9vcmlnLl9vdXRzLCBhcmcpO1xuICAgIH1cbiAgICBfTS5wcm90b3R5cGUuY29ubmVjdCA9IGZ1bmN0aW9uIChhcmcpIHtcbiAgICAgICAgdGhpcy5fcHVzaChfY29ubmVjdCwgW2FyZ10pO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG4gICAgX00ucHJvdG90eXBlLmRpc2Nvbm5lY3QgPSBmdW5jdGlvbiAoYXJnKSB7XG4gICAgICAgIHRoaXMuX3B1c2goX2Rpc2Nvbm5lY3QsIFthcmddKTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgdmFyIF9qeno7XG4gICAgdmFyIF9lbmdpbmUgPSB7fTtcbiAgICB2YXIgX3ZpcnR1YWwgPSB7IF9vdXRzOiBbXSwgX2luczogW10gfTtcblxuICAgIC8vIE5vZGUuanNcbiAgICBmdW5jdGlvbiBfdHJ5Tk9ERSgpIHtcbiAgICAgICAgaWYgKHR5cGVvZiBtb2R1bGUgIT0gJ3VuZGVmaW5lZCcgJiYgbW9kdWxlLmV4cG9ydHMpIHtcbiAgICAgICAgICAgIF9pbml0Tm9kZShyZXF1aXJlKCdqYXp6LW1pZGknKSk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5fYnJlYWsoKTtcbiAgICB9XG4gICAgLy8gSmF6ei1QbHVnaW5cbiAgICBmdW5jdGlvbiBfdHJ5SmF6elBsdWdpbigpIHtcbiAgICAgICAgdmFyIGRpdiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgICAgICBkaXYuc3R5bGUudmlzaWJpbGl0eSA9ICdoaWRkZW4nO1xuICAgICAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKGRpdik7XG4gICAgICAgIHZhciBvYmogPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdvYmplY3QnKTtcbiAgICAgICAgb2JqLnN0eWxlLnZpc2liaWxpdHkgPSAnaGlkZGVuJztcbiAgICAgICAgb2JqLnN0eWxlLndpZHRoID0gJzBweCc7IG9iai5zdHlsZS5oZWlnaHQgPSAnMHB4JztcbiAgICAgICAgb2JqLmNsYXNzaWQgPSAnQ0xTSUQ6MUFDRTE2MTgtMUM3RC00NTYxLUFFRTEtMzQ4NDJBQTg1RTkwJztcbiAgICAgICAgb2JqLnR5cGUgPSAnYXVkaW8veC1qYXp6JztcbiAgICAgICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChvYmopO1xuICAgICAgICBpZiAob2JqLmlzSmF6eikge1xuICAgICAgICAgICAgX2luaXRKYXp6UGx1Z2luKG9iaik7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5fYnJlYWsoKTtcbiAgICB9XG4gICAgLy8gV2ViIE1JREkgQVBJXG4gICAgZnVuY3Rpb24gX3RyeVdlYk1JREkoKSB7XG4gICAgICAgIGlmIChuYXZpZ2F0b3IucmVxdWVzdE1JRElBY2Nlc3MpIHtcbiAgICAgICAgICAgIHZhciBzZWxmID0gdGhpcztcbiAgICAgICAgICAgIGZ1bmN0aW9uIG9uR29vZChtaWRpKSB7XG4gICAgICAgICAgICAgICAgX2luaXRXZWJNSURJKG1pZGkpO1xuICAgICAgICAgICAgICAgIHNlbGYuX3Jlc3VtZSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZnVuY3Rpb24gb25CYWQobXNnKSB7XG4gICAgICAgICAgICAgICAgc2VsZi5fY3Jhc2gobXNnKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHZhciBvcHQgPSB7fTtcbiAgICAgICAgICAgIG5hdmlnYXRvci5yZXF1ZXN0TUlESUFjY2VzcyhvcHQpLnRoZW4ob25Hb29kLCBvbkJhZCk7XG4gICAgICAgICAgICB0aGlzLl9wYXVzZSgpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuX2JyZWFrKCk7XG4gICAgfVxuICAgIGZ1bmN0aW9uIF90cnlXZWJNSURJc3lzZXgoKSB7XG4gICAgICAgIGlmIChuYXZpZ2F0b3IucmVxdWVzdE1JRElBY2Nlc3MpIHtcbiAgICAgICAgICAgIHZhciBzZWxmID0gdGhpcztcbiAgICAgICAgICAgIGZ1bmN0aW9uIG9uR29vZChtaWRpKSB7XG4gICAgICAgICAgICAgICAgX2luaXRXZWJNSURJKG1pZGksIHRydWUpO1xuICAgICAgICAgICAgICAgIHNlbGYuX3Jlc3VtZSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZnVuY3Rpb24gb25CYWQobXNnKSB7XG4gICAgICAgICAgICAgICAgc2VsZi5fY3Jhc2gobXNnKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHZhciBvcHQgPSB7IHN5c2V4OiB0cnVlIH07XG4gICAgICAgICAgICBuYXZpZ2F0b3IucmVxdWVzdE1JRElBY2Nlc3Mob3B0KS50aGVuKG9uR29vZCwgb25CYWQpO1xuICAgICAgICAgICAgdGhpcy5fcGF1c2UoKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLl9icmVhaygpO1xuICAgIH1cbiAgICAvLyBXZWItZXh0ZW5zaW9uXG4gICAgZnVuY3Rpb24gX3RyeUNSWCgpIHtcbiAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgICAgICB2YXIgaW5zdDtcbiAgICAgICAgdmFyIG1zZztcbiAgICAgICAgZnVuY3Rpb24gZXZlbnRIYW5kbGUoZSkge1xuICAgICAgICAgICAgaW5zdCA9IHRydWU7XG4gICAgICAgICAgICBpZiAoIW1zZykgbXNnID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2phenotbWlkaS1tc2cnKTtcbiAgICAgICAgICAgIGlmICghbXNnKSByZXR1cm47XG4gICAgICAgICAgICB2YXIgYSA9IFtdO1xuICAgICAgICAgICAgdHJ5IHsgYSA9IEpTT04ucGFyc2UobXNnLmlubmVyVGV4dCk7IH0gY2F0Y2ggKGUpIHsgfVxuICAgICAgICAgICAgbXNnLmlubmVyVGV4dCA9ICcnO1xuICAgICAgICAgICAgZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcignamF6ei1taWRpLW1zZycsIGV2ZW50SGFuZGxlKTtcbiAgICAgICAgICAgIGlmIChhWzBdID09PSAndmVyc2lvbicpIHtcbiAgICAgICAgICAgICAgICBfaW5pdENSWChtc2csIGFbMl0pO1xuICAgICAgICAgICAgICAgIHNlbGYuX3Jlc3VtZSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgc2VsZi5fY3Jhc2goKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICB0aGlzLl9wYXVzZSgpO1xuICAgICAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdqYXp6LW1pZGktbXNnJywgZXZlbnRIYW5kbGUpO1xuICAgICAgICB0cnkgeyBkb2N1bWVudC5kaXNwYXRjaEV2ZW50KG5ldyBFdmVudCgnamF6ei1taWRpJykpOyB9IGNhdGNoIChlKSB7IH1cbiAgICAgICAgd2luZG93LnNldFRpbWVvdXQoZnVuY3Rpb24gKCkgeyBpZiAoIWluc3QpIHNlbGYuX2NyYXNoKCk7IH0sIDApO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIF96ZXJvQnJlYWsoKSB7XG4gICAgICAgIHRoaXMuX3BhdXNlKCk7XG4gICAgICAgIHZhciBzZWxmID0gdGhpcztcbiAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbiAoKSB7IHNlbGYuX2NyYXNoKCk7IH0sIDApO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIF9maWx0ZXJFbmdpbmVzKG9wdCkge1xuICAgICAgICB2YXIgcmV0ID0gW190cnlOT0RFLCBfemVyb0JyZWFrXTtcbiAgICAgICAgdmFyIGFyciA9IF9maWx0ZXJFbmdpbmVOYW1lcyhvcHQpO1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGFyci5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgaWYgKGFycltpXSA9PSAnd2VibWlkaScpIHtcbiAgICAgICAgICAgICAgICBpZiAob3B0ICYmIG9wdC5zeXNleCA9PT0gdHJ1ZSkgcmV0LnB1c2goX3RyeVdlYk1JRElzeXNleCk7XG4gICAgICAgICAgICAgICAgaWYgKCFvcHQgfHwgb3B0LnN5c2V4ICE9PSB0cnVlIHx8IG9wdC5kZWdyYWRlID09PSB0cnVlKSByZXQucHVzaChfdHJ5V2ViTUlESSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmIChhcnJbaV0gPT0gJ2V4dGVuc2lvbicpIHJldC5wdXNoKF90cnlDUlgpO1xuICAgICAgICAgICAgZWxzZSBpZiAoYXJyW2ldID09ICdwbHVnaW4nKSByZXQucHVzaChfdHJ5SmF6elBsdWdpbik7XG4gICAgICAgIH1cbiAgICAgICAgcmV0LnB1c2goX2luaXROT05FKTtcbiAgICAgICAgcmV0dXJuIHJldDtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBfZmlsdGVyRW5naW5lTmFtZXMob3B0KSB7XG4gICAgICAgIHZhciB3ZWIgPSBbJ2V4dGVuc2lvbicsICd3ZWJtaWRpJywgJ3BsdWdpbiddO1xuICAgICAgICBpZiAoIW9wdCB8fCAhb3B0LmVuZ2luZSkgcmV0dXJuIHdlYjtcbiAgICAgICAgdmFyIGFyciA9IG9wdC5lbmdpbmUgaW5zdGFuY2VvZiBBcnJheSA/IG9wdC5lbmdpbmUgOiBbb3B0LmVuZ2luZV07XG4gICAgICAgIHZhciBkdXAgPSB7fTtcbiAgICAgICAgdmFyIG5vbmU7XG4gICAgICAgIHZhciBldGM7XG4gICAgICAgIHZhciBoZWFkID0gW107XG4gICAgICAgIHZhciB0YWlsID0gW107XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgYXJyLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICB2YXIgbmFtZSA9IGFycltpXS50b1N0cmluZygpLnRvTG93ZXJDYXNlKCk7XG4gICAgICAgICAgICBpZiAoZHVwW25hbWVdKSBjb250aW51ZTtcbiAgICAgICAgICAgIGR1cFtuYW1lXSA9IHRydWU7XG4gICAgICAgICAgICBpZiAobmFtZSA9PT0gJ25vbmUnKSBub25lID0gdHJ1ZTtcbiAgICAgICAgICAgIGlmIChuYW1lID09PSAnZXRjJykgZXRjID0gdHJ1ZTtcbiAgICAgICAgICAgIGlmIChldGMpIHRhaWwucHVzaChuYW1lKTsgZWxzZSBoZWFkLnB1c2gobmFtZSk7XG4gICAgICAgICAgICBfcG9wKHdlYiwgbmFtZSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGV0YyB8fCBoZWFkLmxlbmd0aCB8fCB0YWlsLmxlbmd0aCkgbm9uZSA9IGZhbHNlO1xuICAgICAgICByZXR1cm4gbm9uZSA/IFtdIDogaGVhZC5jb25jYXQoZXRjID8gd2ViIDogdGFpbCk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gX2luaXRKWloob3B0KSB7XG4gICAgICAgIF9qenogPSBuZXcgX0ooKTtcbiAgICAgICAgX2p6ei5fb3B0aW9ucyA9IG9wdDtcbiAgICAgICAgX2p6ei5fcHVzaChfdHJ5QW55LCBbX2ZpbHRlckVuZ2luZXMob3B0KV0pO1xuICAgICAgICBfanp6LnJlZnJlc2goKTtcbiAgICAgICAgX2p6ei5fcHVzaChfaW5pdFRpbWVyLCBbXSk7XG4gICAgICAgIF9qenouX3B1c2goZnVuY3Rpb24gKCkgeyBpZiAoIV9vdXRzLmxlbmd0aCAmJiAhX2lucy5sZW5ndGgpIHRoaXMuX2JyZWFrKCk7IH0sIFtdKTtcbiAgICAgICAgX2p6ei5fcmVzdW1lKCk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gX2luaXROT05FKCkge1xuICAgICAgICBfZW5naW5lLl90eXBlID0gJ25vbmUnO1xuICAgICAgICBfZW5naW5lLl9zeXNleCA9IHRydWU7XG4gICAgICAgIF9lbmdpbmUuX3JlZnJlc2ggPSBmdW5jdGlvbiAoKSB7IF9lbmdpbmUuX291dHMgPSBbXTsgX2VuZ2luZS5faW5zID0gW107IH1cbiAgICB9XG4gICAgLy8gY29tbW9uIGluaXRpYWxpemF0aW9uIGZvciBKYXp6LVBsdWdpbiBhbmQgamF6ei1taWRpXG4gICAgZnVuY3Rpb24gX2luaXRFbmdpbmVKUCgpIHtcbiAgICAgICAgX2VuZ2luZS5faW5BcnIgPSBbXTtcbiAgICAgICAgX2VuZ2luZS5fb3V0QXJyID0gW107XG4gICAgICAgIF9lbmdpbmUuX2luTWFwID0ge307XG4gICAgICAgIF9lbmdpbmUuX291dE1hcCA9IHt9O1xuICAgICAgICBfZW5naW5lLl92ZXJzaW9uID0gX2VuZ2luZS5fbWFpbi52ZXJzaW9uO1xuICAgICAgICBfZW5naW5lLl9zeXNleCA9IHRydWU7XG4gICAgICAgIF9lbmdpbmUuX3JlZnJlc2ggPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBfZW5naW5lLl9vdXRzID0gW107XG4gICAgICAgICAgICBfZW5naW5lLl9pbnMgPSBbXTtcbiAgICAgICAgICAgIHZhciBpLCB4O1xuICAgICAgICAgICAgZm9yIChpID0gMDsgKHggPSBfZW5naW5lLl9tYWluLk1pZGlPdXRJbmZvKGkpKS5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgIF9lbmdpbmUuX291dHMucHVzaCh7IHR5cGU6IF9lbmdpbmUuX3R5cGUsIG5hbWU6IHhbMF0sIG1hbnVmYWN0dXJlcjogeFsxXSwgdmVyc2lvbjogeFsyXSB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGZvciAoaSA9IDA7ICh4ID0gX2VuZ2luZS5fbWFpbi5NaWRpSW5JbmZvKGkpKS5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgIF9lbmdpbmUuX2lucy5wdXNoKHsgdHlwZTogX2VuZ2luZS5fdHlwZSwgbmFtZTogeFswXSwgbWFudWZhY3R1cmVyOiB4WzFdLCB2ZXJzaW9uOiB4WzJdIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIF9lbmdpbmUuX29wZW5PdXQgPSBmdW5jdGlvbiAocG9ydCwgbmFtZSkge1xuICAgICAgICAgICAgdmFyIGltcGwgPSBfZW5naW5lLl9vdXRNYXBbbmFtZV07XG4gICAgICAgICAgICBpZiAoIWltcGwpIHtcbiAgICAgICAgICAgICAgICBpZiAoX2VuZ2luZS5fcG9vbC5sZW5ndGggPD0gX2VuZ2luZS5fb3V0QXJyLmxlbmd0aCkgX2VuZ2luZS5fcG9vbC5wdXNoKF9lbmdpbmUuX25ld1BsdWdpbigpKTtcbiAgICAgICAgICAgICAgICBpbXBsID0ge1xuICAgICAgICAgICAgICAgICAgICBuYW1lOiBuYW1lLFxuICAgICAgICAgICAgICAgICAgICBjbGllbnRzOiBbXSxcbiAgICAgICAgICAgICAgICAgICAgaW5mbzoge1xuICAgICAgICAgICAgICAgICAgICAgICAgbmFtZTogbmFtZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG1hbnVmYWN0dXJlcjogX2VuZ2luZS5fYWxsT3V0c1tuYW1lXS5tYW51ZmFjdHVyZXIsXG4gICAgICAgICAgICAgICAgICAgICAgICB2ZXJzaW9uOiBfZW5naW5lLl9hbGxPdXRzW25hbWVdLnZlcnNpb24sXG4gICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiAnTUlESS1vdXQnLFxuICAgICAgICAgICAgICAgICAgICAgICAgc3lzZXg6IF9lbmdpbmUuX3N5c2V4LFxuICAgICAgICAgICAgICAgICAgICAgICAgZW5naW5lOiBfZW5naW5lLl90eXBlXG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIF9jbG9zZTogZnVuY3Rpb24gKHBvcnQpIHsgX2VuZ2luZS5fY2xvc2VPdXQocG9ydCk7IH0sXG4gICAgICAgICAgICAgICAgICAgIF9yZWNlaXZlOiBmdW5jdGlvbiAoYSkgeyB0aGlzLnBsdWdpbi5NaWRpT3V0UmF3KGEuc2xpY2UoKSk7IH1cbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIHZhciBwbHVnaW4gPSBfZW5naW5lLl9wb29sW19lbmdpbmUuX291dEFyci5sZW5ndGhdO1xuICAgICAgICAgICAgICAgIGltcGwucGx1Z2luID0gcGx1Z2luO1xuICAgICAgICAgICAgICAgIF9lbmdpbmUuX291dEFyci5wdXNoKGltcGwpO1xuICAgICAgICAgICAgICAgIF9lbmdpbmUuX291dE1hcFtuYW1lXSA9IGltcGw7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoIWltcGwub3Blbikge1xuICAgICAgICAgICAgICAgIHZhciBzID0gaW1wbC5wbHVnaW4uTWlkaU91dE9wZW4obmFtZSk7XG4gICAgICAgICAgICAgICAgaWYgKHMgIT09IG5hbWUpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHMpIGltcGwucGx1Z2luLk1pZGlPdXRDbG9zZSgpO1xuICAgICAgICAgICAgICAgICAgICBwb3J0Ll9icmVhaygpOyByZXR1cm47XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGltcGwub3BlbiA9IHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBwb3J0Ll9vcmlnLl9pbXBsID0gaW1wbDtcbiAgICAgICAgICAgIF9wdXNoKGltcGwuY2xpZW50cywgcG9ydC5fb3JpZyk7XG4gICAgICAgICAgICBwb3J0Ll9pbmZvID0gaW1wbC5pbmZvO1xuICAgICAgICAgICAgcG9ydC5fcmVjZWl2ZSA9IGZ1bmN0aW9uIChhcmcpIHsgaW1wbC5fcmVjZWl2ZShhcmcpOyB9XG4gICAgICAgICAgICBwb3J0Ll9jbG9zZSA9IGZ1bmN0aW9uICgpIHsgaW1wbC5fY2xvc2UodGhpcyk7IH1cbiAgICAgICAgfVxuICAgICAgICBfZW5naW5lLl9vcGVuSW4gPSBmdW5jdGlvbiAocG9ydCwgbmFtZSkge1xuICAgICAgICAgICAgdmFyIGltcGwgPSBfZW5naW5lLl9pbk1hcFtuYW1lXTtcbiAgICAgICAgICAgIGlmICghaW1wbCkge1xuICAgICAgICAgICAgICAgIGlmIChfZW5naW5lLl9wb29sLmxlbmd0aCA8PSBfZW5naW5lLl9pbkFyci5sZW5ndGgpIF9lbmdpbmUuX3Bvb2wucHVzaChfZW5naW5lLl9uZXdQbHVnaW4oKSk7XG4gICAgICAgICAgICAgICAgaW1wbCA9IHtcbiAgICAgICAgICAgICAgICAgICAgbmFtZTogbmFtZSxcbiAgICAgICAgICAgICAgICAgICAgY2xpZW50czogW10sXG4gICAgICAgICAgICAgICAgICAgIGluZm86IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG5hbWU6IG5hbWUsXG4gICAgICAgICAgICAgICAgICAgICAgICBtYW51ZmFjdHVyZXI6IF9lbmdpbmUuX2FsbEluc1tuYW1lXS5tYW51ZmFjdHVyZXIsXG4gICAgICAgICAgICAgICAgICAgICAgICB2ZXJzaW9uOiBfZW5naW5lLl9hbGxJbnNbbmFtZV0udmVyc2lvbixcbiAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6ICdNSURJLWluJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHN5c2V4OiBfZW5naW5lLl9zeXNleCxcbiAgICAgICAgICAgICAgICAgICAgICAgIGVuZ2luZTogX2VuZ2luZS5fdHlwZVxuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICBfY2xvc2U6IGZ1bmN0aW9uIChwb3J0KSB7IF9lbmdpbmUuX2Nsb3NlSW4ocG9ydCk7IH0sXG4gICAgICAgICAgICAgICAgICAgIGhhbmRsZTogZnVuY3Rpb24gKHQsIGEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5jbGllbnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIG1zZyA9IE1JREkoYSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5jbGllbnRzW2ldLl9lbWl0KG1zZyk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIGZ1bmN0aW9uIG1ha2VIYW5kbGUoeCkgeyByZXR1cm4gZnVuY3Rpb24gKHQsIGEpIHsgeC5oYW5kbGUodCwgYSk7IH07IH1cbiAgICAgICAgICAgICAgICBpbXBsLm9ubWlkaSA9IG1ha2VIYW5kbGUoaW1wbCk7XG4gICAgICAgICAgICAgICAgdmFyIHBsdWdpbiA9IF9lbmdpbmUuX3Bvb2xbX2VuZ2luZS5faW5BcnIubGVuZ3RoXTtcbiAgICAgICAgICAgICAgICBpbXBsLnBsdWdpbiA9IHBsdWdpbjtcbiAgICAgICAgICAgICAgICBfZW5naW5lLl9pbkFyci5wdXNoKGltcGwpO1xuICAgICAgICAgICAgICAgIF9lbmdpbmUuX2luTWFwW25hbWVdID0gaW1wbDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICghaW1wbC5vcGVuKSB7XG4gICAgICAgICAgICAgICAgdmFyIHMgPSBpbXBsLnBsdWdpbi5NaWRpSW5PcGVuKG5hbWUsIGltcGwub25taWRpKTtcbiAgICAgICAgICAgICAgICBpZiAocyAhPT0gbmFtZSkge1xuICAgICAgICAgICAgICAgICAgICBpZiAocykgaW1wbC5wbHVnaW4uTWlkaUluQ2xvc2UoKTtcbiAgICAgICAgICAgICAgICAgICAgcG9ydC5fYnJlYWsoKTsgcmV0dXJuO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpbXBsLm9wZW4gPSB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcG9ydC5fb3JpZy5faW1wbCA9IGltcGw7XG4gICAgICAgICAgICBfcHVzaChpbXBsLmNsaWVudHMsIHBvcnQuX29yaWcpO1xuICAgICAgICAgICAgcG9ydC5faW5mbyA9IGltcGwuaW5mbztcbiAgICAgICAgICAgIHBvcnQuX2Nsb3NlID0gZnVuY3Rpb24gKCkgeyBpbXBsLl9jbG9zZSh0aGlzKTsgfVxuICAgICAgICB9XG4gICAgICAgIF9lbmdpbmUuX2Nsb3NlT3V0ID0gZnVuY3Rpb24gKHBvcnQpIHtcbiAgICAgICAgICAgIHZhciBpbXBsID0gcG9ydC5faW1wbDtcbiAgICAgICAgICAgIF9wb3AoaW1wbC5jbGllbnRzLCBwb3J0Ll9vcmlnKTtcbiAgICAgICAgICAgIGlmICghaW1wbC5jbGllbnRzLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgIGltcGwub3BlbiA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIGltcGwucGx1Z2luLk1pZGlPdXRDbG9zZSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIF9lbmdpbmUuX2Nsb3NlSW4gPSBmdW5jdGlvbiAocG9ydCkge1xuICAgICAgICAgICAgdmFyIGltcGwgPSBwb3J0Ll9pbXBsO1xuICAgICAgICAgICAgX3BvcChpbXBsLmNsaWVudHMsIHBvcnQuX29yaWcpO1xuICAgICAgICAgICAgaWYgKCFpbXBsLmNsaWVudHMubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgaW1wbC5vcGVuID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgaW1wbC5wbHVnaW4uTWlkaUluQ2xvc2UoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBfZW5naW5lLl9jbG9zZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgX2VuZ2luZS5faW5BcnIubGVuZ3RoOyBpKyspIGlmIChfZW5naW5lLl9pbkFycltpXS5vcGVuKSBfZW5naW5lLl9pbkFycltpXS5wbHVnaW4uTWlkaUluQ2xvc2UoKTtcbiAgICAgICAgfVxuICAgICAgICBfSi5wcm90b3R5cGUuX3RpbWUgPSBmdW5jdGlvbiAoKSB7IHJldHVybiBfZW5naW5lLl9tYWluLlRpbWUoKTsgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIF9pbml0Tm9kZShvYmopIHtcbiAgICAgICAgX2VuZ2luZS5fdHlwZSA9ICdub2RlJztcbiAgICAgICAgX2VuZ2luZS5fbWFpbiA9IG9iajtcbiAgICAgICAgX2VuZ2luZS5fcG9vbCA9IFtdO1xuICAgICAgICBfZW5naW5lLl9uZXdQbHVnaW4gPSBmdW5jdGlvbiAoKSB7IHJldHVybiBuZXcgb2JqLk1JREkoKTsgfVxuICAgICAgICBfaW5pdEVuZ2luZUpQKCk7XG4gICAgfVxuICAgIGZ1bmN0aW9uIF9pbml0SmF6elBsdWdpbihvYmopIHtcbiAgICAgICAgX2VuZ2luZS5fdHlwZSA9ICdwbHVnaW4nO1xuICAgICAgICBfZW5naW5lLl9tYWluID0gb2JqO1xuICAgICAgICBfZW5naW5lLl9wb29sID0gW29ial07XG4gICAgICAgIF9lbmdpbmUuX25ld1BsdWdpbiA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHZhciBwbGcgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdvYmplY3QnKTtcbiAgICAgICAgICAgIHBsZy5zdHlsZS52aXNpYmlsaXR5ID0gJ2hpZGRlbic7XG4gICAgICAgICAgICBwbGcuc3R5bGUud2lkdGggPSAnMHB4Jzsgb2JqLnN0eWxlLmhlaWdodCA9ICcwcHgnO1xuICAgICAgICAgICAgcGxnLmNsYXNzaWQgPSAnQ0xTSUQ6MUFDRTE2MTgtMUM3RC00NTYxLUFFRTEtMzQ4NDJBQTg1RTkwJztcbiAgICAgICAgICAgIHBsZy50eXBlID0gJ2F1ZGlvL3gtamF6eic7XG4gICAgICAgICAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKHBsZyk7XG4gICAgICAgICAgICByZXR1cm4gcGxnLmlzSmF6eiA/IHBsZyA6IHVuZGVmaW5lZDtcbiAgICAgICAgfVxuICAgICAgICBfaW5pdEVuZ2luZUpQKCk7XG4gICAgfVxuICAgIGZ1bmN0aW9uIF9pbml0V2ViTUlESShhY2Nlc3MsIHN5c2V4KSB7XG4gICAgICAgIF9lbmdpbmUuX3R5cGUgPSAnd2VibWlkaSc7XG4gICAgICAgIF9lbmdpbmUuX3ZlcnNpb24gPSA0MztcbiAgICAgICAgX2VuZ2luZS5fc3lzZXggPSAhIXN5c2V4O1xuICAgICAgICBfZW5naW5lLl9hY2Nlc3MgPSBhY2Nlc3M7XG4gICAgICAgIF9lbmdpbmUuX2luTWFwID0ge307XG4gICAgICAgIF9lbmdpbmUuX291dE1hcCA9IHt9O1xuICAgICAgICBfZW5naW5lLl9yZWZyZXNoID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgX2VuZ2luZS5fb3V0cyA9IFtdO1xuICAgICAgICAgICAgX2VuZ2luZS5faW5zID0gW107XG4gICAgICAgICAgICBfZW5naW5lLl9hY2Nlc3Mub3V0cHV0cy5mb3JFYWNoKGZ1bmN0aW9uIChwb3J0LCBrZXkpIHtcbiAgICAgICAgICAgICAgICBfZW5naW5lLl9vdXRzLnB1c2goeyB0eXBlOiBfZW5naW5lLl90eXBlLCBuYW1lOiBwb3J0Lm5hbWUsIG1hbnVmYWN0dXJlcjogcG9ydC5tYW51ZmFjdHVyZXIsIHZlcnNpb246IHBvcnQudmVyc2lvbiB9KTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgX2VuZ2luZS5fYWNjZXNzLmlucHV0cy5mb3JFYWNoKGZ1bmN0aW9uIChwb3J0LCBrZXkpIHtcbiAgICAgICAgICAgICAgICBfZW5naW5lLl9pbnMucHVzaCh7IHR5cGU6IF9lbmdpbmUuX3R5cGUsIG5hbWU6IHBvcnQubmFtZSwgbWFudWZhY3R1cmVyOiBwb3J0Lm1hbnVmYWN0dXJlciwgdmVyc2lvbjogcG9ydC52ZXJzaW9uIH0pO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgX2VuZ2luZS5fb3Blbk91dCA9IGZ1bmN0aW9uIChwb3J0LCBuYW1lKSB7XG4gICAgICAgICAgICB2YXIgaW1wbCA9IF9lbmdpbmUuX291dE1hcFtuYW1lXTtcbiAgICAgICAgICAgIGlmICghaW1wbCkge1xuICAgICAgICAgICAgICAgIGltcGwgPSB7XG4gICAgICAgICAgICAgICAgICAgIG5hbWU6IG5hbWUsXG4gICAgICAgICAgICAgICAgICAgIGNsaWVudHM6IFtdLFxuICAgICAgICAgICAgICAgICAgICBpbmZvOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBuYW1lOiBuYW1lLFxuICAgICAgICAgICAgICAgICAgICAgICAgbWFudWZhY3R1cmVyOiBfZW5naW5lLl9hbGxPdXRzW25hbWVdLm1hbnVmYWN0dXJlcixcbiAgICAgICAgICAgICAgICAgICAgICAgIHZlcnNpb246IF9lbmdpbmUuX2FsbE91dHNbbmFtZV0udmVyc2lvbixcbiAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6ICdNSURJLW91dCcsXG4gICAgICAgICAgICAgICAgICAgICAgICBzeXNleDogX2VuZ2luZS5fc3lzZXgsXG4gICAgICAgICAgICAgICAgICAgICAgICBlbmdpbmU6IF9lbmdpbmUuX3R5cGVcbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgX2Nsb3NlOiBmdW5jdGlvbiAocG9ydCkgeyBfZW5naW5lLl9jbG9zZU91dChwb3J0KTsgfSxcbiAgICAgICAgICAgICAgICAgICAgX3JlY2VpdmU6IGZ1bmN0aW9uIChhKSB7IHRoaXMuZGV2LnNlbmQoYS5zbGljZSgpKTsgfVxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgdmFyIGlkLCBkZXY7XG4gICAgICAgICAgICAgICAgX2VuZ2luZS5fYWNjZXNzLm91dHB1dHMuZm9yRWFjaChmdW5jdGlvbiAoZGV2LCBrZXkpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGRldi5uYW1lID09PSBuYW1lKSBpbXBsLmRldiA9IGRldjtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICBpZiAoaW1wbC5kZXYpIHtcbiAgICAgICAgICAgICAgICAgICAgX2VuZ2luZS5fb3V0TWFwW25hbWVdID0gaW1wbDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSBpbXBsID0gdW5kZWZpbmVkO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGltcGwpIHtcbiAgICAgICAgICAgICAgICBpZiAoaW1wbC5kZXYub3BlbikgaW1wbC5kZXYub3BlbigpO1xuICAgICAgICAgICAgICAgIHBvcnQuX29yaWcuX2ltcGwgPSBpbXBsO1xuICAgICAgICAgICAgICAgIF9wdXNoKGltcGwuY2xpZW50cywgcG9ydC5fb3JpZyk7XG4gICAgICAgICAgICAgICAgcG9ydC5faW5mbyA9IGltcGwuaW5mbztcbiAgICAgICAgICAgICAgICBwb3J0Ll9yZWNlaXZlID0gZnVuY3Rpb24gKGFyZykgeyBpbXBsLl9yZWNlaXZlKGFyZyk7IH1cbiAgICAgICAgICAgICAgICBwb3J0Ll9jbG9zZSA9IGZ1bmN0aW9uICgpIHsgaW1wbC5fY2xvc2UodGhpcyk7IH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgcG9ydC5fYnJlYWsoKTtcbiAgICAgICAgfVxuICAgICAgICBfZW5naW5lLl9vcGVuSW4gPSBmdW5jdGlvbiAocG9ydCwgbmFtZSkge1xuICAgICAgICAgICAgdmFyIGltcGwgPSBfZW5naW5lLl9pbk1hcFtuYW1lXTtcbiAgICAgICAgICAgIGlmICghaW1wbCkge1xuICAgICAgICAgICAgICAgIGltcGwgPSB7XG4gICAgICAgICAgICAgICAgICAgIG5hbWU6IG5hbWUsXG4gICAgICAgICAgICAgICAgICAgIGNsaWVudHM6IFtdLFxuICAgICAgICAgICAgICAgICAgICBpbmZvOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBuYW1lOiBuYW1lLFxuICAgICAgICAgICAgICAgICAgICAgICAgbWFudWZhY3R1cmVyOiBfZW5naW5lLl9hbGxJbnNbbmFtZV0ubWFudWZhY3R1cmVyLFxuICAgICAgICAgICAgICAgICAgICAgICAgdmVyc2lvbjogX2VuZ2luZS5fYWxsSW5zW25hbWVdLnZlcnNpb24sXG4gICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiAnTUlESS1pbicsXG4gICAgICAgICAgICAgICAgICAgICAgICBzeXNleDogX2VuZ2luZS5fc3lzZXgsXG4gICAgICAgICAgICAgICAgICAgICAgICBlbmdpbmU6IF9lbmdpbmUuX3R5cGVcbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgX2Nsb3NlOiBmdW5jdGlvbiAocG9ydCkgeyBfZW5naW5lLl9jbG9zZUluKHBvcnQpOyB9LFxuICAgICAgICAgICAgICAgICAgICBoYW5kbGU6IGZ1bmN0aW9uIChldnQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5jbGllbnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIG1zZyA9IE1JREkoW10uc2xpY2UuY2FsbChldnQuZGF0YSkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuY2xpZW50c1tpXS5fZW1pdChtc2cpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICB2YXIgaWQsIGRldjtcbiAgICAgICAgICAgICAgICBfZW5naW5lLl9hY2Nlc3MuaW5wdXRzLmZvckVhY2goZnVuY3Rpb24gKGRldiwga2V5KSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChkZXYubmFtZSA9PT0gbmFtZSkgaW1wbC5kZXYgPSBkZXY7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgaWYgKGltcGwuZGV2KSB7XG4gICAgICAgICAgICAgICAgICAgIGZ1bmN0aW9uIG1ha2VIYW5kbGUoeCkgeyByZXR1cm4gZnVuY3Rpb24gKGV2dCkgeyB4LmhhbmRsZShldnQpOyB9OyB9XG4gICAgICAgICAgICAgICAgICAgIGltcGwuZGV2Lm9ubWlkaW1lc3NhZ2UgPSBtYWtlSGFuZGxlKGltcGwpO1xuICAgICAgICAgICAgICAgICAgICBfZW5naW5lLl9pbk1hcFtuYW1lXSA9IGltcGw7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2UgaW1wbCA9IHVuZGVmaW5lZDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChpbXBsKSB7XG4gICAgICAgICAgICAgICAgaWYgKGltcGwuZGV2Lm9wZW4pIGltcGwuZGV2Lm9wZW4oKTtcbiAgICAgICAgICAgICAgICBwb3J0Ll9vcmlnLl9pbXBsID0gaW1wbDtcbiAgICAgICAgICAgICAgICBfcHVzaChpbXBsLmNsaWVudHMsIHBvcnQuX29yaWcpO1xuICAgICAgICAgICAgICAgIHBvcnQuX2luZm8gPSBpbXBsLmluZm87XG4gICAgICAgICAgICAgICAgcG9ydC5fY2xvc2UgPSBmdW5jdGlvbiAoKSB7IGltcGwuX2Nsb3NlKHRoaXMpOyB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHBvcnQuX2JyZWFrKCk7XG4gICAgICAgIH1cbiAgICAgICAgX2VuZ2luZS5fY2xvc2VPdXQgPSBmdW5jdGlvbiAocG9ydCkge1xuICAgICAgICAgICAgdmFyIGltcGwgPSBwb3J0Ll9pbXBsO1xuICAgICAgICAgICAgaWYgKCFpbXBsLmNsaWVudHMubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgaWYgKGltcGwuZGV2LmNsb3NlKSBpbXBsLmRldi5jbG9zZSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgX3BvcChpbXBsLmNsaWVudHMsIHBvcnQuX29yaWcpO1xuICAgICAgICB9XG4gICAgICAgIF9lbmdpbmUuX2Nsb3NlSW4gPSBmdW5jdGlvbiAocG9ydCkge1xuICAgICAgICAgICAgdmFyIGltcGwgPSBwb3J0Ll9pbXBsO1xuICAgICAgICAgICAgX3BvcChpbXBsLmNsaWVudHMsIHBvcnQuX29yaWcpO1xuICAgICAgICAgICAgaWYgKCFpbXBsLmNsaWVudHMubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgaWYgKGltcGwuZGV2LmNsb3NlKSBpbXBsLmRldi5jbG9zZSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIF9lbmdpbmUuX2Nsb3NlID0gZnVuY3Rpb24gKCkge1xuICAgICAgICB9XG4gICAgfVxuICAgIGZ1bmN0aW9uIF9pbml0Q1JYKG1zZywgdmVyKSB7XG4gICAgICAgIF9lbmdpbmUuX3R5cGUgPSAnZXh0ZW5zaW9uJztcbiAgICAgICAgX2VuZ2luZS5fdmVyc2lvbiA9IHZlcjtcbiAgICAgICAgX2VuZ2luZS5fc3lzZXggPSB0cnVlO1xuICAgICAgICBfZW5naW5lLl9wb29sID0gW107XG4gICAgICAgIF9lbmdpbmUuX2luQXJyID0gW107XG4gICAgICAgIF9lbmdpbmUuX291dEFyciA9IFtdO1xuICAgICAgICBfZW5naW5lLl9pbk1hcCA9IHt9O1xuICAgICAgICBfZW5naW5lLl9vdXRNYXAgPSB7fTtcbiAgICAgICAgX2VuZ2luZS5fbXNnID0gbXNnO1xuICAgICAgICBfZW5naW5lLl9uZXdQbHVnaW4gPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgcGx1Z2luID0geyBpZDogX2VuZ2luZS5fcG9vbC5sZW5ndGggfTtcbiAgICAgICAgICAgIGlmICghcGx1Z2luLmlkKSBwbHVnaW4ucmVhZHkgPSB0cnVlO1xuICAgICAgICAgICAgZWxzZSBkb2N1bWVudC5kaXNwYXRjaEV2ZW50KG5ldyBDdXN0b21FdmVudCgnamF6ei1taWRpJywgeyBkZXRhaWw6IFsnbmV3J10gfSkpO1xuICAgICAgICAgICAgX2VuZ2luZS5fcG9vbC5wdXNoKHBsdWdpbik7XG4gICAgICAgIH1cbiAgICAgICAgX2VuZ2luZS5fbmV3UGx1Z2luKCk7XG4gICAgICAgIF9lbmdpbmUuX3JlZnJlc2ggPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBfZW5naW5lLl9vdXRzID0gW107XG4gICAgICAgICAgICBfZW5naW5lLl9pbnMgPSBbXTtcbiAgICAgICAgICAgIF9qenouX3BhdXNlKCk7XG4gICAgICAgICAgICBkb2N1bWVudC5kaXNwYXRjaEV2ZW50KG5ldyBDdXN0b21FdmVudCgnamF6ei1taWRpJywgeyBkZXRhaWw6IFsncmVmcmVzaCddIH0pKTtcbiAgICAgICAgfVxuICAgICAgICBfZW5naW5lLl9vcGVuT3V0ID0gZnVuY3Rpb24gKHBvcnQsIG5hbWUpIHtcbiAgICAgICAgICAgIHZhciBpbXBsID0gX2VuZ2luZS5fb3V0TWFwW25hbWVdO1xuICAgICAgICAgICAgaWYgKCFpbXBsKSB7XG4gICAgICAgICAgICAgICAgaWYgKF9lbmdpbmUuX3Bvb2wubGVuZ3RoIDw9IF9lbmdpbmUuX291dEFyci5sZW5ndGgpIF9lbmdpbmUuX25ld1BsdWdpbigpO1xuICAgICAgICAgICAgICAgIHZhciBwbHVnaW4gPSBfZW5naW5lLl9wb29sW19lbmdpbmUuX291dEFyci5sZW5ndGhdO1xuICAgICAgICAgICAgICAgIGltcGwgPSB7XG4gICAgICAgICAgICAgICAgICAgIG5hbWU6IG5hbWUsXG4gICAgICAgICAgICAgICAgICAgIGNsaWVudHM6IFtdLFxuICAgICAgICAgICAgICAgICAgICBpbmZvOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBuYW1lOiBuYW1lLFxuICAgICAgICAgICAgICAgICAgICAgICAgbWFudWZhY3R1cmVyOiBfZW5naW5lLl9hbGxPdXRzW25hbWVdLm1hbnVmYWN0dXJlcixcbiAgICAgICAgICAgICAgICAgICAgICAgIHZlcnNpb246IF9lbmdpbmUuX2FsbE91dHNbbmFtZV0udmVyc2lvbixcbiAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6ICdNSURJLW91dCcsXG4gICAgICAgICAgICAgICAgICAgICAgICBzeXNleDogX2VuZ2luZS5fc3lzZXgsXG4gICAgICAgICAgICAgICAgICAgICAgICBlbmdpbmU6IF9lbmdpbmUuX3R5cGVcbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgX3N0YXJ0OiBmdW5jdGlvbiAoKSB7IGRvY3VtZW50LmRpc3BhdGNoRXZlbnQobmV3IEN1c3RvbUV2ZW50KCdqYXp6LW1pZGknLCB7IGRldGFpbDogWydvcGVub3V0JywgcGx1Z2luLmlkLCBuYW1lXSB9KSk7IH0sXG4gICAgICAgICAgICAgICAgICAgIF9jbG9zZTogZnVuY3Rpb24gKHBvcnQpIHsgX2VuZ2luZS5fY2xvc2VPdXQocG9ydCk7IH0sXG4gICAgICAgICAgICAgICAgICAgIF9yZWNlaXZlOiBmdW5jdGlvbiAoYSkgeyB2YXIgdiA9IGEuc2xpY2UoKTsgdi5zcGxpY2UoMCwgMCwgJ3BsYXknLCBwbHVnaW4uaWQpOyBkb2N1bWVudC5kaXNwYXRjaEV2ZW50KG5ldyBDdXN0b21FdmVudCgnamF6ei1taWRpJywgeyBkZXRhaWw6IHYgfSkpOyB9XG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICBpbXBsLnBsdWdpbiA9IHBsdWdpbjtcbiAgICAgICAgICAgICAgICBwbHVnaW4ub3V0cHV0ID0gaW1wbDtcbiAgICAgICAgICAgICAgICBfZW5naW5lLl9vdXRBcnIucHVzaChpbXBsKTtcbiAgICAgICAgICAgICAgICBfZW5naW5lLl9vdXRNYXBbbmFtZV0gPSBpbXBsO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcG9ydC5fb3JpZy5faW1wbCA9IGltcGw7XG4gICAgICAgICAgICBfcHVzaChpbXBsLmNsaWVudHMsIHBvcnQuX29yaWcpO1xuICAgICAgICAgICAgcG9ydC5faW5mbyA9IGltcGwuaW5mbztcbiAgICAgICAgICAgIHBvcnQuX3JlY2VpdmUgPSBmdW5jdGlvbiAoYXJnKSB7IGltcGwuX3JlY2VpdmUoYXJnKTsgfVxuICAgICAgICAgICAgcG9ydC5fY2xvc2UgPSBmdW5jdGlvbiAoKSB7IGltcGwuX2Nsb3NlKHRoaXMpOyB9XG4gICAgICAgICAgICBpZiAoIWltcGwub3Blbikge1xuICAgICAgICAgICAgICAgIGlmIChpbXBsLnBsdWdpbi5yZWFkeSkgaW1wbC5fc3RhcnQoKTtcbiAgICAgICAgICAgICAgICBwb3J0Ll9wYXVzZSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIF9lbmdpbmUuX29wZW5JbiA9IGZ1bmN0aW9uIChwb3J0LCBuYW1lKSB7XG4gICAgICAgICAgICB2YXIgaW1wbCA9IF9lbmdpbmUuX2luTWFwW25hbWVdO1xuICAgICAgICAgICAgaWYgKCFpbXBsKSB7XG4gICAgICAgICAgICAgICAgaWYgKF9lbmdpbmUuX3Bvb2wubGVuZ3RoIDw9IF9lbmdpbmUuX2luQXJyLmxlbmd0aCkgX2VuZ2luZS5fbmV3UGx1Z2luKCk7XG4gICAgICAgICAgICAgICAgdmFyIHBsdWdpbiA9IF9lbmdpbmUuX3Bvb2xbX2VuZ2luZS5faW5BcnIubGVuZ3RoXTtcbiAgICAgICAgICAgICAgICBpbXBsID0ge1xuICAgICAgICAgICAgICAgICAgICBuYW1lOiBuYW1lLFxuICAgICAgICAgICAgICAgICAgICBjbGllbnRzOiBbXSxcbiAgICAgICAgICAgICAgICAgICAgaW5mbzoge1xuICAgICAgICAgICAgICAgICAgICAgICAgbmFtZTogbmFtZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG1hbnVmYWN0dXJlcjogX2VuZ2luZS5fYWxsSW5zW25hbWVdLm1hbnVmYWN0dXJlcixcbiAgICAgICAgICAgICAgICAgICAgICAgIHZlcnNpb246IF9lbmdpbmUuX2FsbEluc1tuYW1lXS52ZXJzaW9uLFxuICAgICAgICAgICAgICAgICAgICAgICAgdHlwZTogJ01JREktaW4nLFxuICAgICAgICAgICAgICAgICAgICAgICAgc3lzZXg6IF9lbmdpbmUuX3N5c2V4LFxuICAgICAgICAgICAgICAgICAgICAgICAgZW5naW5lOiBfZW5naW5lLl90eXBlXG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIF9zdGFydDogZnVuY3Rpb24gKCkgeyBkb2N1bWVudC5kaXNwYXRjaEV2ZW50KG5ldyBDdXN0b21FdmVudCgnamF6ei1taWRpJywgeyBkZXRhaWw6IFsnb3BlbmluJywgcGx1Z2luLmlkLCBuYW1lXSB9KSk7IH0sXG4gICAgICAgICAgICAgICAgICAgIF9jbG9zZTogZnVuY3Rpb24gKHBvcnQpIHsgX2VuZ2luZS5fY2xvc2VJbihwb3J0KTsgfVxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgaW1wbC5wbHVnaW4gPSBwbHVnaW47XG4gICAgICAgICAgICAgICAgcGx1Z2luLmlucHV0ID0gaW1wbDtcbiAgICAgICAgICAgICAgICBfZW5naW5lLl9pbkFyci5wdXNoKGltcGwpO1xuICAgICAgICAgICAgICAgIF9lbmdpbmUuX2luTWFwW25hbWVdID0gaW1wbDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHBvcnQuX29yaWcuX2ltcGwgPSBpbXBsO1xuICAgICAgICAgICAgX3B1c2goaW1wbC5jbGllbnRzLCBwb3J0Ll9vcmlnKTtcbiAgICAgICAgICAgIHBvcnQuX2luZm8gPSBpbXBsLmluZm87XG4gICAgICAgICAgICBwb3J0Ll9jbG9zZSA9IGZ1bmN0aW9uICgpIHsgaW1wbC5fY2xvc2UodGhpcyk7IH1cbiAgICAgICAgICAgIGlmICghaW1wbC5vcGVuKSB7XG4gICAgICAgICAgICAgICAgaWYgKGltcGwucGx1Z2luLnJlYWR5KSBpbXBsLl9zdGFydCgpO1xuICAgICAgICAgICAgICAgIHBvcnQuX3BhdXNlKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgX2VuZ2luZS5fY2xvc2VPdXQgPSBmdW5jdGlvbiAocG9ydCkge1xuICAgICAgICAgICAgdmFyIGltcGwgPSBwb3J0Ll9pbXBsO1xuICAgICAgICAgICAgX3BvcChpbXBsLmNsaWVudHMsIHBvcnQuX29yaWcpO1xuICAgICAgICAgICAgaWYgKCFpbXBsLmNsaWVudHMubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgaW1wbC5vcGVuID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgZG9jdW1lbnQuZGlzcGF0Y2hFdmVudChuZXcgQ3VzdG9tRXZlbnQoJ2phenotbWlkaScsIHsgZGV0YWlsOiBbJ2Nsb3Nlb3V0JywgaW1wbC5wbHVnaW4uaWRdIH0pKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBfZW5naW5lLl9jbG9zZUluID0gZnVuY3Rpb24gKHBvcnQpIHtcbiAgICAgICAgICAgIHZhciBpbXBsID0gcG9ydC5faW1wbDtcbiAgICAgICAgICAgIF9wb3AoaW1wbC5jbGllbnRzLCBwb3J0Ll9vcmlnKTtcbiAgICAgICAgICAgIGlmICghaW1wbC5jbGllbnRzLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgIGltcGwub3BlbiA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIGRvY3VtZW50LmRpc3BhdGNoRXZlbnQobmV3IEN1c3RvbUV2ZW50KCdqYXp6LW1pZGknLCB7IGRldGFpbDogWydjbG9zZWluJywgaW1wbC5wbHVnaW4uaWRdIH0pKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBfZW5naW5lLl9jbG9zZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgfVxuICAgICAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdqYXp6LW1pZGktbXNnJywgZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgICAgIHZhciB2ID0gX2VuZ2luZS5fbXNnLmlubmVyVGV4dC5zcGxpdCgnXFxuJyk7XG4gICAgICAgICAgICBfZW5naW5lLl9tc2cuaW5uZXJUZXh0ID0gJyc7XG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHYubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICB2YXIgYSA9IFtdO1xuICAgICAgICAgICAgICAgIHRyeSB7IGEgPSBKU09OLnBhcnNlKHZbaV0pOyB9IGNhdGNoIChlKSB7IH1cbiAgICAgICAgICAgICAgICBpZiAoIWEubGVuZ3RoKSBjb250aW51ZTtcbiAgICAgICAgICAgICAgICBpZiAoYVswXSA9PT0gJ3JlZnJlc2gnKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChhWzFdLmlucykge1xuICAgICAgICAgICAgICAgICAgICAgICAgZm9yICh2YXIgaiA9IDA7IGkgPCBhWzFdLmluczsgaSsrKSBhWzFdLmluc1tqXS50eXBlID0gX2VuZ2luZS5fdHlwZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIF9lbmdpbmUuX2lucyA9IGFbMV0uaW5zO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGlmIChhWzFdLm91dHMpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvciAodmFyIGogPSAwOyBpIDwgYVsxXS5vdXRzOyBpKyspIGFbMV0ub3V0c1tqXS50eXBlID0gX2VuZ2luZS5fdHlwZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIF9lbmdpbmUuX291dHMgPSBhWzFdLm91dHM7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgX2p6ei5fcmVzdW1lKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2UgaWYgKGFbMF0gPT09ICd2ZXJzaW9uJykge1xuICAgICAgICAgICAgICAgICAgICB2YXIgcGx1Z2luID0gX2VuZ2luZS5fcG9vbFthWzFdXTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHBsdWdpbikge1xuICAgICAgICAgICAgICAgICAgICAgICAgcGx1Z2luLnJlYWR5ID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChwbHVnaW4uaW5wdXQpIHBsdWdpbi5pbnB1dC5fc3RhcnQoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChwbHVnaW4ub3V0cHV0KSBwbHVnaW4ub3V0cHV0Ll9zdGFydCgpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2UgaWYgKGFbMF0gPT09ICdvcGVub3V0Jykge1xuICAgICAgICAgICAgICAgICAgICB2YXIgaW1wbCA9IF9lbmdpbmUuX3Bvb2xbYVsxXV0ub3V0cHV0O1xuICAgICAgICAgICAgICAgICAgICBpZiAoaW1wbCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGFbMl0gPT0gaW1wbC5uYW1lKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaW1wbC5vcGVuID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoaW1wbC5jbGllbnRzKSBmb3IgKHZhciBpID0gMDsgaSA8IGltcGwuY2xpZW50cy5sZW5ndGg7IGkrKykgaW1wbC5jbGllbnRzW2ldLl9yZXN1bWUoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGVsc2UgaWYgKGltcGwuY2xpZW50cykgZm9yICh2YXIgaSA9IDA7IGkgPCBpbXBsLmNsaWVudHMubGVuZ3RoOyBpKyspIGltcGwuY2xpZW50c1tpXS5fY3Jhc2goKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIGlmIChhWzBdID09PSAnb3BlbmluJykge1xuICAgICAgICAgICAgICAgICAgICB2YXIgaW1wbCA9IF9lbmdpbmUuX3Bvb2xbYVsxXV0uaW5wdXQ7XG4gICAgICAgICAgICAgICAgICAgIGlmIChpbXBsKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoYVsyXSA9PSBpbXBsLm5hbWUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbXBsLm9wZW4gPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChpbXBsLmNsaWVudHMpIGZvciAodmFyIGkgPSAwOyBpIDwgaW1wbC5jbGllbnRzLmxlbmd0aDsgaSsrKSBpbXBsLmNsaWVudHNbaV0uX3Jlc3VtZSgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgZWxzZSBpZiAoaW1wbC5jbGllbnRzKSBmb3IgKHZhciBpID0gMDsgaSA8IGltcGwuY2xpZW50cy5sZW5ndGg7IGkrKykgaW1wbC5jbGllbnRzW2ldLl9jcmFzaCgpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2UgaWYgKGFbMF0gPT09ICdtaWRpJykge1xuICAgICAgICAgICAgICAgICAgICB2YXIgaW1wbCA9IF9lbmdpbmUuX3Bvb2xbYVsxXV0uaW5wdXQ7XG4gICAgICAgICAgICAgICAgICAgIGlmIChpbXBsICYmIGltcGwuY2xpZW50cykge1xuICAgICAgICAgICAgICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBpbXBsLmNsaWVudHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgbXNnID0gTUlESShhLnNsaWNlKDMpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbXBsLmNsaWVudHNbaV0uX2VtaXQobXNnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgdmFyIEpaWiA9IGZ1bmN0aW9uIChvcHQpIHtcbiAgICAgICAgaWYgKCFfanp6KSBfaW5pdEpaWihvcHQpO1xuICAgICAgICByZXR1cm4gX2p6ejtcbiAgICB9XG4gICAgSlpaLmluZm8gPSBmdW5jdGlvbiAoKSB7IHJldHVybiBfSi5wcm90b3R5cGUuaW5mbygpOyB9XG4gICAgSlpaLmNyZWF0ZU5ldyA9IGZ1bmN0aW9uIChhcmcpIHtcbiAgICAgICAgdmFyIG9iaiA9IG5ldyBfTSgpO1xuICAgICAgICBpZiAoYXJnIGluc3RhbmNlb2YgT2JqZWN0KSBmb3IgKHZhciBrIGluIGFyZykgaWYgKGFyZy5oYXNPd25Qcm9wZXJ0eShrKSkgb2JqW2tdID0gYXJnW2tdO1xuICAgICAgICBvYmouX3Jlc3VtZSgpO1xuICAgICAgICByZXR1cm4gb2JqO1xuICAgIH1cbiAgICBfSi5wcm90b3R5cGUuY3JlYXRlTmV3ID0gSlpaLmNyZWF0ZU5ldztcblxuICAgIC8vIEpaWi5TTVBURVxuXG4gICAgZnVuY3Rpb24gU01QVEUoKSB7XG4gICAgICAgIHZhciBzZWxmID0gdGhpcyBpbnN0YW5jZW9mIFNNUFRFID8gdGhpcyA6IHNlbGYgPSBuZXcgU01QVEUoKTtcbiAgICAgICAgU01QVEUucHJvdG90eXBlLnJlc2V0LmFwcGx5KHNlbGYsIGFyZ3VtZW50cyk7XG4gICAgICAgIHJldHVybiBzZWxmO1xuICAgIH1cbiAgICBTTVBURS5wcm90b3R5cGUucmVzZXQgPSBmdW5jdGlvbiAoYXJnKSB7XG4gICAgICAgIGlmIChhcmcgaW5zdGFuY2VvZiBTTVBURSkge1xuICAgICAgICAgICAgdGhpcy5zZXRUeXBlKGFyZy5nZXRUeXBlKCkpO1xuICAgICAgICAgICAgdGhpcy5zZXRIb3VyKGFyZy5nZXRIb3VyKCkpO1xuICAgICAgICAgICAgdGhpcy5zZXRNaW51dGUoYXJnLmdldE1pbnV0ZSgpKTtcbiAgICAgICAgICAgIHRoaXMuc2V0U2Vjb25kKGFyZy5nZXRTZWNvbmQoKSk7XG4gICAgICAgICAgICB0aGlzLnNldEZyYW1lKGFyZy5nZXRGcmFtZSgpKTtcbiAgICAgICAgICAgIHRoaXMuc2V0UXVhcnRlcihhcmcuZ2V0UXVhcnRlcigpKTtcbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICB9XG4gICAgICAgIHZhciBhcnIgPSBhcmcgaW5zdGFuY2VvZiBBcnJheSA/IGFyZyA6IGFyZ3VtZW50cztcbiAgICAgICAgdGhpcy5zZXRUeXBlKGFyclswXSk7XG4gICAgICAgIHRoaXMuc2V0SG91cihhcnJbMV0pO1xuICAgICAgICB0aGlzLnNldE1pbnV0ZShhcnJbMl0pO1xuICAgICAgICB0aGlzLnNldFNlY29uZChhcnJbM10pO1xuICAgICAgICB0aGlzLnNldEZyYW1lKGFycls0XSk7XG4gICAgICAgIHRoaXMuc2V0UXVhcnRlcihhcnJbNV0pO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG4gICAgZnVuY3Rpb24gX2ZpeERyb3BGcmFtZSgpIHsgaWYgKHRoaXMudHlwZSA9PSAyOS45NyAmJiAhdGhpcy5zZWNvbmQgJiYgdGhpcy5mcmFtZSA8IDIgJiYgdGhpcy5taW51dGUgJSAxMCkgdGhpcy5mcmFtZSA9IDI7IH1cbiAgICBTTVBURS5wcm90b3R5cGUuaXNGdWxsRnJhbWUgPSBmdW5jdGlvbiAoKSB7IHJldHVybiB0aGlzLnF1YXJ0ZXIgPT0gMCB8fCB0aGlzLnF1YXJ0ZXIgPT0gNDsgfVxuICAgIFNNUFRFLnByb3RvdHlwZS5nZXRUeXBlID0gZnVuY3Rpb24gKCkgeyByZXR1cm4gdGhpcy50eXBlOyB9XG4gICAgU01QVEUucHJvdG90eXBlLmdldEhvdXIgPSBmdW5jdGlvbiAoKSB7IHJldHVybiB0aGlzLmhvdXI7IH1cbiAgICBTTVBURS5wcm90b3R5cGUuZ2V0TWludXRlID0gZnVuY3Rpb24gKCkgeyByZXR1cm4gdGhpcy5taW51dGU7IH1cbiAgICBTTVBURS5wcm90b3R5cGUuZ2V0U2Vjb25kID0gZnVuY3Rpb24gKCkgeyByZXR1cm4gdGhpcy5zZWNvbmQ7IH1cbiAgICBTTVBURS5wcm90b3R5cGUuZ2V0RnJhbWUgPSBmdW5jdGlvbiAoKSB7IHJldHVybiB0aGlzLmZyYW1lOyB9XG4gICAgU01QVEUucHJvdG90eXBlLmdldFF1YXJ0ZXIgPSBmdW5jdGlvbiAoKSB7IHJldHVybiB0aGlzLnF1YXJ0ZXI7IH1cbiAgICBTTVBURS5wcm90b3R5cGUuc2V0VHlwZSA9IGZ1bmN0aW9uICh4KSB7XG4gICAgICAgIGlmICh0eXBlb2YgeCA9PSAndW5kZWZpbmVkJyB8fCB4ID09IDI0KSB0aGlzLnR5cGUgPSAyNDtcbiAgICAgICAgZWxzZSBpZiAoeCA9PSAyNSkgdGhpcy50eXBlID0gMjU7XG4gICAgICAgIGVsc2UgaWYgKHggPT0gMjkuOTcpIHsgdGhpcy50eXBlID0gMjkuOTc7IF9maXhEcm9wRnJhbWUuYXBwbHkodGhpcyk7IH1cbiAgICAgICAgZWxzZSBpZiAoeCA9PSAzMCkgdGhpcy50eXBlID0gMzA7XG4gICAgICAgIGVsc2UgdGhyb3cgUmFuZ2VFcnJvcignQmFkIFNNUFRFIGZyYW1lIHJhdGU6ICcgKyB4KTtcbiAgICAgICAgaWYgKHRoaXMuZnJhbWUgPj0gdGhpcy50eXBlKSB0aGlzLmZyYW1lID0gdGhpcy50eXBlID09IDI5Ljk3ID8gMjkgOiB0aGlzLnR5cGUgLSAxO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG4gICAgU01QVEUucHJvdG90eXBlLnNldEhvdXIgPSBmdW5jdGlvbiAoeCkge1xuICAgICAgICBpZiAodHlwZW9mIHggPT0gJ3VuZGVmaW5lZCcpIHggPSAwO1xuICAgICAgICBpZiAoeCAhPSBwYXJzZUludCh4KSB8fCB4IDwgMCB8fCB4ID49IDI0KSB0aHJvdyBSYW5nZUVycm9yKCdCYWQgU01QVEUgaG91cnMgdmFsdWU6ICcgKyB4KTtcbiAgICAgICAgdGhpcy5ob3VyID0geDtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuICAgIFNNUFRFLnByb3RvdHlwZS5zZXRNaW51dGUgPSBmdW5jdGlvbiAoeCkge1xuICAgICAgICBpZiAodHlwZW9mIHggPT0gJ3VuZGVmaW5lZCcpIHggPSAwO1xuICAgICAgICBpZiAoeCAhPSBwYXJzZUludCh4KSB8fCB4IDwgMCB8fCB4ID49IDYwKSB0aHJvdyBSYW5nZUVycm9yKCdCYWQgU01QVEUgbWludXRlcyB2YWx1ZTogJyArIHgpO1xuICAgICAgICB0aGlzLm1pbnV0ZSA9IHg7XG4gICAgICAgIF9maXhEcm9wRnJhbWUuYXBwbHkodGhpcyk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cbiAgICBTTVBURS5wcm90b3R5cGUuc2V0U2Vjb25kID0gZnVuY3Rpb24gKHgpIHtcbiAgICAgICAgaWYgKHR5cGVvZiB4ID09ICd1bmRlZmluZWQnKSB4ID0gMDtcbiAgICAgICAgaWYgKHggIT0gcGFyc2VJbnQoeCkgfHwgeCA8IDAgfHwgeCA+PSA2MCkgdGhyb3cgUmFuZ2VFcnJvcignQmFkIFNNUFRFIHNlY29uZHMgdmFsdWU6ICcgKyB4KTtcbiAgICAgICAgdGhpcy5zZWNvbmQgPSB4O1xuICAgICAgICBfZml4RHJvcEZyYW1lLmFwcGx5KHRoaXMpO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG4gICAgU01QVEUucHJvdG90eXBlLnNldEZyYW1lID0gZnVuY3Rpb24gKHgpIHtcbiAgICAgICAgaWYgKHR5cGVvZiB4ID09ICd1bmRlZmluZWQnKSB4ID0gMDtcbiAgICAgICAgaWYgKHggIT0gcGFyc2VJbnQoeCkgfHwgeCA8IDAgfHwgeCA+PSB0aGlzLnR5cGUpIHRocm93IFJhbmdlRXJyb3IoJ0JhZCBTTVBURSBmcmFtZSBudW1iZXI6ICcgKyB4KTtcbiAgICAgICAgdGhpcy5mcmFtZSA9IHg7XG4gICAgICAgIF9maXhEcm9wRnJhbWUuYXBwbHkodGhpcyk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cbiAgICBTTVBURS5wcm90b3R5cGUuc2V0UXVhcnRlciA9IGZ1bmN0aW9uICh4KSB7XG4gICAgICAgIGlmICh0eXBlb2YgeCA9PSAndW5kZWZpbmVkJykgeCA9IDA7XG4gICAgICAgIGlmICh4ICE9IHBhcnNlSW50KHgpIHx8IHggPCAwIHx8IHggPj0gOCkgdGhyb3cgUmFuZ2VFcnJvcignQmFkIFNNUFRFIHF1YXJ0ZXIgZnJhbWU6ICcgKyB4KTtcbiAgICAgICAgdGhpcy5xdWFydGVyID0geDtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuICAgIFNNUFRFLnByb3RvdHlwZS5pbmNyRnJhbWUgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHRoaXMuZnJhbWUrKztcbiAgICAgICAgaWYgKHRoaXMuZnJhbWUgPj0gdGhpcy50eXBlKSB7XG4gICAgICAgICAgICB0aGlzLmZyYW1lID0gMDtcbiAgICAgICAgICAgIHRoaXMuc2Vjb25kKys7XG4gICAgICAgICAgICBpZiAodGhpcy5zZWNvbmQgPj0gNjApIHtcbiAgICAgICAgICAgICAgICB0aGlzLnNlY29uZCA9IDA7XG4gICAgICAgICAgICAgICAgdGhpcy5taW51dGUrKztcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5taW51dGUgPj0gNjApIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5taW51dGUgPSAwO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmhvdXIgPSB0aGlzLmhvdXIgPj0gMjMgPyAwIDogdGhpcy5ob3VyICsgMTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgX2ZpeERyb3BGcmFtZS5hcHBseSh0aGlzKTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuICAgIFNNUFRFLnByb3RvdHlwZS5kZWNyRnJhbWUgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGlmICghdGhpcy5zZWNvbmQgJiYgdGhpcy5mcmFtZSA9PSAyICYmIHRoaXMudHlwZSA9PSAyOS45NyAmJiB0aGlzLm1pbnV0ZSAlIDEwKSB0aGlzLmZyYW1lID0gMDsgLy8gZHJvcC1mcmFtZVxuICAgICAgICB0aGlzLmZyYW1lLS07XG4gICAgICAgIGlmICh0aGlzLmZyYW1lIDwgMCkge1xuICAgICAgICAgICAgdGhpcy5mcmFtZSA9IHRoaXMudHlwZSA9PSAyOS45NyA/IDI5IDogdGhpcy50eXBlIC0gMTtcbiAgICAgICAgICAgIHRoaXMuc2Vjb25kLS07XG4gICAgICAgICAgICBpZiAodGhpcy5zZWNvbmQgPCAwKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5zZWNvbmQgPSA1OTtcbiAgICAgICAgICAgICAgICB0aGlzLm1pbnV0ZS0tO1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLm1pbnV0ZSA8IDApIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5taW51dGUgPSA1OTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5ob3VyID0gdGhpcy5ob3VyID8gdGhpcy5ob3VyIC0gMSA6IDIzO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG4gICAgU01QVEUucHJvdG90eXBlLmluY3JRRiA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdGhpcy5iYWNrd2FyZHMgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5xdWFydGVyID0gKHRoaXMucXVhcnRlciArIDEpICYgNztcbiAgICAgICAgaWYgKHRoaXMucXVhcnRlciA9PSAwIHx8IHRoaXMucXVhcnRlciA9PSA0KSB0aGlzLmluY3JGcmFtZSgpO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG4gICAgU01QVEUucHJvdG90eXBlLmRlY3JRRiA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdGhpcy5iYWNrd2FyZHMgPSB0cnVlO1xuICAgICAgICB0aGlzLnF1YXJ0ZXIgPSAodGhpcy5xdWFydGVyICsgNykgJiA3O1xuICAgICAgICBpZiAodGhpcy5xdWFydGVyID09IDMgfHwgdGhpcy5xdWFydGVyID09IDcpIHRoaXMuZGVjckZyYW1lKCk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cbiAgICBmdW5jdGlvbiBfODI1KGEpIHsgcmV0dXJuIFtbMjQsIDI1LCAyOS45NywgMzBdWyhhWzddID4+IDEpICYgM10sICgoYVs3XSAmIDEpIDw8IDQpIHwgYVs2XSwgKGFbNV0gPDwgNCkgfCBhWzRdLCAoYVszXSA8PCA0KSB8IGFbMl0sIChhWzFdIDw8IDQpIHwgYVswXV07IH1cbiAgICBTTVBURS5wcm90b3R5cGUucmVhZCA9IGZ1bmN0aW9uIChtKSB7XG4gICAgICAgIGlmICghKG0gaW5zdGFuY2VvZiBNSURJKSkgbSA9IE1JREkuYXBwbHkobnVsbCwgYXJndW1lbnRzKTtcbiAgICAgICAgaWYgKG1bMF0gPT0gMHhmMCAmJiBtWzFdID09IDB4N2YgJiYgbVszXSA9PSAxICYmIG1bNF0gPT0gMSAmJiBtWzldID09IDB4ZjcpIHtcbiAgICAgICAgICAgIHRoaXMudHlwZSA9IFsyNCwgMjUsIDI5Ljk3LCAzMF1bKG1bNV0gPj4gNSkgJiAzXTtcbiAgICAgICAgICAgIHRoaXMuaG91ciA9IG1bNV0gJiAzMTtcbiAgICAgICAgICAgIHRoaXMubWludXRlID0gbVs2XTtcbiAgICAgICAgICAgIHRoaXMuc2Vjb25kID0gbVs3XTtcbiAgICAgICAgICAgIHRoaXMuZnJhbWUgPSBtWzhdO1xuICAgICAgICAgICAgdGhpcy5xdWFydGVyID0gMDtcbiAgICAgICAgICAgIHRoaXMuXyA9IHVuZGVmaW5lZDtcbiAgICAgICAgICAgIHRoaXMuX2IgPSB1bmRlZmluZWQ7XG4gICAgICAgICAgICB0aGlzLl9mID0gdW5kZWZpbmVkO1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKG1bMF0gPT0gMHhmMSAmJiB0eXBlb2YgbVsxXSAhPSAndW5kZWZpbmVkJykge1xuICAgICAgICAgICAgdmFyIHEgPSBtWzFdID4+IDQ7XG4gICAgICAgICAgICB2YXIgbiA9IG1bMV0gJiAxNTtcbiAgICAgICAgICAgIGlmIChxID09IDApIHtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5fID09IDcpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMuX2YgPT0gNykge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5yZXNldChfODI1KHRoaXMuX2EpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuaW5jckZyYW1lKCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgdGhpcy5pbmNyRnJhbWUoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmIChxID09IDMpIHtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5fID09IDQpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5kZWNyRnJhbWUoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmIChxID09IDQpIHtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5fID09IDMpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5pbmNyRnJhbWUoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmIChxID09IDcpIHtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5fID09PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLl9iID09PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnJlc2V0KF84MjUodGhpcy5fYSkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5kZWNyRnJhbWUoKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB0aGlzLmRlY3JGcmFtZSgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICghdGhpcy5fYSkgdGhpcy5fYSA9IFtdO1xuICAgICAgICAgICAgdGhpcy5fYVtxXSA9IG47XG4gICAgICAgICAgICB0aGlzLl9mID0gdGhpcy5fZiA9PT0gcSAtIDEgfHwgcSA9PSAwID8gcSA6IHVuZGVmaW5lZDtcbiAgICAgICAgICAgIHRoaXMuX2IgPSB0aGlzLl9iID09PSBxICsgMSB8fCBxID09IDcgPyBxIDogdW5kZWZpbmVkO1xuICAgICAgICAgICAgdGhpcy5fID0gcTtcbiAgICAgICAgICAgIHRoaXMucXVhcnRlciA9IHE7XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIGZ1bmN0aW9uIF9tdGModCkge1xuICAgICAgICBpZiAoIXQuYmFja3dhcmRzICYmIHQucXVhcnRlciA+PSA0KSB0LmRlY3JGcmFtZSgpOyAvLyBjb250aW51ZSBlbmNvZGluZyBwcmV2aW91cyBmcmFtZVxuICAgICAgICBlbHNlIGlmICh0LmJhY2t3YXJkcyAmJiB0LnF1YXJ0ZXIgPCA0KSB0LmluY3JGcmFtZSgpO1xuICAgICAgICB2YXIgcmV0O1xuICAgICAgICBzd2l0Y2ggKHQucXVhcnRlciA+PiAxKSB7XG4gICAgICAgIGNhc2UgMDogcmV0ID0gdC5mcmFtZTsgYnJlYWs7XG4gICAgICAgIGNhc2UgMTogcmV0ID0gdC5zZWNvbmQ7IGJyZWFrO1xuICAgICAgICBjYXNlIDI6IHJldCA9IHQubWludXRlOyBicmVhaztcbiAgICAgICAgZGVmYXVsdDogcmV0ID0gdC5ob3VyO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0LnF1YXJ0ZXIgJiAxKSByZXQgPj49IDQ7XG4gICAgICAgIGVsc2UgcmV0ICY9IDE1O1xuICAgICAgICBpZiAodC5xdWFydGVyID09IDcpIHtcbiAgICAgICAgICAgIGlmICh0LnR5cGUgPT0gMjUpIHJldCB8PSAyO1xuICAgICAgICAgICAgZWxzZSBpZiAodC50eXBlID09IDI5Ljk3KSByZXQgfD0gNDtcbiAgICAgICAgICAgIGVsc2UgaWYgKHQudHlwZSA9PSAzMCkgcmV0IHw9IDY7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCF0LmJhY2t3YXJkcyAmJiB0LnF1YXJ0ZXIgPj0gNCkgdC5pbmNyRnJhbWUoKTtcbiAgICAgICAgZWxzZSBpZiAodC5iYWNrd2FyZHMgJiYgdC5xdWFydGVyIDwgNCkgdC5kZWNyRnJhbWUoKTtcbiAgICAgICAgcmV0dXJuIHJldCB8ICh0LnF1YXJ0ZXIgPDwgNCk7XG4gICAgfVxuICAgIGZ1bmN0aW9uIF9ocnR5cGUodCkge1xuICAgICAgICBpZiAodC50eXBlID09IDI1KSByZXR1cm4gdC5ob3VyIHwgMHgyMDtcbiAgICAgICAgaWYgKHQudHlwZSA9PSAyOS45NykgcmV0dXJuIHQuaG91ciB8IDB4NDA7XG4gICAgICAgIGlmICh0LnR5cGUgPT0gMzApIHJldHVybiB0LmhvdXIgfCAweDYwO1xuICAgICAgICByZXR1cm4gdC5ob3VyO1xuICAgIH1cbiAgICBmdW5jdGlvbiBfZGVjKHgpIHsgcmV0dXJuIHggPCAxMCA/ICcwJyArIHggOiB4OyB9XG4gICAgU01QVEUucHJvdG90eXBlLnRvU3RyaW5nID0gZnVuY3Rpb24gKCkgeyByZXR1cm4gW19kZWModGhpcy5ob3VyKSwgX2RlYyh0aGlzLm1pbnV0ZSksIF9kZWModGhpcy5zZWNvbmQpLCBfZGVjKHRoaXMuZnJhbWUpXS5qb2luKCc6Jyk7IH1cbiAgICBKWlouU01QVEUgPSBTTVBURTtcblxuICAgIC8vIEpaWi5NSURJXG5cbiAgICBmdW5jdGlvbiBNSURJKGFyZykge1xuICAgICAgICB2YXIgc2VsZiA9IHRoaXMgaW5zdGFuY2VvZiBNSURJID8gdGhpcyA6IHNlbGYgPSBuZXcgTUlESSgpO1xuICAgICAgICBzZWxmLl9mcm9tID0gYXJnIGluc3RhbmNlb2YgTUlESSA/IGFyZy5fZnJvbS5zbGljZSgpIDogW107XG4gICAgICAgIGlmICghYXJndW1lbnRzLmxlbmd0aCkgcmV0dXJuIHNlbGY7XG4gICAgICAgIHZhciBhcnIgPSBhcmcgaW5zdGFuY2VvZiBBcnJheSA/IGFyZyA6IGFyZ3VtZW50cztcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBhcnIubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIHZhciBuID0gYXJyW2ldO1xuICAgICAgICAgICAgaWYgKGkgPT0gMSAmJiBzZWxmWzBdID49IDB4ODAgJiYgc2VsZlswXSA8PSAweEFGKSBuID0gTUlESS5ub3RlVmFsdWUobik7XG4gICAgICAgICAgICBpZiAobiAhPSBwYXJzZUludChuKSB8fCBuIDwgMCB8fCBuID4gMjU1KSBfdGhyb3coYXJyW2ldKTtcbiAgICAgICAgICAgIHNlbGYucHVzaChuKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gc2VsZjtcbiAgICB9XG4gICAgTUlESS5wcm90b3R5cGUgPSBbXTtcbiAgICBNSURJLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IE1JREk7XG4gICAgdmFyIF9ub3RlTnVtID0ge307XG4gICAgTUlESS5ub3RlVmFsdWUgPSBmdW5jdGlvbiAoeCkgeyByZXR1cm4gX25vdGVOdW1beC50b1N0cmluZygpLnRvTG93ZXJDYXNlKCldOyB9XG5cbiAgICB2YXIgX25vdGVNYXAgPSB7IGM6IDAsIGQ6IDIsIGU6IDQsIGY6IDUsIGc6IDcsIGE6IDksIGI6IDExLCBoOiAxMSB9O1xuICAgIGZvciAodmFyIGsgaW4gX25vdGVNYXApIHtcbiAgICAgICAgaWYgKCFfbm90ZU1hcC5oYXNPd25Qcm9wZXJ0eShrKSkgY29udGludWU7XG4gICAgICAgIGZvciAodmFyIG4gPSAwOyBuIDwgMTI7IG4rKykge1xuICAgICAgICAgICAgdmFyIG0gPSBfbm90ZU1hcFtrXSArIG4gKiAxMjtcbiAgICAgICAgICAgIGlmIChtID4gMTI3KSBicmVhaztcbiAgICAgICAgICAgIF9ub3RlTnVtW2sgKyBuXSA9IG07XG4gICAgICAgICAgICBpZiAobSA+IDApIHsgX25vdGVOdW1bayArICdiJyArIG5dID0gbSAtIDE7IF9ub3RlTnVtW2sgKyAnYmInICsgbl0gPSBtIC0gMjsgfVxuICAgICAgICAgICAgaWYgKG0gPCAxMjcpIHsgX25vdGVOdW1bayArICcjJyArIG5dID0gbSArIDE7IF9ub3RlTnVtW2sgKyAnIyMnICsgbl0gPSBtICsgMjsgfVxuICAgICAgICB9XG4gICAgfVxuICAgIGZvciAodmFyIG4gPSAwOyBuIDwgMTI4OyBuKyspIF9ub3RlTnVtW25dID0gbjtcbiAgICBmdW5jdGlvbiBfdGhyb3coeCkgeyB0aHJvdyBSYW5nZUVycm9yKCdCYWQgTUlESSB2YWx1ZTogJyArIHgpOyB9XG4gICAgZnVuY3Rpb24gX2NoKG4pIHsgaWYgKG4gIT0gcGFyc2VJbnQobikgfHwgbiA8IDAgfHwgbiA+IDB4ZikgX3Rocm93KG4pOyByZXR1cm4gbjsgfVxuICAgIGZ1bmN0aW9uIF83YihuKSB7IGlmIChuICE9IHBhcnNlSW50KG4pIHx8IG4gPCAwIHx8IG4gPiAweDdmKSBfdGhyb3cobik7IHJldHVybiBuOyB9XG4gICAgZnVuY3Rpb24gX2xzYihuKSB7IGlmIChuICE9IHBhcnNlSW50KG4pIHx8IG4gPCAwIHx8IG4gPiAweDNmZmYpIF90aHJvdyhuKTsgcmV0dXJuIG4gJiAweDdmOyB9XG4gICAgZnVuY3Rpb24gX21zYihuKSB7IGlmIChuICE9IHBhcnNlSW50KG4pIHx8IG4gPCAwIHx8IG4gPiAweDNmZmYpIF90aHJvdyhuKTsgcmV0dXJuIG4gPj4gNzsgfVxuICAgIHZhciBfaGVscGVyID0ge1xuICAgICAgICBub3RlT2ZmOiBmdW5jdGlvbiAoYywgbikgeyByZXR1cm4gWzB4ODAgKyBfY2goYyksIF83YihNSURJLm5vdGVWYWx1ZShuKSksIDBdOyB9LFxuICAgICAgICBub3RlT246IGZ1bmN0aW9uIChjLCBuLCB2KSB7IHJldHVybiBbMHg5MCArIF9jaChjKSwgXzdiKE1JREkubm90ZVZhbHVlKG4pKSwgXzdiKHYpXTsgfSxcbiAgICAgICAgYWZ0ZXJ0b3VjaDogZnVuY3Rpb24gKGMsIG4sIHYpIHsgcmV0dXJuIFsweEEwICsgX2NoKGMpLCBfN2IoTUlESS5ub3RlVmFsdWUobikpLCBfN2IodildOyB9LFxuICAgICAgICBjb250cm9sOiBmdW5jdGlvbiAoYywgbiwgdikgeyByZXR1cm4gWzB4QjAgKyBfY2goYyksIF83YihuKSwgXzdiKHYpXTsgfSxcbiAgICAgICAgcHJvZ3JhbTogZnVuY3Rpb24gKGMsIG4pIHsgcmV0dXJuIFsweEMwICsgX2NoKGMpLCBfN2IobildOyB9LFxuICAgICAgICBwcmVzc3VyZTogZnVuY3Rpb24gKGMsIG4pIHsgcmV0dXJuIFsweEQwICsgX2NoKGMpLCBfN2IobildOyB9LFxuICAgICAgICBwaXRjaEJlbmQ6IGZ1bmN0aW9uIChjLCBuKSB7IHJldHVybiBbMHhFMCArIF9jaChjKSwgX2xzYihuKSwgX21zYihuKV07IH0sXG4gICAgICAgIGJhbmtNU0I6IGZ1bmN0aW9uIChjLCBuKSB7IHJldHVybiBbMHhCMCArIF9jaChjKSwgMHgwMCwgXzdiKG4pXTsgfSxcbiAgICAgICAgYmFua0xTQjogZnVuY3Rpb24gKGMsIG4pIHsgcmV0dXJuIFsweEIwICsgX2NoKGMpLCAweDIwLCBfN2IobildOyB9LFxuICAgICAgICBtb2RNU0I6IGZ1bmN0aW9uIChjLCBuKSB7IHJldHVybiBbMHhCMCArIF9jaChjKSwgMHgwMSwgXzdiKG4pXTsgfSxcbiAgICAgICAgbW9kTFNCOiBmdW5jdGlvbiAoYywgbikgeyByZXR1cm4gWzB4QjAgKyBfY2goYyksIDB4MjEsIF83YihuKV07IH0sXG4gICAgICAgIGJyZWF0aE1TQjogZnVuY3Rpb24gKGMsIG4pIHsgcmV0dXJuIFsweEIwICsgX2NoKGMpLCAweDAyLCBfN2IobildOyB9LFxuICAgICAgICBicmVhdGhMU0I6IGZ1bmN0aW9uIChjLCBuKSB7IHJldHVybiBbMHhCMCArIF9jaChjKSwgMHgyMiwgXzdiKG4pXTsgfSxcbiAgICAgICAgZm9vdE1TQjogZnVuY3Rpb24gKGMsIG4pIHsgcmV0dXJuIFsweEIwICsgX2NoKGMpLCAweDA0LCBfN2IobildOyB9LFxuICAgICAgICBmb290TFNCOiBmdW5jdGlvbiAoYywgbikgeyByZXR1cm4gWzB4QjAgKyBfY2goYyksIDB4MjQsIF83YihuKV07IH0sXG4gICAgICAgIHBvcnRhbWVudG9NU0I6IGZ1bmN0aW9uIChjLCBuKSB7IHJldHVybiBbMHhCMCArIF9jaChjKSwgMHgwNSwgXzdiKG4pXTsgfSxcbiAgICAgICAgcG9ydGFtZW50b0xTQjogZnVuY3Rpb24gKGMsIG4pIHsgcmV0dXJuIFsweEIwICsgX2NoKGMpLCAweDI1LCBfN2IobildOyB9LFxuICAgICAgICB2b2x1bWVNU0I6IGZ1bmN0aW9uIChjLCBuKSB7IHJldHVybiBbMHhCMCArIF9jaChjKSwgMHgwNywgXzdiKG4pXTsgfSxcbiAgICAgICAgdm9sdW1lTFNCOiBmdW5jdGlvbiAoYywgbikgeyByZXR1cm4gWzB4QjAgKyBfY2goYyksIDB4MjcsIF83YihuKV07IH0sXG4gICAgICAgIGJhbGFuY2VNU0I6IGZ1bmN0aW9uIChjLCBuKSB7IHJldHVybiBbMHhCMCArIF9jaChjKSwgMHgwOCwgXzdiKG4pXTsgfSxcbiAgICAgICAgYmFsYW5jZUxTQjogZnVuY3Rpb24gKGMsIG4pIHsgcmV0dXJuIFsweEIwICsgX2NoKGMpLCAweDI4LCBfN2IobildOyB9LFxuICAgICAgICBwYW5NU0I6IGZ1bmN0aW9uIChjLCBuKSB7IHJldHVybiBbMHhCMCArIF9jaChjKSwgMHgwQSwgXzdiKG4pXTsgfSxcbiAgICAgICAgcGFuTFNCOiBmdW5jdGlvbiAoYywgbikgeyByZXR1cm4gWzB4QjAgKyBfY2goYyksIDB4MkEsIF83YihuKV07IH0sXG4gICAgICAgIGV4cHJlc3Npb25NU0I6IGZ1bmN0aW9uIChjLCBuKSB7IHJldHVybiBbMHhCMCArIF9jaChjKSwgMHgwQiwgXzdiKG4pXTsgfSxcbiAgICAgICAgZXhwcmVzc2lvbkxTQjogZnVuY3Rpb24gKGMsIG4pIHsgcmV0dXJuIFsweEIwICsgX2NoKGMpLCAweDJCLCBfN2IobildOyB9LFxuICAgICAgICBkYW1wZXI6IGZ1bmN0aW9uIChjLCBiKSB7IHJldHVybiBbMHhCMCArIF9jaChjKSwgMHg0MCwgYiA/IDEyNyA6IDBdOyB9LFxuICAgICAgICBwb3J0YW1lbnRvOiBmdW5jdGlvbiAoYywgYikgeyByZXR1cm4gWzB4QjAgKyBfY2goYyksIDB4NDEsIGIgPyAxMjcgOiAwXTsgfSxcbiAgICAgICAgc29zdGVudXRvOiBmdW5jdGlvbiAoYywgYikgeyByZXR1cm4gWzB4QjAgKyBfY2goYyksIDB4NDIsIGIgPyAxMjcgOiAwXTsgfSxcbiAgICAgICAgc29mdDogZnVuY3Rpb24gKGMsIGIpIHsgcmV0dXJuIFsweEIwICsgX2NoKGMpLCAweDQzLCBiID8gMTI3IDogMF07IH0sXG4gICAgICAgIGFsbFNvdW5kT2ZmOiBmdW5jdGlvbiAoYykgeyByZXR1cm4gWzB4QjAgKyBfY2goYyksIDB4NzgsIDBdOyB9LFxuICAgICAgICBhbGxOb3Rlc09mZjogZnVuY3Rpb24gKGMpIHsgcmV0dXJuIFsweEIwICsgX2NoKGMpLCAweDdiLCAwXTsgfSxcbiAgICAgICAgbXRjOiBmdW5jdGlvbiAodCkgeyByZXR1cm4gWzB4RjEsIF9tdGModCldOyB9LFxuICAgICAgICBzb25nUG9zaXRpb246IGZ1bmN0aW9uIChuKSB7IHJldHVybiBbMHhGMiwgX2xzYihuKSwgX21zYihuKV07IH0sXG4gICAgICAgIHNvbmdTZWxlY3Q6IGZ1bmN0aW9uIChuKSB7IHJldHVybiBbMHhGMywgXzdiKG4pXTsgfSxcbiAgICAgICAgdHVuZTogZnVuY3Rpb24gKCkgeyByZXR1cm4gWzB4RjZdOyB9LFxuICAgICAgICBjbG9jazogZnVuY3Rpb24gKCkgeyByZXR1cm4gWzB4RjhdOyB9LFxuICAgICAgICBzdGFydDogZnVuY3Rpb24gKCkgeyByZXR1cm4gWzB4RkFdOyB9LFxuICAgICAgICBjb250aW51ZTogZnVuY3Rpb24gKCkgeyByZXR1cm4gWzB4RkJdOyB9LFxuICAgICAgICBzdG9wOiBmdW5jdGlvbiAoKSB7IHJldHVybiBbMHhGQ107IH0sXG4gICAgICAgIGFjdGl2ZTogZnVuY3Rpb24gKCkgeyByZXR1cm4gWzB4RkVdOyB9LFxuICAgICAgICBzeElkUmVxdWVzdDogZnVuY3Rpb24gKCkgeyByZXR1cm4gWzB4RjAsIDB4N0UsIDB4N0YsIDB4MDYsIDB4MDEsIDB4RjddOyB9LFxuICAgICAgICBzeEZ1bGxGcmFtZTogZnVuY3Rpb24gKHQpIHsgcmV0dXJuIFsweEYwLCAweDdGLCAweDdGLCAweDAxLCAweDAxLCBfaHJ0eXBlKHQpLCB0LmdldE1pbnV0ZSgpLCB0LmdldFNlY29uZCgpLCB0LmdldEZyYW1lKCksIDB4RjddOyB9LFxuICAgICAgICByZXNldDogZnVuY3Rpb24gKCkgeyByZXR1cm4gWzB4RkZdOyB9XG4gICAgfTtcbiAgICBmdW5jdGlvbiBfY29weUhlbHBlcihuYW1lLCBmdW5jKSB7XG4gICAgICAgIE1JRElbbmFtZV0gPSBmdW5jdGlvbiAoKSB7IHJldHVybiBuZXcgTUlESShmdW5jLmFwcGx5KDAsIGFyZ3VtZW50cykpOyB9O1xuICAgICAgICBfTS5wcm90b3R5cGVbbmFtZV0gPSBmdW5jdGlvbiAoKSB7IHRoaXMuc2VuZChmdW5jLmFwcGx5KDAsIGFyZ3VtZW50cykpOyByZXR1cm4gdGhpczsgfTtcbiAgICB9XG4gICAgZm9yICh2YXIgayBpbiBfaGVscGVyKSBpZiAoX2hlbHBlci5oYXNPd25Qcm9wZXJ0eShrKSkgX2NvcHlIZWxwZXIoaywgX2hlbHBlcltrXSk7XG5cbiAgICB2YXIgX2NoYW5uZWxNYXAgPSB7IGE6IDEwLCBiOiAxMSwgYzogMTIsIGQ6IDEzLCBlOiAxNCwgZjogMTUsIEE6IDEwLCBCOiAxMSwgQzogMTIsIEQ6IDEzLCBFOiAxNCwgRjogMTUgfTtcbiAgICBmb3IgKHZhciBrID0gMDsgayA8IDE2OyBrKyspIF9jaGFubmVsTWFwW2tdID0gaztcbiAgICBNSURJLnByb3RvdHlwZS5nZXRDaGFubmVsID0gZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgYyA9IHRoaXNbMF07XG4gICAgICAgIGlmICh0eXBlb2YgYyA9PSAndW5kZWZpbmVkJyB8fCBjIDwgMHg4MCB8fCBjID4gMHhlZikgcmV0dXJuO1xuICAgICAgICByZXR1cm4gYyAmIDE1O1xuICAgIH1cbiAgICBNSURJLnByb3RvdHlwZS5zZXRDaGFubmVsID0gZnVuY3Rpb24gKHgpIHtcbiAgICAgICAgdmFyIGMgPSB0aGlzWzBdO1xuICAgICAgICBpZiAodHlwZW9mIGMgPT0gJ3VuZGVmaW5lZCcgfHwgYyA8IDB4ODAgfHwgYyA+IDB4ZWYpIHJldHVybiB0aGlzO1xuICAgICAgICB4ID0gX2NoYW5uZWxNYXBbeF07XG4gICAgICAgIGlmICh0eXBlb2YgeCAhPSAndW5kZWZpbmVkJykgdGhpc1swXSA9IChjICYgMHhmMCkgfCB4O1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG4gICAgTUlESS5wcm90b3R5cGUuZ2V0Tm90ZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmFyIGMgPSB0aGlzWzBdO1xuICAgICAgICBpZiAodHlwZW9mIGMgPT0gJ3VuZGVmaW5lZCcgfHwgYyA8IDB4ODAgfHwgYyA+IDB4YWYpIHJldHVybjtcbiAgICAgICAgcmV0dXJuIHRoaXNbMV07XG4gICAgfVxuICAgIE1JREkucHJvdG90eXBlLnNldE5vdGUgPSBmdW5jdGlvbiAoeCkge1xuICAgICAgICB2YXIgYyA9IHRoaXNbMF07XG4gICAgICAgIGlmICh0eXBlb2YgYyA9PSAndW5kZWZpbmVkJyB8fCBjIDwgMHg4MCB8fCBjID4gMHhhZikgcmV0dXJuIHRoaXM7XG4gICAgICAgIHggPSBNSURJLm5vdGVWYWx1ZSh4KTtcbiAgICAgICAgaWYgKHR5cGVvZiB4ICE9ICd1bmRlZmluZWQnKSB0aGlzWzFdID0geDtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuICAgIE1JREkucHJvdG90eXBlLmdldFZlbG9jaXR5ID0gZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgYyA9IHRoaXNbMF07XG4gICAgICAgIGlmICh0eXBlb2YgYyA9PSAndW5kZWZpbmVkJyB8fCBjIDwgMHg5MCB8fCBjID4gMHg5ZikgcmV0dXJuO1xuICAgICAgICByZXR1cm4gdGhpc1syXTtcbiAgICB9XG4gICAgTUlESS5wcm90b3R5cGUuc2V0VmVsb2NpdHkgPSBmdW5jdGlvbiAoeCkge1xuICAgICAgICB2YXIgYyA9IHRoaXNbMF07XG4gICAgICAgIGlmICh0eXBlb2YgYyA9PSAndW5kZWZpbmVkJyB8fCBjIDwgMHg5MCB8fCBjID4gMHg5ZikgcmV0dXJuIHRoaXM7XG4gICAgICAgIHggPSBwYXJzZUludCh4KTtcbiAgICAgICAgaWYgKHggPj0gMCAmJiB4IDwgMTI4KSB0aGlzWzJdID0geDtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuICAgIE1JREkucHJvdG90eXBlLmdldFN5c0V4Q2hhbm5lbCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgaWYgKHRoaXNbMF0gPT0gMHhmMCkgcmV0dXJuIHRoaXNbMl07XG4gICAgfVxuICAgIE1JREkucHJvdG90eXBlLnNldFN5c0V4Q2hhbm5lbCA9IGZ1bmN0aW9uICh4KSB7XG4gICAgICAgIGlmICh0aGlzWzBdID09IDB4ZjAgJiYgdGhpcy5sZW5ndGggPiAyKSB7XG4gICAgICAgICAgICB4ID0gcGFyc2VJbnQoeCk7XG4gICAgICAgICAgICBpZiAoeCA+PSAwICYmIHggPCAxMjgpIHRoaXNbMl0gPSB4O1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cbiAgICBNSURJLnByb3RvdHlwZS5pc05vdGVPbiA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmFyIGMgPSB0aGlzWzBdO1xuICAgICAgICBpZiAodHlwZW9mIGMgPT0gJ3VuZGVmaW5lZCcgfHwgYyA8IDB4OTAgfHwgYyA+IDB4OWYpIHJldHVybiBmYWxzZTtcbiAgICAgICAgcmV0dXJuIHRoaXNbMl0gPiAwID8gdHJ1ZSA6IGZhbHNlO1xuICAgIH1cbiAgICBNSURJLnByb3RvdHlwZS5pc05vdGVPZmYgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciBjID0gdGhpc1swXTtcbiAgICAgICAgaWYgKHR5cGVvZiBjID09ICd1bmRlZmluZWQnIHx8IGMgPCAweDgwIHx8IGMgPiAweDlmKSByZXR1cm4gZmFsc2U7XG4gICAgICAgIGlmIChjIDwgMHg5MCkgcmV0dXJuIHRydWU7XG4gICAgICAgIHJldHVybiB0aGlzWzJdID09IDAgPyB0cnVlIDogZmFsc2U7XG4gICAgfVxuICAgIE1JREkucHJvdG90eXBlLmlzU3lzRXggPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiB0aGlzWzBdID09IDB4ZjA7XG4gICAgfVxuICAgIE1JREkucHJvdG90eXBlLmlzRnVsbFN5c0V4ID0gZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gdGhpc1swXSA9PSAweGYwICYmIHRoaXNbdGhpcy5sZW5ndGggLSAxXSA9PSAweGY3O1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIF9oZXgoeCkge1xuICAgICAgICB2YXIgYSA9IFtdO1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHgubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGFbaV0gPSAoeFtpXSA8IDE2ID8gJzAnIDogJycpICsgeFtpXS50b1N0cmluZygxNik7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGEuam9pbignICcpO1xuICAgIH1cbiAgICBNSURJLnByb3RvdHlwZS50b1N0cmluZyA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgaWYgKCF0aGlzLmxlbmd0aCkgcmV0dXJuICdlbXB0eSc7XG4gICAgICAgIHZhciBzID0gX2hleCh0aGlzKTtcbiAgICAgICAgaWYgKHRoaXNbMF0gPCAweDgwKSByZXR1cm4gcztcbiAgICAgICAgdmFyIHNzID0ge1xuICAgICAgICAgICAgMjQxOiAnTUlESSBUaW1lIENvZGUnLFxuICAgICAgICAgICAgMjQyOiAnU29uZyBQb3NpdGlvbicsXG4gICAgICAgICAgICAyNDM6ICdTb25nIFNlbGVjdCcsXG4gICAgICAgICAgICAyNDQ6ICdVbmRlZmluZWQnLFxuICAgICAgICAgICAgMjQ1OiAnVW5kZWZpbmVkJyxcbiAgICAgICAgICAgIDI0NjogJ1R1bmUgcmVxdWVzdCcsXG4gICAgICAgICAgICAyNDg6ICdUaW1pbmcgY2xvY2snLFxuICAgICAgICAgICAgMjQ5OiAnVW5kZWZpbmVkJyxcbiAgICAgICAgICAgIDI1MDogJ1N0YXJ0JyxcbiAgICAgICAgICAgIDI1MTogJ0NvbnRpbnVlJyxcbiAgICAgICAgICAgIDI1MjogJ1N0b3AnLFxuICAgICAgICAgICAgMjUzOiAnVW5kZWZpbmVkJyxcbiAgICAgICAgICAgIDI1NDogJ0FjdGl2ZSBTZW5zaW5nJyxcbiAgICAgICAgICAgIDI1NTogJ1Jlc2V0J1xuICAgICAgICB9W3RoaXNbMF1dO1xuICAgICAgICBpZiAoc3MpIHJldHVybiBzICsgJyAtLSAnICsgc3M7XG4gICAgICAgIHZhciBjID0gdGhpc1swXSA+PiA0O1xuICAgICAgICBzcyA9IHsgODogJ05vdGUgT2ZmJywgMTA6ICdBZnRlcnRvdWNoJywgMTI6ICdQcm9ncmFtIENoYW5nZScsIDEzOiAnQ2hhbm5lbCBBZnRlcnRvdWNoJywgMTQ6ICdQaXRjaCBXaGVlbCcgfVtjXTtcbiAgICAgICAgaWYgKHNzKSByZXR1cm4gcyArICcgLS0gJyArIHNzO1xuICAgICAgICBpZiAoYyA9PSA5KSByZXR1cm4gcyArICcgLS0gJyArICh0aGlzWzJdID8gJ05vdGUgT24nIDogJ05vdGUgT2ZmJyk7XG4gICAgICAgIGlmIChjICE9IDExKSByZXR1cm4gcztcbiAgICAgICAgc3MgPSB7XG4gICAgICAgICAgICAwOiAnQmFuayBTZWxlY3QgTVNCJyxcbiAgICAgICAgICAgIDE6ICdNb2R1bGF0aW9uIFdoZWVsIE1TQicsXG4gICAgICAgICAgICAyOiAnQnJlYXRoIENvbnRyb2xsZXIgTVNCJyxcbiAgICAgICAgICAgIDQ6ICdGb290IENvbnRyb2xsZXIgTVNCJyxcbiAgICAgICAgICAgIDU6ICdQb3J0YW1lbnRvIFRpbWUgTVNCJyxcbiAgICAgICAgICAgIDY6ICdEYXRhIEVudHJ5IE1TQicsXG4gICAgICAgICAgICA3OiAnQ2hhbm5lbCBWb2x1bWUgTVNCJyxcbiAgICAgICAgICAgIDg6ICdCYWxhbmNlIE1TQicsXG4gICAgICAgICAgICAxMDogJ1BhbiBNU0InLFxuICAgICAgICAgICAgMTE6ICdFeHByZXNzaW9uIENvbnRyb2xsZXIgTVNCJyxcbiAgICAgICAgICAgIDEyOiAnRWZmZWN0IENvbnRyb2wgMSBNU0InLFxuICAgICAgICAgICAgMTM6ICdFZmZlY3QgQ29udHJvbCAyIE1TQicsXG4gICAgICAgICAgICAxNjogJ0dlbmVyYWwgUHVycG9zZSBDb250cm9sbGVyIDEgTVNCJyxcbiAgICAgICAgICAgIDE3OiAnR2VuZXJhbCBQdXJwb3NlIENvbnRyb2xsZXIgMiBNU0InLFxuICAgICAgICAgICAgMTg6ICdHZW5lcmFsIFB1cnBvc2UgQ29udHJvbGxlciAzIE1TQicsXG4gICAgICAgICAgICAxOTogJ0dlbmVyYWwgUHVycG9zZSBDb250cm9sbGVyIDQgTVNCJyxcbiAgICAgICAgICAgIDMyOiAnQmFuayBTZWxlY3QgTFNCJyxcbiAgICAgICAgICAgIDMzOiAnTW9kdWxhdGlvbiBXaGVlbCBMU0InLFxuICAgICAgICAgICAgMzQ6ICdCcmVhdGggQ29udHJvbGxlciBMU0InLFxuICAgICAgICAgICAgMzY6ICdGb290IENvbnRyb2xsZXIgTFNCJyxcbiAgICAgICAgICAgIDM3OiAnUG9ydGFtZW50byBUaW1lIExTQicsXG4gICAgICAgICAgICAzODogJ0RhdGEgRW50cnkgTFNCJyxcbiAgICAgICAgICAgIDM5OiAnQ2hhbm5lbCBWb2x1bWUgTFNCJyxcbiAgICAgICAgICAgIDQwOiAnQmFsYW5jZSBMU0InLFxuICAgICAgICAgICAgNDI6ICdQYW4gTFNCJyxcbiAgICAgICAgICAgIDQzOiAnRXhwcmVzc2lvbiBDb250cm9sbGVyIExTQicsXG4gICAgICAgICAgICA0NDogJ0VmZmVjdCBjb250cm9sIDEgTFNCJyxcbiAgICAgICAgICAgIDQ1OiAnRWZmZWN0IGNvbnRyb2wgMiBMU0InLFxuICAgICAgICAgICAgNDg6ICdHZW5lcmFsIFB1cnBvc2UgQ29udHJvbGxlciAxIExTQicsXG4gICAgICAgICAgICA0OTogJ0dlbmVyYWwgUHVycG9zZSBDb250cm9sbGVyIDIgTFNCJyxcbiAgICAgICAgICAgIDUwOiAnR2VuZXJhbCBQdXJwb3NlIENvbnRyb2xsZXIgMyBMU0InLFxuICAgICAgICAgICAgNTE6ICdHZW5lcmFsIFB1cnBvc2UgQ29udHJvbGxlciA0IExTQicsXG4gICAgICAgICAgICA2NDogJ0RhbXBlciBQZWRhbCBPbi9PZmYnLFxuICAgICAgICAgICAgNjU6ICdQb3J0YW1lbnRvIE9uL09mZicsXG4gICAgICAgICAgICA2NjogJ1Nvc3RlbnV0byBPbi9PZmYnLFxuICAgICAgICAgICAgNjc6ICdTb2Z0IFBlZGFsIE9uL09mZicsXG4gICAgICAgICAgICA2ODogJ0xlZ2F0byBGb290c3dpdGNoJyxcbiAgICAgICAgICAgIDY5OiAnSG9sZCAyJyxcbiAgICAgICAgICAgIDcwOiAnU291bmQgQ29udHJvbGxlciAxJyxcbiAgICAgICAgICAgIDcxOiAnU291bmQgQ29udHJvbGxlciAyJyxcbiAgICAgICAgICAgIDcyOiAnU291bmQgQ29udHJvbGxlciAzJyxcbiAgICAgICAgICAgIDczOiAnU291bmQgQ29udHJvbGxlciA0JyxcbiAgICAgICAgICAgIDc0OiAnU291bmQgQ29udHJvbGxlciA1JyxcbiAgICAgICAgICAgIDc1OiAnU291bmQgQ29udHJvbGxlciA2JyxcbiAgICAgICAgICAgIDc2OiAnU291bmQgQ29udHJvbGxlciA3JyxcbiAgICAgICAgICAgIDc3OiAnU291bmQgQ29udHJvbGxlciA4JyxcbiAgICAgICAgICAgIDc4OiAnU291bmQgQ29udHJvbGxlciA5JyxcbiAgICAgICAgICAgIDc5OiAnU291bmQgQ29udHJvbGxlciAxMCcsXG4gICAgICAgICAgICA4MDogJ0dlbmVyYWwgUHVycG9zZSBDb250cm9sbGVyIDUnLFxuICAgICAgICAgICAgODE6ICdHZW5lcmFsIFB1cnBvc2UgQ29udHJvbGxlciA2JyxcbiAgICAgICAgICAgIDgyOiAnR2VuZXJhbCBQdXJwb3NlIENvbnRyb2xsZXIgNycsXG4gICAgICAgICAgICA4MzogJ0dlbmVyYWwgUHVycG9zZSBDb250cm9sbGVyIDgnLFxuICAgICAgICAgICAgODQ6ICdQb3J0YW1lbnRvIENvbnRyb2wnLFxuICAgICAgICAgICAgODg6ICdIaWdoIFJlc29sdXRpb24gVmVsb2NpdHkgUHJlZml4JyxcbiAgICAgICAgICAgIDkxOiAnRWZmZWN0cyAxIERlcHRoJyxcbiAgICAgICAgICAgIDkyOiAnRWZmZWN0cyAyIERlcHRoJyxcbiAgICAgICAgICAgIDkzOiAnRWZmZWN0cyAzIERlcHRoJyxcbiAgICAgICAgICAgIDk0OiAnRWZmZWN0cyA0IERlcHRoJyxcbiAgICAgICAgICAgIDk1OiAnRWZmZWN0cyA1IERlcHRoJyxcbiAgICAgICAgICAgIDk2OiAnRGF0YSBJbmNyZW1lbnQnLFxuICAgICAgICAgICAgOTc6ICdEYXRhIERlY3JlbWVudCcsXG4gICAgICAgICAgICA5ODogJ05vbi1SZWdpc3RlcmVkIFBhcmFtZXRlciBOdW1iZXIgTFNCJyxcbiAgICAgICAgICAgIDk5OiAnTm9uLVJlZ2lzdGVyZWQgUGFyYW1ldGVyIE51bWJlciBNU0InLFxuICAgICAgICAgICAgMTAwOiAnUmVnaXN0ZXJlZCBQYXJhbWV0ZXIgTnVtYmVyIExTQicsXG4gICAgICAgICAgICAxMDE6ICdSZWdpc3RlcmVkIFBhcmFtZXRlciBOdW1iZXIgTVNCJyxcbiAgICAgICAgICAgIDEyMDogJ0FsbCBTb3VuZCBPZmYnLFxuICAgICAgICAgICAgMTIxOiAnUmVzZXQgQWxsIENvbnRyb2xsZXJzJyxcbiAgICAgICAgICAgIDEyMjogJ0xvY2FsIENvbnRyb2wgT24vT2ZmJyxcbiAgICAgICAgICAgIDEyMzogJ0FsbCBOb3RlcyBPZmYnLFxuICAgICAgICAgICAgMTI0OiAnT21uaSBNb2RlIE9mZicsXG4gICAgICAgICAgICAxMjU6ICdPbW5pIE1vZGUgT24nLFxuICAgICAgICAgICAgMTI2OiAnTW9ubyBNb2RlIE9uJyxcbiAgICAgICAgICAgIDEyNzogJ1BvbHkgTW9kZSBPbidcbiAgICAgICAgfVt0aGlzWzFdXTtcbiAgICAgICAgaWYgKCFzcykgc3MgPSAnVW5kZWZpbmVkJztcbiAgICAgICAgcmV0dXJuIHMgKyAnIC0tICcgKyBzcztcbiAgICB9XG4gICAgTUlESS5wcm90b3R5cGUuX3N0YW1wID0gZnVuY3Rpb24gKG9iaikgeyB0aGlzLl9mcm9tLnB1c2gob2JqLl9vcmlnID8gb2JqLl9vcmlnIDogb2JqKTsgcmV0dXJuIHRoaXM7IH1cbiAgICBNSURJLnByb3RvdHlwZS5fdW5zdGFtcCA9IGZ1bmN0aW9uIChvYmopIHtcbiAgICAgICAgaWYgKHR5cGVvZiBvYmogPT0gJ3VuZGVmaW5lZCcpIHRoaXMuX2Zyb20gPSBbXTtcbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBpZiAob2JqLl9vcmlnKSBvYmogPSBvYmouX29yaWc7XG4gICAgICAgICAgICB2YXIgaSA9IHRoaXMuX2Zyb20uaW5kZXhPZihvYmopO1xuICAgICAgICAgICAgaWYgKGkgPiAtMSkgdGhpcy5fZnJvbS5zcGxpY2UoaSwgMSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuICAgIE1JREkucHJvdG90eXBlLl9zdGFtcGVkID0gZnVuY3Rpb24gKG9iaikge1xuICAgICAgICBpZiAob2JqLl9vcmlnKSBvYmogPSBvYmouX29yaWc7XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5fZnJvbS5sZW5ndGg7IGkrKykgaWYgKHRoaXMuX2Zyb21baV0gPT0gb2JqKSByZXR1cm4gdHJ1ZTtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIEpaWi5NSURJID0gTUlESTtcblxuICAgIEpaWi5saWIgPSB7fTtcbiAgICBKWloubGliLm9wZW5NaWRpT3V0ID0gZnVuY3Rpb24gKG5hbWUsIGVuZ2luZSkge1xuICAgICAgICB2YXIgcG9ydCA9IG5ldyBfTSgpO1xuICAgICAgICBlbmdpbmUuX29wZW5PdXQocG9ydCwgbmFtZSk7XG4gICAgICAgIHJldHVybiBwb3J0O1xuICAgIH1cbiAgICBKWloubGliLm9wZW5NaWRpSW4gPSBmdW5jdGlvbiAobmFtZSwgZW5naW5lKSB7XG4gICAgICAgIHZhciBwb3J0ID0gbmV3IF9NKCk7XG4gICAgICAgIGVuZ2luZS5fb3BlbkluKHBvcnQsIG5hbWUpO1xuICAgICAgICByZXR1cm4gcG9ydDtcbiAgICB9XG4gICAgSlpaLmxpYi5yZWdpc3Rlck1pZGlPdXQgPSBmdW5jdGlvbiAobmFtZSwgZW5naW5lKSB7XG4gICAgICAgIHZhciB4ID0gZW5naW5lLl9pbmZvKG5hbWUpO1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IF92aXJ0dWFsLl9vdXRzLmxlbmd0aDsgaSsrKSBpZiAoX3ZpcnR1YWwuX291dHNbaV0ubmFtZSA9PSB4Lm5hbWUpIHJldHVybiBmYWxzZTtcbiAgICAgICAgeC5lbmdpbmUgPSBlbmdpbmU7XG4gICAgICAgIF92aXJ0dWFsLl9vdXRzLnB1c2goeCk7XG4gICAgICAgIGlmIChfanp6ICYmIF9qenouX2JhZCkgeyBfanp6Ll9yZXBhaXIoKTsgX2p6ei5fcmVzdW1lKCk7IH1cbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICAgIEpaWi5saWIucmVnaXN0ZXJNaWRpSW4gPSBmdW5jdGlvbiAobmFtZSwgZW5naW5lKSB7XG4gICAgICAgIHZhciB4ID0gZW5naW5lLl9pbmZvKG5hbWUpO1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IF92aXJ0dWFsLl9pbnMubGVuZ3RoOyBpKyspIGlmIChfdmlydHVhbC5faW5zW2ldLm5hbWUgPT0geC5uYW1lKSByZXR1cm4gZmFsc2U7XG4gICAgICAgIHguZW5naW5lID0gZW5naW5lO1xuICAgICAgICBfdmlydHVhbC5faW5zLnB1c2goeCk7XG4gICAgICAgIGlmIChfanp6ICYmIF9qenouX2JhZCkgeyBfanp6Ll9yZXBhaXIoKTsgX2p6ei5fcmVzdW1lKCk7IH1cbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICAgIHZhciBfYWM7XG4gICAgSlpaLmxpYi5nZXRBdWRpb0NvbnRleHQgPSBmdW5jdGlvbiAoKSB7IHJldHVybiBfYWM7IH1cbiAgICBpZiAod2luZG93KSB7XG4gICAgICAgIHZhciBBdWRpb0NvbnRleHQgPSB3aW5kb3cuQXVkaW9Db250ZXh0IHx8IHdpbmRvdy53ZWJraXRBdWRpb0NvbnRleHQ7XG4gICAgICAgIGlmIChBdWRpb0NvbnRleHQpIF9hYyA9IG5ldyBBdWRpb0NvbnRleHQoKTtcbiAgICAgICAgaWYgKF9hYyAmJiAhX2FjLmNyZWF0ZUdhaW4pIF9hYy5jcmVhdGVHYWluID0gX2FjLmNyZWF0ZUdhaW5Ob2RlO1xuICAgICAgICBmdW5jdGlvbiBfYWN0aXZhdGVBdWRpb0NvbnRleHQoKSB7XG4gICAgICAgICAgICBpZiAoX2FjLnN0YXRlICE9ICdydW5uaW5nJykge1xuICAgICAgICAgICAgICAgIF9hYy5yZXN1bWUoKTtcbiAgICAgICAgICAgICAgICB2YXIgb3NjID0gX2FjLmNyZWF0ZU9zY2lsbGF0b3IoKTtcbiAgICAgICAgICAgICAgICB2YXIgZ2FpbiA9IF9hYy5jcmVhdGVHYWluKCk7XG4gICAgICAgICAgICAgICAgZ2Fpbi5nYWluLnNldFRhcmdldEF0VGltZSgwLCBfYWMuY3VycmVudFRpbWUsIDAuMDEpO1xuICAgICAgICAgICAgICAgIG9zYy5jb25uZWN0KGdhaW4pO1xuICAgICAgICAgICAgICAgIGdhaW4uY29ubmVjdChfYWMuZGVzdGluYXRpb24pO1xuICAgICAgICAgICAgICAgIGlmICghb3NjLnN0YXJ0KSBvc2Muc3RhcnQgPSBvc2Mubm90ZU9uO1xuICAgICAgICAgICAgICAgIGlmICghb3NjLnN0b3ApIG9zYy5zdG9wID0gb3NjLm5vdGVPZmY7XG4gICAgICAgICAgICAgICAgb3NjLnN0YXJ0KC4xKTsgb3NjLnN0b3AoMC4xMSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICBkb2N1bWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCd0b3VjaGVuZCcsIF9hY3RpdmF0ZUF1ZGlvQ29udGV4dCk7XG4gICAgICAgICAgICAgICAgZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcignbW91c2Vkb3duJywgX2FjdGl2YXRlQXVkaW9Db250ZXh0KTtcbiAgICAgICAgICAgICAgICBkb2N1bWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCdrZXlkb3duJywgX2FjdGl2YXRlQXVkaW9Db250ZXh0KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCd0b3VjaGVuZCcsIF9hY3RpdmF0ZUF1ZGlvQ29udGV4dCk7XG4gICAgICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlZG93bicsIF9hY3RpdmF0ZUF1ZGlvQ29udGV4dCk7XG4gICAgICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCBfYWN0aXZhdGVBdWRpb0NvbnRleHQpO1xuICAgICAgICBfYWN0aXZhdGVBdWRpb0NvbnRleHQoKTtcbiAgICB9XG5cbiAgICBKWloudXRpbCA9IHt9O1xuICAgIEpaWi51dGlsLmlvc1NvdW5kID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAvLyBkZXByZWNhdGVkLiB3aWxsIGJlIHJlbW92ZWQgaW4gbmV4dCB2ZXJzaW9uXG4gICAgfVxuICAgIHJldHVybiBKWlo7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gY3JlYXRlSnp6KCk7XG4iLCIvLyBlczUgaW1wbGVtZW50YXRpb24gb2YgYm90aCBNYXAgYW5kIFNldFxuXG5sZXQgaWRJbmRleCA9IDA7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFN0b3JlIHtcbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgdGhpcy5zdG9yZSA9IHt9O1xuICAgICAgICB0aGlzLmtleXMgPSBbXTtcbiAgICB9XG4gICAgYWRkKG9iaikge1xuICAgICAgICBjb25zdCBpZCA9IGAke25ldyBEYXRlKCkuZ2V0VGltZSgpfSR7aWRJbmRleH1gO1xuICAgICAgICBpZEluZGV4ICs9IDE7XG4gICAgICAgIHRoaXMua2V5cy5wdXNoKGlkKTtcbiAgICAgICAgdGhpcy5zdG9yZVtpZF0gPSBvYmo7XG4gICAgfVxuICAgIHNldChpZCwgb2JqKSB7XG4gICAgICAgIHRoaXMua2V5cy5wdXNoKGlkKTtcbiAgICAgICAgdGhpcy5zdG9yZVtpZF0gPSBvYmo7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cbiAgICBnZXQoaWQpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuc3RvcmVbaWRdO1xuICAgIH1cbiAgICBoYXMoaWQpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMua2V5cy5pbmRleE9mKGlkKSAhPT0gLTE7XG4gICAgfVxuICAgIGRlbGV0ZShpZCkge1xuICAgICAgICBkZWxldGUgdGhpcy5zdG9yZVtpZF07XG4gICAgICAgIGNvbnN0IGluZGV4ID0gdGhpcy5rZXlzLmluZGV4T2YoaWQpO1xuICAgICAgICBpZiAoaW5kZXggPiAtMSkge1xuICAgICAgICAgICAgdGhpcy5rZXlzLnNwbGljZShpbmRleCwgMSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuICAgIHZhbHVlcygpIHtcbiAgICAgICAgY29uc3QgZWxlbWVudHMgPSBbXTtcbiAgICAgICAgY29uc3QgbCA9IHRoaXMua2V5cy5sZW5ndGg7XG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbDsgaSArPSAxKSB7XG4gICAgICAgICAgICBjb25zdCBlbGVtZW50ID0gdGhpcy5zdG9yZVt0aGlzLmtleXNbaV1dO1xuICAgICAgICAgICAgZWxlbWVudHMucHVzaChlbGVtZW50KTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZWxlbWVudHM7XG4gICAgfVxuICAgIGZvckVhY2goY2IpIHtcbiAgICAgICAgY29uc3QgbCA9IHRoaXMua2V5cy5sZW5ndGg7XG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbDsgaSArPSAxKSB7XG4gICAgICAgICAgICBjb25zdCBlbGVtZW50ID0gdGhpcy5zdG9yZVt0aGlzLmtleXNbaV1dO1xuICAgICAgICAgICAgY2IoZWxlbWVudCk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgY2xlYXIoKSB7XG4gICAgICAgIHRoaXMua2V5cyA9IFtdO1xuICAgICAgICB0aGlzLnN0b3JlID0ge307XG4gICAgfVxufVxuIiwibGV0IFNjb3BlO1xubGV0IGRldmljZSA9IG51bGw7XG5cbi8vIGNoZWNrIGlmIHdlIGFyZSBpbiBhIGJyb3dzZXIgb3IgaW4gTm9kZWpzXG5leHBvcnQgZnVuY3Rpb24gZ2V0U2NvcGUoKSB7XG4gICAgaWYgKHR5cGVvZiBTY29wZSAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgcmV0dXJuIFNjb3BlO1xuICAgIH1cbiAgICBTY29wZSA9IG51bGw7XG4gICAgaWYgKHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgIFNjb3BlID0gd2luZG93O1xuICAgIH0gZWxzZSBpZiAodHlwZW9mIGdsb2JhbCAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgU2NvcGUgPSBnbG9iYWw7XG4gICAgfVxuICAgIC8vIGNvbnNvbGUubG9nKCdzY29wZScsIHNjb3BlKTtcbiAgICByZXR1cm4gU2NvcGU7XG59XG5cblxuLy8gY2hlY2sgb24gd2hhdCB0eXBlIG9mIGRldmljZSB3ZSBhcmUgcnVubmluZywgbm90ZSB0aGF0IGluIHRoaXMgY29udGV4dFxuLy8gYSBkZXZpY2UgaXMgYSBjb21wdXRlciBub3QgYSBNSURJIGRldmljZVxuZXhwb3J0IGZ1bmN0aW9uIGdldERldmljZSgpIHtcbiAgICBjb25zdCBzY29wZSA9IGdldFNjb3BlKCk7XG4gICAgaWYgKGRldmljZSAhPT0gbnVsbCkge1xuICAgICAgICByZXR1cm4gZGV2aWNlO1xuICAgIH1cblxuICAgIGxldCBwbGF0Zm9ybSA9ICd1bmRldGVjdGVkJztcbiAgICBsZXQgYnJvd3NlciA9ICd1bmRldGVjdGVkJztcblxuICAgIGlmIChzY29wZS5uYXZpZ2F0b3Iubm9kZSA9PT0gdHJ1ZSkge1xuICAgICAgICBkZXZpY2UgPSB7XG4gICAgICAgICAgICBwbGF0Zm9ybTogcHJvY2Vzcy5wbGF0Zm9ybSxcbiAgICAgICAgICAgIG5vZGVqczogdHJ1ZSxcbiAgICAgICAgICAgIG1vYmlsZTogcGxhdGZvcm0gPT09ICdpb3MnIHx8IHBsYXRmb3JtID09PSAnYW5kcm9pZCcsXG4gICAgICAgIH07XG4gICAgICAgIHJldHVybiBkZXZpY2U7XG4gICAgfVxuXG4gICAgY29uc3QgdWEgPSBzY29wZS5uYXZpZ2F0b3IudXNlckFnZW50O1xuXG4gICAgaWYgKHVhLm1hdGNoKC8oaVBhZHxpUGhvbmV8aVBvZCkvZykpIHtcbiAgICAgICAgcGxhdGZvcm0gPSAnaW9zJztcbiAgICB9IGVsc2UgaWYgKHVhLmluZGV4T2YoJ0FuZHJvaWQnKSAhPT0gLTEpIHtcbiAgICAgICAgcGxhdGZvcm0gPSAnYW5kcm9pZCc7XG4gICAgfSBlbHNlIGlmICh1YS5pbmRleE9mKCdMaW51eCcpICE9PSAtMSkge1xuICAgICAgICBwbGF0Zm9ybSA9ICdsaW51eCc7XG4gICAgfSBlbHNlIGlmICh1YS5pbmRleE9mKCdNYWNpbnRvc2gnKSAhPT0gLTEpIHtcbiAgICAgICAgcGxhdGZvcm0gPSAnb3N4JztcbiAgICB9IGVsc2UgaWYgKHVhLmluZGV4T2YoJ1dpbmRvd3MnKSAhPT0gLTEpIHtcbiAgICAgICAgcGxhdGZvcm0gPSAnd2luZG93cyc7XG4gICAgfVxuXG4gICAgaWYgKHVhLmluZGV4T2YoJ0Nocm9tZScpICE9PSAtMSkge1xuICAgICAgICAvLyBjaHJvbWUsIGNocm9taXVtIGFuZCBjYW5hcnlcbiAgICAgICAgYnJvd3NlciA9ICdjaHJvbWUnO1xuXG4gICAgICAgIGlmICh1YS5pbmRleE9mKCdPUFInKSAhPT0gLTEpIHtcbiAgICAgICAgICAgIGJyb3dzZXIgPSAnb3BlcmEnO1xuICAgICAgICB9IGVsc2UgaWYgKHVhLmluZGV4T2YoJ0Nocm9taXVtJykgIT09IC0xKSB7XG4gICAgICAgICAgICBicm93c2VyID0gJ2Nocm9taXVtJztcbiAgICAgICAgfVxuICAgIH0gZWxzZSBpZiAodWEuaW5kZXhPZignU2FmYXJpJykgIT09IC0xKSB7XG4gICAgICAgIGJyb3dzZXIgPSAnc2FmYXJpJztcbiAgICB9IGVsc2UgaWYgKHVhLmluZGV4T2YoJ0ZpcmVmb3gnKSAhPT0gLTEpIHtcbiAgICAgICAgYnJvd3NlciA9ICdmaXJlZm94JztcbiAgICB9IGVsc2UgaWYgKHVhLmluZGV4T2YoJ1RyaWRlbnQnKSAhPT0gLTEpIHtcbiAgICAgICAgYnJvd3NlciA9ICdpZSc7XG4gICAgICAgIGlmICh1YS5pbmRleE9mKCdNU0lFIDknKSAhPT0gLTEpIHtcbiAgICAgICAgICAgIGJyb3dzZXIgPSAnaWU5JztcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGlmIChwbGF0Zm9ybSA9PT0gJ2lvcycpIHtcbiAgICAgICAgaWYgKHVhLmluZGV4T2YoJ0NyaU9TJykgIT09IC0xKSB7XG4gICAgICAgICAgICBicm93c2VyID0gJ2Nocm9tZSc7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBkZXZpY2UgPSB7XG4gICAgICAgIHBsYXRmb3JtLFxuICAgICAgICBicm93c2VyLFxuICAgICAgICBtb2JpbGU6IHBsYXRmb3JtID09PSAnaW9zJyB8fCBwbGF0Zm9ybSA9PT0gJ2FuZHJvaWQnLFxuICAgICAgICBub2RlanM6IGZhbHNlLFxuICAgIH07XG4gICAgcmV0dXJuIGRldmljZTtcbn1cblxuXG4vLyBwb2x5ZmlsbCBmb3Igd2luZG93LnBlcmZvcm1hbmNlLm5vdygpXG5jb25zdCBwb2x5ZmlsbFBlcmZvcm1hbmNlID0gKCkgPT4ge1xuICAgIGNvbnN0IHNjb3BlID0gZ2V0U2NvcGUoKTtcbiAgICBpZiAodHlwZW9mIHNjb3BlLnBlcmZvcm1hbmNlID09PSAndW5kZWZpbmVkJykge1xuICAgICAgICBzY29wZS5wZXJmb3JtYW5jZSA9IHt9O1xuICAgIH1cbiAgICBEYXRlLm5vdyA9IERhdGUubm93IHx8ICgoKSA9PiBuZXcgRGF0ZSgpLmdldFRpbWUoKSk7XG5cbiAgICBpZiAodHlwZW9mIHNjb3BlLnBlcmZvcm1hbmNlLm5vdyA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgbGV0IG5vd09mZnNldCA9IERhdGUubm93KCk7XG4gICAgICAgIGlmIChcbiAgICAgICAgICAgIHR5cGVvZiBzY29wZS5wZXJmb3JtYW5jZS50aW1pbmcgIT09ICd1bmRlZmluZWQnICYmXG4gICAgICAgICAgICB0eXBlb2Ygc2NvcGUucGVyZm9ybWFuY2UudGltaW5nLm5hdmlnYXRpb25TdGFydCAhPT0gJ3VuZGVmaW5lZCdcbiAgICAgICAgKSB7XG4gICAgICAgICAgICBub3dPZmZzZXQgPSBzY29wZS5wZXJmb3JtYW5jZS50aW1pbmcubmF2aWdhdGlvblN0YXJ0O1xuICAgICAgICB9XG4gICAgICAgIHNjb3BlLnBlcmZvcm1hbmNlLm5vdyA9IGZ1bmN0aW9uIG5vdygpIHtcbiAgICAgICAgICAgIHJldHVybiBEYXRlLm5vdygpIC0gbm93T2Zmc2V0O1xuICAgICAgICB9O1xuICAgIH1cbn1cblxuLy8gZ2VuZXJhdGVzIFVVSUQgZm9yIE1JREkgZGV2aWNlc1xuZXhwb3J0IGZ1bmN0aW9uIGdlbmVyYXRlVVVJRCgpIHtcbiAgICBsZXQgZCA9IG5ldyBEYXRlKCkuZ2V0VGltZSgpO1xuICAgIGxldCB1dWlkID0gbmV3IEFycmF5KDY0KS5qb2luKCd4Jyk7Ly8gJ3h4eHh4eHh4LXh4eHgtNHh4eC15eHh4LXh4eHh4eHh4eHh4eCc7XG4gICAgdXVpZCA9IHV1aWQucmVwbGFjZSgvW3h5XS9nLCAoYykgPT4ge1xuICAgICAgICBjb25zdCByID0gKGQgKyBNYXRoLnJhbmRvbSgpICogMTYpICUgMTYgfCAwO1xuICAgICAgICBkID0gTWF0aC5mbG9vcihkIC8gMTYpO1xuICAgICAgICByZXR1cm4gKGMgPT09ICd4JyA/IHIgOiAociAmIDB4MyB8IDB4OCkpLnRvU3RyaW5nKDE2KS50b1VwcGVyQ2FzZSgpO1xuICAgIH0pO1xuICAgIHJldHVybiB1dWlkO1xufVxuXG5cbi8vIGEgdmVyeSBzaW1wbGUgaW1wbGVtZW50YXRpb24gb2YgYSBQcm9taXNlIGZvciBJbnRlcm5ldCBFeHBsb3JlciBhbmQgTm9kZWpzXG5jb25zdCBwb2x5ZmlsbFByb21pc2UgPSAoKSA9PiB7XG4gICAgY29uc3Qgc2NvcGUgPSBnZXRTY29wZSgpO1xuICAgIGlmICh0eXBlb2Ygc2NvcGUuUHJvbWlzZSAhPT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICBzY29wZS5Qcm9taXNlID0gZnVuY3Rpb24gcHJvbWlzZShleGVjdXRvcikge1xuICAgICAgICAgICAgdGhpcy5leGVjdXRvciA9IGV4ZWN1dG9yO1xuICAgICAgICB9O1xuXG4gICAgICAgIHNjb3BlLlByb21pc2UucHJvdG90eXBlLnRoZW4gPSBmdW5jdGlvbiB0aGVuKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgICAgICAgaWYgKHR5cGVvZiByZXNvbHZlICE9PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICAgICAgcmVzb2x2ZSA9ICgpID0+IHsgfTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICh0eXBlb2YgcmVqZWN0ICE9PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICAgICAgcmVqZWN0ID0gKCkgPT4geyB9O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5leGVjdXRvcihyZXNvbHZlLCByZWplY3QpO1xuICAgICAgICB9O1xuICAgIH1cbn1cblxuXG5leHBvcnQgZnVuY3Rpb24gcG9seWZpbGwoKSB7XG4gICAgY29uc3QgZCA9IGdldERldmljZSgpO1xuICAgIC8vIGNvbnNvbGUubG9nKGRldmljZSk7XG4gICAgaWYgKGQuYnJvd3NlciA9PT0gJ2llJyB8fCBkLm5vZGVqcyA9PT0gdHJ1ZSkge1xuICAgICAgICBwb2x5ZmlsbFByb21pc2UoKTtcbiAgICB9XG4gICAgcG9seWZpbGxQZXJmb3JtYW5jZSgpO1xufVxuXG4iXX0=
