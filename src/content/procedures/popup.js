'use strict';
import { setUiPopups } from '../reducers/actions';
import { createPopup } from '../reducers/ui/popups';

export const open = add;
export const close = remove;

export function add(store, opts) {
    if (opts == null) return null;
    let { component, props } = opts;

    let popup = createPopup(component, props);

    let { ui } = store.getState();

    let popups = new Map(ui.popups);
    popups.set(popup.id, popup);

    store.dispatch(setUiPopups(popups));

    return popup.id;
}

export function remove(store, popupIds) {
    if (popupIds == null) return;

    let { ui } = store.getState();

    if (!Array.isArray(popupIds)) {
        if (!ui.popups.has(popupIds)) return;
        popupIds = [ popupIds ];
    }

    if (popupIds.length === 0) return;

    let popups = new Map(ui.popups);

    for (let id of popupIds) popups.delete(id);

    store.dispatch(setUiPopups(popups));
}
