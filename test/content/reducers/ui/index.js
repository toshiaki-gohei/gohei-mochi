'use strict';
import assert from 'assert';
import reducer from '~/content/reducers/ui';

describe(__filename, () => {
    describe('export', () => {
        it('should export reducer', () => {
            assert(typeof reducer === 'function');
        });
    });
});
