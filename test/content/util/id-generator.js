'use strict';
import assert from 'assert';
import genId from '~/content/util/id-generator';

describe(__filename, () => {
    describe('genId()', () => {
        it('should not conflict ids', () => {
            let check = {};
            for (let i = 0; i < 100; ++i) check[genId()] = i;

            let got = Object.keys(check).length;
            assert(got === 100);
        });
    });
});
