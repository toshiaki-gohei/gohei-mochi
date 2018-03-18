'use strict';
import Post, { BR_TAG, STATE } from './index';
import { CLASS_NAME as CN } from '~/content/constants';

export default function merge(a, b) {
    let merged = a.object();

    let isChangedH = mergeHeader(merged, a, b);
    let isChangedB = mergeBody(merged, a, b);
    let isChangedF = mergeFile(merged, a, b);

    if (isChangedB || isChangedF) mergeBlockquote(merged, a, b);

    let change = null;
    if (isChangedH || isChangedB || isChangedF) {
        let { index, no, userId, userIp, state } = merged;
        change = { index, no, userId, userIp, state };
    }

    return { post: new Post(merged), change };
}

function mergeHeader(merged = {}, a, b) {
    let isChanged = false;
    if (a.raw.header === b.raw.header) return isChanged;

    if (a.userId !== b.userId && b.userId != null) {
        merged.userId = b.userId;
        isChanged = true;
    }
    if (a.userIp !== b.userIp && b.userIp != null) {
        merged.userIp = b.userIp;
        isChanged = true;
    }
    merged.sod = b.sod;
    merged.raw.header = b.raw.header;

    return isChanged;
}

function mergeBody(merged = {}, a, b) {
    let isChanged = false;
    if (a.raw.body === b.raw.body) return isChanged;

    if (b.state) {
        merged.state = b.state;
        merged.raw.blockquote = a.raw.blockquote;
        isChanged = true;
    }
    merged.raw.body = b.raw.body;

    return isChanged;
}

function mergeFile(merged = {}, a, b) {
    let isChanged = false;

    if (a.hasFile() && !b.hasFile()) {
        if (merged.state == null) {
            merged.state = STATE.DELETE_FILE;
            isChanged = true;
        }
        // don't merge file not to lost thumb
    }

    return isChanged;
}

function mergeBlockquote(merged, a, b) {
    let lines = b.raw.blockquote.split(BR_TAG);
    let msg = '';

    switch (merged.state) {
    case STATE.DELETE_BY_DELETER:
    case STATE.DELETE_BY_THREAKI:
    case STATE.DELETE_BY_WRITER:
        msg = lines[0];
        break;
    case STATE.DELETE_FILE:
        msg = `<span class="${CN.post.DELETE}">ファイルが削除されました</span>`;
        break;
    default:
        return;
    }

    merged.raw.blockquote = `${msg}${BR_TAG}${merged.raw.blockquote}`;
}
