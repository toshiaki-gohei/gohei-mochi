'use strict';
import React, { Component, Fragment } from 'react';
import { CATALOG_SORT } from '~/content/constants';
import { catalogUrl } from '~/content/util/url';
import { catalog } from '~/content/model';

const { BUMP_ORDER, NEWEST, OLDEST, POSTNUM_DESC, POSTNUM_ASC, HISTORY } = CATALOG_SORT;

export default class Nav extends Component {
    constructor(props) {
        super(props);

        this.state = {
            query: new catalog.Query({ or: true })
        };

        this._handlers = {
            update: handleUpdate.bind(this),
            changeQuery: handleChangeQuery.bind(this)
        };

        this._sortBy = {
            [BUMP_ORDER]: handleSort.bind(this, BUMP_ORDER),
            [NEWEST]: handleSort.bind(this, NEWEST),
            [OLDEST]: handleSort.bind(this, OLDEST),
            [POSTNUM_DESC]: handleSort.bind(this, POSTNUM_DESC),
            [POSTNUM_ASC]: handleSort.bind(this, POSTNUM_ASC),
            [HISTORY]: handleSort.bind(this, HISTORY)
        };
    }

    render() {
        let { catalog, app } = this.props;
        if (catalog == null || app == null) return null;

        let { query } = this.state;

        let { url } = catalog;
        let handlers = this._handlers;

        return (
<nav className="gohei-nav">
  <ul className="gohei-catalog-menu">
    <li className="gohei-menu-group gohei-left-menu">
      <UpdateMenu {...{ app, handlers }} />
      <SearchMenu {...{ url, query, handlers }} />
    </li>
    <li className="gohei-menu-group gohei-right-menu">
      <RightMenu {...{ catalog, handlers: this._sortBy }} />
    </li>
  </ul>
  <StatusMessage {...app} />
</nav>
        );
    }
}

function UpdateMenu({ app, handlers }) {
    let { isUpdating } = app;
    let { update } = handlers;

    let label = isUpdating ? '更新中…' : '最新に更新';
    let isDisabled = isUpdating ? true : false;

    return (
<span className="gohei-menu-item gohei-update">
  <button className="gohei-link-btn gohei-update-btn" type="button"
          disabled={isDisabled} onClick={update}>{label}</button>
</span>
    );
}

function SearchMenu({ url, query, handlers }) {
    if (!isAvailableSearch(url)) return null;

    let { changeQuery } = handlers;
    let value = query.title || '';

    return (
<span className="gohei-menu-item gohei-search">
  <input className="gohei-search-input" type="search" value={value}
         onChange={changeQuery} placeholder="カタログを検索" autoComplete="off" />
  {/*<button className="gohei-link-btn gohei-search-detail" type="button"
          onClick={() => {}}>詳細</button>*/}
</span>
    );
}

function isAvailableSearch(url) {
    if (url == null) return true;

    let { hostname } = new window.URL(url);

    switch (hostname) {
    case 'img.2chan.net':
        return false;
    default:
        return true;
    }
}

function RightMenu({ catalog, handlers }) {
    let propsSet = Object.values(CATALOG_SORT).reduce((set, sort) => {
        let sortBy = handlers[sort];
        let props = { catalog, sort, handler: sortBy };
        set[sort] = props;
        return set;
    }, {});

    return (
<Fragment>
  <SortLink {...propsSet[BUMP_ORDER]}>カタログ</SortLink>
  <span className="gohei-spacer" />
  <SortLink {...propsSet[NEWEST]}>新順</SortLink>
  <SortLink {...propsSet[OLDEST]}>古順</SortLink>
  <SortLink {...propsSet[POSTNUM_DESC]}>多順</SortLink>
  <SortLink {...propsSet[POSTNUM_ASC]}>少順</SortLink>
  <span className="gohei-spacer" />
  <SortLink {...propsSet[HISTORY]}>履歴</SortLink>
  <span className="gohei-spacer" />
  <a href={catsetUrl(catalog)} className={menuLinkCss} target="_blank">設定</a>
</Fragment>
    );
}

function SortLink({ catalog, sort, handler, children }) {
    let url = catalogUrl(catalog.url, sort);

    let isSelected = catalog.sort === sort ? true : false;
    let css = isSelected ? `${menuLinkCss} gohei-font-bolder` : menuLinkCss;

    return <a href={url} className={css} onClick={handler}>{children}</a>;
}

const menuLinkCss = 'gohei-menu-link gohei-menu-item';

function StatusMessage({ httpRes }) {
    let msg = statusMessage(httpRes);
    return (
<div className="gohei-status-msg">
  <span className="gohei-text-error gohei-font-smaller">{msg}</span>
</div>
    );
}

function statusMessage({ status, statusText }) {
    switch (status) {
    case null:
    case 200:
        return null;
    default:
        return `(${status} ${statusText})`;
    }
}

function catsetUrl(catalog) {
    let { pathname } = new window.URL(catalog.url);
    return `${pathname}?mode=catset`;
}

async function handleUpdate() {
    let { commit, catalog } = this.props;

    await commit('preferences/load');

    await commit('catalog/update', catalog.url, { sort: catalog.sort });

    await commit('catalog/updateSearchResults');
}

function handleSort(sort, event) {
    let { commit, catalog } = this.props;
    commit('catalog/update', catalog.url, { sort });

    event.preventDefault();
}

async function handleChangeQuery(event) {
    let { commit } = this.props;
    let { query } = this.state;

    let q = query.object();
    q.title = event.target.value;

    query = new catalog.Query(q);
    this.setState({ query });

    await commit('catalog/search', query);
}
