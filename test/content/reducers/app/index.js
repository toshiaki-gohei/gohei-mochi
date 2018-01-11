'use strict';
import assert from 'assert';
import reducer from '~/content/reducers/app';

describe(__filename, () => {
    describe('export', () => {
        it('should export reducer', () => {
            assert(typeof reducer === 'function');
        });
    });
});
