'use strict';
import { F } from '~/common/util';
import jsCookie from 'js-cookie';
import LocalStorage from '../util/local-storage';

// futaba preferences (cookie and localStorage)

export function create(opts) {
    let { catalog, video } = opts || {};

    catalog = Catalog.create(catalog);
    video = Video.create(video);

    return F({ catalog, video });
}

export function load() {
    let cookie = loadCookie();
    let storage = loadLocalStorage();

    let catalog = Catalog.load(cookie);
    let video = Video.load(storage);

    return create({ catalog, video });
}

function loadCookie() {
    let cxyl = jsCookie.get('cxyl') || null;
    return { cxyl };
}

function loadLocalStorage() {
    let storage = new LocalStorage();
    let futabavideo = storage.get('futabavideo');
    return { futabavideo };
}

const Catalog = {
    create(opts) {
        let {
            colnum = null,
            rownum = null,
            title: { length = null, position = null } = {},
            thumb: { size = null } = {}
        } = opts || {};

        return F({
            colnum, rownum,
            title: F({ length, position }),
            thumb: F({ size })
        });
    },

    load(cookie) {
        let { cxyl } = cookie || {};
        if (cxyl == null || cxyl == '') cxyl = '14x6x4x0x0';

        let values = cxyl.split('x').map(value => +value);
        let [ colnum, rownum, titleLength, titlePosition, thumbSize ] = values;

        return this.create({
            colnum, rownum,
            title: { length: titleLength, position: titlePosition },
            thumb: { size: thumbSize }
        });
    }
};

const Video = {
    create(opts) {
        let {
            loop = null,
            muted = null,
            volume = null
        } = opts || {};

        return F({ loop, muted, volume });
    },

    load(storage) {
        let { futabavideo: video } = storage || {};
        if (video == null || video == '') video = '0.5,false,true';

        let [ volume, muted, loop ] = video.split(',').map(value => value);
        volume = +volume;
        muted = muted === 'true' ? true : false;
        loop = loop === 'true' ? true : false;

        return this.create({ loop, muted, volume });
    }
};

export const internal = {
    loadCookie,
    loadLocalStorage,
    Catalog,
    Video
};
