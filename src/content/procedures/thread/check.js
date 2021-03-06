'use strict';
import { setDomainThreads, setAppThreads } from '../../reducers/actions';
import fetch from '../../util/fetch';
import { sleep } from '../../util';

const SLEEP_TIME = 10;

export async function checkActive(store, opts) {
    let { urls = [], sleepTime = SLEEP_TIME } = opts || {};

    let { domain } = store.getState();
    urls = urls.sort();

    let count = 0;
    for (let url of urls) {
        let thread = domain.threads.get(url);

        if (thread == null) continue;
        if (!thread.isActive) continue;

        if (++count !== 1) await sleep(sleepTime);

        await _checkActive(store, url);

        // handle later threads as active threads for decrease to access 2chan.net
        if (canInterrupt(store, url)) break;
    }
}

async function _checkActive(store, url) {
    let { app } = store.getState();

    let res = await fetch.get(url, { method: 'head' });
    let { status, statusText } = res;

    let { httpRes } = app.threads.get(url);
    httpRes = httpRes.clone({ status, statusText });

    let isActive = httpRes.status === 404 ? false : true;

    store.dispatch(setDomainThreads({ url, isActive }));
    store.dispatch(setAppThreads({ url, httpRes }));
}

function canInterrupt(store, url) {
    let { domain } = store.getState();
    let thread = domain.threads.get(url);
    if (thread.isActive) return true;
    return false;
}

export const internal = {
    _checkActive
};
