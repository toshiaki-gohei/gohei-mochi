'use strict';
import assert from 'assert';
import * as util from '~/content/views/util';

describe(__filename, () => {
    describe('hasChanged()', () => {
        const { hasChanged } = util;

        it('should return true if has changed', () => {
            let self = {
                props: { p: 'initial-P' },
                state: { s: 'initial-S' }
            };

            let nextProps = { p: 'changed-P' };
            let nextState = { s: 'initial-S' };
            let got = hasChanged(self, nextProps, nextState);
            assert(got === true);

            nextProps = { p: 'initial-P' };
            nextState = { s: 'changed-S' };
            got = hasChanged(self, nextProps, nextState);
            assert(got === true);

            nextProps = { a: 'changed-P' };
            nextState = { x: 'changed-S' };
            got = hasChanged(self, nextProps, nextState);
            assert(got === true);
        });

        it('should return false if has not changed', () => {
            let self = {
                props: { p: 'initial-P' },
                state: { s: 'initial-S' }
            };

            let nextProps = { p: 'initial-P' };
            let nextState = { s: 'initial-S' };
            let got = hasChanged(self, nextProps, nextState);
            assert(got === false);
        });
    });

    describe('TASK_STATUS_TEXT', () => {
        const { TASK_STATUS_TEXT } = util;

        it('should be exported', () => {
            assert(TASK_STATUS_TEXT != null);
            assert(typeof TASK_STATUS_TEXT === 'object');
        });
    });

    describe('ellipsisify', () => {
        const { ellipsisify } = util;

        it('should ellipsisify', () => {
            let got = ellipsisify('foobar', 3);
            let exp = 'foo...';
            assert(got === exp);
        });

        it('should not ellipsisify if text is not over length', () => {
            let got = ellipsisify('foo', 3);
            let exp = 'foo';
            assert(got === exp);
        });

        it('should return null if not pass text', () => {
            assert(ellipsisify() === null);
            assert(ellipsisify(null) === null);
        });
    });
});
