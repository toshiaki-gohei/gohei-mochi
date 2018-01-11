'use strict';
import assert from 'assert';
import * as modules from '~/content/model/thread';
import Post from '~/content/model/post';

describe(__filename, () => {
    describe('export', () => {
        it('should export modules', () => {
            let got = Object.keys(modules).sort();
            let exp = [
                'Changeset',
                'IdipIndex',
                'findQuotedPost',
                'createPosts',
                'internal'
            ].sort();
            assert.deepStrictEqual(got, exp);
        });
    });

    describe('createPosts()', () => {
        const { createPosts } = modules;

        it('should create posts', () => {
            let url = 'https://may.2chan.net/b/res/123456789.htm';
            let posts = [ '100', '101', '102' ].map(no => ({ no }));

            posts = createPosts(posts, url);

            let got = posts.map(({ id, index, no }) => ({ id, index, no }));
            let exp = [
                { id: 'may/b/100', index: 0, no: '100' },
                { id: 'may/b/101', index: 1, no: '101' },
                { id: 'may/b/102', index: 2, no: '102' }
            ];
            assert.deepStrictEqual(got, exp);

            got = posts.every(post => (post instanceof Post));
            assert(got === true);
        });
    });

    describe('genPostId()', () => {
        const { genPostId } = modules.internal;

        it('should generate post id', () => {
            let post = { no: '123000' };
            let url = 'https://may.2chan.net/b/res/123456789.htm';

            let got = genPostId(post, url);
            assert(got === 'may/b/123000');
        });
    });
});
