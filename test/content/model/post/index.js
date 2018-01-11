'use strict';
import assert from 'assert';
import Post, { PROPS, internal } from '~/content/model/post';

describe(__filename, () => {
    describe('PROPS', () => {
        it('should have PROPS correctly', () => {
            let got = [].concat(PROPS).sort(); // [].concat() for TypeError by freeze
            let exp = [
                'id', 'index',
                'subject', 'name', 'mailto', 'date', 'no', 'userId', 'userIp', 'del', 'sod',
                'file', 'raw', 'state'
            ].sort();
            assert.deepStrictEqual(got, exp);
        });
    });

    describe('construtor()', () => {
        it('should create post', () => {
            let post = new Post();
            assert(post);

            let got = Object.keys(post).sort();
            let exp = [].concat(PROPS).sort(); // [].concat() for TypeError by freeze
            assert.deepStrictEqual(got, exp);

            assert(post.file === null);
            got = post.raw;
            exp = {
                header: null, body: null, fileH: null, fileT: null, blockquote: null
            };
            assert.deepStrictEqual(got ,exp);
        });

        it('should be freeze', () => {
            let post = new Post();

            let got = 0;
            try { post.index = 1; } catch (e) {
                assert(e instanceof TypeError);
                ++got;
            }
            try { post.file = {}; } catch (e) {
                assert(e instanceof TypeError);
                ++got;
            }
            try { post.raw.header = ''; } catch (e) {
                assert(e instanceof TypeError);
                ++got;
            }
            assert(got === 3);
        });

        it('should create post with opts', () => {
            let post = new Post({ index: 1 });
            assert(post.index === 1);
        });

        it('should not set unknown opts', () => {
            let post = new Post({ index: 1, unknown: true });
            assert('unknown' in post === false);
        });
    });

    describe('object()', () => {
        it('should return object', () => {
            let src = new Post({
                index: 1, subject: '無念', name: 'としあき', mailto: null,
                date: '17/01/01(日)01:23:45', no: '12301', userId: null, userIp: null,
                del: 'del', sod: 0,
                file: { url: 'file-url', thumb: { url: 'thumb-url' } },
                raw: { header: 'HEADER', body: 'BODY', blockquote: 'BLOCKQUOTE' }
            });
            let dst = src.object();

            assert(dst instanceof Post === false);
            assert.deepEqual(dst, src);
            assert(src.file !== dst.file);
            assert(src.file.thumb !== dst.file.thumb);
            assert(src.raw !== dst.raw);
        });

        it('should handle file property correctly', () => {
            let src = new Post({ index: 1, file: null });
            let dst = src.object();
            assert.deepEqual(dst, src);

            src = new Post({ index: 1, file: { url: 'file-url' } });
            dst = src.object();
            assert.deepEqual(dst, src);
            assert(src.file !== dst.file);
        });
    });

    describe('hasFile()', () => {
        it('should return true if post has file', () => {
            let post = new Post({ file: { url: 'file-url' } });
            assert(post.hasFile() === true);
        });

        it('should return false if post does not have file', () => {
            let post = new Post({ file: { url: null } });
            assert(post.hasFile() === false);
            post = new Post({ file: null });
            assert(post.hasFile() === false);
        });
    });

    describe('text()', () => {
        it('should return text', () => {
            let blockquote = '<span class="gohei-quote">&gt;引用文</span><br />通常文';
            let post = new Post({ raw: { blockquote } });
            assert(post.text() === '>引用文\n通常文');
        });

        it('should return text if within some tags', () => {
            let blockquote = '通常文1<br /><span class="gohei-quote">&gt;引用文1</span><br />通常文2<br /><span class="gohei-quote">&gt;引用文2</span><br />通常文3';
            let post = new Post({ raw: { blockquote } });
            let got = post.text();
            let exp = '通常文1\n>引用文1\n通常文2\n>引用文2\n通常文3';
            assert(got === exp);

            blockquote = '<span class="gohei-delete"><b>なー</b></span><br /><span class="gohei-quote">&gt;引用文1</span><br /><span class="gohei-quote">&gt;引用文2</span><br />通常文1<br />通常文2';
            post = new Post({ raw: { blockquote } });
            got = post.text();
            exp = 'なー\n>引用文1\n>引用文2\n通常文1\n通常文2';
            assert(got === exp);
        });
    });

    describe('quote()', () => {
        it('should return quote containing specified quote', () => {
            let blockquote = '<span class="gohei-quote">&gt;引用文1a</span><br /><span class="gohei-quote">&gt;引用文1b</span><br />通常文1<br /><span class="gohei-quote">&gt;引用文2</span><br />通常文2';
            let post = new Post({ raw: { blockquote } });

            let got = post.quote('文1');
            let exp = '引用文1a\n引用文1b';
            assert(got === exp);
            got = post.quote('引用文2');
            exp = '引用文2';
            assert(got === exp);

            got = post.quote('hoge');
            exp = null;
            assert(got === exp);

            got = post.quote(); // return the first quote
            exp = '引用文1a\n引用文1b';
            assert(got === exp);
        });

        it('should return null if post do not have quotes', () => {
            let blockquote = '通常文1<br />通常文2';
            let post = new Post({ raw: { blockquote } });
            let got = post.quote('文1');
            assert(got == null);
        });

        it('should return quote if post contain regexp meta', () => {
            let blockquote = '<span class="gohei-quote">&gt;a+b</span>';
            let post = new Post({ raw: { blockquote } });
            let got = post.quote('a+b');
            let exp = 'a+b';
            assert(got === exp);
        });
    });

    describe('quotes()', () => {
        it('should return quotes', () => {
            let blockquote = '<span class="gohei-quote">&gt;引用文</span><br />通常文';
            let post = new Post({ raw: { blockquote } });
            let got = post.quotes();
            let exp = [ '引用文' ];
            assert.deepStrictEqual(got, exp);
        });
    });

    describe('diffFile()', () => {
        const { diffFile } = internal;

        it('should return true or false correctly', () => {
            let url = 'file url';

            let a = new Post({ file: { url } });
            let b = new Post({ file: { url } });
            assert(diffFile(a, b) === false);
            a = new Post({ file: { url: null } });
            b = new Post({ file: { url: null } });
            assert(diffFile(a, b) === false);
            a = new Post({ file: { url: 'file url a' } });
            b = new Post({ file: { url: 'file url b' } });
            assert(diffFile(a, b) === false);

            a = new Post({ file: { url } });
            b = new Post({ file: { url: null } });
            assert(diffFile(a, b) === true);
            a = new Post({ file: { url: null } });
            b = new Post({ file: { url } });
            assert(diffFile(a, b) === true);
        });
    });

    describe('diff()', () => {
        it('should return true or false correctly', () => {
            let a = new Post({ raw: { header: 'header' } });
            let b = new Post({ raw: { header: 'header' } });
            assert(Post.diff(a, b) === null);
            a = new Post({ raw: { header: 'headerA' } });
            b = new Post({ raw: { header: 'headerB' } });
            assert(Post.diff(a, b) === 'header');

            a = new Post({ raw: { body: 'body' } });
            b = new Post({ raw: { body: 'body' } });
            assert(Post.diff(a, b) === null);
            a = new Post({ raw: { body: 'bodyA' } });
            b = new Post({ raw: { body: 'bodyB' } });
            assert(Post.diff(a, b) === 'body');

            a = new Post({ file: { url: 'file url' } });
            b = new Post({ file: { url: 'file url' } });
            assert(Post.diff(a, b) === null);
            a = new Post({ file: { url: 'file url' } });
            b = new Post({ file: null });
            assert(Post.diff(a, b) === 'file');
        });
    });

    describe('merge()', () => {
        it('should merge', () => {
            let a = new Post({
                index: 1, no: '12301', userId: null, userIp: null,
                raw: { header: 'before header' }
            });
            let b = new Post({
                index: 1, no: '12301', userId: 'XXX', userIp: '192.168.*(example.net)',
                raw: { header: 'after header' }
            });

            let { post, change } = Post.merge(a, b);

            let got = change;
            let exp = {
                index: 1, no: '12301',
                userId: 'XXX', userIp: '192.168.*(example.net)',
                state: null
            };
            assert.deepStrictEqual(got, exp);

            got = post.object();
            exp = b.object();
            assert.deepStrictEqual(got, exp);
        });
    });
});
