'use strict';
import assert from 'assert';
import reducer, { internal } from '~/content/reducers/domain/posts';
import { F } from '~/common/util';

describe(__filename, () => {
    let state;
    beforeEach(() => state = F(new Map([
        [ 'may/b/123000', F({ id: 'may/b/123000', name: 'スレあき' }) ],
        [ 'may/b/123001', F({ id: 'may/b/123001', name: 'としあき1' }) ],
        [ 'may/b/123002', F({ id: 'may/b/123002', name: 'としあき2' }) ]
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
            let posts = [
                { id: 'may/b/123001', name: 'としあき1', sod: 1 },
                { id: 'may/b/123003', name: 'としあき3' }
            ];
            let action = { posts };

            let got = reduce(state, action);
            let exp = new Map([
                [ 'may/b/123000', { id: 'may/b/123000', name: 'スレあき' } ],
                [ 'may/b/123001', { id: 'may/b/123001', name: 'としあき1', sod: 1 } ],
                [ 'may/b/123002', { id: 'may/b/123002', name: 'としあき2' } ],
                [ 'may/b/123003', { id: 'may/b/123003', name: 'としあき3' } ]
            ]);
            assert.deepStrictEqual(got, exp);
        });

        it('should reduce state if pass a post', () => {
            let post = { id: 'may/b/123001', name: 'としあき1', sod: 2 };
            let action = { post };

            let got = reduce(state, action);
            let exp = new Map([
                [ 'may/b/123000', { id: 'may/b/123000', name: 'スレあき' } ],
                [ 'may/b/123001', { id: 'may/b/123001', name: 'としあき1', sod: 2 } ],
                [ 'may/b/123002', { id: 'may/b/123002', name: 'としあき2' } ]
            ]);
            assert.deepStrictEqual(got, exp);
        });

        it('should return state as it is if action is empty', () => {
            let got = reduce(state, {});
            assert(got === state);
        });

        it('should throw exception if there is no post id', () => {
            let action = { post: { id: null, no: '123003' } };
            let got;
            try { reduce(state, action); } catch (e) { got = e.message; }
            assert(got === 'post id is required: no=123003');
        });
    });
});
