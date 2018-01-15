'use strict';
import assert from 'assert';
import * as preferences from '~/content/model/preferences';
import { setup, teardown } from '@/support/dom';
import cookie from 'js-cookie';

const { Catalog, Video } = preferences.internal;

describe(__filename, () => {
    before(() => setup());
    after(() => teardown());

    afterEach(() => dispose());

    describe('create()', () => {
        const { create } = preferences;

        it('should create preferences', () => {
            let got = create();
            let exp = {
                catalog: {
                    colnum: null, rownum: null,
                    title: { length: null, position: null },
                    thumb: { size: null }
                },
                video: { loop: null, muted: null, volume: null }
            };
            assert.deepStrictEqual(got, exp);
        });
    });

    describe('load()', () => {
        const { load } = preferences;

        it('should load preferences from storage', () => {
            cookie.set('cxyl', '15x10x5x1x2');
            window.localStorage.setItem('futabavideo', '0.8,true,false');

            let got = load();
            let exp = {
                catalog: {
                    colnum: 15, rownum: 10,
                    title: { length: 5, position: 1 },
                    thumb: { size: 2 }
                },
                video: { loop: false, muted: true, volume: 0.8 }
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
                },
                video: { loop: true, muted: false, volume: 0.5 }
            };
            assert.deepStrictEqual(got, exp);
        });
    });

    describe('store()', () => {
        const { store, load } = preferences;

        const prefs = load();

        it('should store video preferences', () => {
            store(prefs, 'video');

            let got = window.localStorage.getItem('futabavideo');
            let exp = '0.5,false,true';
            assert(got === exp);
        });

        it('should throw exception if unknown type', () => {
            let got;
            try { store(null, 'unknown type'); } catch (e) { got = e.message; }
            assert(got === 'unknown type: unknown type');
        });
    });
});

function dispose() {
    cookie.remove('cxyl');
    window.localStorage.clear();
}

describe(`${__filename}: Catalog`, () => {
    before(() => setup());
    after(() => teardown());

    afterEach(() => dispose());

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
        it('should load preferences from cookie', () => {
            cookie.set('cxyl', '15x10x5x1x2');

            let got = Catalog.load();
            let exp = {
                colnum: 15, rownum: 10,
                title: { length: 5, position: 1 },
                thumb: { size: 2 }
            };
            assert.deepStrictEqual(got, exp);
        });

        it('should load default preferences if no cookie', () => {
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

describe(`${__filename}: Video`, () => {
    before(() => setup());
    after(() => teardown());

    afterEach(() => dispose());

    describe('create()', () => {
        it('should create preferences', () => {
            let got = Video.create();
            let exp = {
                loop: null,
                muted: null,
                volume: null
            };
            assert.deepStrictEqual(got, exp);
        });

        it('should create preferences if pass opts', () => {
            let got = Video.create({ loop: false, volume: 0.8 });
            let exp = {
                loop: false,
                muted: null,
                volume: 0.8
            };
            assert.deepStrictEqual(got, exp);
        });

        it('should ignore unknown properties', () => {
            let got = Video.create({
                foo: 'ignore'
            });
            let exp = Video.create();
            assert.deepStrictEqual(got, exp);
        });
    });

    describe('load()', () => {
        it('should load preferences from localStorage', () => {
            window.localStorage.setItem('futabavideo', '0.8,true,false');

            let got = Video.load();
            let exp = {
                loop: false,
                muted: true,
                volume: 0.8
            };
            assert.deepStrictEqual(got, exp);
        });

        it('should create default preferences if no cookie', () => {
            let got = Video.load();
            let exp = {
                loop: true,
                muted: false,
                volume: 0.5
            };
            assert.deepStrictEqual(got, exp);
        });
    });

    describe('store()', () => {
        it('should store preferences in localStorage', () => {
            let prefs = Video.load();
            Video.store(prefs);

            let got = window.localStorage.getItem('futabavideo');
            let exp = '0.5,false,true';
            assert(got === exp);
        });
    });
});
