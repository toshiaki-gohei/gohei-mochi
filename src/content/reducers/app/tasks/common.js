'use strict';
import { F } from '~/common/util';

export function createRes(opts) {
    if (opts == null) return null;
    let { ok = null, status = null, statusText = null } = opts;
    return F({ ok, status, statusText });
}

export function reduceRes(prev, next) {
    if (next === null) return null;
    if (next === undefined || next === prev) return prev;
    return createRes({ ...prev, ...next });
}
