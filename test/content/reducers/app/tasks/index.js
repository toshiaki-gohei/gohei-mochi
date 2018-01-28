'use strict';
import assert from 'assert';
import reducer from '~/content/reducers/app/tasks';

describe(__filename, () => {
    describe('export', () => {
        it('should export reducer', () => {
            assert(typeof reducer === 'function');
        });
    });
});
