'use strict';
import assert from 'assert';
import Index from '~/content/model/thread/idip-index';

describe(__filename, () => {
    describe('constructor', () => {
        it('should create index', () => {
            let index = new Index();
            assert(index);

            let got = Object.keys(index);
            assert(got.length === 0);
        });

        it('Object.seal()', done => {
            let index = new Index();
            try { index.foo = 'bar'; } catch (e) {
                assert(e instanceof TypeError);
                done();
            }
        });

        it('should create index if pass posts', () => {
            let posts = [
                { id: 'post01', userId: 'id01', userIp: 'ip01' },
                { id: 'post02', userId: 'id02', userIp: null },
                { id: 'post03', userId: null, userIp: 'ip02' },
                { id: 'post04', userId: null, userIp: null }
            ];

            let index = new Index(posts);

            let got = index.map;
            let exp = new Map([
                [ 'id01', [ 'post01' ] ],
                [ 'id02', [ 'post02' ] ],
                [ 'ip01', [ 'post01' ] ],
                [ 'ip02', [ 'post03' ] ]
            ]);
            assert.deepStrictEqual(got, exp);
            got = index.loadedPostCount;
            assert(got === 4);
        });
    });

    describe('update()', () => {
        it('should update', () => {
            let posts = [
                { id: 'post01', userId: 'id01', userIp: 'ip01' },
                { id: 'post02', userId: 'id02', userIp: null },
                { id: 'post03', userId: null, userIp: 'ip02' },
                { id: 'post04', userId: null, userIp: null },
                { id: 'post05', userId: 'id01', userIp: 'ip01' },
                { id: 'post06', userId: 'id02', userIp: null },
                { id: 'post07', userId: null, userIp: 'ip02' },
                { id: 'post08', userId: null, userIp: null }
            ];

            let index = new Index();
            index.update(posts);

            let got = index.map;
            let exp = new Map([
                [ 'id01', [ 'post01', 'post05' ] ],
                [ 'id02', [ 'post02', 'post06' ] ],
                [ 'ip01', [ 'post01', 'post05' ] ],
                [ 'ip02', [ 'post03', 'post07' ] ]
            ]);
            assert.deepStrictEqual(got, exp);
            got = index.loadedPostCount;
            assert(got === 8);
        });

        it('should update diff', () => {
            let posts = [
                { id: 'post01', userId: 'id01', userIp: null },
                { id: 'post02', userId: 'id02', userIp: null },
                { id: 'post03', userId: 'id03', userIp: null }
            ];
            let index = new Index();
            index.update(posts);

            assert(index.loadedPostCount === 3);

            posts = posts.concat([
                { id: 'post04', userId: 'id01', userIp: null },
                { id: 'post05', userId: 'id02', userIp: null },
                { id: 'post06', userId: 'id03', userIp: null }
            ]);
            index.update(posts);

            let got = index.map;
            let exp = new Map([
                [ 'id01', [ 'post01', 'post04' ] ],
                [ 'id02', [ 'post02', 'post05' ] ],
                [ 'id03', [ 'post03', 'post06' ] ]
            ]);
            assert.deepStrictEqual(got, exp);
            assert(index.loadedPostCount === 6);
        });
    });

    describe('countUp()', () => {
        let posts = [
            { id: 'post01', userId: 'id01', userIp: 'ip01' },
            { id: 'post02', userId: 'id02', userIp: null },
            { id: 'post03', userId: null, userIp: 'ip02' },
            { id: 'post04', userId: null, userIp: null },
            { id: 'post05', userId: 'id01', userIp: 'ip01' }
        ];

        it('should count up correctly', () => {
            let index = new Index(posts);

            let got = index.countUp('id01', 'post01');
            let exp = { current: 1, total: 2 };
            assert.deepStrictEqual(got, exp);
            got = index.countUp('id01', 'post05');
            exp = { current: 2, total: 2 };
            assert.deepStrictEqual(got, exp);

            got = index.countUp('id01', 'post02');
            exp = null;
            assert.deepStrictEqual(got, exp);
        });

        it('should return null if id or ip is unknown', () => {
            let index = new Index(posts);

            let got = index.countUp('id03', 'post01');
            let exp = null;
            assert.deepStrictEqual(got, exp);
        });

        it('should return null if args contain null', () => {
            let index = new Index(posts);

            assert(index.countUp(null, 'post01') === null);
            assert(index.countUp('post01', null) === null);
            assert(index.countUp(null, null) === null);

            assert(index.countUp('post01') === null);
            assert(index.countUp() === null);
        });
    });

    describe('retrieve()', () => {
        const posts = [
            { id: 'post01', userId: 'id01', userIp: 'ip01' },
            { id: 'post02', userId: 'id02', userIp: null },
            { id: 'post03', userId: null, userIp: 'ip02' },
            { id: 'post05', userId: 'id01', userIp: 'ip01' }
        ];

        it('should retrieve', () => {
            let index = new Index(posts);

            let got = index.retrieve('id01');
            let exp = [ 'post01', 'post05' ];
            assert.deepStrictEqual(got, exp);

            got = index.retrieve('id03');
            exp = [];
            assert.deepStrictEqual(got, exp);

            got = index.retrieve();
            exp = [];
            assert.deepStrictEqual(got, exp);
        });
    });
});
