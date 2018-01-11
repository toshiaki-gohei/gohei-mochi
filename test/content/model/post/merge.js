'use strict';
import assert from 'assert';
import merge from '~/content/model/post/merge';
import Post, { STATE } from '~/content/model/post';

describe(__filename, () => {
    describe('merge()', () => {
        it('should merge correctly', () => {
            let a = new Post({
                index: 1, subject: '無念', name: 'としあき', mailto: null,
                date: '17/01/01(日)01:23:45', no: '12301', userId: null, userIp: null,
                del: 'del', sod: 0,
                raw: {
                    header: 'before header', body: 'before body', blockquote: 'before blockquote'
                },
                state: null
            });
            let b = new Post({
                index: 1, subject: '無念', name: 'としあき', mailto: null,
                date: '17/01/01(日)01:23:45', no: '12301', userId: 'XXX', userIp: '192.168.*(example.net)',
                del: 'del', sod: 2,
                raw: {
                    header: 'after header', body: 'after body', blockquote: 'after blockquote'
                },
                state: null
            });

            let { post, change } = merge(a, b);

            let got = change;
            let exp = {
                index: 1, no: '12301',
                userId: 'XXX', userIp: '192.168.*(example.net)',
                state: null
            };
            assert.deepStrictEqual(got, exp);

            got = post.object();
            exp = {
                ...b.object(),
                raw: {
                    header: 'after header', body: 'after body',
                    fileH: null, fileT: null,
                    blockquote: 'before blockquote'
                },
                state: null
            };
            assert.deepStrictEqual(got, exp);
        });

        it('should not merge subject, name, mailto in header', () => {
            let a = new Post({
                index: 1, subject: '無念', name: 'としあき', mailto: null
            });
            let b = new Post({
                index: 1, subject: 'なー', name: 'なー', mailto: 'なー',
                raw: { header: 'change' }
            });

            let { post } = merge(a, b);

            let got = post.object();
            let exp = {
                ...b.object(),
                subject: '無念', name: 'としあき', mailto: null
            };
            assert.deepStrictEqual(got, exp);
        });

        it('should merge correctly if delete by someone', () => {
            let a = new Post({
                index: 1, no: '12301',
                raw: { body: 'before body', blockquote: 'before blockquote' }
            });
            let b = new Post({
                index: 1, no: '12301',
                raw: {
                    body: '<blockquote><span class="gohei-delete">書き込みをした人によって削除されました</span><br />after body</blockquote>',
                    blockquote: 'after blockquote'
                },
                state: STATE.DELETE_BY_WRITER
            });

            let { post, change } = merge(a, b);

            let got = change;
            let exp = {
                index: 1, no: '12301', userId: null, userIp: null,
                state: STATE.DELETE_BY_WRITER
            };
            assert.deepStrictEqual(got, exp);

            got = post.object();
            exp = {
                ...b.object(),
                raw: {
                    header: null,
                    body: '<blockquote><span class="gohei-delete">書き込みをした人によって削除されました</span><br />after body</blockquote>',
                    fileH: null, fileT: null,
                    blockquote: 'after blockquote<br />before blockquote'
                },
                state: STATE.DELETE_BY_WRITER
            };
            assert.deepStrictEqual(got, exp);
        });

        it('should merge correctly if delete file', () => {
            let a = new Post({ index: 1, no: '12301', file: { url: 'file-url' } });
            let b = new Post({ index: 1, no: '12301' });

            let { post, change } = merge(a, b);

            let got = change;
            let exp = {
                index: 1, no: '12301', userId: null, userIp: null,
                state: STATE.DELETE_FILE
            };
            assert.deepStrictEqual(got, exp);

            got = post.object();
            exp = {
                ...b.object(),
                file: { url: 'file-url', name: null, size: null, thumb: null },
                state: STATE.DELETE_FILE
            };
            assert.deepStrictEqual(got, exp);
        });

        it('should merge correctly if there is no difference', () => {
            let a = new Post({ index: 1, no: '12301' });
            let { post, change } = merge(a, a);
            assert.deepEqual(post, a);
            assert(change === null);
        });
    });
});
