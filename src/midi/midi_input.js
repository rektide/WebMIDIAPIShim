/*
  MIDIInput is a wrapper around an input of a Jazz instance
*/
import Jzz from '../util/jzz';
import MIDIMessageEvent from './midimessage_event';
import MIDIConnectionEvent from './midiconnection_event';
import { dispatchEvent } from './midi_access';
import { generateUUID, getDevice } from '../util/util';
import Store from '../util/store';

export default class MIDIInput {
    constructor(info) {
        this.id = info.id || generateUUID();
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
            set(value) {
                this._onmidimessage = value;
                if (typeof value === 'function') {
                    if (this.port === null) {
                        this.open();
                    }
                }
            }
        });

        this._listeners = new Store()
            .set('midimessage', new Store())
            .set('statechange', new Store());
    }

    addEventListener(type, listener) {
        const listeners = this._listeners.get(type);
        if (typeof listeners === 'undefined') {
            return;
        }

        if (listeners.has(listener) === false) {
            listeners.add(listener);
        }
    }

    removeEventListener(type, listener) {
        const listeners = this._listeners.get(type);
        if (typeof listeners === 'undefined') {
            return;
        }

        if (listeners.has(listener) === true) {
            listeners.delete(listener);
        }
    }

    dispatchEvent(evt) {
        const listeners = this._listeners.get(evt.type);
        listeners.forEach((listener) => {
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

    open() {
        if (this.connection === 'open') {
            return;
        }
        this.port = Jzz().openMidiIn(this.name)
            // .or(`Could not open input ${this.name}`)
            .and(() => {
                this.connection = 'open';
                dispatchEvent(this); // dispatch MIDIConnectionEvent via MIDIAccess
            })
            .connect( msg=> {
                this._midiProc(0, msg);
            })
            .err((err) => { console.log(err); })
    }

    close() {
        if (this.connection === 'closed') {
            return;
        }
        this.port.close()
            .or(`Could not close input ${this.name}`)
            .and(() => {
                this.connection = 'closed';
                dispatchEvent(this); // dispatch MIDIConnectionEvent via MIDIAccess
                this.port = null;
                this._onmidimessage = null;
                this.onstatechange = null;
                this._listeners.get('midimessage').clear();
                this._listeners.get('statechange').clear();
            });
    }

    _appendToSysexBuffer(data) {
        const oldLength = this._sysexBuffer.length;
        const tmpBuffer = new Uint8Array(oldLength + data.length);
        tmpBuffer.set(this._sysexBuffer);
        tmpBuffer.set(data, oldLength);
        this._sysexBuffer = tmpBuffer;
    }

    _bufferLongSysex(data, initialOffset) {
        let j = initialOffset;
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
}


function midiProc(timestamp, data) {
    let length = 0;
    let i;
    let isSysexMessage = false;

    //console.log(timestamp, data);

    // Jazz sometimes passes us multiple messages at once, so we need to parse them out and pass them one at a time.

    for (i = 0; i < data.length; i += length) {
        let isValidMessage = true;
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
            case 0x00: // Chew up spurious 0x00 bytes.  Fixes a Windows problem.
                length = 1;
                isValidMessage = false;
                break;

            case 0x80: // note off
            case 0x90: // note on
            case 0xA0: // polyphonic aftertouch
            case 0xB0: // control change
            case 0xE0: // channel mode
                length = 3;
                break;

            case 0xC0: // program change
            case 0xD0: // channel aftertouch
                length = 2;
                break;

            case 0xF0:
                switch (data[i]) {
                case 0xf0: // letiable-length sysex.
                    i = this._bufferLongSysex(data, i);
                    if (data[i - 1] != 0xf7) {
                        // ran off the end without hitting the end of the sysex message
                        return;
                    }
                    isSysexMessage = true;
                    break;

                case 0xF1: // MTC quarter frame
                case 0xF3: // song select
                    length = 2;
                    break;

                case 0xF2: // song position pointer
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

        const evt = {};
        // evt.receivedTime = parseFloat(timestamp.toString()) + this._jazzInstance._perfTimeZero;

        if (isSysexMessage || this._inLongSysexMessage) {
            evt.data = new Uint8Array(this._sysexBuffer);
            this._sysexBuffer = new Uint8Array(0);
            this._inLongSysexMessage = false;
        } else {
            evt.data = new Uint8Array(data.slice(i, length + i));
        }

        const e = new MIDIMessageEvent(this, evt.data, evt.receivedTime);
        this.dispatchEvent(e);
    }
}
