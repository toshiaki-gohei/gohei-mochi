'use strict';
import File from './file';
import _merge from './merge';
import { bundleQuotes } from './quote';
import { escapeRegExp, textify } from '../../util/html';
import { F } from '~/common/util';

export const PROPS = F([
    'id', 'index',
    'subject', 'name', 'mailto', 'date', 'no', 'userId', 'userIp', 'del', 'sod',
    'file', 'raw',
    'state'
]);

export default class Post {
    constructor(opts) {
        for (let prop of PROPS) this[prop] = null;
        this.raw = RAW;

        for (let prop in opts) {
            if (!this.hasOwnProperty(prop)) continue;
            switch (prop) {
            case 'file':
                this.file = File.create(opts.file);
                break;
            case 'raw':
                this.raw = createRaw(opts.raw);
                break;
            default:
                this[prop] = opts[prop];
            }
        }

        F(this);
    }

    object() {
        let obj = {};
        let { file, raw, ...primitives } = this;

        for (let prop in primitives) obj[prop] = primitives[prop];
        obj.file = file ? file.object() : null;
        obj.raw = { ...raw };

        return obj;
    }

    hasFile() {
        if (this.file == null) return false;
        if (this.file.url == null) return false;
        return true;
    }

    text() {
        let bq = this.raw.blockquote || '';
        let html = bq.replace(BR_TAG_REGEX, '\n');
        return textify(html);
    }

    quote(partOfQuote) {
        let bundle = this.quotes();
        if (partOfQuote == null) return bundle[0];

        let regexp = new RegExp(escapeRegExp(partOfQuote));
        for (let quote of bundle) {
            if (regexp.test(quote)) return quote;
        }

        return null;
    }

    quotes() { return bundleQuotes(this.raw.blockquote); }

    static diff(a, b) {
        if (a.raw.header !== b.raw.header) return 'header';
        if (a.raw.body !== b.raw.body) return 'body';
        if (diffFile(a, b)) return 'file';
        return null;
    }

    static merge(a, b) { return _merge(a, b); }
}

function createRaw(opts) {
    let {
        header = null, body = null,
        fileH = null, fileT = null,
        blockquote = null
    } = opts || {};
    return F({ header, body, fileH, fileT, blockquote });
}
const RAW = createRaw();

export const BR_TAG = '<br />';

const BR_TAG_REGEX = new RegExp(BR_TAG, 'g');

export const STATE = F({
    DELETE_BY_DELETER: 1,
    DELETE_BY_THREAKI: 2,
    DELETE_BY_WRITER: 3,
    DELETE_FILE: 4 // delete only file
});

function diffFile(a, b) {
    if (a.hasFile() && b.hasFile()) return false;
    if (!a.hasFile() && !b.hasFile()) return false;
    return true;
}

export const internal = {
    diffFile
};
