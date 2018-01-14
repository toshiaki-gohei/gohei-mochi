'use strict';
import jsCookie from 'js-cookie';

export function getPreferences() {
    let cxyl = jsCookie.get('cxyl') || null;
    let cookie = { cxyl };
    return { cookie };
}
