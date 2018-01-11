'use strict';
import * as actions from '../../reducers/actions';

export { update } from './update';

const { setDomainThreads, setDomainCatalogs } = actions;

export function load(store, contents) {
    let { url, catalog } = contents;

    let threads = catalog.threads;

    catalog.url = url;
    catalog.threads = threads.map(thread => thread.url);

    store.dispatch(setDomainThreads(threads));
    store.dispatch(setDomainCatalogs(catalog));
}
