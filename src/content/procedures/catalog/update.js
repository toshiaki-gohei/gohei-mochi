'use strict';
import { setDomainThreads, setDomainCatalogs, setAppCatalogs } from '../../reducers/actions';
import { preferences } from '../../model';
import fetch from '../../util/fetch';
import { catalogUrl } from '../../util/url';
import { deepCopy } from '~/common/util';
import jsCookie from 'js-cookie';

export default update;

export async function update(store, url, { sort = null } = {}) {
    let { app } = store.getState();

    if (url == null) url = app.current.catalog;
    if (url == null) throw new TypeError('request url is required');

    store.dispatch(setDomainCatalogs({ url, sort }));
    store.dispatch(setAppCatalogs({ url, isUpdating: true }));

    let requrl = catalogUrl(url, sort);
    let opts = options(store, { url });

    setPreferences(url);
    let updatedAt = new Date();

    let res = await fetch.getCatalog(requrl, opts);

    deletePreferences(url);

    store.dispatch(setAppCatalogs({ url, isUpdating: false, updatedAt }));

    setResponse(store, { url, res });
}

function options(store, { url }) {
    let { app } = store.getState();
    let { httpRes } = app.catalogs.get(url);
    let headers = httpRes.reqHeaders;
    return { headers };
}

function setPreferences(url) {
    let { catalog } = deepCopy(preferences.load());
    catalog.title.length = 20;
    let value = preferences.Catalog.cookieValue(catalog);

    // use long path to raise the priority of this "cxyl"
    let { hostname: domain, pathname: path } = new window.URL(url);
    jsCookie.set('cxyl', value, { domain, path });
}

function deletePreferences(url) {
    let { hostname: domain, pathname: path } = new window.URL(url);
    jsCookie.remove('cxyl', { domain, path });
}

function setResponse(store, { url, res }) {
    let { domain, app } = store.getState();

    let { httpRes } = app.catalogs.get(url);
    httpRes = httpRes.clone(res);

    if (!res.ok) {
        store.dispatch(setAppCatalogs({ url, httpRes }));
        return;
    }

    let { catalog: { title, threads } } = res.contents;

    threads = merge(domain.threads, threads);

    let catalog = {
        url, title,
        threads: threads.map(thread => thread.url)
    };

    let appCatalog = { url, httpRes };

    store.dispatch(setDomainThreads(threads));
    store.dispatch(setDomainCatalogs(catalog));
    store.dispatch(setAppCatalogs(appCatalog));
}

function merge(storeThreads, newThreads) {
    newThreads = newThreads.map(threadB => {
        let a = storeThreads.get(threadB.url);
        let b = threadB;

        if (a == null) return b;

        let thread = { ...a, ...b };
        thread.newReplynum = b.replynum - a.replynum;

        return thread;
    });

    return newThreads;
}

export const internal = {
    merge
};
