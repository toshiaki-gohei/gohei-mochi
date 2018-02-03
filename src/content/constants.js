'use strict';
import { F } from '~/common/util';

export const CLASS_NAME = F({
    POST: 'gohei-post',
    post: F({
        POSTDEL_CHECKBOX: 'gohei-postdel-checkbox',
        QUOTE: 'gohei-quote',
        DELETE: 'gohei-delete',
        DELETE_NA: 'gohei-delete-na-'
    }),

    POPUP: 'gohei-popup'
});

export const DISPLAY_THRESHOLD = F({
    INITIAL: 200,
    INCREMENT: 100,

    // 16: font-size
    //  4: header and body height are 4em at least
    // 50: before 100 posts
    ROOT_MARGIN: `0px 0px ${16 * 4 * 50}px 0px`
});

export const THREAD_PANEL_TYPE = F({
    FORM_POST: 'FORM_POST',
    FORM_DEL: 'FORM_DEL',
    DELREQ: 'DELREQ'
});

export const CATALOG_SORT = F({
    BUMP_ORDER: 0,
    NEWEST: 1,
    OLDEST: 2,
    POSTNUM_DESC: 3,
    POSTNUM_ASC: 4,
    HISTORY: 9
});
