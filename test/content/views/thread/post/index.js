'use strict';
import assert from 'assert';
import Post from '~/content/views/thread/post/index.jsx';
import { h, render } from 'preact';
import { setup, teardown } from '@/support/dom';
import procedures from '~/content/procedures';
import { Post as ModelPost } from '~/content/model';
import Body from '~/content/views/thread/post/body.jsx';

describe(__filename, () => {
    before(() => setup());
    after(() => teardown());

    let post;
    beforeEach(() => post = new ModelPost({ id: 'post01', index: 1 }));

    describe('render()', () => {
        it('should render reply', () => {
            let $el = render(<Post {...{ post }} />);

            let got = $el.outerHTML;
            let exp = new RegExp(`^
<div class="gohei-post gohei-reply">
<div class="gohei-post-header" style="">.+?</div>
<blockquote class="gohei-post-body" style=""></blockquote>
</div>
$`.replace(/\n/g, ''));
            assert(exp.test(got));
        });

        it('should render original post', () => {
            post = new ModelPost({ ...post, index: 0 });
            let $el = render(<Post {...{ post }} />);

            let got = $el.outerHTML;
            let exp = new RegExp(`^
<div class="gohei-post gohei-op">
<div class="gohei-post-header" style="">.+?</div>
<blockquote class="gohei-post-body" style=""></blockquote>
</div>
$`.replace(/\n/g, ''));
            assert(exp.test(got));
        });

        it('should not render post if no props', () => {
            let $el = render(<Post />);
            let got = $el.outerHTML;
            assert(got === undefined);
        });
    });

    describe('Body#shouldComponentUpdate()', () => {
        let backup;
        before(() => backup = Body.prototype.shouldComponentUpdate);
        after(() => Body.prototype.shouldComponentUpdate = backup);

        it('should handle body change correctly', done => {
            let $el = render(<Post {...{ post }} />);

            let fn = Body.prototype.shouldComponentUpdate;
            Body.prototype.shouldComponentUpdate = function (...args) {
                let ret = fn.apply(this, args);
                assert(ret === false);
                return ret;
            };

            $el._component.forceUpdate(() => done());
        });
    });

    describe('event', () => {
        it('should be active if mouse enter', done => {
            let $el = render(<Post {...{ post }} />);
            let c = $el._component;

            assert(c.state.isActive === false);

            $el.dispatchEvent(new window.Event('mouseenter'));

            setTimeout(() => {
                assert(c.state.isActive === true);
                done();
            }, 5);
        });

        it('should be inactive if mosue leave', done => {
            let $el = render(<Post {...{ post }} />);
            let c = $el._component;

            c.setState({ isActive: true }, () => {
                assert(c.state.isActive === true);

                $el.dispatchEvent(new window.Event('mouseleave'));
            });

            setTimeout(() => {
                assert(c.state.isActive === false);
                done();
            }, 5);
        });

        it('should handle to popup quote', done => {
            let mock = procedures(null, {
                'thread/openQuotePopup': ({ component, index, quote, event }) => {
                    assert(typeof component === 'function');
                    assert(index === 1);
                    assert(quote === '>引用文');
                    assert(event);
                    done();
                }
            });

            let blockquote = '<span class="gohei-quote">&gt;引用文</span><br />通常文';
            post = new ModelPost({ ...post, raw: { blockquote } });

            let $el = render(<Post {...{ commit: mock, post }} />);

            let $quote = $el.querySelector('.gohei-post-body .gohei-quote');
            $quote.dispatchEvent(new window.Event('mouseover', { bubbles: true }));
        });

        it('should handle delreq', () => {
            let addDelreqs, openPanel;
            let p1 = new Promise(resolve => addDelreqs = resolve);
            let p2 = new Promise(resolve => openPanel = resolve);

            let mock = procedures(null, {
                'thread/addDelreqs': addDelreqs,
                'thread/openPanel': openPanel
            });

            post = new ModelPost({ ...post, del: 'del' });
            let thread = { url: 'http://example.net' };
            let $el = render(<Post {...{ commit: mock, post, thread }} />);

            let $btn = $el.querySelector('.gohei-post-header .gohei-del');
            $btn.dispatchEvent(new window.Event('click'));

            return Promise.all([
                p1.then(({ url, id }) => {
                    assert(url === 'http://example.net');
                    assert(id === 'post01');
                }),
                p2.then(type => {
                    assert(type === 'DELREQ');
                })
            ]);
        });

        it('should handle soudane', done => {
            let mock = procedures(null, {
                'thread/soudane': ({ id }) => {
                    assert(id === 'post01');
                    done();
                    return { ok: true };
                }
            });

            post = new ModelPost({ ...post, sod: 0 });
            let $el = render(<Post {...{ commit: mock, post }} />);

            let $btn = $el.querySelector('.gohei-post-header .gohei-sod');
            $btn.dispatchEvent(new window.Event('click'));
        });

        it('should handle to display all', done => {
            let mock = procedures(null, {
                'thread/setDisplayThreshold': threshold => {
                    assert(threshold === null);
                    done();
                }
            });

            post = new ModelPost({ ...post, index: 0 });
            let app = { displayThreshold: 200 };
            let $el = render(<Post {...{ commit: mock, post, app }} />);

            let $btn = $el.querySelector('.gohei-display-all-btn');
            $btn.dispatchEvent(new window.Event('click'));
        });
    });

    describe('popup quote event', () => {
        let mock, p1, p2;
        beforeEach(() => {
            let quote, openPanel;
            p1 = new Promise(resolve => quote = resolve);
            p2 = new Promise(resolve => openPanel = resolve);

            mock = procedures(null, {
                'thread/quote': quote,
                'thread/openPanel': openPanel
            });
        });

        it('should handle to quote no', () => {
            let $el = render(<Post {...{ commit: mock, post }} />);
            let c = $el._component;

            c.setState({ isActive: true }, () => {
                let $btn = $el.querySelectorAll('.gohei-post-action button')[0];
                $btn.dispatchEvent(new window.Event('click'));
            });

            return Promise.all([
                p1.then(({ type, id }) => {
                    assert(type === 'no');
                    assert(id === 'post01');
                }),
                p2.then(type => {
                    assert(type === 'FORM_POST');
                })
            ]);
        });

        it('should handle to quote comment', () => {
            let $el = render(<Post {...{ commit: mock, post }} />);
            let c = $el._component;

            c.setState({ isActive: true }, () => {
                let $btn = $el.querySelectorAll('.gohei-post-action button')[1];
                $btn.dispatchEvent(new window.Event('click'));
            });

            return Promise.all([
                p1.then(({ type, id }) => {
                    assert(type === 'comment');
                    assert(id === 'post01');
                }),
                p2.then(type => {
                    assert(type === 'FORM_POST');
                })
            ]);
        });

        it('should handle to quote file', () => {
            let file = { url: 'file url' };
            post = new ModelPost({ ...post, file });

            let $el = render(<Post {...{ commit: mock, post }} />);
            let c = $el._component;

            c.setState({ isActive: true }, () => {
                let $btn = $el.querySelectorAll('.gohei-post-action button')[2];
                $btn.dispatchEvent(new window.Event('click'));
            });

            return Promise.all([
                p1.then(({ type, id }) => {
                    assert(type === 'file');
                    assert(id === 'post01');
                }),
                p2.then(type => {
                    assert(type === 'FORM_POST');
                })
            ]);
        });
    });
});
