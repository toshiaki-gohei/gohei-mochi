'use strict';
import { render, createElement as createComponent } from 'preact';
import createStore from '../reducers';
import { setDomainCatalogs, setAppCatalogs, setAppCurrent } from '../reducers/actions';
import procedures from '../procedures';
import { initializeBodyStyle, removeChildNodes } from './util';
import Main from '../views/catalog/index.jsx';
import { nav, footer } from '../views/commons';
import { parseAll } from '../parser/catalog';
import * as preferences from '../model/preferences';
import { createElement, $ } from '../util/dom';
import { cleanCatalogUrl } from '../util/url';
import EventEmitter from '~/common/event-emitter';
import jsCookie from 'js-cookie';
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
    }

    init() {
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
            catalog,
            title,
            ads
        } = parseAll(this._html);

        this._html = null;

        stopwatch.stop('parse thread');

        let url = cleanCatalogUrl(this._url);
        let sort = getSort(this._url);

        let $el = createInner({ url, title });
        this._mount($el);

        let { _store: store, _commit: commit, _emitter: emitter } = this;

        store.dispatch(setDomainCatalogs({ url, sort }));
        store.dispatch(setAppCatalogs({ url }));
        store.dispatch(setAppCurrent({ catalog: url }));

        let contents = { url, catalog };
        commit('catalog/load', contents);

        let pref = preferences.load(getPreferences());
        commit('preferences/set', pref);

        stopwatch.start('first render');

        emitter.once('thread:loaded', () => {
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

    // eslint-disable-next-line no-unused-vars
    _displayAds(ads) {
        let { bottom } = ads || {};

        if (bottom) $(ID_ADS.BOTTOM).innerHTML = bottom;
    }
}

const ID_MP_MAIN = 'mount-point-of-main';
const ID_ADS = {
    BOTTOM: 'gohei-ad-bottom'
};

function createInner({ url, title = '' } = {}) {
    let $el = createElement('div', { class: 'gohei-app-catalog' });
    $el.innerHTML = `
<header class="gohei-header">
<h1 class="gohei-title">${title}</h1>
${nav({ url })}
</header>
<hr>
<div id="${ID_MP_MAIN}"></div>
<hr>
<div class="gohei-ad" id="${ID_ADS.BOTTOM}"></div>
${footer()}
`;

    return $el;
}

function getSort(url) {
    url = new window.URL(url);
    let sort = url.searchParams.get('sort');
    return sort == null ? null : +sort;
}

function getPreferences() {
    let cxyl = jsCookie.get('cxyl') || null;
    let cookie = { cxyl };
    return { cookie };
}

export const internal = {
    createInner,
    getSort,
    getPreferences
};
