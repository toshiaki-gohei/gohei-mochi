'use strict';

export default {
    start(name) {
        if (!canUse()) return;
        window.performance.mark(markNameStart(name));
    },

    end(name) {
        if (!canUse()) return;
        window.performance.mark(markNameEnd(name));
    },

    measure(name) {
        if (!canUse()) return;
        window.performance.measure(name, markNameStart(name), markNameEnd(name));
    },

    print(names) {
        if (!canUse()) return;
        if (!Array.isArray(names)) names = [ names ];
        for (let name of names) printMeasure(name);
    }
};

function canUse() {
    if (process.env.NODE_ENV === 'production') return false;
    if (typeof window.performance.mark !== 'function') return false;
    return true;
}

function printMeasure(name) {
    const perf = window.performance;
    let start = markNameStart(name);
    let end = markNameEnd(name);

    if (perf.getEntriesByName(start, 'mark').length === 0) return;
    if (perf.getEntriesByName(end, 'mark').length === 0) return;

    perf.measure(name, start, end);

    let entries = perf.getEntriesByName(name, 'measure');
    let { duration } = entries[entries.length - 1];

    // eslint-disable-next-line no-console
    console.log(`${name}:`, duration.toFixed(3), '[ms]');

    perf.clearMarks(name);
    perf.clearMeasures(name);
}

function markNameStart(name) {
    return `${name}:start`;
}

function markNameEnd(name) {
    return `${name}:end`;
}
