'use strict';
import { createReducer } from '../util';
import { HttpRes } from '~/content/model';
import { F } from '~/common/util';

const STATE = F(new Map());

function create(opts) {
    let {
        url = null,

        searchResults = [],

        isUpdating = false,
        updatedAt = null, // updated date time by user
        httpRes = new HttpRes()
    } = opts || {};

    F(searchResults);

    return F({
        url,
        searchResults,
        isUpdating, updatedAt, httpRes
    });
}


export default createReducer(STATE, {
    'SET_APP_CATALOGS': reduce
});

function reduce(state = STATE, action) {
    let { app, apps } = action;
    if (app) apps = [ app ];
    if (apps == null || apps.length === 0) return state;

    let newState = new Map(state);

    for (let app of apps) {
        let { url } = app;
        if (url == null) throw new Error('url is required');

        let newApp = reduceApp(state.get(url), app);
        newState.set(url, newApp);
    }

    return F(newState);
}

const APP = create();

function reduceApp(prev = APP, next) {
    if (next == null) return prev;

    let newState = { ...prev, ...next };

    return create(newState);
}

export const internal = {
    reduce
};
