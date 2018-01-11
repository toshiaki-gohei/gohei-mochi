'use strict';
import assert from 'assert';
import * as icons from '~/content/views/feather-icons.jsx';

describe(__filename, () => {
    describe('export', () => {
        it('should export functions', () => {
            let got = Object.values(icons).every(fn => typeof fn === 'function');
            assert(got === true);
        });
    });
});
