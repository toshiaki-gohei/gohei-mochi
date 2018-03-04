'use strict';
import assert from 'assert';
import parser, { parseAll, parse, internal } from '~/content/parser/catalog';
import parseFromString from '~/content/parser/dom-parser';
import { setup, teardown, isBrowser } from '@/support/dom';

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
                catalog: {
                    title: null,
                    threads: []
                },
                title: null,
                ads: {
                    bottom: null
                }
            };
            assert.deepStrictEqual(got, exp);
        });
    });

    describe('parse()', () => {
        it('should return default values if cannot parse', () => {
            let got = parse('<div>unknown format</div>');
            let exp = {
                catalog: {
                    title: null,
                    threads: []
                }
            };
            assert.deepStrictEqual(got, exp);
        });
    });

    describe('parseThumb()', () => {
        const { parseThumb } = internal;

        const $anchor = ($doc) => $doc.body.children[0];

        it('should parse thumb', () => {
            let $doc = parseFromString(`
<a href="res/123456000.htm" target="_blank">
<img src="/b/cat/9876543210000s.jpg" border="0" width="50" height="49" alt="">
</a>`);

            let got = parseThumb($anchor($doc));
            let exp = {
                url: href('/b/cat/9876543210000s.jpg'),
                width: 50, height: 49
            };
            assert.deepStrictEqual(got, exp);
        });

        it('should return null if cannot parse', () => {
            let $doc = parseFromString('<a href="res/123456000.htm" target="_blank"></a>');
            let got = parseThumb($anchor($doc));
            assert(got === null);

            got = parseThumb(null);
            assert(got === null);
        });
    });

    describe('parseThread()', () => {
        const { parseThread } = internal;

        const $td = $doc => $doc.body.children[0].children[0].children[0].children[0];
        const html = `
<table><tbody><tr>
<td>
<a href="res/123456000.htm" target="_blank">
<img src="/b/cat/9876543210000s.jpg" border="0" width="50" height="49" alt="">
</a>
<br>
<small>thread1</small>
<br>
<font size="2">1234</font>
</td>
</tr></tbody></table>
`.replace(/\n/g, '');

        it('should parse thread', () => {
            let $doc = parseFromString(html);

            let got = parseThread($td($doc));
            let exp = {
                url: href('res/123456000.htm'),
                title: 'thread1',
                replynum: 1234,
                thumb: { url: href('/b/cat/9876543210000s.jpg'), width: 50, height: 49 }
            };
            assert.deepStrictEqual(got, exp);
        });

        it('should parse thread without thumb', () => {
            let $doc = parseFromString(`
<table><tbody><tr>
<td>
<a href="res/123456000.htm" target="_blank">
<small>thread1</small>
</a>
<br>
<font size="2">1234</font>
</td>
</tr></tbody></table>
`.replace(/\n/g, ''));

            let got = parseThread($td($doc));
            let exp = {
                url: href('res/123456000.htm'),
                title: 'thread1',
                replynum: 1234,
                thumb: null
            };
            assert.deepStrictEqual(got, exp);
        });

        it('should parse thread on img-server', () => {
            let $doc = parseFromString(`
<table><tbody><tr>
<td>
<a href="res/123456000.htm" target="_blank">
<img src="/b/cat/9876543210000s.jpg" border="0" width="50" height="49" alt="">
</a>
<br>
<font size="2">1234</font>
</td>
</tr></tbody></table>
`.replace(/\n/g, ''));

            let got = parseThread($td($doc));
            let exp = {
                url: href('res/123456000.htm'),
                title: null,
                replynum: 1234,
                thumb: { url: href('/b/cat/9876543210000s.jpg'), width: 50, height: 49 }
            };
            assert.deepStrictEqual(got, exp);
        });

        (isBrowser ? it : it.skip)('should set url to href on browser', () => {
            let $doc = parseFromString(html);
            let { url } = parseThread($td($doc));
            assert(/^https?:\/\/.+\/res\/123456000\.htm$/.test(url));
        });

        it('should return null if cannot parse', () => {
            let $doc = parseFromString(`
<table><tbody><tr>
<td>
<small>thread1</small>
<br>
<font size="2">1234</font>
</td>
</tr></tbody></table>
`.replace(/\n/g, ''));
            let got = parseThread($td($doc));
            assert(got === null);

            got = parseThread(null);
            assert(got === null);
        });
    });

    describe('parseThreads()', () => {
        const { parseThreads } = internal;

        it('should parse threads', () => {
            let $doc = parseFromString(`
<table width="100%"><tbody>
<tr><th bgcolor="#0040e0"><font color="#FFFFFF">カタログモード</font></th></tr>
</tbody></table>
<table><tbody>
<tr>
<td>
<a href="res/123456000.htm" target="_blank"><img src="/b/cat/9876543210000s.jpg" border="0" width="50" height="49" alt=""></a>
<br><small>thread1</small><br><font size="2">1234</font>
</td>
<td>
<a href="res/123456001.htm" target="_blank"><img src="/b/cat/9876543210001s.jpg" border="0" width="50" height="49" alt=""></a>
<br><small>thread2</small><br><font size="2">100</font>
</td>
</tr>
<tr>
<td>
<a href="res/123456002.htm" target="_blank"><img src="/b/cat/9876543210002s.jpg" border="0" width="50" height="49" alt=""></a>
<br><small>thread3</small><br><font size="2">0</font>
</td>
</tr>
</tbody></table>
`.replace(/\n/g, ''));

            let got = parseThreads($doc.body);
            let exp = [
                { url: href('res/123456000.htm'), title: 'thread1', replynum: 1234,
                  thumb: { url: href('/b/cat/9876543210000s.jpg'), width: 50, height: 49 } },
                { url: href('res/123456001.htm'), title: 'thread2', replynum: 100,
                  thumb: { url: href('/b/cat/9876543210001s.jpg'), width: 50, height: 49 } },
                { url: href('res/123456002.htm'), title: 'thread3', replynum: 0,
                  thumb: { url: href('/b/cat/9876543210002s.jpg'), width: 50, height: 49 } }
            ];
            assert.deepStrictEqual(got, exp);
        });

        it('should return [] if cannot parse', () => {
            let $doc = parseFromString('<div>unknown format</div>', 'text/html');
            let got = parseThreads($doc.body);
            assert.deepStrictEqual(got, []);
        });
    });
});

function href(pathname) {
    if (!isBrowser) return pathname;
    if (/^https?:\/\/.+?/.test(pathname)) return pathname;

    let [ url, ] = location.href.split('?');
    if (!/^(https?:\/\/.+?)\/.*$/.test(url)) return null;

    pathname = pathname[0] === '/' ? pathname.slice(1) : pathname;

    return `${RegExp.$1}/${pathname}`;
}
