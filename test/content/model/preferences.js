'use strict';
import assert from 'assert';
import * as preferences from '~/content/model/preferences';
import { setup, teardown, disposePreferences } from '@/support/dom';
import jsCookie from 'js-cookie';

const { Video } = preferences.internal;

describe(__filename, () => {
    before(() => setup());
    after(() => teardown());

    afterEach(() => disposePreferences());

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
            jsCookie.set('cxyl', '15x10x5x1x2');
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

        it('should load preferences if there is not futaba preferences', () => {
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
        const { store } = preferences;

        it('should store preferences', () => {
            let prefs = {
                catalog: {
                    colnum: 15, rownum: 10,
                    title: { length: 5, position: 1 },
                    thumb: { size: 2 }
                },
                video: { loop: false, muted: true, volume: 0.8 }
            };

            store(prefs);

            let got = jsCookie.get('cxyl');
            let exp = '15x10x5x1x2';
            assert(got === exp);

            got = window.localStorage.getItem('futabavideo');
            exp = '0.8,true,false';
            assert(got === exp);
        });

        it('should store only catalog preferences', () => {
            let prefs = {
                catalog: {
                    colnum: 15, rownum: 10,
                    title: { length: 5, position: 1 },
                    thumb: { size: 2 }
                }
            };

            store(prefs);

            let got = jsCookie.get('cxyl');
            let exp = '15x10x5x1x2';
            assert(got === exp);

            got = window.localStorage.getItem('futabavideo');
            exp = null;
            assert(got === exp);
        });

        it('should store only video preferences', () => {
            let prefs = {
                video: { loop: false, muted: true, volume: 0.8 }
            };

            store(prefs);

            let got = jsCookie.get('cxyl');
            let exp = undefined;
            assert(got === exp);

            got = window.localStorage.getItem('futabavideo');
            exp = '0.8,true,false';
            assert(got === exp);
        });
    });
});

describe(`${__filename}: Catalog`, () => {
    before(() => setup());
    after(() => teardown());

    afterEach(() => disposePreferences());

    const { Catalog } = preferences;

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
            jsCookie.set('cxyl', '15x10x5x1x2');

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

    describe('store()', () => {
        it('should store preferences in cookie', () => {
            let prefs = Catalog.load();
            Catalog.store(prefs);

            let got = jsCookie.get('cxyl');
            let exp = '14x6x4x0x0';
            assert(got === exp);
        });
    });

    describe('cookieValue()', () => {
        it('should return cookie value', () => {
            let prefs = Catalog.load();

            let got = Catalog.cookieValue(prefs);
            let exp = '14x6x4x0x0';
            assert(got === exp);
        });
    });
});

describe(`${__filename}: Video`, () => {
    before(() => setup());
    after(() => teardown());

    afterEach(() => disposePreferences());

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
