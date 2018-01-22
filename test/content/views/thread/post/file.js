'use strict';
import assert from 'assert';
import File, { marginLeftForThumb, internal } from '~/content/views/thread/post/file.jsx';
import { h, render } from 'preact';
import { setup, teardown } from '@/support/dom';
import procedures from '~/content/procedures';
import { Post, preferences } from '~/content/model';

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

            let got = $el.outerHTML;
            let exp = new RegExp(`
<div class="gohei-post-file">
<div>
<a href="file-url" class="gohei-file-name" download="file-name"><span class="gohei-inline-icon gohei-icon-download"></span>file-name</a>
<span class="gohei-file-size">\\(888 B\\)</span>
</div>
<a href="file-url" target="_blank">
<img (=?.*class="gohei-thumb-image")(=?.*src="thumb-url")(?=.*style="width: 250px; height: 251px;").*?>
</a>
</div>
`.replace(/\n/g, ''));
            assert(exp.test(got));
        });

        it('should render file if original post', () => {
            let post = new Post({ index: 0, file });
            let $el = render(<File {...{ post }} />);

            let got = $el.outerHTML;
            let exp = new RegExp(`
<div class="gohei-post-file">
<div>
画像ファイル名：<a href="file-url" class="gohei-file-name" download="file-name">file-name</a>
<span class="gohei-file-size">\\(888 B\\)</span>
</div>
<a href="file-url" target="_blank">
<img (=?.*class="gohei-thumb-image")(=?.*src="thumb-url")(?=.*style="width: 250px; height: 251px;").*?>
</a>
</div>
`.replace(/\n/g, ''));
            assert(exp.test(got));
        });

        it('should render file if file is webm', () => {
            file.url = '/b/src/123001.webm';
            let post = new Post({ index: 1, file });
            let $el = render(<File {...{ post }} />);

            let got = $el.outerHTML;
            let exp = new RegExp(`
<div class="gohei-post-file">
<div>
<a href="/b/src/123001.webm" class="gohei-file-name" download="file-name"><span class="gohei-inline-icon gohei-icon-download"></span>file-name</a>
<span class="gohei-file-size">\\(888 B\\)</span>
</div>
<a href="/b/src/123001.webm">
<img (=?.*class="gohei-thumb-image")(=?.*src="thumb-url")(?=.*style="width: 250px; height: 251px;").*?>
</a>
</div>
`.replace(/\n/g, ''));
            assert(exp.test(got));
        });

        it('should render video if video is visible', done => {
            file.url = '/b/src/123001.webm';
            let post = new Post({ index: 1, file });
            let $el = render(<File {...{ commit: mock, post }} />);

            let c = $el._component;
            c.setState({ isVisibleVideo: true }, () => {
                let got = $el.outerHTML;
                let exp = new RegExp(`
<div class="gohei-post-file">
<div>
<a href="/b/src/123001.webm" class="gohei-file-name" download="file-name"><span class="gohei-inline-icon gohei-icon-download"></span>file-name</a>
<span class="gohei-file-size">\\(888 B\\)</span>
</div>
<div class="gohei-video-container">
<video class="gohei-video" (?=.*style="display: none;")(?=.*autoplay="true" controls="" loop="").*>
<source src="/b/src/123001.webm" type="video/webm">
<source src="/b/src/123001.mp4" type="video/mp4">
</video>
<div class="gohei-button-area" style="display: none;">
<button class="gohei-icon-btn gohei-close-btn gohei-icon-close"></button>
</div>
</div>
</div>
`.replace(/\n/g, ''));
                assert(exp.test(got));
                done();
            });
        });

        it('should render null if post does not have a file', () => {
            let post = new Post({ index: 1 });
            let $el = render(<File {...{ post }} />);

            let got = $el.outerHTML;
            assert(got === undefined);
        });
    });

    describe('event handlers', () => {
        it('should make handlers if post has a file and a file is webm', () => {
            file.url = '/b/src/123001.webm';
            let post = new Post({ file });
            let $el = render(<File {...{ post }} />);

            let { showVideo, hideVideo } = $el._component._handlers;
            assert(showVideo !== null);
            assert(hideVideo !== null);
        });

        it('should not make handlers if post does not have a file', () => {
            let post = new Post({ index: 1 });
            let $el = render(<File {...{ post }} />);

            let { showVideo, hideVideo } = $el._component._handlers;
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
        it('should show video if click thumb image', done => {
            file.url = '/b/src/123001.webm';
            let post = new Post({ index: 1, file });
            let $el = render(<File {...{ commit: mock, post }} />);

            let got = $el.querySelector('.gohei-video-container');
            assert(got === null);

            let $img = $el.querySelector('.gohei-thumb-image');
            $img.dispatchEvent(new window.Event('click', { bubbles: true }));

            $el._component.forceUpdate(() => {
                let got = $el.querySelector('.gohei-video-container');
                assert(got !== null);
                done();
            });
        });

        it('should hide video if click close button', done => {
            file.url = '/b/src/123001.webm';
            let post = new Post({ index: 1, file });
            let $el = render(<File {...{ commit: mock, post }} />);

            let c = $el._component;
            c.setState({ isVisibleVideo: true }, () => {
                let got = $el.querySelector('.gohei-video-container');
                assert(got !== null);

                let $btn = $el.querySelector('.gohei-close-btn');
                $btn.dispatchEvent(new window.Event('click'));
            });

            setTimeout(() => {
                let got = $el.querySelector('.gohei-video-container');
                assert(got === null);
                done();
            }, 10);
        });
    });
});

describe(`${__filename}: Video`, () => {
    const { Video } = internal;

    before(() => setup());
    after(() => teardown());

    const funs = {
        'sync/preferences': () => preferences.create({
            video: { loop: false, muted: true, volume: 0.8 }
        }),
        'preferences/set': () => {}
    };
    const mock = procedures(null, funs);

    const file = (new Post({ index: 1, file: { url: '/b/src/123001.webm' } })).file;
    const isVisibleVideo = true;

    describe('event', () => {
        it('should show video close button if mouse enter video', done => {
            let $el = render(<Video {...{ commit: mock, file, isVisibleVideo }} />);
            let c = $el._component;

            let got = c.state.isActive;
            assert(got === false);

            $el.dispatchEvent(new window.Event('mouseenter'));

            setTimeout(() => {
                let got = c.state.isActive;
                assert(got === true);
                done();
            }, 5);
        });

        it('should hide video close button if mouse leave video', done => {
            let $el = render(<Video {...{ commit: mock, file, isVisibleVideo }} />);
            let c = $el._component;

            let got = c.state.isActive;
            assert(got === false);

            $el.dispatchEvent(new window.Event('mouseenter'));
            $el.dispatchEvent(new window.Event('mouseleave'));

            setTimeout(() => {
                let got = c.state.isActive;
                assert(got === false);
                done();
            }, 5);
        });

        it('should set video prefs if mouse leave video', () => {
            let set;
            let p = new Promise(resolve => set = resolve);

            let mock = procedures(null, {
                'sync/preferences': funs['sync/preferences'],
                'preferences/set': set
            });

            let $el = render(<Video {...{ commit: mock, file, isVisibleVideo }} />);

            $el.dispatchEvent(new window.Event('mouseleave'));

            return p.then(prefs => {
                let got = prefs;
                let exp = {
                    ...preferences.create(),
                    video: { loop: false, muted: true, volume: 0.8 }
                };
                assert.deepStrictEqual(got, exp);
            });
        });
    });
});
