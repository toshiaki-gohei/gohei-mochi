'use strict';
import assert from 'assert';
import reducer, { internal } from '~/content/reducers/app/tasks/postdels';
import { F } from '~/common/util';

describe(__filename, () => {
    let state;
    beforeEach(() => state = F(new Map([
        [ 'may/b/123000', F({ post: 'may/b/123000', url: 'url-postdel01' }) ],
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
            let postdels = [
                { post: 'may/b/123000', status: 'complete', res: { ok: true, status: 200 } },
                { post: 'may/b/123003' }
            ];
            let action = { postdels };

            let got = reduce(state, action);
            let exp = new Map([
                [ 'may/b/123000', {
                    post: 'may/b/123000', url: 'url-postdel01',
                    form: { mode: null, onlyimgdel: null, pwd: null },
                    status: 'complete', res: { ok: true, status: 200, statusText: null } } ],
                [ 'may/b/123001', { post: 'may/b/123001' } ],
                [ 'may/b/123002', { post: 'may/b/123002' } ],
                [ 'may/b/123003', {
                    post: 'may/b/123003', url: null,
                    form: { mode: null, onlyimgdel: null, pwd: null },
                    status: null, res: null } ]
            ]);
            assert.deepStrictEqual(got, exp);
        });

        it('should reduce state if pass a postdel', () => {
            let postdel = {
                post: 'may/b/123000', form: { mode: 'usrdel', pwd: 'password' }, status: 'stanby'
            };
            let action = { postdel };

            let got = reduce(state, action);
            let exp = new Map([
                [ 'may/b/123000', {
                    post: 'may/b/123000', url: 'url-postdel01',
                    form: { mode: 'usrdel', onlyimgdel: null, pwd: 'password' },
                    status: 'stanby', res: null } ],
                [ 'may/b/123001', { post: 'may/b/123001' } ],
                [ 'may/b/123002', { post: 'may/b/123002' } ]
            ]);
            assert.deepStrictEqual(got, exp);
        });


        it('should do nothing if not change props', () => {
            let post = 'may/b/123000';
            let postdel = {
                post, form: { mode: 'usrdel', pwd: 'password' }, res: { ok: true, status: 200 }
            };
            let action = { postdel };
            let prev = reduce(state, action);

            postdel = { post };
            action = { postdel };
            let next = reduce(prev, action);

            let got = [ 'form', 'res' ].every(prop => {
                return prev.get(post)[prop] === next.get(post)[prop];
            });
            assert(got);

            let { form, res } = prev.get(post);
            postdel = { post, form, res };
            action = { postdel };
            next = reduce(prev, action);

            got = [ 'form', 'res' ].every(prop => {
                return prev.get(post)[prop] === next.get(post)[prop];
            });
            assert(got);
        });

        it('should ignore unknown properties', () => {
            let postdel = {
                post: 'may/b/123000',
                form: { mode: 'usrdel', pwd: 'password', hoge: 'hogehoge' },
                status: 'complete',
                res: { ok: true, status: 200, fuga: 'fugafuga' },
                piyo: 'piyopiyo'
            };
            let action = { postdel };

            let got = reduce(state, action);
            let exp = new Map([
                [ 'may/b/123000', {
                    post: 'may/b/123000', url: 'url-postdel01',
                    form: { mode: 'usrdel', onlyimgdel: null, pwd: 'password' },
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

        it('should throw exception if there is no postdel id', () => {
            let action = { postdel: {} };
            let got;
            try { reduce(state, action); } catch (e) { got = e.message; }
            assert(got === 'post id is required');
        });
    });
});
