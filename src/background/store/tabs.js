'use strict';
import { F } from '~/common/util';

export default { add, set, remove };

export function create(tabs) {
    tabs = new Map(tabs);
    return F(tabs);
}

function add(tabs, opts) {
    let { next } = set(tabs, opts);
    return next;
}

function set(tabs, opts) {
    let { tabId } = opts || {};
    if (tabId == null) throw new TypeError('tabId is required');

    let tab = tabs.get(tabId) || null;

    let tabState = new TabState({ ...tab, ...opts });
    tabs.set(tabId, tabState);

    return { prev: tab, next: tabs.get(tabId) };
}

function remove(tabs, tabId) {
    let tab = tabs.get(tabId);
    if (tab == null) return null;
    tabs.delete(tabId);
    return tab;
}

class TabState {
    constructor(opts) {
        let { tabId = null, status = null, unload = null } = opts || {};

        this.tabId = tabId;
        this.status = status;
        this.unload = F(unload); // { url, pageXOffset, pageYOffset }

        F(this);
    }
}

export const internal = {
    TabState
};
