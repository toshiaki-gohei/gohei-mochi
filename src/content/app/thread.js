'use strict';
import { render, createElement as createComponent } from 'preact';
import createStore from '../reducers';
import { setDomainThreads, setAppThreads, setAppCurrent } from '../reducers/actions';
import procedures from '../procedures';
import { sendMessage, initializeBodyStyle, removeChildNodes } from './util';
import Main from '../views/thread/index.jsx';
import { nav, footer } from '../views/commons';
import { parseAll } from '../parser/thread';
import * as prefs from '../model/preferences';
import { createElement, $ } from '../util/dom';
import { DISPLAY_THRESHOLD, THREAD_PANEL_TYPE as P_TYPE } from '../constants';
import EventEmitter from '~/common/event-emitter';
import stopwatch from '~/common/stopwatch';

export default class App {
    constructor() {
        this._$el = null;
        this._url = document.URL;
        this._store = createStore();
        this._commit = procedures(this._store);
        this._emitter = new EventEmitter();

        this._html = null;
        this._$bucket = null;

        this._preventer = new JsErrorPreventer();
    }

    runBeforeDOMContentLoaded() {
        this._preventer.inject();
    }

    init() {
        this._initEventListener();

        this._preventer.eject();

        this._html = document.body.outerHTML;
        let title = document.title;

        this._$bucket = {
            head: removeChildNodes(document.head),
            body: removeChildNodes(document.body)
        };

        document.title = title;
        initializeBodyStyle(document.body);
    }

    run() {
        stopwatch.start('parse thread');

        let {
            thread, messages, postform, delform,
            title, notice,
            ads
        } = parseAll(this._html);

        this._html = null;

        stopwatch.stop('parse thread');

        let url = this._url;

        let $el = createInner({ url, title, notice });
        this._mount($el);

        let { _store: store, _commit: commit, _emitter: emitter } = this;
        let displayThreshold = getDisplayThreshold(thread.posts);

        store.dispatch(setDomainThreads({ url }));
        store.dispatch(setAppThreads({ url, displayThreshold }));
        store.dispatch(setAppCurrent({ thread: url }));

        let contents = {
            url,
            thread,
            messages, postform, delform,
            lastModified: document.lastModified
        };
        commit('thread/load', contents);

        commit('preferences/set', prefs.load());

        commit('thread/setPanel', { isOpen: false, type: P_TYPE.FORM_POST });

        stopwatch.start('first render');

        emitter.once('thread:did-mount', () => {
            this._$bucket = null;
            if (process.env.NODE_ENV === 'development') return;
            this._displayAds(ads);
        });

        let $main = createComponent(Main, { store, commit, emitter });
        render($main, this._$el, $(ID_MP_MAIN));
    }

    _mount($el) {
        let body = document.body;
        body.insertBefore($el, body.firstChild);
        this._$el = $el;
    }

    _initEventListener() {
        this._emitter.once('thread:did-mount', () => {
            stopwatch.stop('first render');
            adjustScroll();
            stopwatch.log('parse thread');
            stopwatch.log('first render');
        });

        window.addEventListener('beforeunload', () => {
            registerScroll();
        }, { once: true });
    }

    _displayAds(ads) {
        let { top, underPostForm, onThread, right, onDelForm, bottom } = ads || {};

        if (top) $(ID_ADS.TOP).innerHTML = top;
        if (underPostForm) $(ID_ADS.UNDER_POSTFORM).innerHTML = underPostForm;
        if (onThread) $(ID_ADS.ON_THREAD).innerHTML = onThread;
        if (right) $(ID_ADS.RIGHT).innerHTML = right;
        if (onDelForm) $(ID_ADS.ON_DELFORM).innerHTML = onDelForm;
        if (bottom) $(ID_ADS.BOTTOM).innerHTML = bottom;
    }
}

const ID_MP_MAIN = 'mount-point-of-main';
const ID_ADS = {
    TOP: 'gohei-ad-top',
    UNDER_POSTFORM: 'gohei-ad-under-postform',
    ON_THREAD: 'gohei-ad-on-thread',
    RIGHT: 'gohei-ad-right',
    ON_DELFORM: 'gohei-ad-on-delform',
    BOTTOM: 'gohei-ad-bottom'
};

function createInner({ url, title = '', notice = {} }) {
    let notices = (notice.raw || []).map(html => `<li>${html}</li>`).join('');

    let $el = createElement('div', { class: 'gohei-app-thread' });
    $el.innerHTML = `
<div class="gohei-ad" id="${ID_ADS.TOP}"></div>
<header class="gohei-header">
<h1 class="gohei-title">${title}</h1>
${nav({ url })}
</header>
<section>
<h2 class="gohei-mode-title">レス送信モード</h2>
<ul class="gohei-notice">${notices}</ul>
</section>
<div class="gohei-ad" id="${ID_ADS.UNDER_POSTFORM}"></div>
<hr>
<div class="gohei-ad" id="${ID_ADS.ON_THREAD}"></div>
<div id="${ID_MP_MAIN}"></div>
<hr>
<div class="gohei-ad" id="${ID_ADS.RIGHT}"></div>
<div class="gohei-ad" id="${ID_ADS.ON_DELFORM}"></div>
<div class="gohei-ad" id="${ID_ADS.BOTTOM}"></div>
${footer()}
`;

    return $el;
}

function getDisplayThreshold(posts) {
    let threshold = DISPLAY_THRESHOLD.INITIAL;
    if (posts.length < threshold) return null;
    return threshold;
}

function registerScroll() {
    let url = window.location.href;
    let { pageXOffset, pageYOffset } = window;
    let unload = { url, pageXOffset, pageYOffset };

    sendMessage({ type: 'store', set: { unload } });
}

async function adjustScroll() {
    let tab = await sendMessage({ type: 'store', get: 'tab' });

    if (tab == null || tab.unload == null) return;

    let { url, pageXOffset, pageYOffset } = tab.unload;
    if (url !== window.location.href) return;

    window.scroll(pageXOffset, pageYOffset);
}

class JsErrorPreventer {
    constructor() {
        this.$el = null;
    }

    inject() {
        this.$el = createElement('script', {
            src: chrome.extension.getURL('resources/js-error-preventer.js')
        });

        // append directly under <html> because could not access head and body
        document.documentElement.appendChild(this.$el);
    }

    eject() {
        this.$el.parentNode.removeChild(this.$el);
        this.$el = null;
    }
}

export const internal = {
    createInner
};
