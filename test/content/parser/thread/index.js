'use strict';
import assert from 'assert';
import parser, { parseAll, parse, internal } from '~/content/parser/thread';
import parseFromString from '~/content/parser/dom-parser';
import { setup, teardown } from '@/support/dom';

describe(__filename, () => {
    before(() => setup());
    after(() => teardown());

    describe('export', () => {
        it('should export functions', () => {
            let got = parser;
            let exp = { parseAll, parse };
            assert.deepStrictEqual(got, exp);
        });
    });

    describe('parseAll()', () => {
        it('should return default values if cannot parse', () => {
            let got = parseAll('<div>unknown format</div>');
            let exp = {
                thread: {
                    title: null,
                    posts: [],
                    expire: null
                },
                messages: {
                    viewer: null, 
                    notice: null, warning: null, deletedPostCount: null
                },
                postform: null,
                delform: null,
                title: null,
                notice: { raw: [] },
                ads: {
                    top: null, underPostForm: null, onThread: null,
                    right: null, onDelForm: null, bottom: null
                }
            };
            assert.deepStrictEqual(got, exp);
        });
    });

    describe('parse()', () => {
        it('should return default values if cannot parse', () => {
            let got = parse('<div>unknown format</div>');
            let exp = {
                thread: {
                    title: null,
                    posts: [],
                    expire: null
                },
                messages: {
                    viewer: null, 
                    notice: null, warning: null, deletedPostCount: null
                },
                postform: null,
                delform: null
            };
            assert.deepStrictEqual(got, exp);
        });
    });

    describe('parseExpireDate()', () => {
        const { parseExpireDate } = internal;

        it('should return expire date', () => {
            let now = new Date('2018-01-23T01:23:00+09:00');
            let got = parseExpireDate('12:34頃消えます', now);
            assert(got.toISOString() === '2018-01-23T03:34:00.000Z');
        });

        it('should return expire date (date and time)', () => {
            let now = new Date('2018-01-23T01:23:00+09:00');
            let got = parseExpireDate('23日12:34頃消えます', now);
            assert(got.toISOString() === '2018-01-23T03:34:00.000Z');
        });

        it('should return expire date (year and month)', () => {
            let now = new Date('2017-01-23T01:23:00+09:00');
            let got = parseExpireDate('18年1月頃消えます', now);
            assert(got.toISOString() === '2017-12-31T15:00:00.000Z');
        });

        it('should return expire date if expire is over next month', () => {
            let now = new Date('2018-01-31T22:00:00+09:00');
            let got = parseExpireDate('01日01:23頃消えます', now);
            assert(got.toISOString() === '2018-01-31T16:23:00.000Z');
        });

        it('should return null if cannot parse expire', () => {
            let got = parseExpireDate('12:34');
            assert(got === null);
        });
    });

    describe('parseExpire()', () => {
        const { parseExpire } = internal;
        const { year, month, date } = now();

        it('should parse expire', () => {
            let html = `
<div class="thre">
画像ファイル名：<a href="/b/src/9876543210.jpg" target="_blank">9876543210.jpg</a>-(888 B)
<small>サムネ表示</small>
<font color="#cc1105"><b>無念</b></font> 
Name <font color="#117743"><b>としあき </b></font> 17/01/01(日)01:23:45 No.123000000 
<small>12:34頃消えます</small>
<blockquote>本文</blockquote>
</div>`;
            let $doc = parseFromString(html, 'text/html');

            let got = parseExpire($doc.body);
            assert(got.message === '12:34頃消えます');
            assert(got.date.toISOString() === `${year}-${month}-${date}T03:34:00.000Z`);
        });

        it('should parse expire (date and time)', () => {
            let html = '<div class="thre"><small>23日12:34頃消えます</small></div>';
            let $doc = parseFromString(html, 'text/html');

            let got = parseExpire($doc.body);
            assert(got.message === '23日12:34頃消えます');
            assert(got.date.toISOString() === `${year}-${month}-23T03:34:00.000Z`);
        });

        it('sould parse expire (year and month)', () => {
            let msg = `${year % 100 + 1}年1月頃消えます`;
            let html = `<div class="thre"><small>${msg}</small></div>`;
            let $doc = parseFromString(html, 'text/html');

            let got = parseExpire($doc.body);
            assert(got.message === msg);
            assert(got.date.toISOString() === `${year}-12-31T15:00:00.000Z`);
        });

        it('sould return null if cannot parse', () => {
            let html = '<small>12:34頃消えます</small>';
            let $doc = parseFromString(html, 'text/html');

            let got = parseExpire($doc.body);
            assert(got === null);
        });
    });

    describe('parseViewer()', () => {
        const { parseViewer } = internal;

        it('should parse viewer', () => {
            let html = `
<table class="ftbl">
<tbody><tr><td colspan="2" class="chui"><ul>
<li>添付可能...</li>
<li>現在1234人くらいが見てます.<a href="/b/futaba.php?mode=cat">カタログ</a> <a href="/b/futaba.php?mode=cat&amp;sort=1">新順</a> ...</li>
<li>メール欄に...</li>
</ul></td></tr></tbody></table>
`;
            let $doc = parseFromString(html, 'text/html');

            let got = parseViewer($doc.body);
            assert(got === '1234人くらい');
        });

        it('should return null if cannot parse', () => {
            let html = '<li>現在1234人くらいが見てます</li>';
            let $doc = parseFromString(html, 'text/html');

            let got = parseViewer($doc.body);
            assert(got === null);
        });
    });

    describe('parseNotice()', () => {
        const { parseNotice } = internal;

        it('should parse notice', () => {
            let html = `
<div class="thre">
画像ファイル名：<a href="/b/src/9876543210.jpg" target="_blank">9876543210.jpg</a>-(888 B)
<small>サムネ表示</small>
<font color="#cc1105"><b>無念</b></font> 
Name <font color="#117743"><b>としあき </b></font> 17/01/01(日)01:23:45 No.123000000 
<small>12:34頃消えます</small>
<blockquote>本文</blockquote>
<font color="#0000f0"><b>このスレの書き込みはＩＰアドレスが表示されます。</b></font><br>
</div>`;
            let $doc = parseFromString(html, 'text/html');

            let got = parseNotice($doc.body);
            assert(got === 'このスレの書き込みはＩＰアドレスが表示されます。');
        });
    });

    describe('parseWarning()', () => {
        const { parseWarning } = internal;

        it('should parse warning', () => {
            let html = `
<div class="thre">
画像ファイル名：<a href="/b/src/9876543210.jpg" target="_blank">9876543210.jpg</a>-(888 B)
<small>サムネ表示</small>
<font color="#cc1105"><b>無念</b></font> 
Name <font color="#117743"><b>としあき </b></font> 17/01/01(日)01:23:45 No.123000000 
<small>12:34頃消えます</small>
<blockquote>本文</blockquote>
<font color="#f00000"><b>このスレは古いので、もうすぐ消えます。</b></font><br>
</div>`;
            let $doc = parseFromString(html, 'text/html');

            let got = parseWarning($doc.body);
            assert(got === 'このスレは古いので、もうすぐ消えます。');
        });
    });

    describe('parseDeletedPostCount()', () => {
        const { parseDeletedPostCount } = internal;

        it('should parse deleted post count', () => {
            let html = `
<div class="thre">
画像ファイル名：<a href="/b/src/9876543210.jpg" target="_blank">9876543210.jpg</a>-(888 B)
<small>サムネ表示</small>
<font color="#cc1105"><b>無念</b></font> 
Name <font color="#117743"><b>としあき </b></font> 17/01/01(日)01:23:45 No.123000000 
<small>12:34頃消えます</small>
<blockquote>本文</blockquote>
<font color="#f00000"><b>このスレは古いので、もうすぐ消えます。</b></font><br>
<div id="radtop"></div>
<span id="ddel">削除された記事が<span id="ddnum">1</span>件あります.<span id="ddbut">見る</span><br></span>
</div>`;
            let $doc = parseFromString(html, 'text/html');

            let got = parseDeletedPostCount($doc.body);
            assert(got === 1);
        });
    });
});

function now() {
    let now = new Date();
    let year = now.getFullYear(), month = now.getMonth() + 1, date = now.getDate();
    month = month < 10 ? `0${month}` : month;
    date = date < 10 ? `0${date}` : date;
    return { year, month, date };
}
