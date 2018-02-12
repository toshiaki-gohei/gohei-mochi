'use strict';
import assert from 'assert';
import * as modules from '~/content/model/catalog';

describe(__filename, () => {
    describe('export', () => {
        it('should export modules', () => {
            let got = Object.keys(modules).sort();
            let exp = [
                'Query'
            ].sort();
            assert.deepStrictEqual(got, exp);
        });
    });
});
