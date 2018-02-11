'use strict';
import { setDomainThreads, setDomainCatalogs, setAppCatalogs } from '../../reducers/actions';
import { HttpRes, preferences } from '../../model';
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
    let opts = options(app.catalogs.get(url));

    setPreferences(url);

    let updatedAt = new Date();

    let res = await fetch.getCatalog(requrl, opts);

    deletePreferences(url);

    store.dispatch(setAppCatalogs({ url, isUpdating: false, updatedAt }));

    setResponse(store, { url, res });
}

function options(catalog) {
    let { updateHttpRes: res } = catalog;
    if (res == null) return null;
    let headers = res.reqHeaders;
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

    let { updateHttpRes } = app.catalogs.get(url);
    updateHttpRes = updateHttpRes ? updateHttpRes.unify(res) : new HttpRes(res);

    if (!res.ok) {
        store.dispatch(setAppCatalogs({ url, updateHttpRes }));
        return;
    }

    let { catalog } = res.contents;

    let threads = merge(domain.threads, catalog.threads);

    catalog.url = url;
    catalog.threads = catalog.threads.map(thread => thread.url);

    let appCatalog = { url, updateHttpRes };

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
        thread.newPostnum = b.postnum - a.postnum;

        return thread;
    });

    return newThreads;
}

export const internal = {
    merge
};
