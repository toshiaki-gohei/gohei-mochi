'use strict';
import assert from 'assert';
import { bundleQuotes } from '~/content/model/post/quote';

describe(__filename, () => {
    describe('quotes()', () => {
        it('should return quotes', () => {
            let bq = '<span class="gohei-quote">&gt;引用文</span><br />通常文';
            let got = bundleQuotes(bq);
            let exp = [ '引用文' ];
            assert.deepStrictEqual(got, exp);
        });

        it('should return quotes if blockquote is complex', () => {
            let bq = `
<span class="gohei-quote">&gt;引用文1a</span><br />
<span class="gohei-quote">&gt;引用文1b</span><br />
通常文1<br />
<span class="gohei-quote">&gt;引用文2</span><br />
通常文2
`.replace(/\n/g, '');
            let got = bundleQuotes(bq);
            let exp = [ '引用文1a\n引用文1b', '引用文2' ];
            assert.deepStrictEqual(got, exp);

            bq = `
通常文1<br />
<span class="gohei-quote">&gt;引用文1</span><br />
通常文2<br />
<span class="gohei-quote">&gt;引用文2</span><br />
通常文3
`.replace(/\n/g, '');
            got = bundleQuotes(bq);
            exp = [ '引用文1', '引用文2' ];
            assert.deepStrictEqual(got, exp);
        });

        it('should return quotes if quote contain anchor', () => {
            let bq = `
<span class="gohei-quote">&gt;引用文</span><br />
<span class="gohei-quote">&gt;<a href="url">url</a></span><br />
通常文
`.replace(/\n/g, '');
            let got = bundleQuotes(bq);
            let exp = [ '引用文\nurl' ];
            assert.deepStrictEqual(got, exp);
        });

        it('should return quote while skipping non-quote', () => {
            let bq = `
<span class="gohei-delete">スレあき削除</span><br />
<span class="gohei-quote">&gt;引用文</span><br />
通常文
`.replace(/\n/g, '');
            let got = bundleQuotes(bq);
            let exp = [ '引用文' ];
            assert.deepStrictEqual(got, exp);
        });

        it('should return [] if blockquote is null', () => {
            let got = bundleQuotes(null);
            assert.deepStrictEqual(got, []);
        });
    });
});
