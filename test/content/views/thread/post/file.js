'use strict';
import assert from 'assert';
import File, { marginLeftForThumb } from '~/content/views/thread/post/file.jsx';
import React from 'react';
import { render, simulate } from '@/support/react';
import { setup, teardown, tidy } from '@/support/dom';
import procedures from '~/content/procedures';
import { Post, preferences } from '~/content/model';
import { sleep } from '~/content/util';

describe(__filename, () => {
    before(() => setup());
    after(() => teardown());

    let file;
    beforeEach(() => {
        file = {
            url: 'file-url', name: 'file-name', size: 888,
            thumb: { url: 'thumb-url', width: 250, height: 251 }
        };
    });

    const mock = procedures(null, {
        'sync/preferences': () => preferences.load(),
        'preferences/set': () => {}
    });

    describe('render()', () => {
        it('should render file', () => {
            let post = new Post({ index: 1, file });
            let $el = render(<File {...{ post }} />);

            let got = tidy($el.outerHTML);
            let exp = tidy(`
<div class="gohei-post-file">
<div>
<a href="file-url" class="gohei-file-name" download="file-name"><span class="gohei-inline-icon gohei-icon-download"></span>file-name</a>
<span class="gohei-file-size">(888 B)</span>
</div>
<a href="file-url" target="_blank">
<img class="gohei-thumb-image" src="thumb-url" style="width: 250px; height: 251px;">
</a>
</div>
`.replace(/\n/g, ''));
            assert(got === exp);
        });

        it('should render file if original post', () => {
            let post = new Post({ index: 0, file });
            let $el = render(<File {...{ post }} />);

            let got = tidy($el.outerHTML);
            let exp = tidy(`
<div class="gohei-post-file">
<div>
画像ファイル名：<a href="file-url" class="gohei-file-name" download="file-name">file-name</a>
<span class="gohei-file-size">(888 B)</span>
</div>
<a href="file-url" target="_blank">
<img class="gohei-thumb-image" src="thumb-url" style="width: 250px; height: 251px;">
</a>
</div>
`.replace(/\n/g, ''));
            assert(got === exp);
        });

        it('should render file if file is webm', () => {
            file.url = '/b/src/123001.webm';
            let post = new Post({ index: 1, file });
            let $el = render(<File {...{ post }} />);

            let got = tidy($el.outerHTML);
            let exp = tidy(`
<div class="gohei-post-file">
<div>
<a href="/b/src/123001.webm" class="gohei-file-name" download="file-name"><span class="gohei-inline-icon gohei-icon-download"></span>file-name</a>
<span class="gohei-file-size">(888 B)</span>
</div>
<a href="/b/src/123001.webm">
<img class="gohei-thumb-image" src="thumb-url" style="width: 250px; height: 251px;">
</a>
</div>
`.replace(/\n/g, ''));
            assert(got === exp);
        });

        it('should render video if video is visible', done => {
            file.url = '/b/src/123001.webm';
            let post = new Post({ index: 1, file });
            let $el = render(<File {...{ commit: mock, post }} />);

            $el.setState({ isVisibleVideo: true }, () => {
                let got = $el.outerHTML;
                let exp = new RegExp(`
<div class="gohei-post-file">
<div>
<a href="/b/src/123001.webm" class="gohei-file-name" download="file-name"><span class="gohei-inline-icon gohei-icon-download"></span>file-name</a>
<span class="gohei-file-size">\\(888 B\\)</span>
</div>
<div class="gohei-video-container">.+</div>
</div>
`.replace(/\n/g, ''));
                assert(exp.test(got));
                done();
            });
        });

        it('should not render file if post does not have a file', () => {
            let post = new Post({ index: 1 });
            let $el = render(<File {...{ post }} />);
            let got = $el.outerHTML;
            assert(got === null);
        });
    });

    describe('event handlers', () => {
        it('should make handlers if post has a file and a file is webm', () => {
            file.url = '/b/src/123001.webm';
            let post = new Post({ file });
            let $el = render(<File {...{ post }} />);

            let { showVideo, hideVideo } = $el._handlers;
            assert(showVideo !== null);
            assert(hideVideo !== null);
        });

        it('should not make handlers if post does not have a file', () => {
            let post = new Post({ index: 1 });
            let $el = render(<File {...{ post }} />);

            let { showVideo, hideVideo } = $el._handlers;
            assert(showVideo === null);
            assert(hideVideo === null);
        });
    });

    describe('marginLeftForThumb()', () => {
        it('should return margin-left', () => {
            let file = { thumb: { width: 250 } };

            let got = marginLeftForThumb(file);
            assert(got === '290px');
        });

        it('should return null if file is null or etc', () => {
            let got = marginLeftForThumb();
            assert(got === null);
            got = marginLeftForThumb({});
            assert(got === null);
            got = marginLeftForThumb({ thumb: null });
            assert(got === null);
            got = marginLeftForThumb({ thumb: {} });
            assert(got === null);
        });
    });

    describe('event', () => {
        after(() => window.localStorage.clear());

        it('should show video if click thumb image', done => {
            file.url = '/b/src/123001.webm';
            let post = new Post({ index: 1, file });
            let $el = render(<File {...{ commit: mock, post }} />);

            let got = $el.querySelector('.gohei-video-container');
            assert(got === null);

            let $img = $el.querySelector('.gohei-thumb-image');
            simulate.click($img);

            $el.forceUpdate(() => {
                let got = $el.querySelector('.gohei-video-container');
                assert(got !== null);
                done();
            });
        });

        it('should hide video if click close button', async () => {
            file.url = '/b/src/123001.webm';
            let post = new Post({ index: 1, file });
            let $el = render(<File {...{ commit: mock, post }} />);

            $el.setState({ isVisibleVideo: true }, () => {
                let got = $el.querySelector('.gohei-video-container');
                assert(got !== null);

                let $btn = $el.querySelector('.gohei-close-btn');
                simulate.click($btn);
            });

            await sleep(1);

            let got = $el.querySelector('.gohei-video-container');
            assert(got === null);
        });
    });
});
