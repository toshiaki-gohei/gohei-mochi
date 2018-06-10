'use strict';
import assert from 'assert';
import fetch, { internal } from '~/content/util/fetch';
import { decode } from '~/content/util/encoding';
import FormData from '~/content/util/form-data';
import { setup, teardown, isBrowser } from '@/support/dom';
import createServer from '@/support/server';

describe(__filename, () => {
    before(() => setup());
    after(() => teardown());

    describe('get()', () => {
        it('should not throw exception if network error occurs', async () => {
            let res = await fetch.get('about:config');
            assert(res.ok === false);
            assert(res.status === 499);
            assert(/^fetch error: .+/.test(res.statusText));
        });
    });

    (isBrowser ? describe.skip : describe)('get(): use http server', () => {
        let server;
        beforeEach(async () => server = await createServer());
        afterEach(() => server.close());

        const url = () => `http://localhost:${server.address().port}`;

        it('should get', async () => {
            server.on('request', (req, res) => {
                res.writeHead(200, { 'Content-type': 'text/html' });
                res.end('テスト');
            });

            let res = await fetch.get(url());
            assert(res.ok === true);
            assert(res.status === 200);
            assert(res.text === 'テスト');
        });

        it('should get headers', async () => {
            server.on('request', (req, res) => {
                res.writeHead(200, {
                    'Content-type': 'text/plain',
                    'Last-Modified': new Date('2017-01-01T10:23:45+09:00').toUTCString(),
                    'ETag': '"123000"'
                });
                res.end('テスト');
            });

            let res = await fetch.get(url());
            assert(res.ok === true);
            assert(res.status === 200);
            assert(res.text === 'テスト');

            let got = res.headers.get('last-modified');
            assert(got === 'Sun, 01 Jan 2017 01:23:45 GMT');
            got = res.headers.get('etag');
            assert(got === '"123000"');
        });

        it('should get shift-jis content', async () => {
            server.on('request', (req, res) => {
                res.writeHead(200, { 'Content-type': 'text/html; charset=Shift_JIS' });
                res.end(Buffer.from([0x83, 0x65, 0x83, 0x58, 0x83, 0x67]), 'binary');
            });

            let res = await fetch.get(url());
            assert(res.ok === true);
            assert(res.status === 200);
            assert(res.text === 'テスト');
        });

        it('should get unknown mime', async () => {
            server.on('request', (req, res) => {
                res.writeHead(200, { 'Content-type': 'unknown' });
                res.end();
            });

            let res = await fetch.get(url());
            assert(res.ok === true);
            assert(res.status === 200);
        });

        it('should set request header correctly', async () => {
            server.on('request', (req, res) => {
                let got = req.headers['if-modified-since'];
                assert(got === 'Sun, 01 Jan 2017 01:23:45 GMT');
                got = req.headers['if-none-match'];
                assert(got === '"123000"');

                res.writeHead(304);
                res.end();
            });

            let opts = {
                headers: {
                    'if-modified-since': 'Sun, 01 Jan 2017 01:23:45 GMT',
                    'if-none-match': '"123000"'
                }
            };

            let res = await fetch.get(url(), opts);
            assert(res.ok === false);
            assert(res.status === 304);
        });

        it('should handle response if status is not 2xx', async () => {
            server.on('request', (req, res) => {
                res.writeHead(404, { 'Content-type': 'text/plain' });
                res.end('page not found');
            });

            let res = await fetch.get(url());
            assert(res.ok === false);
            assert(res.status === 404);
            assert(res.text === 'page not found');
        });

        it.skip('should be timeout if request takes time', async () => {
            let svr;
            let p = new Promise(resolve => {
                svr = res => {
                    res.writeHead(200, { 'Content-type': 'text/html' });
                    res.end();
                    resolve();
                };
            });
            server.on('request', (req, res) => {
                setTimeout(svr, 100, res);
            });

            let res = await fetch.get(url(), { timeout: 50 });
            assert(res.ok === false);
            assert(res.status === 599);
            assert(res.statusText === 'request timeout');

            return p;
        });
    });

    (isBrowser ? describe.skip : describe)('getThread(): use http server', () => {
        let server;
        beforeEach(async () => server = await createServer());
        afterEach(() => server.close());

        const url = () => `http://localhost:${server.address().port}`;

        it('should get thread', async () => {
            server.on('request', (req, res) => {
                res.writeHead(200, { 'Content-type': 'text/plain' });
                res.end(`
<html><body>
<span id="tit">タイトル</span>
<div class="thre"><input type="checkbox"><font color="#cc1105"><b>無念</b></font>
Name <font color="#117743"><b>スレあき </b></font> 17/01/01(日)01:23:45 No.123000000 <a class="del">del</a><a class="sod">+</a>
<blockquote>本文</blockquote>
<table border="0"></table>
</div>
</body></html>`);
            });

            let res = await fetch.getThread(url());
            assert(res.status === 200);
            let got = res.contents.thread.title;
            assert(got === '本文');
        });
    });

    (isBrowser ? describe.skip : describe)('getCatalog(): use http server', () => {
        let server;
        beforeEach(async () => server = await createServer());
        afterEach(() => server.close());

        const url = () => `http://localhost:${server.address().port}`;

        it('should get', async () => {
            server.on('request', (req, res) => {
                res.writeHead(200, { 'Content-type': 'text/plain' });
                res.end('<html><body><span id="tit">test-title</span></body></html>');
            });

            let res = await fetch.getCatalog(url());
            assert(res.status === 200);
            let got = res.contents.catalog.title;
            assert(got === 'test-title');
        });
    });

    describe('post()', () => {
        it('should throw not exception if network error occurs', async () => {
            let res = await fetch.post('about:config');
            assert(res.ok === false);
            assert(res.status === 499);
            assert(/^fetch error: .+/.test(res.statusText));
        });
    });

    (isBrowser ? describe.skip : describe)('post(): use http server', () => {
        let server;
        beforeEach(async () => server = await createServer());
        afterEach(() => server.close());

        const url = () => `http://localhost:${server.address().port}`;

        it('should post', async () => {
            server.on('request', (req, res) => {
                let body = Buffer.from([]);
                req.on('data', chunk => { body = Buffer.concat([ body, chunk ]); });
                req.on('end', () => {
                    let got = req.headers['content-type'];
                    let exp = 'multipart/form-data; boundary=--';
                    assert(got === exp);

                    got = decode(body);
                    exp = `\
----
Content-Disposition: form-data; name="test"
Content-Type: text/plain; charset=Shift_JIS

テスト
------
`.replace(/\n/g, '\r\n');
                    assert(got === exp);

                    res.writeHead(200, { 'Content-type': 'text/html; charset=Shift_JIS' });
                    res.end(Buffer.from([0x83, 0x65, 0x83, 0x58, 0x83, 0x67]), 'binary');
                });
            });

            let fd = new FormData();
            fd._boundary = '--';
            fd.append('test', 'テスト');

            let headers = fd.headers;
            let body = fd.blobify();

            let res = await fetch.post(url(), { headers, body });
            assert(res.status === 200);
            assert(res.text === 'テスト');
        });

        it.skip('should be timeout if request takes time', async () => {
            let svr;
            let p = new Promise(resolve => {
                svr = res => {
                    res.writeHead(200, { 'Content-type': 'text/html' });
                    res.end();
                    resolve();
                };
            });
            server.on('request', (req, res) => {
                setTimeout(svr, 100, res);
            });

            let res = await fetch.post(url(), { timeout: 50 });
            assert(res.ok === false);
            assert(res.status === 599);
            assert(res.statusText === 'request timeout');

            return p;
        });
    });

    describe('mime()', () => {
        const { mime } = internal;

        it('should return mime correctly', () => {
            let got = mime('text/html; charset=UTF-8');
            let exp = { type: 'text/html', charset: 'utf-8' };
            assert.deepStrictEqual(got, exp);
            got = mime('text/javascript; charset=utf_8');
            exp = { type: 'text/javascript', charset: 'utf-8' };
            assert.deepStrictEqual(got, exp);

            got = mime('text/html');
            exp = { type: 'text/html', charset: 'utf-8' };
            assert.deepStrictEqual(got, exp);
            got = mime('text/html; charset=Shift_JIS');
            exp = { type: 'text/html', charset: 'shift-jis' };
            assert.deepStrictEqual(got, exp);

            got = mime('application/javascript');
            exp = { type: 'application/javascript', parameter: null };
            assert.deepStrictEqual(got, exp);
        });
    });
});
