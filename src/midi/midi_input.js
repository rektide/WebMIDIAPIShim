/*
  MIDIInput is a wrapper around an input of a Jazz instance
*/
import Jzz from 'jzz';
import MIDIMessageEvent from './midimessage_event';
import MIDIConnectionEvent from './midiconnection_event';
import { dispatchEvent } from './midi_access';
import { generateUUID } from '../util/util';
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
                    this.port.connect((msg) => {
                        const m = new MIDIMessageEvent(this, msg);
                        value(m);
                    });
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
            .or(`Could not open input ${this.name}`)
            .and(() => {
                this.connection = 'open';
                dispatchEvent(this); // dispatch MIDIConnectionEvent via MIDIAccess
            });
    }

    close() {
        if (this.connection === 'closed') {
            return;
        }
        this.port.close()
            .or(`Could not close input ${this.name}`)
            .and(() => {
                this.connection = 'closed';
                this.port = null;
                this._onmidimessage = null;
                this.onstatechange = null;
                this._listeners.get('midimessage').clear();
                this._listeners.get('statechange').clear();
                dispatchEvent(this); // dispatch MIDIConnectionEvent via MIDIAccess
            });
    }
}
