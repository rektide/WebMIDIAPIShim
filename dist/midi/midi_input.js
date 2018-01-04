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
//# sourceMappingURL=midi_input.js.map