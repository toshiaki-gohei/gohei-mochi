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
    let catalog = Catalog.load();
    let video = Video.load();

    return create({ catalog, video });
}

export function store(prefs) {
    let { catalog, video } = prefs;
    Catalog.store(catalog);
    Video.store(video);
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

    load() {
        let cxyl = jsCookie.get('cxyl') || null;
        if (cxyl == null || cxyl == '') cxyl = '14x6x4x0x0';

        let values = cxyl.split('x').map(value => +value);
        let [ colnum, rownum, titleLength, titlePosition, thumbSize ] = values;

        return this.create({
            colnum, rownum,
            title: { length: titleLength, position: titlePosition },
            thumb: { size: thumbSize }
        });
    },

    store(prefs) {
        let { colnum, rownum, title, thumb } = prefs;
        let cxyl = [ colnum, rownum, title.length, title.position, thumb.size ].join('x');
        jsCookie.set('cxyl', cxyl);
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

    load() {
        let storage = new LocalStorage();
        let video = storage.get('futabavideo');
        if (video == null || video == '') video = '0.5,false,true';

        let [ volume, muted, loop ] = video.split(',').map(value => value);
        volume = +volume;
        muted = muted === 'true' ? true : false;
        loop = loop === 'true' ? true : false;

        return this.create({ loop, muted, volume });
    },

    store(prefs) {
        let { loop, muted, volume } = prefs;
        let video = [ volume, muted, loop ].join(',');

        let storage = new LocalStorage();
        storage.set('futabavideo', video);
    }
};

export const internal = {
    Catalog,
    Video
};
