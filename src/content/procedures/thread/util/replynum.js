'use strict';

export default function getReplynum(store, { url, posts }) {
    let { domain } = store.getState();
    let thread = domain.threads.get(url);

    let replynum = posts.length - 1;
    let newReplynum = null;

    if (thread == null) return { replynum, newReplynum };

    if (thread.replynum != null) {
        newReplynum = replynum - thread.replynum;
    }

    return { replynum, newReplynum };
}
