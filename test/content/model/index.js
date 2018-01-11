'use strict';
import assert from 'assert';
import * as model from '~/content/model';

describe(__filename, () => {
    describe('export', () => {
        it('should export model/http-res', () => {
            let { HttpRes } = model;
            assert(HttpRes);
        });

        it('should export model/post', () => {
            let { Post, post } = model;
            assert(Post);
            assert(post);
        });

        it('should export model/preferences', () => {
            let { preferences } = model;
            assert(preferences);
        });

        it('should export model/thread', () => {
            let { thread } = model;
            assert(thread);
        });
    });
});
