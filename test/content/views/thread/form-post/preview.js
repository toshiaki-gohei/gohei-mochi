'use strict';
import assert from 'assert';
import Preview from '~/content/views/thread/form-post/preview.jsx';
import React from 'react';
import { render } from '@/support/react';
import { setup, teardown } from '@/support/dom';
import { sleep } from '~/content/util';

describe(__filename, () => {
    before(() => setup());
    after(() => teardown());

    describe('render()', () => {
        it('should render preview', () => {
            let $el = render(<Preview />);
            let got = $el.outerHTML;
            let exp = `
<div class="gohei-preview">
<img class="gohei-preview-img" style="display: none;">
<video class="gohei-preview-video" style="display: none;"></video>
</div>
`.replace(/\n/g, '');
            assert(got === exp);
        });

        it('should render image preview', async () => {
            let type = 'image/jpeg';
            let file = new window.File([], 'test-file.jpg', { type });

            let $el = render(<Preview {...{ file }} />);

            await sleep(5);

            let got = $el.outerHTML;
            let exp = new RegExp(`^
<div class="gohei-preview">
<img class="gohei-preview-img" (?=.*style="")(?=.*src="data:.*?").+?>
<video class="gohei-preview-video" style="display: none;"></video>
</div>
$`.replace(/\n/g, ''));
            assert(exp.test(got));
        });

        it('should render video preview', async () => {
            let type = 'video/webm';
            let file = new window.File([], 'test-file.webm', { type });

            let $el = render(<Preview {...{ file }} />);

            await sleep(5);

            let got = $el.outerHTML;
            let exp = new RegExp(`^
<div class="gohei-preview">
<img class="gohei-preview-img" style="display: none;">
<video class="gohei-preview-video" (?=.*style="")(?=.*src="data:.*?").+?></video>
</div>
$`.replace(/\n/g, ''));
            assert(exp.test(got));
        });
    });
});
