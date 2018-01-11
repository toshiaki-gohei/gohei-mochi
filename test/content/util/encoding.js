'use strict';
import assert from 'assert';
import { encode, decode, isAscii } from '~/content/util/encoding';
import { setup, teardown } from '@/support/dom';

describe(__filename, () => {
    before(() => setup());
    after(() => teardown());

    describe('decode()', () => {
        it('should decode', () => {
            let arrBuf = new Uint8Array([0x83, 0x65, 0x83, 0x58, 0x83, 0x67]);
            let got = decode(arrBuf);
            assert(got === 'テスト');
        });
    });

    describe('encode()', () => {
        it('should decode', () => {
            let got = encode('テスト');
            let exp = new Uint8Array([0x83, 0x65, 0x83, 0x58, 0x83, 0x67]);
            assert.deepStrictEqual(got, exp);
        });
    });

    describe('isAscii()', () => {
        it('should return true or false correctly', () => {
            assert(isAscii('test') === true);
            assert(isAscii('テスト') === false);
            assert(isAscii('testテスト') === false);
            assert(isAscii('𐐀') === false); // SMP(𐐀=0x10400)
            assert(isAscii('𠮷') === false); // SIP(𠮷=0x20BB7)
        });
    });
});
