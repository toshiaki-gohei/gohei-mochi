'use strict';
import { setDomainPosts } from '../../reducers/actions';
import { getCurrentThread } from '../../reducers/getters';
import { Post } from '../../model';
import fetch from '../../util/fetch';
import { separate } from '~/common/url';

export default soudane;

export async function soudane(store, { id, url = null }) {
    let { domain } = store.getState();
    let thread = getCurrentThread(store);

    let post = domain.posts.get(id);
    if (post == null) throw new Error(`post is not found: id=${id}`);

    url = url || sodurl(thread.url, post);

    let res;
    try {
        res = await fetch.get(url);
    } catch (e) {
        res = { ok: false, status: 499, statusText: `なんかエラーだって: ${e.message}` };
    }

    if (!res.ok) return res;

    let sod = +res.text;
    if (!Number.isInteger(+sod)) {
        res.statusText = 'could not parse res.text';
        return res;
    }

    post = new Post({ ...post.object(), sod });
    store.dispatch(setDomainPosts(post));

    return res;
}

function sodurl(url, post) {
    if (url == null || post == null) throw new TypeError('two arguments are required');
    if (typeof url === 'string') url = new window.URL(url);
    let { href, origin } = url;
    let { boardKey } = separate(href);
    return `${origin}/sd.php?${boardKey}.${post.no}`;
}

export const internal = {
    sodurl
};
