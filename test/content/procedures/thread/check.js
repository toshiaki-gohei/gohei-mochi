'use strict';
import assert from 'assert';
import { checkActive, internal } from '~/content/procedures/thread/check';
import createStore from '~/content/reducers';
import { setDomainThreads, setAppThreads } from '~/content/reducers/actions';
import { HttpRes } from '~/content/model';
import { setup, teardown, isBrowser } from '@/support/dom';
import createServer from '@/support/server';
import { pluckFromMap as pluck } from '@/support/util';
import fetch from '~/content/util/fetch';

describe(__filename, () => {
    before(() => setup());
    after(() => teardown());

    let store;
    beforeEach(() => store = createStore());

    const getThread = url => store.getState().domain.threads.get(url);
    const getApp = url => store.getState().app.threads.get(url);

    describe('checkActive()', () => {
        let backup;
        beforeEach(() => backup = fetch.get);
        afterEach(() => fetch.get = backup);

        const lastModified = 'Sun, 01 Jan 2017 01:23:00 GMT';

        it('should check', async () => {
            let urls = [
                'https://may.2chan.net/b/res/123000.htm',
                'https://may.2chan.net/b/res/123001.htm',
                'https://may.2chan.net/b/res/123002.htm',
                'https://may.2chan.net/b/res/123003.htm'
            ];
            store.dispatch(setDomainThreads([
                { url: urls[0], isActive: true },
                { url: urls[1], isActive: true },
                { url: urls[2], isActive: false },
                { url: urls[3], isActive: false }
            ]));
            store.dispatch(setAppThreads([
                { url: urls[0], httpRes: new HttpRes({ status: 200, lastModified }) },
                { url: urls[1], httpRes: new HttpRes({ status: 200, lastModified }) },
                { url: urls[2], httpRes: new HttpRes({ status: 404, lastModified }) },
                { url: urls[3], httpRes: new HttpRes({ status: 404, lastModified }) }
            ]));

            fetch.get = url => {
                let headers = {
                    'last-modified': 'Sun, 01 Jan 2017 01:23:45 GMT',
                    get(name) { return this[name]; }
                };

                switch (url) {
                case urls[0]:
                    return { ok: true, status: 200, headers };
                case urls[1]:
                    return { ok: false, status: 404, headers };
                default:
                    throw new Error('not reach here');
                }
            };

            await checkActive(store, { urls, sleepTime: 0 });

            let { domain, app } = store.getState();

            let got = pluck(domain.threads, 'url', 'isActive');
            let exp = [
                { url: urls[0], isActive: true },
                { url: urls[1], isActive: false },
                { url: urls[2], isActive: false },
                { url: urls[3], isActive: false }
            ];
            assert.deepStrictEqual(got, exp);

            got = pluck(app.threads, 'url', 'httpRes')
                .map(({ url, httpRes: { status, lastModified } }) => ({ url, status, lastModified }));
            exp = [
                { url: urls[0], lastModified, status: 200 },
                { url: urls[1], lastModified, status: 404 },
                { url: urls[2], lastModified, status: 404 },
                { url: urls[3], lastModified, status: 404 }
            ];
            assert.deepStrictEqual(got, exp);
        });
    });

    (isBrowser ? describe.skip : describe)('_checkActive(): use http server', () => {
        const { _checkActive } = internal;

        let server;
        beforeEach(async () => server = await createServer());
        afterEach(() => server.close());

        const getUrl = () => `http://localhost:${server.address().port}`;

        const httpRes = new HttpRes({
            status: 200, statusText: 'OK',
            lastModified: 'Sun, 01 Jan 2017 01:23:00 GMT',
            etag: '"123000"'
        });

        it('should set true to isActive if response is 200', async () => {
            server.on('request', (req, res) => {
                res.writeHead(200, {
                    'Content-type': 'text/plain',
                    'Last-Modified': new Date('2017-01-01T10:23:45+09:00').toUTCString(),
                    'ETag': '"123450"'
                });
                res.end();
            });

            let url = getUrl();
            store.dispatch(setDomainThreads({ url }));
            store.dispatch(setAppThreads({ url, httpRes }));

            await _checkActive(store, url);

            let { isActive } = getThread(url);
            assert(isActive === true);

            let got = getApp(url).httpRes;
            let exp = {
                status: 200, statusText: 'OK',
                lastModified: 'Sun, 01 Jan 2017 01:23:00 GMT',
                etag: '"123000"'
            };
            assert.deepEqual(got, exp);
        });

        it('should set false to isActive if response is 404', async () => {
            server.on('request', (req, res) => {
                res.writeHead(404, {
                    'Content-type': 'text/plain',
                    'Last-Modified': new Date('2017-01-01T10:23:45+09:00').toUTCString(),
                    'ETag': '"123450"'
                });
                res.end();
            });

            let url = getUrl();
            store.dispatch(setDomainThreads({ url }));
            store.dispatch(setAppThreads({ url, httpRes }));

            await _checkActive(store, url);

            let { isActive } = getThread(url);
            assert(isActive === false);

            let got = getApp(url).httpRes;
            let exp = {
                status: 404, statusText: 'Not Found',
                lastModified: 'Sun, 01 Jan 2017 01:23:00 GMT',
                etag: '"123000"'
            };
            assert.deepEqual(got, exp);
        });
    });
});
