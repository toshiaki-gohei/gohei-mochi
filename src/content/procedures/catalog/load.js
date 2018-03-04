'use strict';
import { setDomainThreads, setDomainCatalogs, setAppCatalogs } from '../../reducers/actions';
import { HttpRes } from '../../model';

export function load(store, contents) {
    let { url, catalog: { title, threads } } = contents;

    let catalog = {
        url, title,
        threads: threads.map(thread => thread.url)
    };

    let appCatalog = {
        url,
        httpRes: new HttpRes({ status: 200 })
    };

    store.dispatch(setDomainThreads(threads));
    store.dispatch(setDomainCatalogs(catalog));
    store.dispatch(setAppCatalogs(appCatalog));
}
