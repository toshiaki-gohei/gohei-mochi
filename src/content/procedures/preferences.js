'use strict';
import * as actions from '../reducers/actions';
import { preferences } from '~/content/model';

const { setUiPreferences } = actions;

export function load(store) {
    let prefs = preferences.load();
    store.dispatch(setUiPreferences(prefs));
}

export function save(store, prefs) {
    if (prefs == null) return;
    preferences.store(prefs);
    store.dispatch(setUiPreferences(prefs));
}
