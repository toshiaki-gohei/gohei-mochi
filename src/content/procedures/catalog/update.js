'use strict';
import { setDomainThreads, setDomainCatalogs, setAppCatalogs } from '../../reducers/actions';
import { HttpRes } from '../../model';
import fetch from '../../util/fetch';
import { catalogUrl } from '../../util/url';

export default update;

export async function update(store, url, { sort = null } = {}) {
    let { app } = store.getState();

    if (url == null) url = app.current.catalog;
    if (url == null) throw new TypeError('request url is required');

    store.dispatch(setDomainCatalogs({ url, sort }));
    store.dispatch(setAppCatalogs({ url, isUpdating: true }));

    let requrl = catalogUrl(url, sort);
    let opts = options(app.catalogs.get(url));

    let lastUpdatedByUser = new Date();

    let res;
    try {
        res = await fetch.getCatalog(requrl, opts);
    } catch (e) {
        res = { ok: false, status: 499, statusText: `なんかエラーだって: ${e.message}` };
    }

    store.dispatch(setAppCatalogs({ url, isUpdating: false, lastUpdatedByUser }));

    setRes(store, { url, res });
}

function options(catalog) {
    let { updateHttpRes: res } = catalog;
    if (res == null) return null;
    let headers = res.reqHeaders;
    return { headers };
}

function setRes(store, { url, res }) {
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
