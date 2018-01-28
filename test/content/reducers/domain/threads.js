'use strict';
import assert from 'assert';
import reducer, { internal } from '~/content/reducers/domain/threads';
import { F } from '~/common/util';

describe(__filename, () => {
    let state;
    beforeEach(() => state = F(new Map([
        [ 'url-thread01', F({ url: 'url-thread01', title: 'title-thread01' }) ],
        [ 'url-thread02', F({ url: 'url-thread02' }) ],
        [ 'url-thread03', F({ url: 'url-thread03' }) ]
    ])));

    describe('export', () => {
        it('should export reducer', () => {
            let got = reducer();
            assert.deepStrictEqual(got, new Map());
        });
    });

    describe('reduce()', () => {
        const { reduce } = internal;

        it('should reduce state', () => {
            let threads = [
                { url: 'url-thread01', posts: [ 'may/b/123000' ] },
                { url: 'url-thread04' }
            ];
            let action = { threads };

            let got = reduce(state, action);
            let exp = new Map([
                [ 'url-thread01', {
                    url: 'url-thread01', title: 'title-thread01',
                    posts: [ 'may/b/123000' ], expire: null,
                    postnum: null, newPostnum: null, thumb: null } ],
                [ 'url-thread02', { url: 'url-thread02' } ],
                [ 'url-thread03', { url: 'url-thread03' } ],
                [ 'url-thread04', {
                    url: 'url-thread04', title: null,
                    posts: [], expire: null,
                    postnum: null, newPostnum: null, thumb: null } ]
            ]);
            assert.deepStrictEqual(got, exp);
        });

        it('should reduce state if pass a thread', () => {
            let thread = {
                url: 'url-thread01',
                posts: [ 'may/b/123000', 'may/b/123001' ],
                expire: { message: '12:34頃消えます' },
                thumb: { url: 'thumb01' }
            };
            let action = { thread };

            let got = reduce(state, action);
            let exp = new Map([
                [ 'url-thread01', {
                    url: 'url-thread01', title: 'title-thread01',
                    posts: [ 'may/b/123000', 'may/b/123001' ],
                    expire: { message: '12:34頃消えます', date: null },
                    postnum: null, newPostnum: null,
                    thumb: { url: 'thumb01', width: null, height: null } } ],
                [ 'url-thread02', { url: 'url-thread02' } ],
                [ 'url-thread03', { url: 'url-thread03' } ]
            ]);
            assert.deepStrictEqual(got, exp);
        });

        it('should do nothing if not change props', () => {
            let url = 'url-thread01';
            let thread = {
                url,
                expire: { message: '12:34頃消えます' },
                thumb: { url: 'thumb01' }
            };
            let action = { thread };
            let prev = reduce(state, action);

            let { expire, thumb } = prev.get(url);
            thread = { url, expire, thumb };
            action = { thread };
            let next = reduce(prev, action);

            let got = [ 'expire', 'thumb' ].every(prop => {
                return prev.get(url)[prop] === next.get(url)[prop];
            });
            assert(got);
        });

        it('should ignore unknown properties', () => {
            let thread = {
                url: 'url-thread01',
                expire: { message: '12:34頃消えます', hoge: 'hogehoge' },
                fuga: 'fugafuga'
            };
            let action = { thread };

            let got = reduce(state, action);
            let exp = new Map([
                [ 'url-thread01', {
                    url: 'url-thread01', title: 'title-thread01',
                    posts: [],
                    expire: { message: '12:34頃消えます', date: null },
                    postnum: null, newPostnum: null, thumb: null } ],
                [ 'url-thread02', { url: 'url-thread02' } ],
                [ 'url-thread03', { url: 'url-thread03' } ]
            ]);
            assert.deepStrictEqual(got, exp);
        });

        it('should return state as it is if action is empty', () => {
            let got = reduce(state, {});
            assert(got === state);
        });

        it('should throw exception if there is no thread url', () => {
            let action = { thread: {} };
            let got;
            try { reduce(state, action); } catch (e) { got = e.message; }
            assert(got === 'thread url is required');
        });
    });
});
