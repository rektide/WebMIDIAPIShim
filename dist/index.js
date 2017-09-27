'use strict';

var _midi_access = require('./midi/midi_access');

var _util = require('./util/util');

/* eslint wrap-iife: ["error", "any"] */

var midiAccess = void 0;

(function () {
    //    if (!navigator.requestMIDIAccess) {
    (0, _util.polyfill)();
    navigator.requestMIDIAccess = function () {
        // singleton-ish, no need to create multiple instances of MIDIAccess
        if (midiAccess === undefined) {
            midiAccess = (0, _midi_access.createMIDIAccess)();
        }
        return midiAccess;
    };
    if ((0, _util.getDevice)().nodejs === true) {
        navigator.close = function () {
            // Need to close MIDI input ports, otherwise Node.js will wait for MIDI input forever.
            (0, _midi_access.closeAllMIDIInputs)();
        };
    }
    //    }
})();