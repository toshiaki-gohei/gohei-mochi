'use strict';
import { F } from '~/common/util';

export default class HttpRes {
    constructor(opts) {
        this.status = null;
        this.statusText = null;
        this.lastModified = null;
        this.etag = null;

        if (opts) this._init(opts);

        F(this);
    }

    get reqHeaders() {
        return {
            'if-modified-since': this.lastModified,
            'if-none-match': this.etag
        };
    }

    _init(opts) {
        let { status: s = null, statusText: st = null,
              lastModified: lm = null, etag = null, headers = null } = opts || {};

        if (headers) {
            lm = headers.get('last-modified') || null;
            etag = headers.get('etag') || null;
        }

        this.status = s;
        this.statusText = st;
        this.lastModified = lm ? (new Date(lm)).toUTCString() : null;
        this.etag = etag;
    }

    clone(opts = {}) {
        let res = new HttpRes(opts);
        let obj = Object.keys(res).reduce((obj, prop) => {
            if (res[prop] != null) obj[prop] = res[prop];
            return obj;
        }, {});
        return new HttpRes({ ...this, ...obj });
    }
}
