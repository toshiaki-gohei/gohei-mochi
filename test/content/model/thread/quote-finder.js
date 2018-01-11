'use strict';
import assert from 'assert';
import findQuotedPost, { internal } from '~/content/model/thread/quote-finder.js';
import Post from '~/content/model/post';

describe(__filename, () => {
    describe('findQuotedPost()', () => {
        it('should find quoted post', () => {
            let posts = [
                'レス0a<br />レス0b',
                'レス1',
                '<span class="gohei-quote">&gt;レス0a</span><br /><span class="gohei-quote">&gt;レス0b</span><br />レス0を全て引用<br /><span class="gohei-quote">&gt;存在しないレス</span><br />存在しないレスを引用',
                '<span class="gohei-quote">&gt;&gt;レス0b</span><br />レス2の一部を引用'
            ].map((blockquote, i) => new Post({ index: i, raw: { blockquote } }));

            let got = findQuotedPost(posts, { index: 2, quote: 'レス0' });
            assert(got.index === 0);
            got = findQuotedPost(posts, { index: 2, quote: '存在しない' });
            assert(got === null);
            got = findQuotedPost(posts, { index: 3, quote: '>レス0' });
            assert(got.index === 2);
        });

        it('should find quoted post according to priority', () => {
            let posts = [
                { no: '100', bq: 'レス0' },
                { no: '101', bq: '<span class="gohei-quote">&gt;No.100</span><br />レス1' },
                { no: '102', bq: '<span class="gohei-quote">&gt;No.100</span><br />レス2' }
            ].map(({ no, bq }, i) => new Post({ index: i, no, raw: { blockquote: bq } }));

            let got = findQuotedPost(posts, { index: 2, quote: 'No.100' });
            assert(got.index === 0);
        });

        it('should find post by match if quote contian regexp meta', () => {
            let posts = [
                'regexp meta: a+b',
                '<span class="gohei-quote">&gt;regexp meta: a+b</span>'
            ].map((blockquote, i) => new Post({ index: i, raw: { blockquote } }));

            let got = findQuotedPost(posts, { index: 1, quote: 'regexp meta: a+b' });
            assert(got.index === 0);
        });
    });

    describe('findPostByFullMatch()', () => {
        const { findPostByFullMatch: find } = internal;

        it('should find post by full match', () => {
            let posts = [
                'レス0a<br />レス0b',
                'レス1',
                '<span class="gohei-quote">&gt;レス0a</span><br /><span class="gohei-quote">&gt;レス0b</span><br />レス0を全て引用<br /><span class="gohei-quote">&gt;存在しないレス</span><br />存在しないレスを引用'
            ].map((blockquote, i) => new Post({ index: i, raw: { blockquote } }));

            let got = find(posts, { index: 2, quote: 'レス0' });
            assert(got.index === 0);
            got = find(posts, { index: 2, quote: '存在しない' });
            assert(got === null);
        });
    });

    describe('findPostByBeginningOfLineMatch()', () => {
        const { findPostByBeginningOfLineMatch: find } = internal;

        it('should find post by match', () => {
            let posts = [
                'レス0a<br />レス0b',
                'レス1',
                '<span class="gohei-quote">&gt;レス0a</span><br /><span class="gohei-quote">&gt;レス0b</span><br />レス0を全て引用<br /><span class="gohei-quote">&gt;存在しないレス</span><br />存在しないレスを引用'
            ].map((blockquote, i) => new Post({ index: i, raw: { blockquote } }));

            let got = find(posts, { index: 2, quote: 'レス0' });
            assert(got.index === 0);
            got = find(posts, { index: 2, quote: '存在しない' });
            assert(got === null);
        });

        it('should find post by beginning of line match', () => {
            let posts = [
                'レス0',
                'レス1 レス0',
                '<span class="gohei-quote">&gt;レス0</span><br />レス2'
            ].map((blockquote, i) => new Post({ index: i, raw: { blockquote } }));

            let got = find(posts, { index: 2, quote: 'レス0' });
            assert(got.index === 0);
        });

        it('should find post by match if quote contian regexp meta', () => {
            let posts = [
                'regexp meta: a+b',
                '<span class="gohei-quote">&gt;regexp meta: a+b</span>'
            ].map((blockquote, i) => new Post({ index: i, raw: { blockquote } }));

            let got = find(posts, { index: 1, quote: 'regexp meta: a+b' });
            assert(got.index === 0);
        });
    });

    describe('findPostByMatch()', () => {
        const { findPostByMatch: find } = internal;

        it('should find post by match', () => {
            let posts = [
                'レス0',
                'レス1 レス0',
                '<span class="gohei-quote">&gt;レス0</span><br />レス2'
            ].map((blockquote, i) => new Post({ index: i, raw: { blockquote } }));

            let got = find(posts, { index: 2, quote: 'レス0' });
            assert(got.index === 1);
        });
    });

    describe('findPostByNo()', () => {
        const { findPostByNo: find } = internal;

        it('should find post by no', () => {
            let posts = [
                '100', '101', '102'
            ].map((no, i) => new Post({ index: i, no }));

            let got = find(posts, { index: 2, quote: 'No.100' });
            assert(got.no === '100');
            got = find(posts, { index: 2, quote: 'foo No.100 bar' });
            assert(got.no === '100');
            got = find(posts, { index: 2, quote: 'No.109' });
            assert(got === null);
        });

        it('should find post by no (without No.)', () => {
            let posts = [
                '100', '101', '102'
            ].map((no, i) => new Post({ index: i, no }));

            let got = find(posts, { index: 2, quote: '100' });
            assert(got.no === '100');
            got = find(posts, { index: 2, quote: ' 100' });
            assert(got.no === '100');
            got = find(posts, { index: 2, quote: '  100' });
            assert(got === null);
        });
    });

    describe('findPostByFilename()', () => {
        const { findPostByFilename: find } = internal;

        it('should find post by filename', () => {
            let posts = [
                { name: '10000.jpg' },
                null,
                { name: '10002.jpg' }
            ].map((file, i) => new Post({ index: i, file }));

            let got = find(posts, { index: 2, quote: '10000.jpg' });
            assert(got.index === 0);
            got = find(posts, { index: 2, quote: '10000.gif' });
            assert(got === null);
        });

        it('should find post by number filename only', () => {
            let posts = [
                { name: 'string-filename.jpg' },
                null
            ].map((file, i) => new Post({ index: i, file }));

            let got = find(posts, { index: 1, quote: 'string-filename.jpg' });
            assert(got === null);
        });
    });
});
