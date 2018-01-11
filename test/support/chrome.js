'use strict';

/* global window */
(ctx => {
    if (ctx.chrome == null) {
        ctx.chrome = {};
    }

    let chr = ctx.chrome;
    if (chr.webRequest == null) {
        chr.webRequest = {
            onBeforeRequest: { addListener() {} }
        };
    }
    if (chr.runtime == null) {
        chr.runtime = {
            onMessage: { addListener() {} }
        };
    }
    if (chr.runtime.onMessage == null) {
        chr.runtime.onMessage = { addListener() {} };
    }
    if (chr.runtime.sendMessage == null) {
        chr.runtime.sendMessage = () => {};
    }
    if (chr.tabs == null) {
        chr.tabs = {
            onRemoved: { addListener() {} }
        };
    }
    if (chr.extension == null) {
        chr.extension = {
            getURL: url => url
        };
    }
})(global == null ? window : global);
