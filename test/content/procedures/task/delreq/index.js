'use strict';
import assert from 'assert';
import * as procedures from '~/content/procedures/task/delreq';

describe(__filename, () => {
    describe('export', () => {
        it('should export functions', () => {
            let got = Object.values(procedures).every(fn => typeof fn === 'function');
            assert(got === true);
        });
    });
});
