'use strict';
import * as actions from '../../reducers/actions';
import { HttpRes } from '../../model';

const { setDomainThreads, setDomainCatalogs, setAppThreads, setAppCatalogs } = actions;

export function load(store, contents) {
    let { url, catalog: { title, threads } } = contents;

    threads = threads.map(thread => ({ ...thread, isActive: true }));

    let appThreads = threads.map(({ url }) => ({ url }));

    let catalog = {
        url, title,
        threads: threads.map(thread => thread.url)
    };

    let appCatalog = {
        url,
        httpRes: new HttpRes({ status: 200 })
    };

    store.dispatch(setDomainThreads(threads));
    store.dispatch(setAppThreads(appThreads));
    store.dispatch(setDomainCatalogs(catalog));
    store.dispatch(setAppCatalogs(appCatalog));
}
