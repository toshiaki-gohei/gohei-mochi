'use strict';
import assert from 'assert';
import { F } from '~/common/util';
import { isBrowser } from '@/support/dom';

describe(__filename, () => {
    (isBrowser ? describe.skip : describe)('F()', () => {
        let backup;
        before(() => backup = process.env.NODE_ENV);
        after(() => process.env.NODE_ENV = backup);

        it('should return freezed object if NODE_ENV is not "production"', done => {
            process.env.NODE_ENV = 'development';

            let obj = F({ foo: 'bar' });
            assert.deepStrictEqual(obj, { foo: 'bar' });

            try { obj.foo = 'baz'; } catch (e) {
                done();
            }
        });

        it('should return object if NODE_ENV is "production"', () => {
            process.env.NODE_ENV = 'production';

            let obj = F({ foo: 'bar' });
            assert.deepStrictEqual(obj, { foo: 'bar' });

            obj.foo = 'baz';
            assert.deepStrictEqual(obj, { foo: 'baz' });
        });
    });
});
