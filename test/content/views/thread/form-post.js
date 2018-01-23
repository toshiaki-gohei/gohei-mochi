'use strict';
import assert from 'assert';
import Postform from '~/content/views/thread/form-post.jsx';
import React from 'react';
import { render, simulate } from '@/support/react';
import { setup, teardown } from '@/support/dom';
import { create as createApp } from '~/content/reducers/app/threads';
import { create as createUi } from '~/content/reducers/ui/thread';
import procedures from '~/content/procedures';
import cookie from 'js-cookie';
import { sleep } from '~/content/util';

describe(__filename, () => {
    before(() => setup());
    after(() => teardown());

    let props;
    before(() => {
        let { postform } = createApp();
        let { panel } = createUi({ panel: { type: 'FORM_POST' } });
        props = { postform, panel };
    });
    beforeEach(() => document.cookie = '');

    describe('render()', () => {
        it('should render postform', () => {
            let $el = render(<Postform {...props} />);

            let got = $el.outerHTML;
            let exp = new RegExp(`^
<div class="gohei-postform">
<div class="gohei-err-msg gohei-text-error"></div>
<form method="POST" enctype="multipart/form-data">
<div class="gohei-hiddens"></div>
<div class="gohei-row">.+</div>
<div class="gohei-row">.+</div>
<div class="gohei-row">.+</div>
<div class="gohei-row">.+</div>
<div class="gohei-row">.+</div>
<div class="gohei-row">.+</div>
</form>
<div class="gohei-drop-msg" style="display: none;">ここにファイルをドロップ</div>
</div>
$`.replace(/\n/g, ''));
            assert(exp.test(got));
        });

        it('should render with inital data', () => {
            let { postform } = createApp({
                postform: {
                    action: 'http://example.net/submit-url',
                    hiddens: [
                        { name: 'hidden1', value: 'test hidden1' },
                        { name: 'hidden2', value: 'test hidden2' }
                    ],
                    comment: 'test comment'
                }
            });
            cookie.set('namec', 'cookie name');
            cookie.set('pwdc', 'cookie pwd');

            let $el = render(<Postform {...{ ...props, postform }} />);

            let got = $el.outerHTML;
            let exp = new RegExp(`
<form.*action="http://example.net/submit-url".*>
<div class="gohei-hiddens">
<input (?=.*type="hidden")(?=.*name="hidden1")(?=.*value="test hidden1").+?>
<input (?=.*type="hidden")(?=.*name="hidden2")(?=.*value="test hidden2").+?>
</div>
.+<input (?=.*name="name")(?=.*value="cookie name").+?>
.+<textarea .*name="com".*?>test comment</textarea>
.+<input (?=.*name="pwd")(?=.*value="cookie pwd").+?>
.+
</form>
`.replace(/\n/g, ''));
            assert(exp.test(got));

            let { name, pwd } = $el.state;
            assert(name === 'cookie name');
            assert(pwd === 'cookie pwd');
        });

        it('should render error message if set state.errmsg', () => {
            let $el = render(<Postform {...props} />);

            $el.setState({ errmsg: 'test errmsg' }, () => {
                let got = $el.querySelector('.gohei-err-msg').innerHTML;
                assert(got === 'test errmsg');
            });
        });

        it('should not render postform if no props', () => {
            let $el = render(<Postform />);
            let got = $el.outerHTML;
            assert(got === null);
        });
    });

    describe('refs', () => {
        it('shoudl set elements', () => {
            let $el = render(<Postform {...props} />);

            let got = $el._$inputFile;
            let exp = $el.querySelector('input[type=file]');
            assert(got === exp);

            got = $el._$comment;
            exp = $el.querySelector('textarea');
            assert(got === exp);
        });
    });

    describe('event', () => {
        it('should set comment if change comment', done => {
            let mock = procedures(null, {
                'thread/setComment': comment => {
                    assert(comment === 'test com');
                    done();
                }
            });

            let $el = render(<Postform {...{ ...props, commit: mock }} />);

            let $textarea = $el.querySelector('form textarea[name=com]');
            $textarea.value = 'test com';
            simulate.change($textarea);
        });
    });

    describe('submit event', () => {
        let $el;

        it('should commit procedures correctly', () => {
            let submit, setComment, update;
            let p1 = new Promise(resolve => {
                submit = async args => {
                    await sleep(1);
                    let { isPosting, errmsg } = $el.state;
                    resolve({ args, isPosting, errmsg });
                    return { ok: true };
                };
            });
            let p2 = new Promise(resolve => setComment = resolve);
            let p3 = new Promise(resolve => update = resolve);

            let mock = procedures(null, {
                'thread/submit': submit,
                'thread/setComment': setComment,
                'thread/update': update
            });

            let { postform } = createApp({
                postform: {
                    action: 'http://example.net/submit-url',
                    comment: 'test comment'
                }
            });

            $el = render(<Postform {...{ ...props, postform, commit: mock }} />);

            $el.setState({ errmsg: 'test errmsg' }, () => {
                let $form = $el.querySelector('form');
                simulate.submit($form);
            });

            return Promise.all([
                p1.then(({ args, isPosting, errmsg }) => {
                    let { url, formdata } = args;
                    assert(url === 'http://example.net/submit-url');
                    assert(formdata != null);
                    assert(isPosting === true);
                    assert(errmsg === null);
                }),
                p2.then(comment => {
                    assert(comment === null);
                }),
                p3.then(() => {
                    let { isPosting } = $el.state;
                    assert(isPosting === false);
                })
            ]);
        });

        it('should set formdata correctly', () => {
            let submit, setComment, update;
            let p1 = new Promise(resolve => {
                submit = args => {
                    resolve(args);
                    return { ok: true };
                };
            });
            let p2 = new Promise(resolve => setComment = resolve);
            let p3 = new Promise(resolve => update = resolve);

            let mock = procedures(null, {
                'thread/submit': submit,
                'thread/setComment': setComment,
                'thread/update': update
            });

            let { postform } = createApp({
                postform: {
                    action: 'http://example.net/submit-url',
                    hiddens: [
                        { name: 'hidden1', value: 'test hidden1' },
                        { name: 'hidden2', value: 'test hidden2' }
                    ]
                }
            });

            $el = render(<Postform {...{ ...props, postform, commit: mock }} />);

            $el.querySelector('form input[name=name]').value = 'test name';
            $el.querySelector('form input[name=email]').value = 'test email';
            $el.querySelector('form input[name=sub]').value = 'test sub';
            $el.querySelector('form textarea[name=com]').value = 'test com';
            $el.querySelector('form input[name=pwd]').value = 'test pwd';

            let $form = $el.querySelector('form');
            $form.dispatchEvent(new window.Event('submit'));

            return Promise.all([
                p1.then(({ url, formdata }) => {
                    assert(url === 'http://example.net/submit-url');
                    let got = formdata.entries();
                    let exp = [
                        [ 'hidden1', 'test hidden1' ],
                        [ 'hidden2', 'test hidden2' ],
                        [ 'name', 'test name' ],
                        [ 'email', 'test email' ],
                        [ 'sub', 'test sub' ],
                        [ 'com', 'test com' ],
                        [ 'pwd', 'test pwd' ],
                        [ 'js', 'on' ]
                    ];
                    assert.deepStrictEqual(got, exp);
                }),
                p2, p3
            ]);
        });

        it('should set cookie', () => {
            let update;
            let p = new Promise(resolve => update = resolve);

            let mock = procedures(null, {
                'thread/submit': () => ({ ok: true }),
                'thread/setComment': () => {},
                'thread/update': update
            });

            let { postform } = createApp({
                postform: { comment: 'test comment' }
            });

            $el = render(<Postform {...{ ...props, postform, commit: mock }} />);

            $el.querySelector('form input[name=name]').value = 'test name';
            $el.querySelector('form input[name=pwd]').value = 'test pwd';

            $el.setState({ errmsg: 'test errmsg' }, () => {
                let $form = $el.querySelector('form');
                simulate.submit($form);
            });

            return p.then(() => {
                let { name, pwd } = $el.state;
                assert(name === 'test name');
                assert(pwd === 'test pwd');
                let namec = cookie.get('namec');
                let pwdc = cookie.get('pwdc');
                assert(namec === 'test name');
                assert(pwdc === 'test pwd');
            });
        });

        it('should set errmsg if error occurs', () => {
            let update;
            let p = new Promise(resolve => update = resolve);

            let mock = procedures(null, {
                'thread/submit': () => ({ ok: false, statusText: 'error message' }),
                'thread/setComment': () => {},
                'thread/update': update
            });

            let { postform } = createApp({
                postform: { comment: 'test comment' }
            });

            $el = render(<Postform {...{ ...props, postform, commit: mock }} />);

            let $form = $el.querySelector('form');
            simulate.submit($form);

            return p.then(() => {
                let { errmsg } = $el.state;
                assert(errmsg === 'error message');
            });
        });

        it('should set errmsg if form is empty', async () => {
            let mock = procedures(null, {});

            $el = render(<Postform {...{ ...props, commit: mock }} />);

            let $form = $el.querySelector('form');
            simulate.submit($form);

            await sleep(1);

            let { errmsg } = $el.state;
            assert(errmsg === '何か書いて下さい');
        });
    });

    describe('drag & drop event', () => {
        it('should set state correctly if dragenter -> dragover -> dragleave', async () => {
            let $el = render(<Postform {...props} />);

            assert($el._isInsideDropBox === false);
            assert($el._isInsideChildren === false);

            // dragenter($postform) ->
            // dragover: dragenter($child1) -> dragleave($postform) ->
            // dragover: dragenter($child2) -> dragleave($child1) ->
            // dragover: dragenter($postform) -> dragleave($child2) ->
            // dragleave($postform)

            simulate.dragEnter($el.querySelector('.gohei-postform'));
            await sleep(1);
            assert($el._isInsideDropBox === true);
            assert($el._isInsideChildren === false);
            assert($el.state.styleDropMsg === null);

            simulate.dragEnter($el.querySelector('textarea'));
            await sleep(1);
            assert($el._isInsideDropBox === true);
            assert($el._isInsideChildren === true);
            assert($el.state.styleDropMsg === null);

            simulate.dragLeave($el.querySelector('.gohei-postform'));
            await sleep(1);
            assert($el._isInsideDropBox === true);
            assert($el._isInsideChildren === false);
            assert($el.state.styleDropMsg === null);

            simulate.dragEnter($el.querySelector('.gohei-postform'));
            await sleep(1);
            assert($el._isInsideDropBox === true);
            assert($el._isInsideChildren === true);
            assert($el.state.styleDropMsg === null);

            simulate.dragLeave($el.querySelector('textarea'));
            await sleep(1);
            assert($el._isInsideDropBox === true);
            assert($el._isInsideChildren === false);
            assert($el.state.styleDropMsg === null);

            simulate.dragLeave($el.querySelector('.gohei-postform'));
            await sleep(1);
            assert($el._isInsideDropBox === false);
            assert($el._isInsideChildren === false);
            assert.deepStrictEqual($el.state.styleDropMsg, { display: 'none' });
        });
    });
});
