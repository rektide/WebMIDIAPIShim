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
                (0, _midi_access.dispatchEvent)(_this3); // dispatch MIDIConnectionEvent via MIDIAccess
                _this3.port = null;
                _this3._onmidimessage = null;
                _this3.onstatechange = null;
                _this3._listeners.get('midimessage').clear();
                _this3._listeners.get('statechange').clear();
            });
        }
    }]);

    return MIDIInput;
}();

exports.default = MIDIInput;

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
            if (arr[i] == 'extension') ret.push(_tryCRX);else if (arr[i] == 'plugin') ret.push(_tryJazzPlugin);
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
},{"_process":2}]},{},[3]);
