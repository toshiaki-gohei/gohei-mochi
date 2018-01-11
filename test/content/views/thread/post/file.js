'use strict';
import assert from 'assert';
import File, { marginLeftForThumb } from '~/content/views/thread/post/file.jsx';
import { h, render } from 'preact';
import { setup, teardown } from '@/support/dom';
import { Post } from '~/content/model';

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

    describe('render()', () => {
        it('should render file', () => {
            let post = new Post({ index: 1, file });
            let $el = render(<File {...{ post }} />);

            let got = $el.outerHTML;
            let exp = new RegExp(`
<div class="gohei-post-file">
<div>
<a href="file-url" class="gohei-file-name" target="_blank">file-name</a>
<span class="gohei-file-size">\\(888 B\\)</span>
</div>
<a href="file-url" target="_blank">
<img (=?.*class="gohei-file-thumb")(=?.*src="thumb-url")(?=.*style="width: 250px; height: 251px;").*?>
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
画像ファイル名：<a href="file-url" class="gohei-file-name" target="_blank">file-name</a>
<span class="gohei-file-size">\\(888 B\\)</span>
</div>
<a href="file-url" target="_blank">
<img (=?.*class="gohei-file-thumb")(=?.*src="thumb-url")(?=.*style="width: 250px; height: 251px;").*?>
</a>
</div>
`.replace(/\n/g, ''));
            assert(exp.test(got));
        });

        it('should render null if post does not have a file', () => {
            let post = new Post({ index: 1 });
            let $el = render(<File {...{ post }} />);

            let got = $el.outerHTML;
            assert(got === undefined);
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
});
