'use strict';
import fetch from '../../util/fetch';
import { textify } from '../../util/html';

export default submit;

export async function submit(store, { url, formdata: fd }) {
    let opts = { headers: fd.headers, body: fd.blobify(), timeout: TIMEOUT };

    let res;
    try {
        res = await fetch.post(url, opts);
    } catch (e) {
        res = { ok: false, status: 499, statusText: `なんかエラーだって: ${e.message}` };
    }

    if (res.ok && !isSuccess(res.text)) return checkError(res);

    return res;
}

const TIMEOUT = 60 * 1000;

function isSuccess(html) {
    switch (true) {
    case /<body>.+スレッド<font.*?>\d+<\/font>に切り替えます.+<\/body>/.test(html):
        return true;
    default:
        return false;
    }
}

function checkError(res) {
    let { text } = res;

    res.ok = false;

    switch (true) {
    case /アップロードに失敗しました<br>同じ画像があります/.test(text):
        res.statusText = 'アップロードに失敗しました。同じ画像があります';
        break;
    case /<body>(cookieを有効にしてもう一度送信してください)<\/body>/.test(text):
        res.statusText = RegExp.$1;
        break;
    case /<div align=center><font color=red size=5><b>(.+?)<br><br>/.test(text):
        res.statusText = textify(RegExp.$1);
        break;
    case /<body.*?>(.+?)<\/body>/.test(text):
        res.statusText = textify(RegExp.$1);
        break;
    default:
        res.statusText = 'なんかエラーだって: console にレスポンスを出力';
        console.error('thread/submit#checkError():', text); // eslint-disable-line no-console
        break;
    }

    return res;
}

export const internal = {
    isSuccess,
    checkError
};
