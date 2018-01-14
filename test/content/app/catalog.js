'use strict';
import assert from 'assert';
import App, { internal } from '~/content/app/catalog';
import { setup, teardown } from '@/support/dom';
import createStore from '~/content/reducers';
import { create as createCatalog } from '~/content/reducers/domain/catalogs';
import { create as createApp } from '~/content/reducers/app/catalogs';
import procedures from '~/content/procedures';
import cookie from 'js-cookie';

describe(__filename, () => {
    before(() => setup());
    after(() => teardown());

    const initialState = createStore().getState();

    describe('constructor()', () => {
        it('should create app', () => {
            let app = new App();
            assert(app);
        });
    });

    describe('run()', () => {
        it('should commit correctly', () => {
            let load, set;
            let p1 = new Promise(resolve => load = resolve);
            let p2 = new Promise(resolve => set = resolve);

            let store = createStore();
            let mock = procedures(store, {
                'catalog/load': load,
                'preferences/set': set
            });

            let app = new App();
            app._url = 'https://may.2chan.net/b/futaba.php?mode=cat&sort=3';
            app._store = store;
            app._commit = mock;

            cookie.set('cxyl', '14x6x4x0x0');

            app.run();

            let url = 'https://may.2chan.net/b/futaba.php?mode=cat';
            let state = store.getState();

            let got = state.domain;
            let exp = {
                ...initialState.domain,
                catalogs: new Map([ [ url, { ...createCatalog(), url, sort: 3 } ] ])
            };
            assert.deepStrictEqual(got, exp);

            got = state.app;
            exp = {
                ...initialState.app,
                current: { thread: null, catalog: url },
                catalogs: new Map([ [ url, { ...createApp(), url } ] ])
            };
            assert.deepStrictEqual(got, exp);

            return Promise.all([
                p1,
                p2.then(preferences => {
                    let got = preferences;
                    let exp = {
                        ...preferences,
                        catalog: {
                            colnum: 14, rownum: 6,
                            title: { length: 4, position: 0 },
                            thumb: { size: 0 }
                        }
                    };
                    assert.deepStrictEqual(got, exp);
                })
            ]);
        });
    });

    describe('createInner()', () => {
        const { createInner } = internal;

        const url = 'https://may.2chan.net/b/futaba.php?mode=cat&sort=3';

        it('should create content', () => {
            let $el = createInner({
                url,
                title: 'TITLE'
            });

            let got = $el.outerHTML;
            let exp = `\
<div class="gohei-app-catalog">
<header class="gohei-header">
<h1 class="gohei-title">TITLE</h1>
<nav class="gohei-header-nav">[<a href="https://may.2chan.net/b/futaba.htm">掲示板に戻る</a>][<a href="https://www.2chan.net/">ホーム</a>]</nav>
</header>
<hr>
<div id="mount-point-of-main"></div>
<hr>
<div class="gohei-ad" id="gohei-ad-bottom"></div>
<footer class="gohei-footer">
<div class="gohei-credits">- <a href="http://php.s3.to" rel="external">GazouBBS</a> + <a href="https://www.2chan.net/">futaba</a> / <a href="https://toshiaki-gohei.github.io/gohei-mochi/" rel="external">gohei-mochi</a> -</div>
</footer>
</div>`;
            assert(got === exp);
        });
    });

    describe('getSort()', () => {
        const { getSort } = internal;

        it('should get sort', () => {
            let got = getSort('https://may.2chan.net/b/futaba.php?mode=cat&sort=3');
            assert(got === 3);

            got = getSort('https://may.2chan.net/b/futaba.php?mode=cat');
            assert(got === null);
        });
    });

    describe('getPreferences()', () => {
        const { getPreferences } = internal;

        beforeEach(() => cookie.remove('cxyl'));

        it('should get preferences', () => {
            cookie.set('cxyl', '14x6x4x0x0');

            let got = getPreferences();
            let exp = {
                cookie: { cxyl: '14x6x4x0x0' }
            };
            assert.deepStrictEqual(got, exp);
        });

        it('should get preferences if no cookie', () => {
            let got = getPreferences();
            let exp = {
                cookie: { cxyl: null }
            };
            assert.deepStrictEqual(got, exp);
        });
    });
});
