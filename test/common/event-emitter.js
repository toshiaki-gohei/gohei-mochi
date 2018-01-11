'use strict';
import assert from 'assert';
import EventEmitter from '~/common/event-emitter';

describe(__filename, () => {
    describe('export', () => {
        it('should export EventEmitter', () => {
            assert(EventEmitter);

            let got = new EventEmitter();
            assert(got);
            assert(typeof got.on === 'function');
            assert(typeof got.off === 'function');
            assert(typeof got.once === 'function');
        });
    });
});
