'use strict';
import jconv from 'jconv';

export default { encode, decode, isAscii };

export function encode(str) {
    let buf = jconv.encode(str, 'cp932');
    return new Uint8Array(buf);
}

class TextDecoder {
    decode(arrBuf) {
        let buffer = Buffer.from(arrBuf);
        return jconv.decode(buffer, 'cp932');
    }
}

const isDefinedTextDecoder = (typeof window !== 'undefined' && window.TextDecoder != null);
const decoder = isDefinedTextDecoder ? new window.TextDecoder('shift-jis') : new TextDecoder();

export function decode(arrBuf) {
    return decoder.decode(arrBuf);
}

export function isAscii(str) {
    for (let c of str) {
        if (0x007F < c.codePointAt(0)) return false;
    }
    return true;
}
