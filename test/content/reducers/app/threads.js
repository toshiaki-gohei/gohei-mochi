'use strict';
import assert from 'assert';
import reducer, { internal } from '~/content/reducers/app/threads';
import { F } from '~/common/util';

describe(__filename, () => {
    let state;
    beforeEach(() => state = F(new Map([
        [ 'url-thread01', F({ url: 'url-thread01', idipIndex: 'idip-index' }) ],
        [ 'url-thread02', F({ url: 'url-thread02' }) ],
        [ 'url-thread03', F({ url: 'url-thread03' }) ]
    ])));

    const APP = internal.APP;

    describe('export', () => {
        it('should export reducer', () => {
            let got = reducer();
            assert.deepStrictEqual(got, new Map());
        });
    });

    describe('reduce()', () => {
        const { reduce } = internal;

        it('should reduce state', () => {
            let apps = [
                { url: 'url-thread01',
                  messages: { viewer: '1234人くらい' },
                  postform: { action: 'post' },
                  delform: { action: 'del' },
                  delreq: { targets: new Map([ [ 'delreq01', null ] ]) } },
                { url: 'url-thread04' }
            ];
            let action = { apps };

            let got = reduce(state, action);
            let exp = new Map([
                [ 'url-thread01', {
                    ...APP,
                    url: 'url-thread01',
                    messages: {
                        viewer: '1234人くらい',
                        notice: null, warning: null, deletedPostCount: null
                    },
                    postform: { action: 'post', hiddens: [], comment: null, file: null },
                    delform: { action: 'del', targets: new Map() },
                    delreq: { targets: new Map([ [ 'delreq01', null ] ]) },
                    idipIndex: 'idip-index' } ],
                [ 'url-thread02', { url: 'url-thread02' } ],
                [ 'url-thread03', { url: 'url-thread03' } ],
                [ 'url-thread04', { ...APP, url: 'url-thread04' } ]
            ]);
            assert.deepStrictEqual(got, exp);
        });

        it('should reduce state if pass a app', () => {
            let app = {
                url: 'url-thread01',
                messages: { viewer: '1234人くらい' },
                postform: { action: 'post' },
                delform: { action: 'del' },
                delreq: { targets: new Map([ [ 'delreq01', null ] ]) }
            };
            let action = { app };

            let got = reduce(state, action);
            let exp = new Map([
                [ 'url-thread01', {
                    ...APP,
                    url: 'url-thread01',
                    messages: {
                        viewer: '1234人くらい',
                        notice: null, warning: null, deletedPostCount: null
                    },
                    postform: { action: 'post', hiddens: [], comment: null, file: null },
                    delform: { action: 'del', targets: new Map() },
                    delreq: { targets: new Map([ [ 'delreq01', null ] ]) },
                    idipIndex: 'idip-index' } ],
                [ 'url-thread02', { url: 'url-thread02' } ],
                [ 'url-thread03', { url: 'url-thread03' } ]
            ]);
            assert.deepStrictEqual(got, exp);
        });

        it('should do nothing if not change props', () => {
            let url = 'url-thread01';
            let app = {
                url,
                messages: { viewer: '1234人くらい' },
                postform: { action: 'post' },
                delform: { action: 'del' },
                delreq: { targets: new Map([ [ 'delreq01', null ] ]) }
            };
            let action = { app };
            let prev = reduce(state, action);

            app = { url };
            action = { app };
            let next = reduce(prev, action);

            let got = [ 'messages', 'postform', 'delform', 'delreq' ].every(prop => {
                return prev.get(url)[prop] === next.get(url)[prop];
            });
            assert(got);

            let { messages, postform, delform, delreq } = prev.get(url);
            app = { url, messages, postform, delform, delreq };
            action = { app };
            next = reduce(prev, action);

            got = [ 'messages', 'postform', 'delform', 'delreq' ].every(prop => {
                return prev.get(url)[prop] === next.get(url)[prop];
            });
            assert(got);
        });

        it('should ignore unknown properties', () => {
            let app = {
                url: 'url-thread01',
                postform: { action: 'post', hoge: 'hogehoge' },
                fuga: 'fugafuga'
            };
            let action = { app };

            let got = reduce(state, action);
            let exp = new Map([
                [ 'url-thread01', {
                    ...APP,
                    url: 'url-thread01',
                    postform: { action: 'post', hiddens: [], comment: null, file: null },
                    idipIndex: 'idip-index' } ],
                [ 'url-thread02', { url: 'url-thread02' } ],
                [ 'url-thread03', { url: 'url-thread03' } ]
            ]);
            assert.deepStrictEqual(got, exp);
        });

        it('should return state as it is if action is empty', () => {
            let got = reduce(state, {});
            assert(got === state);
        });

        it('should throw exception if thread url is null', () => {
            let action = { app: {} };
            let got;
            try { reduce(state, action); } catch (e) { got = e.message; }
            assert(got === 'url is required');
        });
    });
});
