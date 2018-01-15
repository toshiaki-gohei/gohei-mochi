'use strict';
import * as actions from '../reducers/actions';

const { setUiPreferences } = actions;

export function set(store, prefs) {
    if (prefs == null) return;
    store.dispatch(setUiPreferences(prefs));
}
