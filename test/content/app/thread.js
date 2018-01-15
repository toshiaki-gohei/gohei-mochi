'use strict';
import assert from 'assert';
import App, { internal } from '~/content/app/thread';
import { setup, teardown } from '@/support/dom';
import createStore from '~/content/reducers';
import { create as createThread } from '~/content/reducers/domain/threads';
import { create as createApp } from '~/content/reducers/app/threads';
import procedures from '~/content/procedures';

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
            let load, set, setPanel;
            let p1 = new Promise(resolve => load = resolve);
            let p2 = new Promise(resolve => set = resolve);
            let p3 = new Promise(resolve => setPanel = resolve);

            let store = createStore();
            let mock = procedures(store, {
                'thread/load': load,
                'preferences/set': set,
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

            let got = state.domain;
            let exp = {
                ...initialState.domain,
                threads: new Map([ [ url, { ...createThread(), url } ] ])
            };
            assert.deepStrictEqual(got, exp);

            got = state.app;
            exp = {
                ...initialState.app,
                current: { thread: url, catalog: null },
                threads: new Map([
                    [ url, { ...createApp(), url } ]
                ])
            };
            assert.deepStrictEqual(got, exp);

            return Promise.all([
                p1,
                p2.then(preferences => {
                    let got = preferences;
                    let exp = {
                        ...preferences,
                        video: { loop: false, muted: true, volume: 0.8 }
                    };
                    assert.deepStrictEqual(got, exp);
                }),
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
<div id="mount-point-of-main"></div>
<hr>
<div class="gohei-ad" id="gohei-ad-right"></div>
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
