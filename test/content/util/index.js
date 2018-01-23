'use strict';
import assert from 'assert';
import * as util from '~/content/util';

describe(__filename, () => {
    describe('sleep()', () => {
        const { sleep } = util;

        it('should sleep', async () => {
            let elapsed = Date.now();

            await sleep(50);

            elapsed = Date.now() - elapsed;
            assert(elapsed > 5);
        });
    });
});
