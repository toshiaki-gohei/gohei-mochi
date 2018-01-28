'use strict';
import { createReducer } from '../util';
import { F } from '~/common/util';

const STATE = F(new Map());

function create(opts) {
    let {
        url = null,

        displayThreshold = null,
        messages = createMessage(),

        postform = createPostform(),
        delform = createDelform(),
        delreq = createDelreq(),

        changeset = null, // model/thread/changeset
        idipIndex = null, // model/thread/idip-index

        isUpdating = false,
        lastUpdatedByUser = null,
        updateHttpRes = null // model/http-res
    } = opts || {};

    F(messages);
    F(postform);
    F(delform);
    F(delreq);

    return F({
        url,
        displayThreshold, messages,
        postform, delform, delreq,
        changeset, idipIndex,
        isUpdating, lastUpdatedByUser, updateHttpRes
    });
}

function createMessage(opts) {
    let { viewer = null, notice = null, warning = null, deletedPostCount = null } = opts || {};
    return F({ viewer, notice, warning, deletedPostCount });
}

function createPostform(opts) {
    let { action = null, hiddens = [], comment = null, file = null } = opts || {};
    F(hiddens);
    //F(file); // TypeError: can't prevent extensions on this proxy object
    return F({ action, hiddens, comment, file });
}

function createDelform(opts) {
    let { action = null } = opts || {};
    return F({ action });
}

function createDelreq(opts) {
    let { targets = new Map() } = opts || {};
    F(targets);
    return F({ targets });
}

export function createDelreqTarget(opts) {
    // post: post id
    let { post = null, checked = true } = opts || {};
    return F({ post, checked });
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

function reduceApp(prev = APP, next) {
    if (next == null) return prev;

    let messages = reduceMessage(prev.messages, next.messages);
    let postform = reducePostform(prev.postform, next.postform);
    let delform = reduceDelform(prev.delform, next.delform);
    let delreq = reduceDelreq(prev.delreq, next.delreq);

    let newState = { ...prev, ...next, messages, postform, delform, delreq };

    return create(newState);
}

function reduceMessage(prev, next) {
    if (next == null || next === prev) return prev;
    return createMessage({ ...prev, ...next });
}

function reducePostform(prev, next) {
    if (next == null || next === prev) return prev;
    return createPostform({ ...prev, ...next });
}

function reduceDelform(prev, next) {
    if (next == null || next === prev) return prev;
    return createDelform({ ...prev, ...next });
}

function reduceDelreq(prev, next) {
    if (next == null || next === prev) return prev;
    return createDelreq({ ...prev, ...next });
}

export const internal = {
    reduce,
    APP
};
