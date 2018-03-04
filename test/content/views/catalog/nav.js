'use strict';
import assert from 'assert';
import Nav from '~/content/views/catalog/nav.jsx';
import React from 'react';
import { render, simulate } from '@/support/react';
import { setup, teardown, disposePreferences } from '@/support/dom';
import createStore from '~/content/reducers';
import { setDomainCatalogs, setAppCatalogs } from '~/content/reducers/actions';
import procedures, { defaultMap } from '~/content/procedures';
import { CATALOG_SORT } from '~/content/constants';
import jsCookie from 'js-cookie';

describe(__filename, () => {
    before(() => setup());
    after(() => teardown());

    let store, props;
    beforeEach(() => {
        store = createStore();
        store.dispatch(setDomainCatalogs({ url: URL }));
        store.dispatch(setAppCatalogs({ url: URL }));

        let { domain, app } = store.getState();
        let catalog = domain.catalogs.get(URL);
        let appCatalog = app.catalogs.get(URL);
        props = { catalog, app: appCatalog };
    });

    const URL = 'http://example.net/?mode=cat';

    describe('render()', () => {
        it('should render nav', () => {
            let $el = render(<Nav {...props} />);

            let got = $el.outerHTML;
            let exp = new RegExp(`^
<nav class="gohei-nav">
<ul class="gohei-catalog-menu">
<li class="gohei-menu-group gohei-left-menu">.+</li>
<li class="gohei-menu-group gohei-right-menu">.+</li>
</ul>
<div class="gohei-status-msg"><span class="gohei-text-error gohei-font-smaller"></span></div>
</nav>
$`.replace(/\n/g, ''));
            assert(exp.test(got));
        });

        it('should render catalog menu', () => {
            let $el = render(<Nav {...props} />);

            let got = $el.outerHTML;
            let exp = new RegExp(`
<ul class="gohei-catalog-menu">
<li class="gohei-menu-group gohei-left-menu">
<span class="gohei-menu-item gohei-update">
<button class="gohei-link-btn gohei-update-btn" type="button">最新に更新</button>
</span>
<span class="gohei-menu-item gohei-search"><input .+?></span>
</li>
<li class="gohei-menu-group gohei-right-menu">
<a .+>カタログ</a>
<span class="gohei-spacer"></span>
<a .+>新順</a><a .+>古順</a><a .+>多順</a><a .+>少順</a>
<span class="gohei-spacer"></span>
<a .+>履歴</a>
<span class="gohei-spacer"></span>
<a .+>設定</a>
</li>
</ul>
`.replace(/\n/g, ''));
            assert(exp.test(got));
        });

        it('should render menu link url correctly', () => {
            let $el = render(<Nav {...props} />);

            let got = $el.outerHTML;
            let exp = new RegExp(`
<li class="gohei-menu-group gohei-right-menu">
<a (?=.*href="\\S+?mode=cat").*>カタログ</a>
<span class="gohei-spacer"></span>
<a (?=.*href="\\S+?mode=cat&amp;sort=1").*>新順</a>
<a (?=.*href="\\S+?mode=cat&amp;sort=2").*>古順</a>
<a (?=.*href="\\S+?mode=cat&amp;sort=3").*>多順</a>
<a (?=.*href="\\S+?mode=cat&amp;sort=4").*>少順</a>
<span class="gohei-spacer"></span>
<a (?=.*href="\\S+?mode=cat&amp;sort=9&amp;guid=on").*>履歴</a>
<span class="gohei-spacer"></span>
<a (?=.*href="\\S+?mode=catset").*>設定</a>
</li>
`.replace(/\n/g, ''));
            assert(exp.test(got));
        });

        it('should render bolder menu link', () => {
            store.dispatch(setDomainCatalogs({
                url: URL,
                sort: CATALOG_SORT.NEWEST
            }));
            let catalog = store.getState().domain.catalogs.get(URL);

            let $el = render(<Nav {...{ ...props, catalog }} />);

            let got = $el.outerHTML;
            let exp = new RegExp(`
<li class="gohei-menu-group gohei-right-menu">
.+
<a href="\\S+?mode=cat&amp;sort=1" class="[^"]+ gohei-font-bolder">新順</a>
.+
</li>
`.replace(/\n/g, ''));
            assert(exp.test(got));
        });

        it('should render updating message if catalog is updating', () => {
            store.dispatch(setAppCatalogs({
                url: URL,
                isUpdating: true
            }));
            let app = store.getState().app.catalogs.get(URL);

            let $el = render(<Nav {...{ ...props, app }} />);

            let got = $el.querySelector('.gohei-update-btn').outerHTML;
            let exp = `
<button class="gohei-link-btn gohei-update-btn" type="button" disabled="">
更新中…
</button>
`.replace(/\n/g, '');
            assert(got === exp);
        });

        it('should not render nav if no props', () => {
            let $el = render(<Nav />);
            let got = $el.outerHTML;
            assert(got === null);
        });
    });

    describe('update event', () => {
        after(() => disposePreferences());

        it('should commit procedure if click update', () => {
            let update;
            let p = new Promise(resolve => update = resolve);

            let mock = procedures(store, {
                ...defaultMap(store),
                'catalog/update': (...args) => update(args)
            });

            store.dispatch(setDomainCatalogs({ url: URL, sort: CATALOG_SORT.NEWEST }));
            let catalog = store.getState().domain.catalogs.get(URL);

            jsCookie.set('cxyl', '15x10x5x1x2');

            let $el = render(<Nav {...{ ...props, commit: mock, catalog }} />);

            let $btn = $el.querySelector('.gohei-update-btn');
            simulate.click($btn);

            return p.then(([ url, { sort } ]) => {
                assert(url === 'http://example.net/?mode=cat');
                assert(sort === 1);

                let { ui } = store.getState();
                let got = ui.preferences.catalog;
                let exp = {
                    colnum: 15, rownum: 10,
                    title: { length: 5, position: 1 },
                    thumb: { size: 2 }
                };
                assert.deepStrictEqual(got, exp);
            });
        });
    });

    describe('search event', () => {
        it('should search if change query', () => {
            let search;
            let p = new Promise(resolve => search = resolve);

            let mock = procedures(null, {
                'catalog/search': search
            });

            let $el = render(<Nav {...{ ...props, commit: mock }} />);

            let $input = $el.querySelector('.gohei-search-input');
            $input.value = 'foo bar';
            simulate.change($input);

            return p.then(query => {
                assert(query.title === 'foo bar');

                let got = $el.state.query.object();
                let exp = { title: 'foo bar', and: false, or: true };
                assert.deepStrictEqual(got, exp);
            });
        });
    });

    describe('sort event', () => {
        it('should commit procedure if click sort', done => {
            let mock = procedures(null, {
                'catalog/update': (url, { sort }) => {
                    assert(url === 'http://example.net/?mode=cat');
                    assert(sort === CATALOG_SORT.POSTNUM_DESC);
                    done();
                }
            });

            let $el = render(<Nav {...{ ...props, commit: mock }} />);

            let $btn = $el.querySelector('.gohei-right-menu > .gohei-menu-link:nth-child(5)'); // 多順
            simulate.click($btn);
        });
    });
});
