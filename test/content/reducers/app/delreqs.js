'use strict';
import assert from 'assert';
import reducer, { internal } from '~/content/reducers/app/delreqs';
import { F } from '~/common/util';

describe(__filename, () => {
    let state;
    beforeEach(() => state = F(new Map([
        [ 'may/b/123000', F({ post: 'may/b/123000', url: 'url-delreq01' }) ],
        [ 'may/b/123001', F({ post: 'may/b/123001' }) ],
        [ 'may/b/123002', F({ post: 'may/b/123002' }) ]
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
            let delreqs = [
                { post: 'may/b/123000', status: 'complete', res: { ok: true, status: 200 } },
                { post: 'may/b/123003' }
            ];
            let action = { delreqs };

            let got = reduce(state, action);
            let exp = new Map([
                [ 'may/b/123000', {
                    post: 'may/b/123000', url: 'url-delreq01',
                    form: { reason: null, mode: null, b: null, d: null, dlv: null },
                    status: 'complete', res: { ok: true, status: 200, statusText: null } } ],
                [ 'may/b/123001', { post: 'may/b/123001' } ],
                [ 'may/b/123002', { post: 'may/b/123002' } ],
                [ 'may/b/123003',
                  { post: 'may/b/123003', url: null,
                    form: { reason: null, mode: null, b: null, d: null, dlv: null },
                    status: null, res: null } ]
            ]);
            assert.deepStrictEqual(got, exp);
        });

        it('should reduce state if pass a delreq', () => {
            let delreq = {
                post: 'may/b/123000', form: { b: 'b', d: '123000' }, status: 'stanby'
            };
            let action = { delreq };

            let got = reduce(state, action);
            let exp = new Map([
                [ 'may/b/123000', {
                    post: 'may/b/123000', url: 'url-delreq01',
                    form: { reason: null, mode: null, b: 'b', d: '123000', dlv: null },
                    status: 'stanby', res: null } ],
                [ 'may/b/123001', { post: 'may/b/123001' } ],
                [ 'may/b/123002', { post: 'may/b/123002' } ]
            ]);
            assert.deepStrictEqual(got, exp);
        });

        it('should ignore unknown properties', () => {
            let delreq = {
                post: 'may/b/123000',
                form: { b: 'b', d: '123000', hoge: 'hogehoge' },
                status: 'complete',
                res: { ok: true, status: 200, fuga: 'fugafuga' },
                piyo: 'piyopiyo'
            };
            let action = { delreq };

            let got = reduce(state, action);
            let exp = new Map([
                [ 'may/b/123000', {
                    post: 'may/b/123000', url: 'url-delreq01',
                    form: { reason: null, mode: null, b: 'b', d: '123000', dlv: null },
                    status: 'complete',
                    res: { ok: true, status: 200, statusText: null } } ],
                [ 'may/b/123001', { post: 'may/b/123001' } ],
                [ 'may/b/123002', { post: 'may/b/123002' } ]
            ]);
            assert.deepStrictEqual(got, exp);
        });

        it('should return state as it is if action is empty', () => {
            let got = reduce(state, {});
            assert(got === state);
        });

        it('should throw exception if there is no delreq id', () => {
            let action = { delreq: {} };
            let got;
            try { reduce(state, action); } catch (e) { got = e.message; }
            assert(got === 'post id is required');
        });
    });
});
