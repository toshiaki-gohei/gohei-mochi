'use strict';
import assert from 'assert';
import submit, { internal } from '~/content/procedures/task/postdel/submit';
import createStore from '~/content/reducers';
import { setDomainPosts, setAppTasksPostdels } from '~/content/reducers/actions';
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
        let postdels = posts.map(({ id }) => ({ post: id }));
        store.dispatch(setDomainPosts(posts));
        store.dispatch(setAppTasksPostdels(postdels));
    });

    const getPostdel = postId => store.getState().app.tasks.postdels.get(postId);

    describe('submit()', () => {
        let backup;
        beforeEach(() => backup = fetch.post);
        afterEach(() => fetch.post = backup);

        const post = 'may/b/123001';

        it('should set status while submitting', async () => {
            fetch.post = () => {
                let { status } = getPostdel(post);
                assert(status === 'posting');
                let text = '<META HTTP-EQUIV="refresh" content="0;URL=res/123456000.htm">';
                return { ok: true, status: 200, statusText: 'OK', text };
            };

            await submit(store, { url: 'http://example.net', post });

            let postdel = getPostdel(post);
            assert(postdel.status === 'complete');
            let got = postdel.res;
            let exp = { ok: true, status: 200, statusText: 'OK' };
            assert.deepStrictEqual(got, exp);
        });

        it('should handle correctly if response is error of "200 OK"', async () => {
            fetch.post = () => ({ ok: true, status: 200, text: 'error content' });

            await submit(store, { url: 'http://example.net', post });

            let postdel = getPostdel(post);
            assert(postdel.status === 'error');
            let got = postdel.res;
            let exp = {
                ok: false, status: 200,
                statusText: 'なんかエラーだって: console にレスポンスを出力'
            };
            assert.deepStrictEqual(got, exp);
        });
    });

    (isBrowser ? describe.skip : describe)('submit(): use http server', () => {
        let server;
        beforeEach(async () => server = await createServer());
        afterEach(() => server.close());

        const getUrl = () => `http://localhost:${server.address().port}`;

        it('should submit postdel', async () => {
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
--${boundary}--
`.replace(/\n/g, '\r\n');
                    assert(got === exp);

                    res.writeHead(200, { 'Content-type': 'text/plain; charset=Shift_JIS' });
                    let sjis = encode('<META HTTP-EQUIV="refresh" content="0;URL=res/123456000.htm">');
                    res.end(Buffer.from(sjis), 'binary');
                });
            });

            let postdel = {
                post: 'may/b/123001',
                url: getUrl(),
                form: {
                    mode: 'usrdel',
                    onlyimgdel: null,
                    pwd: 'password'
                }
            };

            await submit(store, postdel);

            postdel = getPostdel('may/b/123001');
            assert(postdel.status === 'complete');
            let got = postdel.res;
            let exp = { ok: true, status: 200, statusText: 'OK' };
            assert.deepStrictEqual(got, exp);
        });
    });

    describe('isSuccess()', () => {
        const { isSuccess } = internal;

        it('should return true if succeed to postdel', () => {
            let html = '<META HTTP-EQUIV="refresh" content="0;URL=res/123456000.htm">';
            let got = isSuccess(html);
            assert(got === true);
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
            let res = { ok: true, text };

            let got = checkError(res);
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
            res = { ok: true, text };

            got = checkError(res);
            exp = {
                ok: false, text,
                statusText: '削除できる記事が見つからないかパスワードが間違っています。No.123001を削除する権限はありません'
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
