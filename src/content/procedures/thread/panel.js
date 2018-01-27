'use strict';
import { setUiThread } from '../../reducers/actions';

export function openPanel(store, type) {
    let panel = { isOpen: true };
    if (type) panel.type = type;
    store.dispatch(setUiThread({ panel }));
}

export function closePanel(store) {
    let { ui } = store.getState();
    if (ui.thread.panel.isOpen === false) return;
    let panel = { isOpen: false };
    store.dispatch(setUiThread({ panel }));
}

export function setPanel(store, panel) {
    store.dispatch(setUiThread({ panel }));
}
