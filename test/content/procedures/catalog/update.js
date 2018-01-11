'use strict';
import assert from 'assert';
import update, { internal } from '~/content/procedures/catalog/update';
import createStore from '~/content/reducers';
import { setDomainCatalogs, setAppCatalogs } from '~/content/reducers/actions';
import { HttpRes } from '~/content/model';
import { setup, teardown, isBrowser } from '@/support/dom';
import createServer from '@/support/server';
import { pick, pluckFromMap as pluck } from '@/support/util';
import { F } from '~/common/util';
import fetch from '~/content/util/fetch';

describe(__filename, () => {
    before(() => setup());
    after(() => teardown());

    let store;
    beforeEach(() => store = createStore());

    const getCatalog = url => store.getState().domain.catalogs.get(url);
    const getApp = url => store.getState().app.catalogs.get(url);

    describe('update()', () => {
        let backup;
        beforeEach(() => backup = fetch.getCatalog);
        afterEach(() => fetch.getCatalog = backup);

        const url = 'url-catalog01';

        it('should update', async () => {
            let urls = [ 0, 1, 2, 3 ].map(i => `url-thread0${i}`);
            store = createStore({
                domain: {
                    threads: new Map([
                        [ urls[0], { url: urls[0], postnum: 100 } ],
                        [ urls[1], { url: urls[1], postnum: 50 } ],
                        [ urls[2], { url: urls[2], postnum: 0 } ]
                    ]),
                    catalogs: new Map([
                        [ url, { url, threads: [ urls[0], urls[1], urls[2] ] } ]
                    ])
                }
            });
            store.dispatch(setAppCatalogs({ url }));

            fetch.getCatalog = () => {
                let threads = [
                    { url: urls[1], postnum: 50 },
                    { url: urls[2], postnum: 10 },
                    { url: urls[3], postnum: 5 }
                ];
                let contents = { catalog: { threads } };
                return { ok: true, status: 200, contents };
            };

            await update(store, url, { sort: 3 });

            let { domain } = store.getState();
            let got = pluck(domain.threads, 'url', 'postnum', 'newPostnum');
            let exp = [
                { url: urls[0], postnum: 100, newPostnum: undefined },
                { url: urls[1], postnum: 50, newPostnum: 0 },
                { url: urls[2], postnum: 10, newPostnum: 10 },
                { url: urls[3], postnum: 5, newPostnum: null }
            ];
            assert.deepStrictEqual(got, exp);

            got = pick(domain.catalogs.get(url), 'url', 'threads', 'sort');
            exp = { url, threads: [ urls[1], urls[2], urls[3] ], sort: 3 };
            assert.deepStrictEqual(got, exp);
        });

        it('should update app', async () => {
            store.dispatch(setAppCatalogs({ url }));

            fetch.getCatalog = () => {
                let { sort } = getCatalog(url);
                assert(sort === 3);
                let { isUpdating } = getApp(url);
                assert(isUpdating === true);

                let headers = {
                    'last-modified': 'Sun, 01 Jan 2017 01:23:45 GMT',
                    'etag': '"123000"',
                    get(name) { return this[name]; }
                };
                let contents = { catalog: { threads: [] } };

                return { ok: true, status: 200, statusText: 'OK', headers, contents };
            };

            await update(store, url, { sort: 3 });

            let { sort } = getCatalog(url);
            assert(sort === 3);

            let { isUpdating, lastUpdatedByUser, updateHttpRes } = getApp(url);
            assert(isUpdating === false);

            let got = updateHttpRes;
            let exp = {
                status: 200, statusText: 'OK',
                lastModified: 'Sun, 01 Jan 2017 01:23:45 GMT',
                etag: '"123000"'
            };
            assert.deepEqual(got, exp);

            got = Math.ceil(lastUpdatedByUser / (1000 * 10));
            exp = Math.ceil(Date.now() / (1000 * 10));
            assert(got === exp);
        });

        it('should handle sort correctly', async () => {
            const getSort = url => getCatalog(url).sort;

            store.dispatch(setAppCatalogs({ url }));

            fetch.getCatalog = () => {
                let contents = { catalog: { threads: [] } };
                return { ok: true, status: 200, statusText: 'OK', contents };
            };

            store.dispatch(setDomainCatalogs({ url, sort: null }));
            await update(store, url);
            assert(getSort(url) === null);

            store.dispatch(setDomainCatalogs({ url, sort: 3 }));
            await update(store, url);
            assert(getSort(url) === null);

            store.dispatch(setDomainCatalogs({ url, sort: null }));
            await update(store, url, { sort: null });
            assert(getSort(url) === null);

            store.dispatch(setDomainCatalogs({ url, sort: 3 }));
            await update(store, url, { sort: null });
            assert(getSort(url) === null);

            store.dispatch(setDomainCatalogs({ url, sort: null }));
            await update(store, url, { sort: 3 });
            assert(getSort(url) === 3);

            store.dispatch(setDomainCatalogs({ url, sort: 1 }));
            await update(store, url, { sort: 3 });
            assert(getSort(url) === 3);
        });

        it('should update using current catalog url if not pass url', async () => {
            let appCatalogs = new Map([ [ url, { url } ] ]);
            store = createStore({
                app: { catalogs: appCatalogs, current: { catalog: url } }
            });

            fetch.getCatalog = requrl => {
                assert(requrl === url);
                let contents = { catalog: { threads: [] } };
                return { ok: true, status: 200, statusText: 'OK', contents };
            };

            await update(store);

            let { updateHttpRes: { status } } = getApp(url);
            assert(status === 200);
        });

        it('should set state correctly if network error occurs', async () => {
            let url = 'about:config';
            store.dispatch(setAppCatalogs({ url }));

            await update(store, url, { sort: 3 });

            let app = getApp(url);
            let { status, statusText } = app.updateHttpRes;
            assert(status === 499);
            assert(/^network error: .+/.test(statusText));

            let { sort } = getCatalog(url);
            assert(sort == 3);
            let { isUpdating } = app;
            assert(isUpdating === false);
        });

        it('should set state correctly if throw exception in fetch', async () => {
            let url = 'http://example.net';
            store.dispatch(setAppCatalogs({ url }));

            fetch.getCatalog = () => { throw new Error('unknown error'); };

            await update(store, url, { sort: 3 });

            let app = getApp(url);
            let { status, statusText } = app.updateHttpRes;
            assert(status === 499);
            assert(statusText === 'なんかエラーだって: unknown error');

            let { sort } = getCatalog(url);
            assert(sort == 3);
            let { isUpdating } = app;
            assert(isUpdating === false);
        });

        it('should throw exception if no request url', async () => {
            store = createStore({
                app: { current: { catalog: null } }
            });

            let got;
            try { await update(store); } catch (e) { got = e.message; }
            assert(got === 'request url is required');
        });
    });

    (isBrowser ? describe.skip : describe)('update(): use http server', () => {
        let server;
        beforeEach(async () => server = await createServer());
        afterEach(() => server.close());

        const getUrl = () => `http://localhost:${server.address().port}?mode=cat`;

        it('should update', async () => {
            server.on('request', (req, res) => {
                assert(req.url === '/?mode=cat&sort=3');

                res.writeHead(200, {
                    'Content-type': 'text/plain',
                    'Last-Modified': new Date('2017-01-01T10:23:45+09:00').toUTCString(),
                    'ETag': '"123000"'
                });
                res.end('<html><body><span id="tit">test-title</span></body></html>');
            });

            let url = getUrl();
            store.dispatch(setAppCatalogs({ url }));

            await update(store, url, { sort: 3 });

            let { title } = getCatalog(url);
            assert(title === 'test-title');

            let got = getApp(url).updateHttpRes;
            let exp = {
                status: 200, statusText: 'OK',
                lastModified: 'Sun, 01 Jan 2017 01:23:45 GMT',
                etag: '"123000"'
            };
            assert.deepEqual(got, exp);
        });

        it('should update if 304 Not Modified', async () => {
            server.on('request', (req, res) => {
                let got = req.headers['if-modified-since'];
                assert(got === 'Sun, 01 Jan 2017 01:23:45 GMT');
                got = req.headers['if-none-match'];
                assert(got === '"123000"');

                res.writeHead(304);
                res.end();
            });

            let url = getUrl();
            store.dispatch(setAppCatalogs({
                url,
                updateHttpRes: new HttpRes({
                    lastModified: 'Sun, 01 Jan 2017 01:23:45 GMT',
                    etag: '"123000"'
                })
            }));

            let initialState = store.getState();

            await update(store, url, { sort: 3 });

            let { domain } = store.getState();
            assert(domain.catalogs !== initialState.domain.catalogs);
            assert(domain.threads === initialState.domain.threads);

            let got = getApp(url).updateHttpRes;
            let exp = {
                status: 304, statusText: 'Not Modified',
                lastModified: 'Sun, 01 Jan 2017 01:23:45 GMT',
                etag: '"123000"'
            };
            assert.deepEqual(got, exp);
        });
    });

    describe('merge()', () => {
        const { merge } = internal;

        let urls = [ 0, 1, 2, 3 ].map(i => `url-thread0${i}`);

        it('should merge', () => {
            let storeThreads = F(new Map([
                [ urls[0], F({ url: urls[0], postnum: 100 }) ],
                [ urls[1], F({ url: urls[1], postnum: 50 }) ],
                [ urls[2], F({ url: urls[2], postnum: 0 }) ]
            ]));
            let newThreads = [
                { url: urls[1], postnum: 50 + 10 },
                { url: urls[3], postnum: 5 }
            ];

            let got = merge(storeThreads, newThreads);
            let exp = [
                { url: urls[1], postnum: 60, newPostnum: 10 },
                { url: urls[3], postnum: 5 }
            ];
            assert.deepStrictEqual(got, exp);
        });
    });
});