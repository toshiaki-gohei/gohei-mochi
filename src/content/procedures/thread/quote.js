'use strict';
import { setAppThreads } from '../../reducers/actions';
import { getCurrentThread } from '../../reducers/getters';

export default quote;

export function quote(store, { id, type }) {
    let { domain, app } = store.getState();
    let { url } = getCurrentThread(store);

    let post = domain.posts.get(id);
    if (post == null) return;

    let text = null;
    switch (type) {
    case 'no':
        text = `No.${post.no}`;
        break;
    case 'comment':
        text = post.text();
        break;
    case 'file':
        text = post.file.name;
        break;
    default:
        throw new TypeError(`unknown type: ${type}`);
    }

    let q = quotify(text);
    if (q == null) return;

    let { postform } = app.threads.get(url);

    let { comment: com } = postform;
    if (com == null) com = '';

    if (com !== '' && com.charAt(com.length - 1) !== '\n') com += '\n';

    postform = { comment: com + q };
    store.dispatch(setAppThreads({ url, postform }));
}

function quotify(text) {
    if (text == null || text === '') return null;

    let lines = text.split('\n');
    if (lines[lines.length - 1] == '') lines.pop(); // remove last line if only \n

    let quotes = lines.map(line => `>${line}`);

    return quotes.join('\n') + '\n';
}

export const internal = {
    quotify
};
