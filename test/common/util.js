'use strict';
import assert from 'assert';
import { F, deepCopy } from '~/common/util';
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

    describe('deepCopy()', () => {
        it('should copy deelply', () => {
            let obj = {
                a: { x: { z: 1 }, y: 2 },
                b: [ 1, 2 ],
                c: new Date(),
                d: 'str',
                e: 1,
                f: null,
                g: undefined
            };

            let got = deepCopy(obj);
            assert(got !== obj);

            assert.deepStrictEqual(got.a, obj.a);
            assert(got.a !== obj.a);
            assert(got.a.x !== obj.a.x);

            assert(got.b !== obj.b);
            assert.deepStrictEqual(got.b, obj.b);

            assert(got.c !== obj.c);
            assert(got.c.toUTCString() === obj.c.toUTCString());

            assert(got.d === obj.d);
            assert(got.e === obj.e);
            assert(got.f === obj.f);
            assert(got.g === obj.g);

            assert.deepStrictEqual(got, obj);
        });
    });
});
