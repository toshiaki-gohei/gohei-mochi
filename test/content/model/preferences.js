'use strict';
import assert from 'assert';
import * as pref from '~/content/model/preferences';
import { setup, teardown } from '@/support/dom';
import cookie from 'js-cookie';

describe(__filename, () => {
    before(() => setup());
    after(() => teardown());

    describe('create()', () => {
        const { create } = pref;

        it('should create preferences', () => {
            let got = create();
            let exp = {
                catalog: {
                    colnum: null, rownum: null,
                    title: { length: null, position: null },
                    thumb: { size: null }
                }
            };
            assert.deepStrictEqual(got, exp);
        });
    });

    describe('load()', () => {
        const { load } = pref;

        afterEach(() => cookie.remove('cxyl'));

        it('should load preferences from storage', () => {
            cookie.set('cxyl', '15x10x5x1x2');

            let got = load();
            let exp = {
                catalog: {
                    colnum: 15, rownum: 10,
                    title: { length: 5, position: 1 },
                    thumb: { size: 2 }
                }
            };
            assert.deepStrictEqual(got, exp);
        });

        it('should load preferences if storage is empty', () => {
            let got = load();
            let exp = {
                catalog: {
                    colnum: 14, rownum: 6,
                    title: { length: 4, position: 0 },
                    thumb: { size: 0 }
                }
            };
            assert.deepStrictEqual(got, exp);
        });
    });
});

describe(`${__filename}: Catalog`, () => {
    const { Catalog } = pref.internal;

    describe('create()', () => {
        it('should create preferences', () => {
            let got = Catalog.create();
            let exp = {
                colnum: null, rownum: null,
                title: { length: null, position: null },
                thumb: { size: null }
            };
            assert.deepStrictEqual(got, exp);
        });

        it('should create preferences if pass opts', () => {
            let got = Catalog.create({
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
            let got = Catalog.create({
                foo: 'ignore',
                title: { bar: 'ignore' }
            });
            let exp = Catalog.create();
            assert.deepStrictEqual(got, exp);
        });
    });

    describe('load()', () => {
        it('should create preferences from cookie', () => {
            let got = Catalog.load({ cxyl: '15x10x5x1x2' });
            let exp = {
                colnum: 15, rownum: 10,
                title: { length: 5, position: 1 },
                thumb: { size: 2 }
            };
            assert.deepStrictEqual(got, exp);
        });

        it('should create default preferences if no cookie', () => {
            let got = Catalog.load();
            let exp = {
                colnum: 14, rownum: 6,
                title: { length: 4, position: 0 },
                thumb: { size: 0 }
            };
            assert.deepStrictEqual(got, exp);
        });
    });
});
