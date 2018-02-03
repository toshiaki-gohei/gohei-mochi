'use strict';

export function isThreadLazyDisplay(appThread) {
    let { displayThreshold } = appThread || {};
    if (displayThreshold == null) return false;
    return true;
}

export function hasCheckedTarget(app, name) {
    let { current, threads } = app;
    let container = threads.get(current.thread)[name];

    for (let [ , { checked } ] of container.targets) {
        if (checked) return true;
    }
    return false;
}
