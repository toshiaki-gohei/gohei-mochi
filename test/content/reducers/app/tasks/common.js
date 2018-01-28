'use strict';
import assert from 'assert';
import * as common from '~/content/reducers/app/tasks/common';

describe(__filename, () => {
    describe('createRes()', () => {
        const { createRes } = common;

        it('should create res', () => {
            let got = createRes({ ok: true, status: 200 });
            let exp = { ok: true, status: 200, statusText: null };
            assert.deepStrictEqual(got, exp);
        });

        it('should return null if pass null', () => {
            let got = createRes(null);
            assert(got === null);
        });
    });

    describe('reduceRes()', () => {
        const { reduceRes } = common;

        it('should reduce res', () => {
            let prev = null;
            let next = { ok: true, status: 200 };

            let got = reduceRes(prev, next);
            let exp = { ok: true, status: 200, statusText: null };
            assert.deepStrictEqual(got, exp);
        });

        it('should return null if next is null', () => {
            let prev = { ok: true, status: 200 };
            let next = null;

            let got = reduceRes(prev, next);
            assert(got === null);
        });

        it('should return prev in some cases', () => {
            let prev = { ok: true, status: 200 };

            let got = reduceRes(prev, undefined);
            assert(got === prev);

            got = reduceRes(prev, prev);
            assert(got === prev);
        });
    });
});
