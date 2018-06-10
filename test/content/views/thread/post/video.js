'use strict';
import assert from 'assert';
import Video from '~/content/views/thread/post/video.jsx';
import React from 'react';
import { render, simulate } from '@/support/react';
import { setup, teardown, disposePreferences } from '@/support/dom';
import createStore from '~/content/reducers';
import procedures from '~/content/procedures';
import { Post } from '~/content/model';
import { sleep } from '~/content/util';

describe(__filename, () => {
    before(() => setup());
    after(() => teardown());

    afterEach(() => disposePreferences());

    let store, commit;
    beforeEach(async () => {
        store = createStore();
        commit = procedures(store);
        await commit('preferences/load');
    });

    const { file } = new Post({ index: 1, file: { url: '/b/src/123001.webm' } });
    const isVisibleVideo = true;

    describe('render()', () => {
        it('should render webm video', () => {
            let $el = render(<Video {...{ commit, file, isVisibleVideo }} />);

            let got = $el.outerHTML;
            let exp = new RegExp(`^
<div class="gohei-video-container">
<video class="gohei-video" (?=.*style="display: none;")(?=.*autoplay="" controls="" loop="" volume="0\\.5").*>
<source src="/b/src/123001.webm" type="video/webm">
<source src="/b/src/123001.mp4" type="video/mp4">
</video>
<div class="gohei-button-area" style="display: none;">
<button class="gohei-icon-btn gohei-close-btn gohei-icon-close"></button>
</div>
</div>
$`.replace(/\n/g, ''));
            assert(exp.test(got));
        });

        it('should render mp4 video', () => {
            let { file } = new Post({ index: 1, file: { url: '/b/src/123001.mp4' } });
            let $el = render(<Video {...{ commit, file, isVisibleVideo }} />);

            let got = $el.querySelector('video').outerHTML;
            let exp = new RegExp(`^
<video class="gohei-video" (?=.*style="display: none;")(?=.*autoplay="" controls="" loop="" volume="0\\.5").*>
<source src="/b/src/123001.mp4" type="video/mp4">
</video>
$`.replace(/\n/g, ''));
            assert(exp.test(got));
        });

        it('should not render video if video is not visible', () => {
            let $el = render(<Video {...{ commit, file }} />);
            let got = $el.outerHTML;
            assert(got === null);
        });
    });

    describe('event', () => {
        it('should show video close button if mouse enter video', async () => {
            let $el = render(<Video {...{ commit, file, isVisibleVideo }} />);

            let got = $el.state.isActive;
            assert(got === false);

            let $container = $el.querySelector('.gohei-video-container');
            simulate.mouseEnter($container);

            await sleep(1);

            got = $el.state.isActive;
            assert(got === true);
        });

        it('should hide video close button if mouse leave video', async () => {
            let $el = render(<Video {...{ commit, file, isVisibleVideo }} />);

            let got = $el.state.isActive;
            assert(got === false);

            let $container = $el.querySelector('.gohei-video-container');
            simulate.mouseEnter($container);
            simulate.mouseLeave($container);

            await sleep(1);

            got = $el.state.isActive;
            assert(got === false);
        });

        it('should set video prefs if mouse leave video', async () => {
            let $el = render(<Video {...{ commit, file, isVisibleVideo }} />);

            $el._$video.loop = false;
            $el._$video.muted = true;
            $el._$video.volume = 0.8;

            let $container = $el.querySelector('.gohei-video-container');
            simulate.mouseLeave($container);

            await sleep(1);

            let { ui } = store.getState();
            let got = ui.preferences;
            let exp = {
                catalog: {
                    colnum: 14, rownum: 6,
                    title: { length: 4, position: 0 },
                    thumb: { size: 0 }
                },
                video: { loop: false, muted: true, volume: 0.8 }
            };
            assert.deepStrictEqual(got, exp);
        });
    });
});
