'use strict';
import assert from 'assert';
import * as models from '~/content/model';

describe(__filename, () => {
    describe('export', () => {
        it('should export modules', () => {
            let got = Object.keys(models).sort();
            let exp = [
                'catalog',
                'HttpRes',
                'Post', 'post',
                'preferences',
                'thread'
            ].sort();
            assert.deepStrictEqual(got, exp);
        });
    });
});
