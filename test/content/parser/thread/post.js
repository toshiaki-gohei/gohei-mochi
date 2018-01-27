'use strict';
import assert from 'assert';
import parsePosts, { internal } from '~/content/parser/thread/post';
import parseFromString from '~/content/parser/dom-parser';
import { STATE } from '~/content/model/post';
import { setup, teardown, tidy } from '@/support/dom';

describe(__filename, () => {
    before(() => setup());
    after(() => teardown());

    describe('create()', () => {
        const { create } = internal;

        it('should create post', () => {
            let got = create();
            let exp = {
                id: null, index: null,
                subject: null, name: null, mailto: null,
                date: null, no: null, userId: null, userIp: null,
                del: null, sod: null,
                file: null, raw: {},
                state: null
            };
            assert.deepStrictEqual(got, exp);
        });

        it('should be seal', done => {
            let post = create();
            try { post.foo = 'bar'; } catch (e) {
                assert(e instanceof TypeError);
                done();
            }
        });
    });

    describe('parseState()', () => {
        const { parseState } = internal;

        it('should parse state correctly', () => {
            let body = '<blockquote><font color="#ff0000">書き込みをした人によって削除されました</font><br>本文</blockquote>';
            let got = parseState(body);
            assert(got === STATE.DELETE_BY_WRITER);

            body = '<blockquote><font color="#ff0000">スレッドを立てた人によって削除されました</font><br>本文</blockquote>';
            got = parseState(body);
            assert(got === STATE.DELETE_BY_THREAKI);

            body = '<blockquote><font color="#ff0000"><b>なー</b></font></blockquote>';
            got = parseState(body);
            assert(got === STATE.DELETE_BY_DELETER);

            body = '<blockquote>comment</blockquote>';
            got = parseState(body);
            assert(got === null);
        });
    });

    describe('parseQuoteLine()', () => {
        const { parseQuoteLine } = internal;

        it('should parse quote line', () => {
            let line = '<font color="#789922">&gt;引用文</font>';
            let got = parseQuoteLine(line);
            let exp = '<span class="gohei-quote">&gt;引用文</span>';
            assert(got === exp);
        });
    });

    describe('parseLineWithFont()', () => {
        const { parseLineWithFont } = internal;

        it('should parse line correctly', () => {
            let line = 'foo<font color="blue">hoge</font>bar<font color="red">fuga</font>baz';
            let got = parseLineWithFont(line);
            let exp = 'foo<span style="color: blue;">hoge</span>bar<span style="color: red;">fuga</span>baz';
            assert(got === exp);
        });

        it('should not parse nested font tag', () => {
            let line = 'foo<font color="blue">hoge<font color="red">fuga</font>piyo</font>bar';
            let got = parseLineWithFont(line);
            let exp = 'foo<span style="color: blue;">hoge<font color="red">fuga</span>piyo</font>bar';
            assert(got === exp);
        });

        it('should not parse unrelated line', () => {
            let got = parseLineWithFont('foo<span>hoge</span>bar');
            assert(got === 'foo<span>hoge</span>bar');

            got = parseLineWithFont('foo bar');
            assert(got === 'foo bar');

            got = parseLineWithFont(null);
            assert(got === null);
        });

        it('should not decode HTML entities', () => {
            let got = parseLineWithFont('<font color="blue">&<>"\'</font>');
            let exp = '<span style="color: blue;">&<>"\'</span>';
            assert(got === exp);

            got = parseLineWithFont('&<>"\'');
            exp = '&<>"\'';
            assert(got === exp);
        });
    });

    describe('parseBlockquote()', () => {
        const { parseBlockquote } = internal;

        it('should parse blockquote', () => {
            let body = `
<blockquote>
通常文1<br>
<font color="#ff0000"><b>なー</b></font><br>
通常文2<br>
<font color="#789922">&gt;引用文1</font><br>
通常文3<br>
<font color="#0000ff">なんか font 付きの文</font><br>
通常文4<br>
<span>知らないタグ</span><br>
通常文5<br>
<font color="#0000ff">知らない<span>タグ</span>が中にある</font><br>
通常文6<br>
</blockquote>`.replace(/\n/g, '');

            let got = parseBlockquote(body);
            let exp = `
通常文1<br />
<span class="gohei-delete-na-">なー</span><br />
通常文2<br />
<span class="gohei-quote">&gt;引用文1</span><br />
通常文3<br />
<span style="color: #0000ff;">なんか font 付きの文</span><br />
通常文4<br />
<span>知らないタグ</span><br />
通常文5<br />
<span style="color: #0000ff;">知らない<span>タグ</span>が中にある</span><br />
通常文6<br />
`.replace(/\n/g, '');
            assert(got === exp);
        });

        it('should collapse sequences of whitespace', () => {
            let got = parseBlockquote('<blockquote>  foo  bar  baz  </blockquote>');
            assert(got === ' foo bar baz ');

            got = parseBlockquote('<blockquote>foo  bar  baz</blockquote>');
            assert(got === 'foo bar baz');

            got = parseBlockquote('<blockquote>foo bar  baz</blockquote>');
            assert(got === 'foo bar baz');
        });

        it('should handle line break correctly', () => {
            let got = parseBlockquote('<blockquote>hoge<br>fuga<br></blockquote>');
            assert(got === 'hoge<br />fuga<br />');

            got = parseBlockquote('<blockquote>hoge<br>fuga</blockquote>');
            assert(got === 'hoge<br />fuga');

            got = parseBlockquote('<blockquote>hoge<br></blockquote>');
            assert(got === 'hoge<br />');

            got = parseBlockquote('<blockquote>hoge</blockquote>');
            assert(got === 'hoge');
        });

        it('should return null if no blockquote', () => {
            let got = parseBlockquote();
            assert(got === null);
            got = parseBlockquote('<blockquote></blockquote>');
            assert(got === null);
            got = parseBlockquote('<no-bq></no-bq>');
            assert(got === null);
        });
    });

    describe('parseSoudane()', () => {
        const { parseSoudane } = internal;

        it('should parse soudane', () => {
            let got = parseSoudane('そうだねx2');
            assert(got === 2);
            got = parseSoudane('そうだねx11');
            assert(got === 11);
            got = parseSoudane('+');
            assert(got === 0);
        });

        it('should return null if cannot parse', () => {
            let got = parseSoudane('unknown format');
            assert(got === null);
            got = parseSoudane('そうだねx２');
            assert(got === null);
        });
    });

    describe('parseHeader()', () => {
        const { parseHeader } = internal;

        it('should parse header', () => {
            let header = `
<input type="checkbox" name="123000001" value="delete" id="delcheck123000001"><font color="#cc1105"><b>無念</b></font> 
Name <font color="#117743"><b>としあき </b></font> 17/01/01(日)01:23:45 No.123000001 <a class="del" href="javascript:void(0);" onclick="del(123000001);return(false);">del</a>
<a href="javascript:void(0);" onclick="sd(123000001);return(false);" class="sod" id="sd123000001">そうだねx2</a>`;

            let got = parseHeader(header);
            let exp = {
                subject: '無念', name: 'としあき', mailto: null,
                date: '17/01/01(日)01:23:45', no: '123000001', userId: null, userIp: null,
                del: 'del', sod: 2
            };
            assert.deepStrictEqual(got, exp);
        });

        it('should parse header with ID', () => {
            let header = `<font color="#cc1105"><b>無念</b></font> 
Name <font color="#117743"><b>としあき </b></font> 17/01/01(日)01:23:45 ID:XXXXXXXX No.123000001 <a class="del">`;

            let got = parseHeader(header);
            let exp = {
                subject: '無念', name: 'としあき', mailto: null,
                date: '17/01/01(日)01:23:45', no: '123000001', userId: 'XXXXXXXX', userIp: null,
                del: null, sod: null
            };
            assert.deepStrictEqual(got, exp);
        });

        it('should parse header with IP', () => {
            let header = `<font color="#cc1105"><b>無念</b></font> 
Name <font color="#117743"><b>としあき </b></font> 17/01/01(日)01:23:45 IP:192.168.*(example.net) No.123000001 <a class="del">`;

            let got = parseHeader(header);
            let exp = {
                subject: '無念', name: 'としあき', mailto: null,
                date: '17/01/01(日)01:23:45', no: '123000001', userId: null, userIp: '192.168.*(example.net)',
                del: null, sod: null
            };
            assert.deepStrictEqual(got, exp);
        });

        it('should parse header with mailto', () => {
            let header = `<font color="#cc1105"><b>無念</b></font> 
Name <font color="#117743"><b><a href="mailto:メル欄">としあき </a></b></font> 17/01/01(日)01:23:45 No.123000001 <a class="del">`;

            let got = parseHeader(header);
            let exp = {
                subject: '無念', name: 'としあき', mailto: 'メル欄',
                date: '17/01/01(日)01:23:45', no: '123000001', userId: null, userIp: null,
                del: null, sod: null
            };
            assert.deepStrictEqual(got, exp);
        });

        it('should parse header with html comment', () => {
            let header = `<font color="#cc1105"><b>無念</b></font> 
Name <font color="#117743"><b>としあき </b></font> 17/01/01(日)01:23:45<!--AnimationGIF--> No.123000001 <a class="del">`;

            let got = parseHeader(header);
            let exp = {
                subject: '無念', name: 'としあき', mailto: null,
                date: '17/01/01(日)01:23:45', no: '123000001', userId: null, userIp: null,
                del: null, sod: null
            };
            assert.deepStrictEqual(got, exp);
        });

        it('should parse if null or etc', () => {
            let got;
            const exp = {
                subject: null, name: null, mailto: null,
                date: null, no: null, userId: null, userIp: null,
                del: null, sod: null
            };
            got = parseHeader(null);
            assert.deepStrictEqual(got, exp);
            got = parseHeader();
            assert.deepStrictEqual(got, exp);
            got = parseHeader('');
            assert.deepStrictEqual(got, exp);
        });
    });

    describe('parseFile()', () => {
        const { parseFile } = internal;

        it('should parse fileH', () => {
            let fileH = ' &nbsp; &nbsp; <a href="/b/src/9876543210.jpg" target="_blank">9876543210.jpg</a>-(888 B) <small>サムネ表示</small><br>';
            let fileT = '<a href="/b/src/9876543210.jpg" target="_blank"><img src="/b/thumb/9876543210s.jpg" border="0" align="left" width="250" height="249" hspace="20" alt="888 B"></a>';

            let got = parseFile(fileH, fileT);
            let exp = {
                url: '/b/src/9876543210.jpg', name: '9876543210.jpg', size: 888,
                thumb: { url: '/b/thumb/9876543210s.jpg', width: 250, height: 249 }
            };
            assert.deepStrictEqual(got, exp);
        });

        it('should parse fileH of original post', () => {
            let fileH = '画像ファイル名：<a href="/b/src/9876543210.jpg" target="_blank">9876543210.jpg</a>-(888 B)<small>サムネ表示</small><br>';
            let fileT = '<a href="/b/src/9876543210.jpg" target="_blank"><img src="/b/thumb/9876543210s.jpg" border="0" align="left" width="250" height="249" hspace="20" alt="888 B"></a>';

            let got = parseFile(fileH, fileT);
            let exp = {
                url: '/b/src/9876543210.jpg', name: '9876543210.jpg', size: 888,
                thumb: { url: '/b/thumb/9876543210s.jpg', width: 250, height: 249 }
            };
            assert.deepStrictEqual(got, exp);
        });

        it('should return null if cannot parse', () => {
            let got = parseFile(null);
            assert.deepStrictEqual(got, null);
            got = parseFile();
            assert.deepStrictEqual(got, null);
            got = parseFile('');
            assert.deepStrictEqual(got, null);
        });
    });

    describe('parseReply()', () => {
        const { parseReply } = internal;

        it('should parse reply', () => {
            let html = `<table border="0"><tbody><tr><td class="rts">…</td><td class="rtd">
<input type="checkbox" name="123000001" value="delete" id="delcheck123000001"><font color="#cc1105"><b>無念</b></font> 
Name <font color="#117743"><b>としあき </b></font> 17/01/01(日)01:23:45 No.123000001 <a class="del" href="javascript:void(0);" onclick="del(123000001);return(false);">del</a>
<a href="javascript:void(0);" onclick="sd(123000001);return(false);" class="sod" id="sd123000001">そうだねx2</a><blockquote><font color="#789922">&gt;引用文</font><br>本文</blockquote></td></tr></tbody></table>`;

            let $doc = parseFromString(html, 'text/html');
            let $table = $doc.querySelector('table');

            let got = parseReply($table);
            for (let prop in got.raw) got.raw[prop] = tidy(got.raw[prop]);
            let exp = {
                id: null, index: null,
                subject: '無念', name: 'としあき', mailto: null,
                date: '17/01/01(日)01:23:45', no: '123000001', userId: null, userIp: null,
                del: 'del', sod: 2,
                file: null,
                raw: {
                    header: tidy(`
<input type="checkbox" name="123000001" value="delete" id="delcheck123000001"><font color="#cc1105"><b>無念</b></font> 
Name <font color="#117743"><b>としあき </b></font> 17/01/01(日)01:23:45 No.123000001 <a class="del" href="javascript:void(0);" onclick="del(123000001);return(false);">del</a>
<a href="javascript:void(0);" onclick="sd(123000001);return(false);" class="sod" id="sd123000001">そうだねx2</a>`),
                    body: '<blockquote><font color="#789922">&gt;引用文</font><br>本文</blockquote>',
                    fileH: null,
                    fileT: null,
                    blockquote: tidy('<span class="gohei-quote">&gt;引用文</span><br />本文')
                },
                state: null
            };
            assert.deepStrictEqual(got, exp);
        });

        it('should parse reply with image', () => {
            let html = `<table border="0"><tbody><tr><td class="rts">…</td><td class="rtd">
<input type="checkbox" name="123000001" value="delete" id="delcheck123000001"><font color="#cc1105"><b>無念</b></font> 
Name <font color="#117743"><b>としあき </b></font> 17/01/01(日)01:23:45 No.123000001 <a class="del" href="javascript:void(0);" onclick="del(123000001);return(false);">del</a>
<a href="javascript:void(0);" onclick="sd(123000001);return(false);" class="sod" id="sd123000001">+</a><br> &nbsp; &nbsp; <a href="/b/src/9876543210.jpg" target="_blank">9876543210.jpg</a>-(888 B) <small>サムネ表示</small><br><a href="/b/src/9876543210.jpg" target="_blank"><img src="/b/thumb/9876543210s.jpg" border="0" align="left" width="250" height="250" hspace="20" alt="888 B"></a><blockquote style="margin-left:290px;">本文</blockquote></td></tr></tbody></table>`;

            let $doc = parseFromString(html, 'text/html');
            let $table = $doc.querySelector('table');

            let got = parseReply($table);
            for (let prop in got.raw) got.raw[prop] = tidy(got.raw[prop]);
            let exp = {
                id: null, index: null,
                subject: '無念', name: 'としあき', mailto: null,
                date: '17/01/01(日)01:23:45', no: '123000001', userId: null, userIp: null,
                del: 'del', sod: 0,
                file: {
                    url: '/b/src/9876543210.jpg', name: '9876543210.jpg', size: 888,
                    thumb: { url: '/b/thumb/9876543210s.jpg', width: 250, height: 250 }
                },
                raw: {
                    header: tidy(`
<input type="checkbox" name="123000001" value="delete" id="delcheck123000001"><font color="#cc1105"><b>無念</b></font> 
Name <font color="#117743"><b>としあき </b></font> 17/01/01(日)01:23:45 No.123000001 <a class="del" href="javascript:void(0);" onclick="del(123000001);return(false);">del</a>
<a href="javascript:void(0);" onclick="sd(123000001);return(false);" class="sod" id="sd123000001">+</a><br>`),
                    body: '<blockquote style="margin-left:290px;">本文</blockquote>',
                    fileH: tidy(' &nbsp; &nbsp; <a href="/b/src/9876543210.jpg" target="_blank">9876543210.jpg</a>-(888 B) <small>サムネ表示</small><br>'),
                    fileT: tidy('<a href="/b/src/9876543210.jpg" target="_blank"><img src="/b/thumb/9876543210s.jpg" border="0" align="left" width="250" height="250" hspace="20" alt="888 B"></a>'),
                    blockquote: '本文'
                },
                state: null
            };
            assert.deepStrictEqual(got, exp);
        });

        it('should parse reply on img-server', () => {
            let html = `<table border="0"><tbody><tr><td class="rts">…</td><td class="rtd">
<input type="checkbox" name="123000001" value="delete" id="delcheck123000001">17/01/01(日)01:23:45 No.123000001 <a class="del" href="javascript:void(0);" onclick="del(123000001);return(false);">del</a>
<a href="javascript:void(0);" onclick="sd(123000001);return(false);" class="sod" id="sd123000001">+</a><blockquote style="margin-left:290px;">本文</blockquote></td></tr></tbody></table>`;

            let $doc = parseFromString(html, 'text/html');
            let $table = $doc.querySelector('table');

            let got = parseReply($table);
            for (let prop in got.raw) got.raw[prop] = tidy(got.raw[prop]);
            let exp = {
                id: null, index: null,
                subject: null, name: null, mailto: null,
                date: '17/01/01(日)01:23:45', no: '123000001', userId: null, userIp: null,
                del: 'del', sod: 0,
                file: null,
                raw: {
                    header: tidy(`
<input type="checkbox" name="123000001" value="delete" id="delcheck123000001">17/01/01(日)01:23:45 No.123000001 <a class="del" href="javascript:void(0);" onclick="del(123000001);return(false);">del</a>
<a href="javascript:void(0);" onclick="sd(123000001);return(false);" class="sod" id="sd123000001">+</a>`),
                    body: '<blockquote style="margin-left:290px;">本文</blockquote>',
                    fileH: null,
                    fileT: null,
                    blockquote: '本文'
                },
                state: null
            };
            assert.deepStrictEqual(got, exp);
        });

        it('should parse as far as possible', () => {
            let html = `<table border="0"><tbody><tr><td class="rts">…</td><td class="rtd">
<font color="#cc1105"><b>無念</b></font> 
Name <font color="#117743"><b>としあき </b></font>
<blockquote style="margin-left:290px;">本文</blockquote></td></tr></tbody></table>`;

            let $doc = parseFromString(html, 'text/html');
            let $table = $doc.querySelector('table');

            let got = parseReply($table);
            let exp = {
                id: null, index: null,
                subject: '無念', name: 'としあき', mailto: null,
                date: null, no: null, userId: null, userIp: null,
                del: null, sod: null,
                file: null,
                raw: {
                    header: `
<font color="#cc1105"><b>無念</b></font> 
Name <font color="#117743"><b>としあき </b></font>
`,
                    body: '<blockquote style="margin-left:290px;">本文</blockquote>',
                    fileH: null,
                    fileT: null,
                    blockquote: '本文'
                },
                state: null
            };
            assert.deepStrictEqual(got, exp);
        });

        it('should parse deleted reply', () => {
            let html = `<table border="0"><tbody><tr><td class="rts">…</td><td class="rtd">
<input type="checkbox" name="123000001" value="delete" id="delcheck123000001"><font color="#cc1105"><b>無念</b></font> 
Name <font color="#117743"><b>としあき </b></font> 17/01/01(日)01:23:45 No.123000001 <a class="del" href="javascript:void(0);" onclick="del(123000001);return(false);">del</a>
<a href="javascript:void(0);" onclick="sd(123000001);return(false);" class="sod" id="sd123000001">そうだねx2</a><blockquote><font color="#ff0000">書き込みをした人によって削除されました</font></blockquote></td></tr></tbody></table>`;

            let $doc = parseFromString(html, 'text/html');
            let $table = $doc.querySelector('table');

            let got = parseReply($table);
            for (let prop in got.raw) got.raw[prop] = tidy(got.raw[prop]);
            let exp = {
                id: null, index: null,
                subject: '無念', name: 'としあき', mailto: null,
                date: '17/01/01(日)01:23:45', no: '123000001', userId: null, userIp: null,
                del: 'del', sod: 2,
                file: null,
                raw: {
                    header: tidy(`
<input type="checkbox" name="123000001" value="delete" id="delcheck123000001"><font color="#cc1105"><b>無念</b></font> 
Name <font color="#117743"><b>としあき </b></font> 17/01/01(日)01:23:45 No.123000001 <a class="del" href="javascript:void(0);" onclick="del(123000001);return(false);">del</a>
<a href="javascript:void(0);" onclick="sd(123000001);return(false);" class="sod" id="sd123000001">そうだねx2</a>`),
                    body: '<blockquote><font color="#ff0000">書き込みをした人によって削除されました</font></blockquote>',
                    fileH: null,
                    fileT: null,
                    blockquote: '<span class="gohei-delete">書き込みをした人によって削除されました</span>'
                },
                state: STATE.DELETE_BY_WRITER
            };

            assert.deepStrictEqual(got, exp);
        });

        it('should parse as far as possible if unknown format', () => {
            let html = '<div>unknown format</div>';

            let $doc = parseFromString(html, 'text/html');
            let $div = $doc.querySelector('div');

            let got = parseReply($div);
            let exp = {
                id: null, index: null,
                subject: null, name: null, mailto: null, date: null,
                no: null, userId: null, userIp: null,
                del: null, sod: null,
                file: null,
                raw: { header: null, body: null, fileH: null, fileT: null, blockquote: null },
                state: null
            };
            assert.deepStrictEqual(got, exp);
        });
    });

    describe('parseOriginalPost()', () => {
        const { parseOriginalPost } = internal;

        it('should parse original post', () => {
            let html = `<div class="thre">画像ファイル名：<a href="/b/src/9876543210.jpg" target="_blank">9876543210.jpg</a>-(888 B)<small>サムネ表示</small><br><a href="/b/src/9876543210.jpg" target="_blank"><img src="/b/thumb/9876543210s.jpg" border="0" align="left" width="250" height="250" hspace="20" alt="888 B"></a><input type="checkbox" name="123000000" value="delete" id="delcheck123000000"><font color="#cc1105"><b>無念</b></font> 
Name <font color="#117743"><b>スレあき </b></font> 17/01/01(日)01:23:45 No.123000000 <a class="del" href="javascript:void(0);" onclick="del(123000000);return(false);">del</a>
<a href="javascript:void(0);" onclick="sd(123000000);return(false);" class="sod" id="sd123000000">+</a>
<small>12:34頃消えます</small>
<blockquote>本文</blockquote><div id="radtop"></div><span id="ddel">削除された記事が<span id="ddnum">2</span>件あります.<span id="ddbut" onclick="onddbut()">見る</span><br></span>
<table border="0"></table>
<table border="0"></table>`;

            let $doc = parseFromString(html, 'text/html');

            let got = parseOriginalPost($doc.body);
            for (let prop in got.raw) got.raw[prop] = tidy(got.raw[prop]);
            let exp = {
                id: null, index: null,
                subject: '無念', name: 'スレあき', mailto: null,
                date: '17/01/01(日)01:23:45', no: '123000000', userId: null, userIp: null,
                del: 'del', sod: 0,
                file: {
                    url: '/b/src/9876543210.jpg', name: '9876543210.jpg', size: 888,
                    thumb: { url: '/b/thumb/9876543210s.jpg', width: 250, height: 250 }
                },
                raw: {
                    header: tidy(`<input type="checkbox" name="123000000" value="delete" id="delcheck123000000"><font color="#cc1105"><b>無念</b></font> 
Name <font color="#117743"><b>スレあき </b></font> 17/01/01(日)01:23:45 No.123000000 <a class="del" href="javascript:void(0);" onclick="del(123000000);return(false);">del</a>
<a href="javascript:void(0);" onclick="sd(123000000);return(false);" class="sod" id="sd123000000">+</a>
<small>12:34頃消えます</small>
`),
                    body: tidy(`<blockquote>本文</blockquote><div id="radtop"></div><span id="ddel">削除された記事が<span id="ddnum">2</span>件あります.<span id="ddbut" onclick="onddbut()">見る</span><br></span>
`),
                    fileH: tidy('画像ファイル名：<a href="/b/src/9876543210.jpg" target="_blank">9876543210.jpg</a>-(888 B)<small>サムネ表示</small><br>'),
                    fileT: tidy('<a href="/b/src/9876543210.jpg" target="_blank"><img src="/b/thumb/9876543210s.jpg" border="0" align="left" width="250" height="250" hspace="20" alt="888 B"></a>'),
                    blockquote: '本文'
                },
                state: null
            };
            assert.deepStrictEqual(got, exp);
        });

        it('should parse original post without image', () => {
            let html = `<div class="thre"><input type="checkbox" name="123000000" value="delete" id="delcheck123000000"><font color="#cc1105"><b>無念</b></font> 
Name <font color="#117743"><b>スレあき </b></font> 17/01/01(日)01:23:45 No.123000000 <a class="del" href="javascript:void(0);" onclick="del(123000000);return(false);">del</a>
<a href="javascript:void(0);" onclick="sd(123000000);return(false);" class="sod" id="sd123000000">+</a>
<small>12:34頃消えます</small>
<blockquote>本文</blockquote><div id="radtop"></div>
<table border="0"></table>
<table border="0"></table>`;

            let $doc = parseFromString(html, 'text/html');

            let got = parseOriginalPost($doc.body);
            for (let prop in got.raw) got.raw[prop] = tidy(got.raw[prop]);
            let exp = {
                id: null, index: null,
                subject: '無念', name: 'スレあき', mailto: null,
                date: '17/01/01(日)01:23:45', no: '123000000', userId: null, userIp: null,
                del: 'del', sod: 0,
                file: null,
                raw: {
                    header: tidy(`<input type="checkbox" name="123000000" value="delete" id="delcheck123000000"><font color="#cc1105"><b>無念</b></font> 
Name <font color="#117743"><b>スレあき </b></font> 17/01/01(日)01:23:45 No.123000000 <a class="del" href="javascript:void(0);" onclick="del(123000000);return(false);">del</a>
<a href="javascript:void(0);" onclick="sd(123000000);return(false);" class="sod" id="sd123000000">+</a>
<small>12:34頃消えます</small>
`),
                    body: `<blockquote>本文</blockquote><div id="radtop"></div>
`,
                    fileH: null, fileT: null,
                    blockquote: '本文'
                },
                state: null
            };
            assert.deepStrictEqual(got, exp);
        });

        it('should parse original post only', () => {
            let html = `<div class="thre"><input type="checkbox" name="123000000" value="delete" id="delcheck123000000"><font color="#cc1105"><b>無念</b></font> 
Name <font color="#117743"><b>スレあき </b></font> 17/01/01(日)01:23:45 No.123000000 <a class="del" href="javascript:void(0);" onclick="del(123000000);return(false);">del</a>
<a href="javascript:void(0);" onclick="sd(123000000);return(false);" class="sod" id="sd123000000">+</a>
<small>12:34頃消えます</small>
<blockquote>本文</blockquote><div style="clear:left"></div>
</div>`;

            let $doc = parseFromString(html, 'text/html');

            let got = parseOriginalPost($doc.body);
            for (let prop in got.raw) got.raw[prop] = tidy(got.raw[prop]);
            let exp = {
                id: null, index: null,
                subject: '無念', name: 'スレあき', mailto: null,
                date: '17/01/01(日)01:23:45', no: '123000000', userId: null, userIp: null,
                del: 'del', sod: 0,
                file: null,
                raw: {
                    header: tidy(`<input type="checkbox" name="123000000" value="delete" id="delcheck123000000"><font color="#cc1105"><b>無念</b></font> 
Name <font color="#117743"><b>スレあき </b></font> 17/01/01(日)01:23:45 No.123000000 <a class="del" href="javascript:void(0);" onclick="del(123000000);return(false);">del</a>
<a href="javascript:void(0);" onclick="sd(123000000);return(false);" class="sod" id="sd123000000">+</a>
<small>12:34頃消えます</small>
`),
                    body: '<blockquote>本文</blockquote>',
                    fileH: null, fileT: null,
                    blockquote: '本文'
                },
                state: null
            };
            assert.deepStrictEqual(got, exp);
        });

        it('should return null if cannot parse', () => {
            let html = '<div>unknown format</div>';

            let $doc = parseFromString(html, 'text/html');
            let got = parseOriginalPost($doc.body);
            assert(got == null);
        });
    });

    describe('parsePosts()', () => {
        it('should parse posts', () => {
            let html = `<div class="thre"><input type="checkbox" name="123000000" value="delete" id="delcheck123000000"><font color="#cc1105"><b>無念</b></font> 
Name <font color="#117743"><b>スレあき </b></font> 17/01/01(日)01:23:45 No.123000000 <a class="del" href="javascript:void(0);" onclick="del(123000000);return(false);">del</a>
<a href="javascript:void(0);" onclick="sd(123000000);return(false);" class="sod" id="sd123000000">+</a>
<small>12:34頃消えます</small>
<blockquote>本文</blockquote><div id="radtop"></div>
<table border="0"><tbody><tr><td class="rts">…</td><td class="rtd">
<input type="checkbox" name="123000001" value="delete" id="delcheck123000001"><font color="#cc1105"><b>無念</b></font> 
Name <font color="#117743"><b>としあき </b></font> 17/01/01(日)01:23:45 No.123000001 <a class="del" href="javascript:void(0);" onclick="del(123000001);return(false);">del</a>
<a href="javascript:void(0);" onclick="sd(123000001);return(false);" class="sod" id="sd123000001">そうだねx2</a><blockquote><font color="#789922">&gt;引用文</font><br>本文</blockquote></td></tr></tbody></table>
</div>`;

            let $doc = parseFromString(html, 'text/html');

            let posts = parsePosts($doc.body);
            let got = posts.map(post => post.name);
            let exp = [ 'スレあき', 'としあき' ];
            assert.deepStrictEqual(got, exp);
        });

        it('should return [] if cannot parse', () => {
            let $doc = parseFromString('<div>unknown format</div>', 'text/html');
            let got = parsePosts($doc.body);
            assert.deepStrictEqual(got, []);
        });
    });
});
