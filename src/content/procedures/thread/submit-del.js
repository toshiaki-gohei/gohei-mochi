'use strict';
import fetch from '~/content/util/fetch';
import FormData from '~/content/util/form-data';
import { textify } from '~/content/util/html';

export default submit;

export async function submit(store, { url, ...form }) {
    let fd = makeFormData(store, form);
    let opts = { headers: fd.headers, body: fd.blobify(), timeout: TIMEOUT };

    let res = await fetch.post(url, opts);

    if (isSuccess(res)) return res;

    return checkError(res);
}

const TIMEOUT = 60 * 1000;

function makeFormData(store, form) {
    let { posts = [], mode = 'usrdel', pwd = '', onlyimgdel } = form || {};

    let fd = new FormData();
    fd.set('mode', mode);
    fd.set('pwd', pwd);
    if (onlyimgdel != null) fd.set('onlyimgdel', onlyimgdel);

    let map = store.getState().domain.posts;
    for (let postId of posts) {
        let { no } = map.get(postId);
        fd.set(no, 'delete');
    }

    return fd;
}

function isSuccess(res) {
    let { ok, text } = res;

    if (!ok) return false;

    switch (true) {
    case /<META HTTP-EQUIV="refresh" content="0;URL=res\/\d+\.htm">/.test(text):
        return true;
    default:
        return false;
    }
}

function checkError(res) {
    let { ok, text } = res;

    if (!ok) return res;

    res.ok = false;

    switch (true) {
    case /<b>削除したい記事をチェックしてください<br>/.test(text):
        res.statusText = '削除したい記事をチェックしてください';
        break;
    case /<b>削除できる記事が見つからないかパスワードが間違っています<br>(.+)<br><a href=\/b\/futaba\.htm>/.test(text):
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
