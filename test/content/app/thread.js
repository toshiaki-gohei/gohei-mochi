'use strict';
import assert from 'assert';
import App, { internal } from '~/content/app/thread';
import { setup, teardown } from '@/support/dom';
import createStore from '~/content/reducers';
import procedures from '~/content/procedures';
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
            let load, pload, setPanel;
            let p1 = new Promise(resolve => load = resolve);
            let p2 = new Promise(resolve => pload = resolve);
            let p3 = new Promise(resolve => setPanel = resolve);

            let store = createStore();
            let mock = procedures(store, {
                'thread/load': load,
                'preferences/load': pload,
                'thread/setPanel': setPanel,
                'sync/threadPosts': () => []
            });

            let app = new App();
            app._url = 'https://may.2chan.net/b/res/123456789.htm';
            app._store = store;
            app._commit = mock;

            window.localStorage.setItem('futabavideo', '0.8,true,false');

            app.run();

            let url = app._url;
            let state = store.getState();

            let got = pluck(state.domain.threads, 'url');
            let exp = [ { url } ];
            assert.deepStrictEqual(got, exp);

            got = state.app.current;
            exp = { thread: url, catalog: null };
            assert.deepStrictEqual(got, exp);

            got = pluck(state.app.threads, 'url');
            exp = [ { url } ];
            assert.deepStrictEqual(got, exp);

            return Promise.all([
                p1, p2,
                p3.then(panel => {
                    let got = panel;
                    let exp = { isOpen: false, type: 'FORM_POST' };
                    assert.deepStrictEqual(got, exp);
                })
            ]);
        });
    });

    describe('createInner()', () => {
        const { createInner } = internal;

        const url = 'https://may.2chan.net/b/res/123456789.htm';

        it('should create content', () => {
            let $el = createInner({
                url,
                title: 'TITLE',
                notice: { raw: [ 'notice-1', 'notice-2' ] }
            });

            let got = $el.outerHTML;
            let exp = `\
<div class="gohei-app-thread">
<div class="gohei-ad" id="gohei-ad-top"></div>
<header class="gohei-header">
<h1 class="gohei-title">TITLE</h1>
<nav class="gohei-header-nav">[<a href="https://may.2chan.net/b/futaba.htm">掲示板に戻る</a>][<a href="https://www.2chan.net/">ホーム</a>]</nav>
</header>
<section>
<h2 class="gohei-mode-title">レス送信モード</h2>
<ul class="gohei-notice"><li>notice-1</li><li>notice-2</li></ul>
</section>
<div class="gohei-ad" id="gohei-ad-under-postform"></div>
<hr>
<div class="gohei-ad" id="gohei-ad-on-thread"></div>
<div class="gohei-ad-right-container">
<div class="gohei-ad" id="gohei-ad-right"></div>
</div>
<main></main>
<hr>
<div class="gohei-ad" id="gohei-ad-on-delform"></div>
<div class="gohei-ad" id="gohei-ad-bottom"></div>
<footer class="gohei-footer">
<div class="gohei-credits">- <a href="http://php.s3.to" rel="external">GazouBBS</a> + <a href="https://www.2chan.net/">futaba</a> / <a href="https://toshiaki-gohei.github.io/gohei-mochi/" rel="external">gohei-mochi</a> -</div>
</footer>
</div>`;
            assert(got === exp);
        });
    });
});
