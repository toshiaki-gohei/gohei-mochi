'use strict';
import { setAppTasksDelreqs } from '~/content/reducers/actions';
import fetch from '~/content/util/fetch';
import FormData from '~/content/util/form-data';
import { textify } from '~/content/util/html';

export default submit;

export async function submit(store, delreq) {
    let { post, url, form } = delreq;

    let fd = makeFormData(form);
    let opts = { headers: fd.headers, body: fd.blobify() };

    store.dispatch(setAppTasksDelreqs({ post, status: 'posting' }));

    let res = await fetch.post(url, opts);

    setResponse(store, res, delreq);
}

function makeFormData(form) {
    let fd = new FormData();
    for (let name in form) {
        let value = form[name];
        fd.set(name, value);
    }
    return fd;
}

function setResponse(store, res, delreq) {
    let status = null;

    if (isSuccess(res)) {
        status = 'complete';
    } else {
        status = 'error';
        res = checkError(res);
    }

    let { post } = delreq;
    store.dispatch(setAppTasksDelreqs({ post, status, res }));
}

function isSuccess(res) {
    let { ok, text } = res;

    if (!ok) return false;

    switch (true) {
    case /<body>登録しました/.test(text):
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
