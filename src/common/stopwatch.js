'use strict';

class Stopwatch {
    constructor() {
        this._records = {};
        this.disabled = false;
    }

    start(name) {
        if (this.disabled) return;
        if (name == null) throw new TypeError('name is required');
        let rec = new Record();
        rec.start();
        this._records[name] = rec;
    }

    stop(name) {
        if (this.disabled) return null;
        if (name == null) throw new TypeError('name is required');
        let rec = this._records[name];
        if (rec == null) throw new Error('must call start() at first');
        rec.stop();
        return this.record(name);
    }

    record(name) {
        if (name == null) throw new TypeError('name is required');
        if (this._records[name] == null) return `${name} is no recored`;
        return `${name}: ${this._records[name]} sec`;
    }

    log(name) {
        if (this.disabled) return;
        console.log(this.record(name)); // eslint-disable-line no-console
    }
}

class Record {
    constructor() {
        this._start = null;
        this._stop = null;
    }

    start() { this._start = Date.now(); }
    stop() { this._stop = Date.now(); }

    toString() {
        if (this.start == null || this.stop == null) return null;
        let elapsed = (this._stop - this._start) / 1000;
        return elapsed.toFixed(3);
    }
}

const stopwatch = new Stopwatch();

export default stopwatch;
