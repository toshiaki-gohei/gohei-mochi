'use strict';
import { separate } from '~/common/url';
import { post } from '~/content/model';
import jsCookie from 'js-cookie';

const { STATE } = post;

export function isThreadLazyDisplay(appThread) {
    let { displayThreshold } = appThread || {};
    if (displayThreshold == null) return false;
    return true;
}

export function hasCheckedTarget(app, name) {
    let { current, threads } = app;
    let container = threads.get(current.thread)[name];

    for (let [ , { checked } ] of container.targets) {
        if (checked) return true;
    }
    return false;
}

export function isHiddenPost({ post, filters }) {
    let { isHiddenDeletedPosts } = filters;

    if (!isHiddenDeletedPosts) return false;

    switch (post.state) {
    case STATE.DELETE_BY_DELETER:
    case STATE.DELETE_BY_THREAKI:
    case STATE.DELETE_BY_WRITER:
        return true;
    }

    return false;
}

export function setNamec(name, url) {
    if (name == null) name = '';
    let { boardKey } = separate(url);
    jsCookie.set('namec', name, { path: `/${boardKey}/` });
}

export function setPwdc(password) {
    if (password == null) password = '';
    jsCookie.set('pwdc', password, { domain: '.2chan.net' });
}
