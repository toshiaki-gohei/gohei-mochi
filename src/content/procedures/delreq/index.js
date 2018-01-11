'use strict';
import { setAppDelreqs } from '../../reducers/actions';
import { create } from '../../reducers/app/delreqs';
import { type as urltype, separate } from '~/common/url';

export { submit } from './submit';

export function add(store, opts) {
    let { url: threadOrCatalogUrl, post, posts, reason, status } = opts;

    if (post != null) posts = [ post ];
    if (posts === null) throw new Error('post is required');

    posts = posts.filter(addingCond(store));

    let { boardKey } = separate(threadOrCatalogUrl);
    let url = delreqUrl(threadOrCatalogUrl);

    let delreqs = posts.map(({ id, no }) => {
        let [ d, b ] = [ no, boardKey ];
        let form = { reason, mode: 'post', d, b, dlv: 0 };
        return create({ post: id, url, form, status });
    });

    store.dispatch(setAppDelreqs(delreqs));
}

function addingCond(store) {
    let { delreqs } = store.getState().app;

    return post => {
        if (delreqs.has(post.id)) return false;
        return true;
    };
}

function delreqUrl(url) {
    let type = urltype(url);
    if (type !== 'thread' && type !== 'catalog') {
        throw new Error(`thread url or catalog url is required: ${url}`);
    }

    let { server } = separate(url);
    let { protocol } = new window.URL(url);

    return `${protocol}//${server}.2chan.net/del.php?guid=on`;
}

export const internal = {
    delreqUrl
};
