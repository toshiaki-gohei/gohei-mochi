'use strict';
import React, { Component } from 'react';
import { CATALOG_SORT } from '~/content/constants';
import { catalogUrl } from '~/content/util/url';
import * as prefs from '~/content/model/preferences';

const { BUMP_ORDER, NEWEST, OLDEST, POSTNUM_DESC, POSTNUM_ASC, HISTORY } = CATALOG_SORT;

export default class Nav extends Component {
    constructor(props) {
        super(props);

        this._handleUpdate = handleUpdate.bind(this);
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

        let propsSet = Object.values(CATALOG_SORT).reduce((set, sort) => {
            let props = { catalog, sort, handler: this._sortBy[sort] };
            set[sort] = props;
            return set;
        }, {});

        return (
<nav className="gohei-nav">
  <ul className="gohei-catalog-menu">
    <li className="gohei-menu-group gohei-left-menu">
      <UpdateBtn {...{ app, handler: this._handleUpdate }} />
      <span className="gohei-font-smaller">{statusMessage(app)}</span>
    </li>
    <li className="gohei-menu-group gohei-right-menu">
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
    </li>
  </ul>
</nav>
        );
    }
}

function UpdateBtn({ app, handler }) {
    let { isUpdating } = app;

    let label = isUpdating ? '更新中…' : '最新に更新';
    let isDisabled = isUpdating ? true : false;

    return <button className="gohei-link-btn gohei-update-btn gohei-menu-item" type="button"
                   disabled={isDisabled} onClick={handler}>{label}</button>;
}

function SortLink({ catalog, sort, handler, children }) {
    let url = catalogUrl(catalog.url, sort);

    let isSelected = catalog.sort === sort ? true : false;
    let css = isSelected ? `${menuLinkCss} gohei-font-bolder` : menuLinkCss;

    return <a href={url} className={css} onClick={handler}>{children}</a>;
}

const menuLinkCss = 'gohei-menu-link gohei-menu-item';

function statusMessage(app) {
    let { updateHttpRes: res } = app;
    if (res == null) return null;

    let { status, statusText } = res;
    if (status === 200) return null;

    return `(${status} ${statusText})`;
}

function catsetUrl(catalog) {
    let { pathname } = new window.URL(catalog.url);
    return `${pathname}?mode=catset`;
}

function handleUpdate() {
    let { commit, catalog } = this.props;

    commit('preferences/set', prefs.load());

    commit('catalog/update', catalog.url, { sort: catalog.sort });
}

function handleSort(sort, event) {
    let { commit, catalog } = this.props;
    commit('catalog/update', catalog.url, { sort });

    event.preventDefault();
}
