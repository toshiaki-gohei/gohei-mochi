'use strict';
import { setAppTasksDelreqs } from '~/content/reducers/actions';
import { createDelreq } from '~/content/reducers/app/tasks/delreqs';
import { type as urltype, separate } from '~/common/url';

export function add(store, opts) {
    let { url: threadOrCatalogUrl, posts, reason, status } = opts;
    let { domain, app } = store.getState();

    let postIds = posts || [];
    postIds = postIds.filter(ignoreContainings(app.tasks.delreqs));

    let { boardKey } = separate(threadOrCatalogUrl);
    let url = delreqUrl(threadOrCatalogUrl);

    let delreqs = postIds.map(id => {
        let post = domain.posts.get(id);
        let [ d, b ] = [ post.no, boardKey ];
        let form = { reason, mode: 'post', d, b, dlv: 0 };
        return createDelreq({ post: id, url, form, status });
    });

    store.dispatch(setAppTasksDelreqs(delreqs));
}

function ignoreContainings(delreqs) {
    return postId => delreqs.has(postId) ? false : true;
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
