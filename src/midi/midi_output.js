/*
  MIDIOutput is a wrapper around an output of a Jazz instance
*/
import Jzz from '../util/jzz';
import { generateUUID } from '../util/util';
import Store from '../util/store';
import { dispatchEvent } from './midi_access';

export default class MIDIOutput {
    constructor(info) {
        this.id = info.id || generateUUID();
        this.name = info.name;
        this.manufacturer = info.manufacturer;
        this.version = info.version;
        this.type = 'output';
        this.state = 'connected';
        this.connection = 'pending';
        this.onmidimessage = null;
        this.onstatechange = null;
        this.port = null;

        this._listeners = new Store();
    }

    open() {
        if (this.connection === 'open') {
            return;
        }
        this.port = Jzz().openMidiOut(this.name)
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
            .or(`Could not close output ${this.name}`)
            .and(() => {
                this.connection = 'closed';
                dispatchEvent(this); // dispatch MIDIConnectionEvent via MIDIAccess
                this.onstatechange = null;
                this._listeners.clear();
            })
    }

    send(data, timestamp = 0) {
        let delayBeforeSend = 0;
        if (timestamp !== 0) {
            delayBeforeSend = Math.floor(timestamp - performance.now());
        }

        this.port
            .wait(delayBeforeSend)
            .send(data);

        return true;
    }

    clear() {
        // to be implemented
    }

    addEventListener(type, listener) {
        if (type !== 'statechange') {
            return;
        }

        if (this._listeners.has(listener) === false) {
            this._listeners.add(listener);
        }
    }

    removeEventListener(type, listener) {
        if (type !== 'statechange') {
            return;
        }

        if (this._listeners.has(listener) === true) {
            this._listeners.delete(listener);
        }
    }

    dispatchEvent(evt) {
        this._listeners.forEach((listener) => {
            listener(evt);
        });

        if (this.onstatechange !== null) {
            this.onstatechange(evt);
        }
    }
}
