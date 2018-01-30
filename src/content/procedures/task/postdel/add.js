'use strict';
import { setAppTasksPostdels } from '~/content/reducers/actions';
import { createPostdel } from '~/content/reducers/app/tasks/postdels';

export default add;

export function add(store, opts) {
    let { url, posts, mode = 'usrdel', onlyimgdel, pwd = '', status } = opts;
    let { app } = store.getState();

    let postIds = posts || [];
    postIds = postIds.filter(ignoreContainings(app.tasks.postdels));

    let postdels = postIds.map(id => {
        let form = { mode, onlyimgdel, pwd };
        return createPostdel({ post: id, url, form, status });
    });

    store.dispatch(setAppTasksPostdels(postdels));
}

function ignoreContainings(postdels) {
    return postId => postdels.has(postId) ? false : true;
}
