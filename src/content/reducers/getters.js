'use strict';

export function getThreadPosts(store, url) {
    if (url == null) throw new Error('url is required');
    let { domain } = store.getState();
    let thread = domain.threads.get(url) || null;
    if (thread == null) return [];
    return thread.posts.map(id => domain.posts.get(id));
}

export function getCurrentThread(store) {
    let { domain, app } = store.getState();
    let url = app.current.thread;
    if (url == null) throw new Error('no current thread');
    let thread = domain.threads.get(url);
    if (thread == null) throw new Error(`current thread not found: ${url}`);
    return thread;
}

export function getCurrentCatalog(store) {
    let { domain, app } = store.getState();
    let url = app.current.catalog;
    if (url == null) throw new Error('no current catalog');
    let catalog = domain.catalogs.get(url);
    if (catalog == null) throw new Error(`current catalog not found: ${url}`);
    return catalog;
}

export function getCurrentAppThread(store) {
    let { app } = store.getState();
    let url = app.current.thread;
    if (url == null) throw new Error('no current thread');
    let appThread = app.threads.get(url);
    if (appThread == null) throw new Error(`current app thread not found: ${url}`);
    return appThread;
}

export function getCurrentAppCatalog(store) {
    let { app } = store.getState();
    let url = app.current.catalog;
    if (url == null) throw new Error('no current catalog');
    let appCatalog = app.catalogs.get(url);
    if (appCatalog == null) throw new Error(`current app catalog not found: ${url}`);
    return appCatalog;
}
