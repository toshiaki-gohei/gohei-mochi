'use strict';
import { setAppDelreqs } from '../../reducers/actions';
import fetch from '../../util/fetch';
import FormData from '../../util/form-data';
import { textify } from '../../util/html';

export default submit;

export async function submit(store, delreq) {
    let { post: id, url, form } = delreq;

    let fd = makeFormData(form);
    let opts = { headers: fd.headers, body: fd.blobify() };

    store.dispatch(setAppDelreqs({ post: id, status: 'posting' }));

    let res;
    try {
        res = await fetch.post(url, opts);
    } catch (e) {
        res = { ok: false, status: 499, statusText: `なんかエラーだって: ${e.message}` };
    }

    let status = null;
    if (!res.ok) {
        status = 'error';
    } else if (res.ok && isSuccess(res.text)) {
        status = 'complete';
    } else {
        status = 'error';
        res = checkError(res);
    }

    store.dispatch(setAppDelreqs({ post: id, status, res }));
}

function makeFormData(form) {
    let fd = new FormData();
    for (let name in form) {
        let value = form[name];
        fd.set(name, value);
    }
    return fd;
}

function isSuccess(html) {
    switch (true) {
    case /<body>登録しました/.test(html):
        return true;
    default:
        return false;
    }
}

function checkError(res) {
    let { text } = res;

    res.ok = false;

    switch (true) {
    case /<b>同じIPアドレスからの削除依頼があります<br>/.test(text):
        res.statusText = '同じIPアドレスからの削除依頼があります';
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
