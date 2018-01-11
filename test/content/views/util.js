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

    describe('isThreadLazyDisplay()', () => {
        const { isThreadLazyDisplay } = util;

        it('should return true if displayThreshold has value', () => {
            let app = { displayThreshold: 200 };
            let got = isThreadLazyDisplay(app);
            assert(got === true);
        });

        it('should return false if displayThreshold is null', () => {
            let app = { displayThreshold: null };
            let got = isThreadLazyDisplay(app);
            assert(got === false);
        });

        it('should return false if app is null', () => {
            let app = null;
            let got = isThreadLazyDisplay(app);
            assert(got === false);
        });
    });
});
