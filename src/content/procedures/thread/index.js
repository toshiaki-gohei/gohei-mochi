'use strict';
import { setAppThreads } from '../../reducers/actions';
import { getCurrentAppThread } from '../../reducers/getters';

export {
    addDelformTargets, setDelformTargets, removeDelformTargets, clearDelformTargets
} from './delform';
export {
    addDelreqTargets, setDelreqTargets, clearDelreqTargets, registerDelreqTasks
} from './delreq';
export { load } from './load';
export { openPanel, closePanel, setPanel } from './panel';
export { openQuotePopup, openPostsPopup, closePostsPopup, clearPostsPopup } from './popup';
export { setComment, setFile } from './postform';
export { quote } from './quote';
export { soudane } from './soudane';
export { submit as submitDel } from './submit-del';
export { submit as submitPost } from './submit-post';
export { update } from './update';


export function setDisplayThreshold(store, displayThreshold) {
    let { url } = getCurrentAppThread(store);
    store.dispatch(setAppThreads({ url, displayThreshold }));
}
