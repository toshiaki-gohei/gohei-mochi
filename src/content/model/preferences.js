'use strict';
import { F } from '~/common/util';

// futaba cookie preferences

export function create(opts) {
    let {
        colnum = null,
        rownum = null,
        title: { length = null, position = null } = {},
        thumb: { size = null } = {}
    } = opts || {};

    return F({
        colnum,
        rownum,
        title: F({ length, position }),
        thumb: F({ size })
    });
}

export function load(cookie) {
    if (cookie == null || cookie == '') cookie = '14x6x4x0x0';

    let values = cookie.split('x').map(value => +value);
    let [ colnum, rownum, titleLength, titlePosition, thumbSize ] = values;

    let pref = create({
        colnum, rownum,
        title: { length: titleLength, position: titlePosition },
        thumb: { size: thumbSize }
    });
    return pref;
}
