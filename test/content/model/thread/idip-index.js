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
                { index: 1, userId: 'id01', userIp: 'ip01' },
                { index: 2, userId: 'id02', userIp: null },
                { index: 3, userId: null, userIp: 'ip02' },
                { index: 4, userId: null, userIp: null }
            ];

            let index = new Index(posts);

            let got = index.map;
            let exp = new Map([
                [ 'id01', [ 1 ] ],
                [ 'id02', [ 2 ] ],
                [ 'ip01', [ 1 ] ],
                [ 'ip02', [ 3 ] ]
            ]);
            assert.deepStrictEqual(got, exp);
            got = index.loadedPostCount;
            assert(got === 4);
        });
    });

    describe('update()', () => {
        it('should update', () => {
            let posts = [
                { index: 1, userId: 'id01', userIp: 'ip01' },
                { index: 2, userId: 'id02', userIp: null },
                { index: 3, userId: null, userIp: 'ip02' },
                { index: 4, userId: null, userIp: null },
                { index: 5, userId: 'id01', userIp: 'ip01' },
                { index: 6, userId: 'id02', userIp: null },
                { index: 7, userId: null, userIp: 'ip02' },
                { index: 8, userId: null, userIp: null }
            ];

            let index = new Index();
            index.update(posts);

            let got = index.map;
            let exp = new Map([
                [ 'id01', [ 1, 5 ] ],
                [ 'id02', [ 2, 6 ] ],
                [ 'ip01', [ 1, 5 ] ],
                [ 'ip02', [ 3, 7 ] ]
            ]);
            assert.deepStrictEqual(got, exp);
            got = index.loadedPostCount;
            assert(got === 8);
        });

        it('should update diff', () => {
            let posts = [
                { index: 1, userId: 'id01', userIp: null },
                { index: 2, userId: 'id02', userIp: null },
                { index: 3, userId: 'id03', userIp: null }
            ];
            let index = new Index();
            index.update(posts);

            assert(index.loadedPostCount === 3);

            posts = posts.concat([
                { index: 4, userId: 'id01', userIp: null },
                { index: 5, userId: 'id02', userIp: null },
                { index: 6, userId: 'id03', userIp: null }
            ]);
            index.update(posts);

            let got = index.map;
            let exp = new Map([
                [ 'id01', [ 1, 4 ] ],
                [ 'id02', [ 2, 5 ] ],
                [ 'id03', [ 3, 6 ] ]
            ]);
            assert.deepStrictEqual(got, exp);
            assert(index.loadedPostCount === 6);
        });
    });

    describe('countUp()', () => {
        let posts = [
            { index: 1, userId: 'id01', userIp: 'ip01' },
            { index: 2, userId: 'id02', userIp: null },
            { index: 3, userId: null, userIp: 'ip02' },
            { index: 4, userId: null, userIp: null },
            { index: 5, userId: 'id01', userIp: 'ip01' }
        ];

        it('should count up correctly', () => {
            let index = new Index(posts);

            let got = index.countUp('id01', 1);
            let exp = { current: 1, total: 2 };
            assert.deepStrictEqual(got, exp);
            got = index.countUp('id01', 5);
            exp = { current: 2, total: 2 };
            assert.deepStrictEqual(got, exp);

            got = index.countUp('id01', 2);
            exp = null;
            assert.deepStrictEqual(got, exp);
        });

        it('should return null if id or ip is unknown', () => {
            let index = new Index(posts);

            let got = index.countUp('id03', 1);
            let exp = null;
            assert.deepStrictEqual(got, exp);
        });

        it('should return null if args contain null', () => {
            let index = new Index(posts);

            assert(index.countUp(null, 1) === null);
            assert(index.countUp('id', null) === null);
            assert(index.countUp(null, null) === null);

            assert(index.countUp('id') === null);
            assert(index.countUp() === null);
        });
    });

    describe('retrieve()', () => {
        const posts = [
            { index: 1, userId: 'id01', userIp: 'ip01' },
            { index: 2, userId: 'id02', userIp: null },
            { index: 3, userId: null, userIp: 'ip02' },
            { index: 5, userId: 'id01', userIp: 'ip01' }
        ];

        it('should retrieve', () => {
            let index = new Index(posts);

            let got = index.retrieve('id01');
            let exp = [ 1, 5 ];
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
