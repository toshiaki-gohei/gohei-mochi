'use strict';
import assert from 'assert';
import parse from '~/content/parser/thread/ads';
import parseFromString from '~/content/parser/dom-parser';
import { setup, teardown } from '@/support/dom';

describe(__filename, () => {
    before(() => setup());
    after(() => teardown());

    describe('parse()', () => {
        it('should parse ads', () => {
            let html = `
<body>
<div><iframe>top-ad</iframe></div>
<p id="hdp"></p>
<hr>
<table></table>
<form id="fm"></form>
<div style="width:728px;margin:2px auto;">under-postform-ad</div>
<form>
<div class="tue">on-thread</div>
<div class="thre">...</div>
<div id="rightad"><div id="rightadfloat">right-ad</div></div>
<hr>
<div style="width:728px;height:90px;margin:2px auto;">on-delform-ad</div>
<div class="delform"></div>
</form>
<script></script>
<div align="center">
<iframe>bottom-ad</iframe>
<div></div>
<div></div>
<small>credits</small>
</div>
</body>
`;
            let $doc = parseFromString(html, 'text/html');

            let got = parse($doc.body);
            let exp = {
                top: '<div><iframe>top-ad</iframe></div>',
                underPostForm: '<div style="width:728px;margin:2px auto;">under-postform-ad</div>',
                onThread: 'on-thread',
                right: 'right-ad',
                onDelForm: '<div style="width:728px;height:90px;margin:2px auto;">on-delform-ad</div>',
                bottom: '<iframe>bottom-ad</iframe><div></div><div></div>'
            };
            assert.deepStrictEqual(got, exp);
        });

        it('should not throw exception if cannot parse', () => {
            let $doc = parseFromString('<div>unknown format</div>', 'text/html');
            let got = parse($doc.body);
            let exp = {
                top: null,
                underPostForm: null,
                onThread: null,
                right: null,
                onDelForm: null,
                bottom: null
            };
            assert.deepStrictEqual(got, exp);
        });
    });
});
