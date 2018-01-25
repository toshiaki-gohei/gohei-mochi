'use strict';
import assert from 'assert';
import File from '~/content/views/thread/form-post/file.jsx';
import React from 'react';
import { render } from '@/support/react';
import { setup, teardown } from '@/support/dom';

describe(__filename, () => {
    before(() => setup());
    after(() => teardown());

    describe('render()', () => {
        it('should render file', () => {
            let $el = render(<div><File /></div>);
            let got = $el.outerHTML;
            let exp = new RegExp(`^
<div>
<input (?=.*type="file")(?=.*class="gohei-input-file")(?=.*name="upfile").+?>
<div class="gohei-font-smaller">\\(ドラッグ＆ドロップでファイルを添付できます\\)</div>
<div style="display: none;">
<button class="gohei-link-btn" type="button">\\[ファイルを削除\\]</button>
</div>
<div class="gohei-preview">.+</div>
</div>
$`.replace(/\n/g, ''));
            assert(exp.test(got));
        });
    });
});
