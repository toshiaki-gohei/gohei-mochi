'use strict';
import assert from 'assert';
import * as util from '~/content/views/thread/post/util';
import { post } from '~/content/model';

const BR = post.BR_TAG;

describe(__filename, () => {
    describe('replaceNoWithNoQuote()', () => {
        const { replaceNoWithNoQuote } = util;

        it('should replace No with No quote', () => {
            let bq = `No.12345${BR}通常文`;
            let got = replaceNoWithNoQuote(bq);
            let exp = `
<span class="gohei-quote">No.12345</span>${BR}通常文
`.replace(/\n/g, '');
            assert(got === exp);
        });

        it('should replace No with No quote globally', () => {
            let bq = `No.00100${BR}No.00101,No.00102`;
            let got = replaceNoWithNoQuote(bq);
            let exp = `
<span class="gohei-quote">No.00100</span>${BR}
<span class="gohei-quote">No.00101</span>,<span class="gohei-quote">No.00102</span>
`.replace(/\n/g, '');
            assert(got === exp);
        });

        it('should not replace No inside quote', () => {
            let bq = `<span class="gohei-quote">&gt;引用文No.00100</span>${BR}通常文No.00101`;
            let got = replaceNoWithNoQuote(bq);
            let exp = `
<span class="gohei-quote">&gt;引用文No.00100</span>${BR}
通常文<span class="gohei-quote">No.00101</span>
`.replace(/\n/g, '');
            assert(got === exp);
        });

        it('should not replace too short No', () => {
            let bq = `No.123${BR}通常文`;
            let got = replaceNoWithNoQuote(bq);
            let exp = `
No.123${BR}通常文
`.replace(/\n/g, '');
            assert(got === exp);
        });
    });

    describe('replaceLink()', () => {
        const { replaceLink } = util;

        it('should replace a string like URL with link', () => {
            let bq = `https://may.2chan.net/b/res/546730074.htm${BR}通常文`;
            let got = replaceLink(bq);
            let exp = `
<a href="https://may.2chan.net/b/res/546730074.htm" rel="noreferrer">https://may.2chan.net/b/res/546730074.htm</a>${BR}
通常文
`.replace(/\n/g, '');
            assert(got === exp);
        });

        it('should replace strings like URL with link', () => {
            let bq = `
<span class="gohei-quote">
&gt;引用文 https://addons.mozilla.org/ja/firefox/addon/gohei-mochi/
</span>${BR}
通常文 https://addons.mozilla.org/ja/firefox/addon/gohei-mochi/${BR}
<span class="gohei-quote">
&gt;ttp://example.net/foo/bar ttps://example.net/hoge/fuga
</span>${BR}
ttp://example.net/foo/bar ttps://example.net/hoge/fuga
`.replace(/\n/g, '');
            let got = replaceLink(bq);
            let exp = `
<span class="gohei-quote">
&gt;引用文 <a href="https://addons.mozilla.org/ja/firefox/addon/gohei-mochi/" rel="noreferrer">https://addons.mozilla.org/ja/firefox/addon/gohei-mochi/</a>
</span>${BR}
通常文 <a href="https://addons.mozilla.org/ja/firefox/addon/gohei-mochi/" rel="noreferrer">https://addons.mozilla.org/ja/firefox/addon/gohei-mochi/</a>${BR}
<span class="gohei-quote">
&gt;<a href="http://example.net/foo/bar" rel="noreferrer">ttp://example.net/foo/bar</a> <a href="https://example.net/hoge/fuga" rel="noreferrer">ttps://example.net/hoge/fuga</a></span>${BR}
<a href="http://example.net/foo/bar" rel="noreferrer">ttp://example.net/foo/bar</a> <a href="https://example.net/hoge/fuga" rel="noreferrer">ttps://example.net/hoge/fuga</a>
`.replace(/\n/g, '');
            assert(got === exp);
        });

        it('should replace protocol correctly', () => {
            let bq = `
http://example.net/url1 ttp://example.net/url2 tp://example.net/url3${BR}
https://example.net/url1 ttps://example.net/url2 tps://example.net/url3
`.replace(/\n/g, '');
            let got = replaceLink(bq);
            let exp = `
<a href="http://example.net/url1" rel="noreferrer">http://example.net/url1</a> <a href="http://example.net/url2" rel="noreferrer">ttp://example.net/url2</a> <a href="http://example.net/url3" rel="noreferrer">tp://example.net/url3</a>${BR}
<a href="https://example.net/url1" rel="noreferrer">https://example.net/url1</a> <a href="https://example.net/url2" rel="noreferrer">ttps://example.net/url2</a> <a href="https://example.net/url3" rel="noreferrer">tps://example.net/url3</a>
`.replace(/\n/g, '');
            assert(got === exp);
        });
    });

    describe('replaceSiokaraLink()', () => {
        const { replaceSiokaraLink } = util;

        it('should replace a string like siokarabin URL with link', () => {
            let bq = `su1230001.jpg${BR}通常文`;
            let got = replaceSiokaraLink(bq);
            let exp = `
<a href="http://www.nijibox5.com/futabafiles/tubu/src/su1230001.jpg" rel="noreferrer">su1230001.jpg</a>${BR}
通常文
`.replace(/\n/g, '');
            assert(got === exp);
        });

        it('should replace strings like siokarabin URL with link', () => {
            let bq = `
<span class="gohei-quote">
&gt;引用文 su1230001.jpg
</span>${BR}
通常文 su1230001.jpg${BR}
linked already: <a href="http://www.nijibox5.com/futabafiles/tubu/src/su1230001.jpg" rel="noreferrer">http://www.nijibox5.com/futabafiles/tubu/src/su1230001.jpg</a>
`.replace(/\n/g, '');
            let got = replaceSiokaraLink(bq);
            let exp = `
<span class="gohei-quote">
&gt;引用文 <a href="http://www.nijibox5.com/futabafiles/tubu/src/su1230001.jpg" rel="noreferrer">su1230001.jpg</a>
</span>${BR}
通常文 <a href="http://www.nijibox5.com/futabafiles/tubu/src/su1230001.jpg" rel="noreferrer">su1230001.jpg</a>${BR}
linked already: <a href="http://www.nijibox5.com/futabafiles/tubu/src/su1230001.jpg" rel="noreferrer">http://www.nijibox5.com/futabafiles/tubu/src/su1230001.jpg</a>
`.replace(/\n/g, '');
            assert(got === exp);
        });

        it('should replace strings like various siokarabin URL with link', () => {
            let bq = `
ss1230001.jpg${BR}
sa1230001.jpg${BR}
sp1230001.jpg${BR}
sq1230001.jpg${BR}
`.replace(/\n/g, '');
            let got = replaceSiokaraLink(bq);
            let exp = `
<a href="http://www.nijibox5.com/futabafiles/kobin/src/ss1230001.jpg" rel="noreferrer">ss1230001.jpg</a>${BR}
<a href="http://www.nijibox6.com/futabafiles/001/src/sa1230001.jpg" rel="noreferrer">sa1230001.jpg</a>${BR}
<a href="http://www.nijibox2.com/futabafiles/003/src/sp1230001.jpg" rel="noreferrer">sp1230001.jpg</a>${BR}
<a href="http://www.nijibox6.com/futabafiles/mid/src/sq1230001.jpg" rel="noreferrer">sq1230001.jpg</a>${BR}
`.replace(/\n/g, '');
            assert(got === exp);
        });

    });
});
