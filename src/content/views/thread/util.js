'use strict';
import { separate } from '~/common/url';
import jsCookie from 'js-cookie';

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

export function setNamec(name, url) {
    if (name == null) name = '';
    let { boardKey } = separate(url);
    jsCookie.set('namec', name, { path: `/${boardKey}/` });
}

export function setPwdc(password) {
    if (password == null) password = '';
    jsCookie.set('pwdc', password, { domain: '.2chan.net' });
}
