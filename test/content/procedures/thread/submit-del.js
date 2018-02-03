'use strict';
import assert from 'assert';
import submit, { internal } from '~/content/procedures/thread/submit-del';
import createStore from '~/content/reducers';
import { setDomainPosts } from '~/content/reducers/actions';
import { encode, decode } from '~/content/util/encoding';
import { setup, teardown, isBrowser } from '@/support/dom';
import createServer from '@/support/server';
import fetch from '~/content/util/fetch';

describe(__filename, () => {
    before(() => setup());
    after(() => teardown());

    let store;
    beforeEach(() => {
        store = createStore();
        let posts = [ 123000, 123001, 123002 ]
            .map((no, index) => ({ id: `may/b/${no}`, index, no }));
        store.dispatch(setDomainPosts(posts));
    });

    describe('submit()', () => {
        let backup;
        beforeEach(() => backup = fetch.post);
        afterEach(() => fetch.post = backup);

        it('should handle correctly if response is error of "200 OK"', async () => {
            fetch.post = () => ({ ok: true, status: 200, text: 'error content' });

            let got = await submit(store, { url: 'http://example.net' });
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
Content-Disposition: form-data; name="mode"

usrdel
--${boundary}
Content-Disposition: form-data; name="pwd"

password
--${boundary}
Content-Disposition: form-data; name="123001"

delete
--${boundary}
Content-Disposition: form-data; name="123002"

delete
--${boundary}--
`.replace(/\n/g, '\r\n');
                    assert(got === exp);

                    res.writeHead(200, { 'Content-type': 'text/plain; charset=Shift_JIS' });
                    let sjis = encode(`
<META HTTP-EQUIV="refresh" content="0;URL=res/123456000.htm">
`.replace(/\n/g, ''));
                    res.end(Buffer.from(sjis), 'binary');
                });
            });

            let form = {
                posts: [ 'may/b/123001', 'may/b/123002' ],
                pwd: 'password'
            };

            let res = await submit(store, { url: getUrl(), ...form });
            assert(res.ok === true);
            assert(res.status === 200);
        });
    });

    describe('isSuccess()', () => {
        const { isSuccess } = internal;

        it('should return true if succeed to postdel', () => {
            let text = '<META HTTP-EQUIV="refresh" content="0;URL=res/123456000.htm">';
            let got = isSuccess({ ok: true, text });
            assert(got === true);
        });

        it('should return false if fail to submit', () => {
            let got = isSuccess({ ok: false });
            assert(got === false);
        });
    });

    describe('checkError()', () => {
        const { checkError } = internal;

        it('should set postdel failed message if already known error message', () => {
            let text = `
<html><head><META HTTP-EQUIV="Content-type" CONTENT="text/html; charset=Shift_JIS">
<title>二次元裏＠ふたば</title>
</head>
<body>
<br><br><hr size=1><br><br>
        <div align=center><font color=red size=5><b>削除したい記事をチェックしてください<br><br><a href=/b/futaba.htm>リロード</a></b></font></div>
        <br><br><hr size=1>
</body></html>
`.replace(/\n/g, '');

            let got = checkError({ ok: true, text });
            let exp = {
                ok: false, text,
                statusText: '削除したい記事をチェックしてください'
            };
            assert.deepStrictEqual(got, exp);

            text = `
<html><head><META HTTP-EQUIV="Content-type" CONTENT="text/html; charset=Shift_JIS">
<title>二次元裏＠ふたば</title>
</head>
<body>
<br><br><hr size=1><br><br>
        <div align=center><font color=red size=5><b>削除できる記事が見つからないかパスワードが間違っています<br>No.123001を削除する権限はありません<br><a href=/b/futaba.htm>リロード</a></b></font></div>
        <br><br><hr size=1>
</body></html>
`.replace(/\n/g, '');

            got = checkError({ ok: true, text });
            exp = {
                ok: false, text,
                statusText: '削除できる記事が見つからないかパスワードが間違っています。No.123001を削除する権限はありません'
            };
            assert.deepStrictEqual(got, exp);
        });

        it('should set parsed message if can parse response body', () => {
            let text = '<body>unknown <b>error</b> message</body>';

            let got = checkError({ ok: true, text });
            let exp = {
                ok: false, text,
                statusText: 'unknown error message'
            };
            assert.deepStrictEqual(got, exp);
        });

        it('should set res.ok false if response is unknown error message', () => {
            let text = 'unknown error message';

            let got = checkError({ ok: true, text });
            let exp = {
                ok: false, text,
                statusText: 'なんかエラーだって: console にレスポンスを出力'
            };
            assert.deepStrictEqual(got, exp);
        });

        it('should return res as it is if res.ok is false', () => {
            let res = { ok: false };
            let got = checkError(res);
            assert(got === res);
        });
    });
});
