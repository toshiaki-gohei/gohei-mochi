'use strict';
import React from 'react';
import { render } from 'react-dom';
import createStore from '../reducers';
import { setDomainCatalogs, setAppCatalogs, setAppCurrent } from '../reducers/actions';
import procedures from '../procedures';
import { initializeBodyStyle, removeChildNodes } from './util';
import Main from '../views/catalog/index.jsx';
import { nav, footer } from '../views/commons';
import { parseAll } from '../parser/catalog';
import * as prefs from '../model/preferences';
import { createElement, $ } from '../util/dom';
import { cleanCatalogUrl } from '../util/url';
import EventEmitter from '~/common/event-emitter';
import performance from '~/common/performance';

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
        this._initEventListener();

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
        performance.start('parse catalog');

        let {
            catalog,
            title,
            ads
        } = parseAll(this._html);

        this._html = null;

        performance.end('parse catalog');

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

        commit('preferences/set', prefs.load());

        performance.start('first render');

        if (process.env.NODE_ENV === 'production') {
            emitter.once('catalog:did-mount', () => displayAds(ads));
        }

        let $main = React.createElement(Main, { store, commit, emitter });
        let $container = document.querySelector('main');
        render($main, $container);
    }

    _mount($el) {
        let body = document.body;
        body.insertBefore($el, body.firstChild);
        this._$el = $el;
    }

    _initEventListener() {
        this._emitter.once('catalog:did-mount', () => {
            performance.end('first render');

            this._$bucket = null;

            performance.print([ 'parse catalog', 'first render' ]);
        });
    }
}

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
<main></main>
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

function displayAds(ads) {
    let { bottom } = ads || {};

    if (bottom) $(ID_ADS.BOTTOM).innerHTML = bottom;
}

export const internal = {
    createInner,
    getSort
};
