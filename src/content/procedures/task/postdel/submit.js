'use strict';
import { setAppTasksPostdels } from '~/content/reducers/actions';
import fetch from '~/content/util/fetch';
import FormData from '~/content/util/form-data';
import { textify } from '~/content/util/html';

export default submit;

export async function submit(store, postdel) {
    let { post, url, form } = postdel;

    let fd = makeFormData(store, post, form);
    let opts = { headers: fd.headers, body: fd.blobify() };

    store.dispatch(setAppTasksPostdels({ post, status: 'posting' }));

    let res = await fetch.post(url, opts);

    setResponse(store, res, postdel);
}

function makeFormData(store, postId, form) {
    let fd = new FormData();

    for (let name in form) {
        let value = form[name];
        if (value == null) continue;
        fd.set(name, value);
    }

    let { no } = store.getState().domain.posts.get(postId);
    fd.set(no, 'delete');

    return fd;
}

function setResponse(store, res, postdel) {
    let status = null;

    if (!res.ok) {
        status = 'error';
    } else if (res.ok && isSuccess(res.text)) {
        status = 'complete';
    } else {
        status = 'error';
        res = checkError(res);
    }

    let { post } = postdel;
    store.dispatch(setAppTasksPostdels({ post, status, res }));
}

function isSuccess(html) {
    switch (true) {
    case /<META HTTP-EQUIV="refresh" content="0;URL=res\/\d+\.htm">/.test(html):
        return true;
    default:
        return false;
    }
}

function checkError(res) {
    let { text } = res;

    res.ok = false;

    switch (true) {
    case /<b>削除したい記事をチェックしてください<br>/.test(text):
        res.statusText = '削除したい記事をチェックしてください';
        break;
    case /<b>削除できる記事が見つからないかパスワードが間違っています<br>(.+?)<br>/.test(text):
        res.statusText = '削除できる記事が見つからないかパスワードが間違っています。'
            + textify(RegExp.$1);
        break;
    case /<body.*?>(.+?)<\/body>/.test(text):
        res.statusText = textify(RegExp.$1);
        break;
    default:
        res.statusText = 'なんかエラーだって: console にレスポンスを出力';
        console.error('submit-post#checkError():', text); // eslint-disable-line no-console
        break;
    }

    return res;
}

export const internal = {
    isSuccess,
    checkError
};
