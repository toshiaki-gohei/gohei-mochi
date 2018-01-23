'use strict';
import assert from 'assert';
import Post from '~/content/views/thread/post/index.jsx';
import React from 'react';
import { render, simulate } from '@/support/react';
import { setup, teardown } from '@/support/dom';
import procedures from '~/content/procedures';
import { Post as ModelPost, thread as modelThread } from '~/content/model';
import Body from '~/content/views/thread/post/body.jsx';
import { sleep } from '~/content/util';

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
<div class="gohei-post-header">.+?</div>
<blockquote class="gohei-post-body"></blockquote>
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
<div class="gohei-post-header">.+?</div>
<blockquote class="gohei-post-body"></blockquote>
</div>
$`.replace(/\n/g, ''));
            assert(exp.test(got));
        });

        it('should not render post if no props', () => {
            let $el = render(<Post />);
            let got = $el.outerHTML;
            assert(got === null);
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

            $el.forceUpdate(() => done());
        });
    });

    describe('event', () => {
        it('should be active if mouse enter', async () => {
            let $el = render(<Post {...{ post }} />);

            assert($el.state.isActive === false);

            simulate.mouseEnter($el.querySelector('.gohei-post'));

            await sleep(1);

            assert($el.state.isActive === true);
        });

        it('should be inactive if mosue leave', async () => {
            let $el = render(<Post {...{ post }} />);

            $el.setState({ isActive: true }, () => {
                assert($el.state.isActive === true);

                simulate.mouseLeave($el.querySelector('.gohei-post'));
            });

            await sleep(1);

            assert($el.state.isActive === false);
        });

        it('should handle to popup posts by id', done => {
            let mock = procedures(null, {
                'thread/openPostsPopup': ({ component, posts, event }) => {
                    assert(typeof component === 'function');
                    assert.deepStrictEqual(posts, [ 'post01' ]);
                    assert(event);
                    done();
                }
            });

            const posts = [
                { id: 'post01', userId: 'id01' },
                { id: 'post02', userId: 'id02'},
                { id: 'post03', userId: null }
            ];
            let app = {
                idipIndex: new modelThread.IdipIndex(posts)
            };
            post = new ModelPost(posts[0]);

            let $el = render(<Post {...{ commit: mock, post, app }} />);

            let $counter = $el.querySelector('.gohei-post-header .gohei-counter');
            simulate.mouseEnter($counter);
        });

        it('should handle to popup posts by ip', done => {
            let mock = procedures(null, {
                'thread/openPostsPopup': ({ component, posts, event }) => {
                    assert(typeof component === 'function');
                    assert.deepStrictEqual(posts, [ 'post01' ]);
                    assert(event);
                    done();
                }
            });

            const posts = [
                { id: 'post01', userIp: 'ip01' },
                { id: 'post02', userIp: 'ip02'},
                { id: 'post03', userIp: null }
            ];
            let app = {
                idipIndex: new modelThread.IdipIndex(posts)
            };
            post = new ModelPost(posts[0]);

            let $el = render(<Post {...{ commit: mock, post, app }} />);

            let $counter = $el.querySelector('.gohei-post-header .gohei-counter');
            simulate.mouseEnter($counter);
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

            let target = $el.querySelector('.gohei-post-body .gohei-quote');
            simulate.mouseOver($el.querySelector('.gohei-post-body'), { target });
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
            simulate.click($btn);

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
            simulate.click($btn);
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

            $el.setState({ isActive: true }, () => {
                let $btn = $el.querySelectorAll('.gohei-post-action button')[0];
                simulate.click($btn);
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

            $el.setState({ isActive: true }, () => {
                let $btn = $el.querySelectorAll('.gohei-post-action button')[1];
                simulate.click($btn);
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

            $el.setState({ isActive: true }, () => {
                let $btn = $el.querySelectorAll('.gohei-post-action button')[2];
                simulate.click($btn);
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
