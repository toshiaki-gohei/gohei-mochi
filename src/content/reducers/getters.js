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

export function getCurrentThreadApp(store) {
    let { app } = store.getState();
    let url = app.current.thread;
    if (url == null) throw new Error('no current thread');
    let threadApp = app.threads.get(url);
    if (threadApp == null) throw new Error(`current thread app not found: ${url}`);
    return threadApp;
}
