'use strict';
import assert from 'assert';
import parse, { internal } from '~/content/parser/thread/static-contents';
import parseFromString from '~/content/parser/dom-parser';
import { setup, teardown } from '@/support/dom';

describe(__filename, () => {
    before(() => setup());
    after(() => teardown());

    describe('parse()', () => {
        it('should return default values if cannot parse', () => {
            let $doc = parseFromString('<div>unknown format</div>', 'text/html');
            let got = parse($doc.body);
            let exp = {
                title: null,
                notice: { raw: [] }
            };
            assert.deepStrictEqual(got, exp);
        });
    });

    describe('parseNotice()', () => {
        const { parseNotice } = internal;

        it('should parse notice', () => {
            let html = `
<table class="ftbl">
<tbody><tr><td colspan="2" class="chui"><ul>
<li>添付可能：GIF, JPG, PNG, WEBM. 2000KBまで. 250x250以上は縮小.</li>
<li>現在1234人くらいが見てます.<a href="/b/futaba.php?mode=cat">カタログ</a></li>
<li>メール欄に「ip表示」と入れてスレッドを立てるとスレッド全部をip表示にできます.</li>
<li><span style="color:#ff0000">政治はだめ.</span>&nbsp;&nbsp;「そうだね」テスト中.</li>
</ul></td></tr></tbody>
</table>
`;
            let $doc = parseFromString(html, 'text/html');

            let got = parseNotice($doc.body);
            let exp = {
                raw: [
                    '添付可能：GIF, JPG, PNG, WEBM. 2000KBまで. 250x250以上は縮小.',
                    '現在1234人くらいが見てます.<a href="/b/futaba.php?mode=cat">カタログ</a>',
                    'メール欄に「ip表示」と入れてスレッドを立てるとスレッド全部をip表示にできます.',
                    '<span style="color:#ff0000">政治はだめ.</span>&nbsp;&nbsp;「そうだね」テスト中.'
                ]
            };
            assert.deepStrictEqual(got, exp);
        });

        it('should parse notice if notice does not exist', () => {
            let html = '<div></div>';
            let $doc = parseFromString(html, 'text/html');
            let got = parseNotice($doc.body);
            assert.deepStrictEqual(got, { raw: [] });
        });
    });
});
