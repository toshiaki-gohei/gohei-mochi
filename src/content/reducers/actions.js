'use strict';

export const setDomainPosts = arg => {
    if (Array.isArray(arg)) return { type: 'SET_DOMAIN_POSTS', posts: arg };
    return { type: 'SET_DOMAIN_POSTS', post: arg };
};
export const setDomainThreads = arg => {
    if (Array.isArray(arg)) return { type: 'SET_DOMAIN_THREADS', threads: arg };
    return { type: 'SET_DOMAIN_THREADS', thread: arg };
};
export const setDomainCatalogs = arg => {
    if (Array.isArray(arg)) return { type: 'SET_DOMAIN_CATALOGS', catalogs: arg };
    return { type: 'SET_DOMAIN_CATALOGS', catalog: arg };
};

export const setAppCurrent = current => ({ type: 'SET_APP_CURRENT', current });
export const setAppThreads = arg => {
    if (Array.isArray(arg)) return { type: 'SET_APP_THREADS', apps: arg };
    return { type: 'SET_APP_THREADS', app: arg };
};
export const setAppCatalogs = arg => {
    if (Array.isArray(arg)) return { type: 'SET_APP_CATALOGS', apps: arg };
    return { type: 'SET_APP_CATALOGS', app: arg };
};
export const setAppTasksDelreqs = arg => {
    if (Array.isArray(arg)) return { type: 'SET_APP_TASKS_DELREQS', delreqs: arg };
    return { type: 'SET_APP_TASKS_DELREQS', delreq: arg };
};
export const setAppTasksPostdels = arg => {
    if (Array.isArray(arg)) return { type: 'SET_APP_TASKS_POSTDELS', postdels: arg };
    return { type: 'SET_APP_TASKS_POSTDELS', postdel: arg };
};
export const setAppWorkers = args => ({ type: 'SET_APP_WORKERS', ...args });
export const clearAppWorkerId = worker => ({ type: 'CLEAR_APP_WORKER_ID', worker });

export const setUiThread = ui => ({ type: 'SET_UI_THREAD', ui });
export const setUiPreferences = preferences => ({ type: 'SET_UI_PREFERENCES', preferences });
export const setUiPopups = popups => ({ type: 'SET_UI_POPUPS', popups });
