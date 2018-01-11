'use strict';
import { createReducer } from '../util';
import { F } from '~/common/util';

const STATE = F(new Map());

export function create(opts) {
    let {
        url = null,

        displayThreshold = null,

        messages: {
            viewer = null,
            notice = null, warning = null, deletedPostCount = null
        } = {},

        postform,
        delform,

        changeset = null, // model/thread/changeset
        idipIndex = null, // model/thread/idip-index

        delreqs = [], // post ids

        isUpdating = false,
        lastUpdatedByUser = null,
        updateHttpRes = null // model/http-res
    } = opts || {};

    let messages = F({
        viewer,
        notice, warning, deletedPostCount
    });
    postform = createPostform(postform);
    delform = createDelform(delform);
    F(delreqs);

    return F({
        url,
        displayThreshold,
        messages, postform, delform,
        changeset, idipIndex,
        delreqs,
        isUpdating, lastUpdatedByUser, updateHttpRes
    });
}

function createPostform(opts) {
    let { action = null, hiddens = [], comment = null } = opts || {};
    F(hiddens);
    return F({ action, hiddens, comment });
}

function createDelform(opts) {
    let { action = null } = opts || {};
    return F({ action });
}

export default createReducer(STATE, {
    'SET_APP_THREADS': reduce
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

function reduceApp(state = APP, app) {
    if (app == null) return state;

    let { messages, postform, delform } = app;
    messages = { ...state.messages, ...messages };
    postform = { ...state.postform, ...postform };
    delform = { ...state.delform, ...delform };

    let newState = { ...state, ...app, messages, postform, delform };

    return create(newState);
}

export const internal = {
    reduce
};
