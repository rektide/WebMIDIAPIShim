/*
  Creates a MIDIAccess instance:
  - Creates MIDIInput and MIDIOutput instances for the initially connected MIDI devices.
  - Keeps track of newly connected devices and creates the necessary instances of MIDIInput and MIDIOutput.
  - Keeps track of disconnected devices and removes them from the inputs and/or outputs map.
  - Creates a unique id for every device and stores these ids by the name of the device:
    so when a device gets disconnected and reconnected again, it will still have the same id. This
    is in line with the behavior of the native MIDIAccess object.

*/
import Jzz from '../util/jzz';
import MIDIInput from './midi_input';
import MIDIOutput from './midi_output';
import MIDIConnectionEvent from './midiconnection_event';
import { getDevice } from '../util/util';
import Store from '../util/store';

let midiAccess;
const listeners = new Store();
const midiInputs = new Store();
const midiOutputs = new Store();

class MIDIAccess {
    constructor(inputs, outputs) {
        this.sysexEnabled = true;
        this.inputs = inputs;
        this.outputs = outputs;
    }

    addEventListener(type, listener) {
        if (type !== 'statechange') {
            return;
        }
        if (listeners.has(listener) === false) {
            listeners.add(listener);
        }
    }

    removeEventListener(type, listener) {
        if (type !== 'statechange') {
            return;
        }
        if (listeners.has(listener) === true) {
            listeners.delete(listener);
        }
    }
}


export function getMIDIPorts() {
    midiInputs.clear();
    midiOutputs.clear();
    Jzz().info().inputs.forEach(info => {
        let port = new MIDIInput(info);
        midiInputs.set(port.id, port);
    });
    Jzz().info().outputs.forEach(info => {
        let port = new MIDIOutput(info);
        midiOutputs.set(port.id, port);
    });
}


export function createMIDIAccess() {
    return new Promise(((resolve, reject) => {
        if (typeof midiAccess !== 'undefined') {
            resolve(midiAccess);
            return;
        }

        if (getDevice().browser === 'ie9') {
            reject({ message: 'WebMIDIAPIShim supports Internet Explorer 10 and above.' });
            return;
        }
        Jzz()
            .or(() => {
                reject({ message: 'No access to MIDI devices: your browser does not support the WebMIDI API and the Jazz extension (or Jazz plugin) is not installed.' });
            })
            .and(() => {
                getMIDIPorts();
                midiAccess = new MIDIAccess(midiInputs, midiOutputs);
                resolve(midiAccess);
            })
            .err((msg) => {
                reject(msg);
            })
    }));
}


// when a device gets connected/disconnected both the port and MIDIAccess dispatch a MIDIConnectionEvent
// therefor we call the ports dispatchEvent function here as well
export function dispatchEvent(port) {
    port.dispatchEvent(new MIDIConnectionEvent(port, port));

    const evt = new MIDIConnectionEvent(midiAccess, port);

    if (typeof midiAccess.onstatechange === 'function') {
        midiAccess.onstatechange(evt);
    }
    listeners.forEach(listener => listener(evt));
}
