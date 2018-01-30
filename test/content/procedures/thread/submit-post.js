'use strict';
import assert from 'assert';
import submit, { internal } from '~/content/procedures/thread/submit-post';
import FormData from '~/content/util/form-data';
import { encode, decode } from '~/content/util/encoding';
import { setup, teardown, isBrowser } from '@/support/dom';
import createServer from '@/support/server';
import fetch from '~/content/util/fetch';

describe(__filename, () => {
    before(() => setup());
    after(() => teardown());

    const store = null;

    describe('submit()', () => {
        let backup;
        beforeEach(() => backup = fetch.post);
        afterEach(() => fetch.post = backup);

        const formdata = new FormData();

        it('should return response if network error occurs', async () => {
            let res = await submit(store, { url: 'about:config', formdata });

            let { ok, status, statusText } = res;
            assert(ok === false);
            assert(status === 499);
            assert(/^fetch error: .+/.test(statusText));
        });

        it('should handle correctly if response is error of "200 OK"', async () => {
            fetch.post = () => ({ ok: true, status: 200, text: 'error content' });

            let got = await submit(store, { url: 'http://example.net', formdata });
            let exp = {
                ok: false, status: 200,
                statusText: 'なんかエラーだって: console にレスポンスを出力',
                text: 'error content'
            };
            assert.deepStrictEqual(got, exp);
        });
    });

    (isBrowser ? describe.skip : describe)('submit(): use http server', () => {
        let server;
        beforeEach(async () => server = await createServer());
        afterEach(() => server.close());

        const getUrl = () => `http://localhost:${server.address().port}`;

        it('should submit post', async () => {
            server.on('request', (req, res) => {
                let body = Buffer.from([]);
                req.on('data', chunk => { body = Buffer.concat([ body, chunk ]); });
                req.on('end', () => {
                    let boundary = req.headers['content-type'].split('boundary=')[1];
                    let got = decode(body);
                    let exp = `\
--${boundary}
Content-Disposition: form-data; name="name"

cookie-name
--${boundary}
Content-Disposition: form-data; name="email"


--${boundary}
Content-Disposition: form-data; name="com"

test
--${boundary}
Content-Disposition: form-data; name="pwd"

cookie-pwd
--${boundary}--
`.replace(/\n/g, '\r\n');
                    assert(got === exp);

                    res.writeHead(200, { 'Content-type': 'text/plain; charset=Shift_JIS' });
                    let sjis = encode(`
更新延期  スレッド<font color="#dd0000">123456789</font>に切り替えます 処理時間0.123秒
`.replace(/\n/g, '\r\n'));
                    res.end(Buffer.from(sjis), 'binary');
                });
            });

            let fd = new FormData();
            fd.set('name', 'cookie-name');
            fd.set('email', '');
            fd.set('com', 'test');
            fd.set('pwd', 'cookie-pwd');

            let res = await submit(store, { url: getUrl(), formdata: fd });
            assert(res.status === 200);
        });
    });

    describe('isSuccess()', () => {
        const { isSuccess } = internal;

        it('should return true if succeed to post', () => {
            let html = `
<html>
<head></head>
<body>更新延期  スレッド<font color="#dd0000">123456789</font>に切り替えます 処理時間0.123秒</body>
</html>
`.replace(/\n/g, '');
            let got = isSuccess(html);
            assert(got === true);

            html = `
<html>
<head><META HTTP-EQUIV="refresh" content="1;URL=res/123456789.htm"></head>
<body> スレッド<font color="#dd0000">123456789</font>に切り替えます 処理時間0.123秒</body>
</html>
`.replace(/\n/g, '');
            got = isSuccess(html);
            assert(got === true);
        });

        it('should return true if succeed to post with image', () => {
            let html = `
<html>
<head></head>
<body>
画像 filename のアップロードが成功しました<br><br>
更新延期  スレッド<font color="#dd0000">123456789</font>に切り替えます 処理時間0.123秒
</body>
</html>
`.replace(/\n/g, '');
            let got = isSuccess(html);
            assert(got === true);
        });
    });

    describe('checkError()', () => {
        const { checkError } = internal;

        it('should set upload failed message if already known error message', () => {
            let text = `
<div align=center>
<font color=red size=5><b>アップロードに失敗しました<br>同じ画像があります<br>
<br>
<a href=/b/futaba.htm>リロード</a></b></font>
</div>
</html>
`.replace(/\n/g, '');
            let res = { ok: true, text };

            let got = checkError(res);
            let exp = {
                ok: false, text,
                statusText: 'アップロードに失敗しました。同じ画像があります'
            };
            assert.deepStrictEqual(got, exp);
        });

        it('should set cookie error message if already known error message', () => {
            let text = '<body>cookieを有効にしてもう一度送信してください</body>';
            let res = { ok: true, text };

            let got = checkError(res);
            let exp = {
                ok: false, text,
                statusText: 'cookieを有効にしてもう一度送信してください'
            };
            assert.deepStrictEqual(got, exp);
        });

        it('should set parsed message if can parse response', () => {
            let text = `
<body bgcolor="#FFFFEE"><p id="hdp"></p>
<hr width="90%" size=1>
<br><br><hr size=1><br><br>
        <div align=center><font color=red size=5><b>何か<br>書いて下さい<br><br><a href=/b/futaba.htm>リロード</a></b></font></div>
        <br><br><hr size=1></body></html>
`;
            let res = { ok: true, text };

            let got = checkError(res);
            let exp = {
                ok: false, text,
                statusText: '何か書いて下さい'
            };
            assert.deepStrictEqual(got, exp);
        });

        it('should set parsed message if can parse response body', () => {
            let text = '<body>unknown <b>error</b> message</body>';
            let res = { ok: true, text };

            let got = checkError(res);
            let exp = {
                ok: false, text,
                statusText: 'unknown error message'
            };
            assert.deepStrictEqual(got, exp);
        });

        it('should set res.ok false if response is unknown error message', () => {
            let text = 'unknown error message';
            let res = { ok: true, text };

            let got = checkError(res);
            let exp = {
                ok: false, text,
                statusText: 'なんかエラーだって: console にレスポンスを出力'
            };
            assert.deepStrictEqual(got, exp);
        });
    });
});
