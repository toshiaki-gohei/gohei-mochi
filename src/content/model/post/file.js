'use strict';
import { F } from '~/common/util';

export default class File {
    constructor(opts) {
        let { url = null, name = null, size = null, thumb = null } = opts || {};

        this.url = url;
        this.name = name;
        this.size = size;
        this.thumb = createThumb(thumb);

        F(this);
    }

    object() {
        let obj = {};
        let { thumb, ...primitives } = this;

        for (let prop in primitives) obj[prop] = primitives[prop];
        obj.thumb = thumb ? { ...thumb } : null;

        return obj;
    }

    isVideo() {
        return this.isMp4() || this.isWebm();
    }

    isMp4() {
        if (/\.mp4$/.test(this.url)) return true;
        return false;
    }

    isWebm() {
        if (/\.webm$/.test(this.url)) return true;
        return false;
    }

    static create(opts) {
        if (opts == null) return null;
        return new File(opts);
    }
}

function createThumb(opts) {
    if (opts == null) return null;
    let { url = null, width = null, height = null } = opts;
    return F({ url, width, height });
}
