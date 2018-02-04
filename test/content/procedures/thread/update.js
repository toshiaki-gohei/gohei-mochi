'use strict';
import assert from 'assert';
import update, { internal } from '~/content/procedures/thread/update';
import createStore from '~/content/reducers';
import * as actions from '~/content/reducers/actions';
import * as model from '~/content/model';
import { setup, teardown, isBrowser } from '@/support/dom';
import createServer from '@/support/server';
import { pick, pluckFromMap as pluck } from '@/support/util';
import fetch from '~/content/util/fetch';

const { setDomainPosts, setDomainThreads, setAppThreads } = actions;
const { Post, HttpRes, thread: { Changeset } } = model;

describe(__filename, () => {
    before(() => setup());
    after(() => teardown());

    let store;
    beforeEach(() => store = createStore());

    const getApp = url => store.getState().app.threads.get(url);

    describe('update()', () => {
        let backup;
        beforeEach(() => backup = fetch.getThread);
        afterEach(() => fetch.getThread = backup);

        const url = 'https://may.2chan.net/b/res/123000.htm';

        it('should update', async () => {
            let posts = [ '100', '101', '102' ]
                .map((no, index) => new Post({ id: `may/b/${no}`, index, no }));
            let thread = { url, posts: [ 'may/b/101', 'may/b/102', 'may/b/103' ] };
            store.dispatch(setDomainPosts(posts));
            store.dispatch(setDomainThreads(thread));
            store.dispatch(setAppThreads({ url }));

            fetch.getThread = () => {
                let posts = [
                    { no: '100' },
                    { no: '101' },
                    { no: '102', sod: 1, raw: { header: 'changed' } },
                    { no: '103' }
                ];
                let contents = { thread: { posts } };
                return { ok: true, status: 200, contents };
            };

            await update(store, url);

            let { domain } = store.getState();
            let got = pluck(domain.posts, 'id', 'index', 'no', 'sod');
            let exp = [
                { id: 'may/b/100', index: 0, no: '100', sod: null },
                { id: 'may/b/101', index: 1, no: '101', sod: null },
                { id: 'may/b/102', index: 2, no: '102', sod: 1 },
                { id: 'may/b/103', index: 3, no: '103', sod: null }
            ];
            assert.deepStrictEqual(got, exp);

            got = pick(domain.threads.get(url), 'url', 'posts');
            exp = { url, posts: [ 'may/b/100', 'may/b/101', 'may/b/102', 'may/b/103' ] };
            assert.deepStrictEqual(got, exp);
        });

        it('should update app', async () => {
            store.dispatch(setDomainThreads({ url }));
            store.dispatch(setAppThreads({
                url, changeset: new Changeset({ newPostsCount: 1 })
            }));

            fetch.getThread = () => {
                let { changeset, isUpdating } = getApp(url);
                assert(changeset === null);
                assert(isUpdating === true);

                let headers = {
                    'last-modified': 'Sun, 01 Jan 2017 01:23:45 GMT',
                    'etag': '"123000"',
                    get(name) { return this[name]; }
                };
                let contents = { thread: { posts: [] } };

                return { ok: true, status: 200, statusText: 'OK', headers, contents };
            };

            await update(store, url);

            let {
                changeset, idipIndex,
                isUpdating, updatedAt, updateHttpRes
            } = getApp(url);

            assert(changeset);
            assert(idipIndex);
            assert(isUpdating === false);

            let got = updateHttpRes;
            let exp = {
                status: 200, statusText: 'OK',
                lastModified: 'Sun, 01 Jan 2017 01:23:45 GMT',
                etag: '"123000"'
            };
            assert.deepEqual(got, exp);

            got = Math.ceil(updatedAt / (1000 * 10));
            exp = Math.ceil(Date.now() / (1000 * 10));
            assert(got === exp);
        });

        it('should update using current thread url if not pass url', async () => {
            store = createStore({ app: { current: { thread: url } } });
            store.dispatch(setDomainThreads({ url }));
            store.dispatch(setAppThreads({
                url, changeset: new Changeset({ newPostsCount: 1 })
            }));

            fetch.getThread = requrl => {
                assert(requrl === url);
                let contents = { thread: { posts: [] } };
                return { ok: true, status: 200, statusText: 'OK', contents };
            };

            await update(store);

            let { updateHttpRes: { status } } = getApp(url);
            assert(status === 200);
        });

        it('should set state correctly if network error occurs', async () => {
            let url = 'about:config';
            store.dispatch(setAppThreads({ url, changeset: 'dummy data' }));

            await update(store, url);

            let app = getApp(url);
            let { status, statusText } = app.updateHttpRes;
            assert(status === 499);
            assert(/^fetch error: .+/.test(statusText));

            let { changeset, isUpdating } = app;
            assert(changeset == null);
            assert(isUpdating === false);
        });

        it('should throw exception if no request url', async () => {
            store = createStore({ app: { current: { thread: null } } });
            let got;
            try { await update(store); } catch (e) { got = e.message; }
            assert(got === 'request url is required');
        });
    });

    (isBrowser ? describe.skip : describe)('update(): use http server', () => {
        let server;
        beforeEach(async () => server = await createServer());
        afterEach(() => server.close());

        const getUrl = () => `http://localhost:${server.address().port}`;

        it('should update', async () => {
            server.on('request', (req, res) => {
                res.writeHead(200, {
                    'Content-type': 'text/plain',
                    'Last-Modified': new Date('2017-01-01T10:23:45+09:00').toUTCString(),
                    'ETag': '"123000"'
                });
                res.end('<html><body><span id="tit">test-title</span></body></html>');
            });

            let url = getUrl();
            store.dispatch(setDomainThreads({ url }));
            store.dispatch(setAppThreads({ url }));

            await update(store, url);

            let { domain } = store.getState();

            let { title } = domain.threads.get(url);
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
            store.dispatch(setDomainThreads({ url }));
            store.dispatch(setAppThreads({
                url,
                updateHttpRes: new HttpRes({
                    lastModified: 'Sun, 01 Jan 2017 01:23:45 GMT',
                    etag: '"123000"'
                })
            }));

            let initialState = store.getState();

            await update(store, url);

            let { domain } = store.getState();
            assert(domain === initialState.domain);

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

        it('should merge', () => {
            let storePosts = new Map([
                [ 'post0', new Post({ id: 'post0', index: 0, name: 'スレあき' }) ],
                [ 'post1', new Post({ id: 'post1', index: 1, name: 'としあき1' }) ]
            ]);
            let postsB = [
                { id: 'post0', index: 0, name: 'スレあき' },
                { id: 'post1', index: 1, name: 'としあき1',
                  userId: 'XXX', raw: { header: 'changed' } },
                { id: 'post2', index: 2, name: 'としあき2' }
            ].map(post => new Post(post));

            let { posts, changeset } = merge(storePosts, postsB);

            let got = posts.map(post => pick(post, 'index', 'name', 'userId'));
            let exp = [
                { index: 0, name: 'スレあき', userId: null },
                { index: 1, name: 'としあき1', userId: 'XXX' },
                { index: 2, name: 'としあき2', userId: null }
            ];
            assert.deepStrictEqual(got, exp);

            got = changeset;
            exp = {
                newPostsCount: 1,
                exposedIdPosts: [ { index: 1, no: null, userId: 'XXX', userIp: null } ],
                exposedIpPosts: [],
                deletedPosts: []
            };
            assert.deepEqual(got, exp);
        });
    });
});
