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
//# sourceMappingURL=midi_output.js.map