'use strict';
import assert from 'assert';
import App, { internal } from '~/content/app/catalog';
import { setup, teardown } from '@/support/dom';
import createStore from '~/content/reducers';
import procedures from '~/content/procedures';
import cookie from 'js-cookie';
import { pluckFromMap as pluck } from '@/support/util';

describe(__filename, () => {
    before(() => setup());
    after(() => teardown());

    describe('constructor()', () => {
        it('should create app', () => {
            let app = new App();
            assert(app);
        });
    });

    describe('run()', () => {
        it('should commit correctly', () => {
            let load, pload;
            let p1 = new Promise(resolve => load = resolve);
            let p2 = new Promise(resolve => pload = resolve);

            let store = createStore();
            let mock = procedures(store, {
                'catalog/load': load,
                'preferences/load': pload
            });

            let app = new App();
            app._url = 'https://may.2chan.net/b/futaba.php?mode=cat&sort=3';
            app._store = store;
            app._commit = mock;

            cookie.set('cxyl', '14x6x4x0x0');

            app.run();

            let url = 'https://may.2chan.net/b/futaba.php?mode=cat';
            let state = store.getState();

            let got = pluck(state.domain.catalogs, 'url', 'sort');
            let exp = [ { url, sort: 3 } ];
            assert.deepStrictEqual(got, exp);

            got = state.app.current;
            exp = { thread: null, catalog: url };
            assert.deepStrictEqual(got, exp);

            got = pluck(state.app.catalogs, 'url');
            exp = [ { url } ];
            assert.deepStrictEqual(got, exp);

            return Promise.all([ p1, p2 ]);
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
<main></main>
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
});
