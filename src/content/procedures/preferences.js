'use strict';
import * as actions from '../reducers/actions';

const { setUiPreferences } = actions;

export function set(store, pref) {
    if (pref == null) return;
    store.dispatch(setUiPreferences(pref));
}
