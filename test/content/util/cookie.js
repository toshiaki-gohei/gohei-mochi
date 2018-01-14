'use strict';
import assert from 'assert';
import { getPreferences } from '~/content/util/cookie';
import { setup, teardown } from '@/support/dom';
import cookie from 'js-cookie';

describe(__filename, () => {
    before(() => setup());
    after(() => teardown());

    beforeEach(() => cookie.remove('cxyl'));

    describe('getPreferences()', () => {
        it('should get preferences', () => {
            cookie.set('cxyl', '14x6x4x0x0');

            let got = getPreferences();
            let exp = {
                cookie: { cxyl: '14x6x4x0x0' }
            };
            assert.deepStrictEqual(got, exp);
        });

        it('should get preferences if no cookie', () => {
            let got = getPreferences();
            let exp = {
                cookie: { cxyl: null }
            };
            assert.deepStrictEqual(got, exp);
        });
    });
});
