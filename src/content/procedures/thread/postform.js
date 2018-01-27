'use strict';
import { setAppThreads } from '../../reducers/actions';
import { getCurrentAppThread } from '../../reducers/getters';

export function setComment(store, comment) {
    let { url, postform } = getCurrentAppThread(store);
    if (postform.comment === comment) return;
    postform = { comment };
    store.dispatch(setAppThreads({ url, postform }));
}

export function setFile(store, file) {
    let { url, postform } = getCurrentAppThread(store);
    if (postform.file === file) return;
    postform = { file };
    store.dispatch(setAppThreads({ url, postform }));
}
