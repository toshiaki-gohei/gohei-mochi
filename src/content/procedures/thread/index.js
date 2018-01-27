'use strict';
import * as actions from '../../reducers/actions';
import { getCurrentAppThread } from '../../reducers/getters';
import * as model from '../../model';

export {
    addDelreqTargets, setDelreqTargets, clearDelreqTargets, registerDelreqTasks
} from './delreq';
export { openQuotePopup, openPostsPopup, closePostsPopup, clearPostsPopup } from './popup';
export { setComment, setFile } from './postform';
export { quote } from './quote';
export { soudane } from './soudane';
export { submit as submitPost } from './submit-post';
export { update } from './update';

const { setDomainPosts, setDomainThreads, setAppThreads, setUiThread } = actions;
const { HttpRes, thread: { IdipIndex, createPosts } } = model;

export function load(store, contents) {
    let { url, thread, messages, postform, delform, lastModified } = contents;

    let posts = createPosts(thread.posts, url);

    thread.url = url;
    thread.posts = posts.map(post => post.id);

    let appThread = {
        url,
        messages, postform, delform,
        idipIndex: new IdipIndex(posts),
        updateHttpRes: new HttpRes({ lastModified })
    };

    store.dispatch(setDomainPosts(posts));
    store.dispatch(setDomainThreads(thread));
    store.dispatch(setAppThreads(appThread));
}


export function setDisplayThreshold(store, displayThreshold) {
    let { url } = getCurrentAppThread(store);
    store.dispatch(setAppThreads({ url, displayThreshold }));
}


export function openPanel(store, type) {
    let panel = { isOpen: true };
    if (type) panel.type = type;
    store.dispatch(setUiThread({ panel }));
}

export function closePanel(store) {
    let { ui } = store.getState();
    if (ui.thread.panel.isOpen === false) return;
    let panel = { isOpen: false };
    store.dispatch(setUiThread({ panel }));
}

export function setPanel(store, panel) {
    store.dispatch(setUiThread({ panel }));
}
