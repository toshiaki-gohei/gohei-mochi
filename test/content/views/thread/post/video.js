'use strict';
import assert from 'assert';
import Video from '~/content/views/thread/post/video.jsx';
import React from 'react';
import { render, simulate } from '@/support/react';
import { setup, teardown } from '@/support/dom';
import procedures from '~/content/procedures';
import { Post, preferences } from '~/content/model';
import { sleep } from '~/content/util';

describe(__filename, () => {
    before(() => setup());
    after(() => teardown());

    const { file } = new Post({ index: 1, file: { url: '/b/src/123001.webm' } });
    const isVisibleVideo = true;

    describe('render()', () => {
        const mock = procedures(null, {
            'sync/preferences': () => preferences.load(),
            'preferences/set': () => {}
        });

        it('should render video', () => {
            let isVisibleVideo = true;
            let $el = render(<Video {...{ commit: mock, file, isVisibleVideo }} />);

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

        it('should not render video if video is not visible', () => {
            let $el = render(<Video {...{ commit: mock, file }} />);
            let got = $el.outerHTML;
            assert(got === null);
        });
    });

    describe('event', () => {
        after(() => window.localStorage.clear());

        const funs = {
            'sync/preferences': () => preferences.create({
                video: { loop: false, muted: true, volume: 0.8 }
            }),
            'preferences/set': () => {}
        };
        const mock = procedures(null, funs);

        it('should show video close button if mouse enter video', async () => {
            let $el = render(<Video {...{ commit: mock, file, isVisibleVideo }} />);

            let got = $el.state.isActive;
            assert(got === false);

            let $container = $el.querySelector('.gohei-video-container');
            simulate.mouseEnter($container);

            await sleep(1);

            got = $el.state.isActive;
            assert(got === true);
        });

        it('should hide video close button if mouse leave video', async () => {
            let $el = render(<Video {...{ commit: mock, file, isVisibleVideo }} />);

            let got = $el.state.isActive;
            assert(got === false);

            let $container = $el.querySelector('.gohei-video-container');
            simulate.mouseEnter($container);
            simulate.mouseLeave($container);

            await sleep(1);

            got = $el.state.isActive;
            assert(got === false);
        });

        it('should set video prefs if mouse leave video', () => {
            let set;
            let p = new Promise(resolve => set = resolve);

            let mock = procedures(null, {
                'sync/preferences': funs['sync/preferences'],
                'preferences/set': set
            });

            let $el = render(<Video {...{ commit: mock, file, isVisibleVideo }} />);
            $el._setVideoAttrs();

            let $container = $el.querySelector('.gohei-video-container');
            simulate.mouseLeave($container);

            return p.then(prefs => {
                let got = prefs.video;
                let exp = { loop: false, muted: true, volume: 0.8 };
                assert.deepStrictEqual(got, exp);
            });
        });
    });
});
