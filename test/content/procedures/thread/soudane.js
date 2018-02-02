'use strict';
import assert from 'assert';
import soudane, { internal } from '~/content/procedures/thread/soudane';
import createStore from '~/content/reducers';
import { Post } from '~/content/model';
import { setup, teardown, isBrowser } from '@/support/dom';
import createServer from '@/support/server';
import { pick, pluckFromMap as pluck } from '@/support/util';

describe(__filename, () => {
    before(() => setup());
    after(() => teardown());

    let store;
    beforeEach(() => {
        let posts = [
            { id: 'may/b/123000', index: 0, name: 'スレあき' },
            { id: 'may/b/123001', index: 1, name: 'としあき1' },
            { id: 'may/b/123002', index: 2, name: 'としあき2' }
        ].map(opts => new Post(opts));

        store = createStore({
            domain: {
                posts: new Map(posts.map(post => [ post.id, post ])),
                threads: new Map([
                    [ 'url-thread01', { url: 'url-thread01', posts: posts.map(({ id }) => id) } ]
                ])
            },
            app: {
                current: { thread: 'url-thread01' }
            }
        });
    });

    const getPosts = () => store.getState().domain.posts;

    (isBrowser ? describe.skip : describe)('soudane(): use http server', () => {
        let server;
        beforeEach(async () => server = await createServer());
        afterEach(() => server.close());

        const getUrl = () => `http://localhost:${server.address().port}`;

        it('should soudane', async () => {
            server.on('request', (req, res) => {
                res.writeHead(200, { 'Content-type': 'text/plain; charset=Shift_JIS' });
                res.end(Buffer.from('10'), 'binary');
            });

            let res = await soudane(store, { id: 'may/b/123001', url: getUrl() });

            let got = pick(res, 'ok', 'status');
            let exp = { ok: true, status: 200 };
            assert.deepStrictEqual(got, exp);

            got = pluck(getPosts(), 'index', 'name', 'sod');
            exp = [
                { index: 0, name: 'スレあき', sod: null },
                { index: 1, name: 'としあき1', sod: 10 },
                { index: 2, name: 'としあき2', sod: null }
            ];
            assert.deepStrictEqual(got, exp);
        });

        it('should do nothing if response is error', async () => {
            server.on('request', (req, res) => {
                res.writeHead(404, { 'Content-type': 'text/plain; charset=Shift_JIS' });
                res.end(Buffer.from('error'), 'binary');
            });

            let initial = getPosts();

            let res = await soudane(store, { id: 'may/b/123001', url: getUrl() });

            let got = pick(res, 'ok', 'status', 'text');
            let exp = {
                ok: false,
                status: 404,
                text: 'error'
            };
            assert.deepStrictEqual(got, exp);

            got = getPosts();
            assert(got === initial);
        });

        it('should do nothing if response is not number', async () => {
            server.on('request', (req, res) => {
                res.writeHead(200, { 'Content-type': 'text/plain; charset=Shift_JIS' });
                res.end(Buffer.from('error'), 'binary');
            });

            let initial = getPosts();

            let res = await soudane(store, { id: 'may/b/123001', url: getUrl() });

            let got = pick(res, 'ok', 'status', 'statusText', 'text');
            let exp = {
                ok: false,
                status: 200,
                statusText: 'could not parse res.text',
                text: 'error'
            };
            assert.deepStrictEqual(got, exp);

            got = getPosts();
            assert(got === initial);
        });
    });

    describe('sodurl()', () => {
        const { sodurl } = internal;

        it('should return sod url', () => {
            let url = 'https://may.2chan.net/b/res/123456789.htm';
            let post = { no: '12345' };

            let got = sodurl(url, post);
            assert(got === 'https://may.2chan.net/sd.php?b.12345');
        });

        it('should throw exception if not specify two arguments', () => {
            let got;
            try {
                sodurl('http://example.net');
            } catch (e) { got = e.message; }

            assert(got === 'two arguments are required');
        });
    });
});
