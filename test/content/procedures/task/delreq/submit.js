'use strict';
import assert from 'assert';
import submit, { internal } from '~/content/procedures/task/delreq/submit';
import createStore from '~/content/reducers';
import { setAppTasksDelreqs } from '~/content/reducers/actions';
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
        let delreqs = [
            { post: 'may/b/123000' }, { post: 'may/b/123001' }, { post: 'may/b/123002' }
        ];
        store.dispatch(setAppTasksDelreqs(delreqs));
    });

    const getDelreq = postId => store.getState().app.tasks.delreqs.get(postId);

    describe('submit()', () => {
        let backup;
        beforeEach(() => backup = fetch.post);
        afterEach(() => fetch.post = backup);

        const post = 'may/b/123001';

        it('should set status while submitting', async () => {
            fetch.post = () => {
                let { status } = getDelreq(post);
                assert(status === 'posting');
                let text = '<body>登録しました</body>';
                return { ok: true, status: 200, statusText: 'OK', text };
            };

            await submit(store, { url: 'http://example.net', post });

            let delreq = getDelreq(post);
            assert(delreq.status === 'complete');
            let got = delreq.res;
            let exp = { ok: true, status: 200, statusText: 'OK' };
            assert.deepStrictEqual(got, exp);
        });

        it('should handle correctly if response is error of "200 OK"', async () => {
            fetch.post = () => ({ ok: true, status: 200, text: 'error content' });

            await submit(store, { url: 'http://example.net', post });

            let delreq = getDelreq(post);
            assert(delreq.status === 'error');
            let got = delreq.res;
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

        it('should submit delreq', async () => {
            server.on('request', (req, res) => {
                let body = Buffer.from([]);
                req.on('data', chunk => { body = Buffer.concat([ body, chunk ]); });
                req.on('end', () => {
                    let boundary = req.headers['content-type'].split('boundary=')[1];
                    let got = decode(body);
                    let exp = `\
--${boundary}
Content-Disposition: form-data; name="reason"

110
--${boundary}
Content-Disposition: form-data; name="mode"

post
--${boundary}
Content-Disposition: form-data; name="b"

b
--${boundary}
Content-Disposition: form-data; name="d"

123001
--${boundary}
Content-Disposition: form-data; name="dlv"

0
--${boundary}--
`.replace(/\n/g, '\r\n');
                    assert(got === exp);

                    res.writeHead(200, { 'Content-type': 'text/plain; charset=Shift_JIS' });
                    let sjis = encode('<body>登録しました</body>');
                    res.end(Buffer.from(sjis), 'binary');
                });
            });

            let delreq = {
                post: 'may/b/123001',
                url: getUrl(),
                form: {
                    reason: 110,
                    mode: 'post',
                    b: 'b', d: '123001',
                    dlv: '0'
                }
            };

            await submit(store, delreq);

            delreq = getDelreq('may/b/123001');
            assert(delreq.status === 'complete');
            let got = delreq.res;
            let exp = { ok: true, status: 200, statusText: 'OK' };
            assert.deepStrictEqual(got, exp);
        });
    });

    describe('isSuccess()', () => {
        const { isSuccess } = internal;

        it('should return true if succeed to delreq', () => {
            let html = `
<html><head><META HTTP-EQUIV="Content-type" CONTENT="text/html; charset=Shift_JIS">
<title>削除依頼フォーム</title>
</head><body>登録しました<a href="javascript:void(0);" onclick="history.go(-2);return(false);">戻る</a></body></html>
`.replace(/\n/g, '');
            let got = isSuccess(html);
            assert(got === true);
        });
    });

    describe('checkError()', () => {
        const { checkError } = internal;

        it('should set delreq failed message if already known error message', () => {
            let text = `
<html><head><META HTTP-EQUIV="Content-type" CONTENT="text/html; charset=Shift_JIS">
<title>削除依頼フォーム</title>
</head><body><br><br><hr size=1><br><br>
        <center><font color=red size=5><b>同じIPアドレスからの削除依頼があります<br><br></b></font></center>
        <br><br><hr size=1><a href="javascript:void(0);" onclick="history.go(-2);return(false);">戻る</a></body></html>
`.replace(/\n/g, '');
            let res = { ok: true, text };

            let got = checkError(res);
            let exp = {
                ok: false, text,
                statusText: '同じIPアドレスからの削除依頼があります'
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
