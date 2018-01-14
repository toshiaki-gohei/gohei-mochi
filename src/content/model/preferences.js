'use strict';
import { F } from '~/common/util';

// futaba preferences (cookie and localStorage)

export function create(opts) {
    let { catalog } = opts || {};

    catalog = Catalog.create(catalog);

    return F({ catalog });
}

export function load(data) {
    let { cookie } = data || {};

    let catalog = Catalog.load(cookie);

    return create({ catalog });
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
            colnum,
            rownum,
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

export const internal = {
    Catalog
};
