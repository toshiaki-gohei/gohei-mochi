'use strict';
import assert from 'assert';
import * as pref from '~/content/model/preferences';

describe(__filename, () => {
    describe('create()', () => {
        const { create } = pref;

        it('should create preferences', () => {
            let got = create();
            let exp = {
                colnum: null, rownum: null,
                title: { length: null, position: null },
                thumb: { size: null }
            };
            assert.deepStrictEqual(got, exp);
        });

        it('should create preferences if pass opts', () => {
            let got = create({
                rownum: 10,
                title: { length: 4 },
                thumb: { size: 1 }
            });
            let exp = {
                colnum: null, rownum: 10,
                title: { length: 4, position: null },
                thumb: { size: 1 }
            };
            assert.deepStrictEqual(got, exp);
        });

        it('should ignore unknown properties', () => {
            let got = create({
                foo: 'ignore',
                title: { bar: 'ignore' }
            });
            let exp = create();
            assert.deepStrictEqual(got, exp);
        });
    });

    describe('load()', () => {
        const { load } = pref;

        it('should load cookie data', () => {
            let got = load('15x10x5x1x2');
            let exp = {
                colnum: 15, rownum: 10,
                title: { length: 5, position: 1 },
                thumb: { size: 2 }
            };
            assert.deepStrictEqual(got, exp);
        });

        it('should return defautl value if no cookie data', () => {
            let got = load();
            let exp = {
                colnum: 14, rownum: 6,
                title: { length: 4, position: 0 },
                thumb: { size: 0 }
            };
            assert.deepStrictEqual(got, exp);
        });
    });
});
