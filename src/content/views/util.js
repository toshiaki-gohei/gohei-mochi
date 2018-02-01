'use strict';

export function hasChanged(self, nextProps, nextState) {
    let { props, state } = self;

    for (let prop in nextProps) {
        if (props[prop] !== nextProps[prop]) return true;
    }
    for (let prop in nextState) {
        if (state[prop] !== nextState[prop]) return true;
    }

    return false;
}

export function isThreadLazyDisplay(appThread) {
    let { displayThreshold } = appThread || {};
    if (displayThreshold == null) return false;
    return true;
}


export function preventDefault(event) {
    event.preventDefault();
}

export function stopPropagation(event) {
    event.stopPropagation();
}
