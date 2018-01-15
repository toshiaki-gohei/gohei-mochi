'use strict';
import assert from 'assert';
import Nav from '~/content/views/catalog/nav.jsx';
import { h, render } from 'preact';
import { setup, teardown } from '@/support/dom';
import procedures from '~/content/procedures';
import { CATALOG_SORT } from '~/content/constants';
import cookie from 'js-cookie';

describe(__filename, () => {
    before(() => setup());
    after(() => teardown());

    let props;
    beforeEach(() => props = {
        catalog: { url: 'http://example.net/?mode=cat' },
        app: {}
    });

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
<button class="[^"]+" type="button">最新に更新</button>
<span class="gohei-font-smaller">.*</span>
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
            props.catalog.sort = CATALOG_SORT.NEWEST;

            let $el = render(<Nav {...props} />);

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
            props.app.isUpdating = true;
            let $el = render(<Nav {...props} />);

            let got = $el.querySelector('.gohei-update-btn').outerHTML;
            let exp = `
<button class="gohei-link-btn gohei-update-btn gohei-menu-item" type="button" disabled="">
更新中…
</button>
`.replace(/\n/g, '');
            assert(got === exp);
        });

        it('should not render nav if no props', () => {
            let $el = render(<Nav />);
            let got = $el.outerHTML;
            assert(got === undefined);
        });
    });

    describe('event', () => {
        it('should commit procedure if click update', () => {
            let set, update;
            let p1 = new Promise(resolve => set = resolve);
            let p2 = new Promise(resolve => update = resolve);

            let mock = procedures(null, {
                'preferences/set': set,
                'catalog/update': (...args) => update(args)
            });

            props.catalog.sort = CATALOG_SORT.NEWEST;
            cookie.set('cxyl', '15x10x5x1x2');

            let $el = render(<Nav {...{ ...props, commit: mock }} />);

            let $btn = $el.querySelector('.gohei-update-btn');
            $btn.dispatchEvent(new window.Event('click'));

            return Promise.all([
                p1.then(prefs => {
                    let got = prefs.catalog;
                    let exp = {
                        colnum: 15, rownum: 10,
                        title: { length: 5, position: 1 },
                        thumb: { size: 2 }
                    };
                    assert.deepStrictEqual(got, exp);
                }),
                p2.then(([ url, { sort } ]) => {
                    assert(url === 'http://example.net/?mode=cat');
                    assert(sort === 1);
                })
            ]);
        });

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
            $btn.dispatchEvent(new window.Event('click'));
        });
    });
});
