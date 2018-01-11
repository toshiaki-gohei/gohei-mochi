'use strict';
import assert from 'assert';
import * as constants from '~/content/constants';

describe(__filename, () => {
    describe('export', () => {
        it('should export constants', () => {
            let got = Object.keys(constants).sort();
            let exp = [
                'CLASS_NAME',
                'DISPLAY_THRESHOLD',
                'THREAD_PANEL_TYPE',
                'CATALOG_SORT'
            ].sort();
            assert.deepStrictEqual(got, exp);
        });
    });
});
