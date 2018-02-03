'use strict';
import assert from 'assert';
import Postform from '~/content/views/thread/form-post/index.jsx';
import React from 'react';
import { render, simulate } from '@/support/react';
import { setup, teardown } from '@/support/dom';
import createStore from '~/content/reducers';
import { setAppThreads, setUiThread } from '~/content/reducers/actions';
import procedures from '~/content/procedures';
import cookie from 'js-cookie';
import { sleep } from '~/content/util';

describe(__filename, () => {
    before(() => setup());
    after(() => teardown());

    let store, props;
    before(() => {
        store = createStore();
        store.dispatch(setAppThreads({ url: URL }));
        store.dispatch(setUiThread({ panel: { type: 'FORM_POST' } }));

        let { app, ui } = store.getState();
        let { postform } = app.threads.get(URL);
        let { panel } = ui.thread;
        props = { postform, panel };
    });
    beforeEach(() => dispose());

    const URL = 'http://example.net/thread01';

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
<div class="gohei-drop-box">ここにファイルをドロップ</div>
</div>
$`.replace(/\n/g, ''));
            assert(exp.test(got));
        });

        it('should render with inital data', () => {
            store.dispatch(setAppThreads({
                url: URL,
                postform: {
                    action: 'http://example.net/submit-url',
                    hiddens: [
                        { name: 'hidden1', value: 'test hidden1' },
                        { name: 'hidden2', value: 'test hidden2' }
                    ],
                    comment: 'test comment',
                    file: null
                }
            }));
            let { postform } = store.getState().app.threads.get(URL);

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

            let got = $el._$form;
            let exp = $el.querySelector('form');
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

        it('should set a file if change a file', done => {
            let mock = procedures(null, {
                'thread/setFile': file => {
                    assert(file === null);
                    done();
                }
            });

            let $el = render(<Postform {...{ ...props, commit: mock }} />);

            let $inputFile = $el.querySelector('form input[type=file]');
            simulate.change($inputFile);
        });
    });

    describe('submit event', () => {
        let $el;

        it('should commit procedures correctly', () => {
            let submit, setComment, setFile, update;
            let p1 = new Promise(resolve => {
                submit = async args => {
                    await sleep(1);
                    let { isSubmitting, errmsg } = $el.state;
                    resolve({ args, isSubmitting, errmsg });
                    return { ok: true };
                };
            });
            let p2 = new Promise(resolve => setComment = resolve);
            let p3 = new Promise(resolve => setFile = resolve);
            let p4 = new Promise(resolve => update = resolve);

            let mock = procedures(null, {
                'thread/submitPost': submit,
                'thread/setComment': setComment,
                'thread/setFile': setFile,
                'thread/update': update
            });

            store.dispatch(setAppThreads({
                url: URL,
                postform: {
                    action: 'http://example.net/submit-url',
                    comment: 'test comment'
                }
            }));
            let { postform } = store.getState().app.threads.get(URL);

            $el = render(<Postform {...{ ...props, postform, commit: mock }} />);

            $el.setState({ errmsg: 'test errmsg' }, () => {
                let $form = $el.querySelector('form');
                simulate.submit($form);
            });

            return Promise.all([
                p1.then(({ args, isSubmitting, errmsg }) => {
                    let { url, formdata } = args;
                    assert(url === 'http://example.net/submit-url');
                    assert(formdata != null);
                    assert(isSubmitting === true);
                    assert(errmsg === null);
                }),
                p2.then(comment => {
                    assert(comment === null);
                }),
                p3.then(file => {
                    assert(file === null);
                }),
                p4.then(() => {
                    let { isSubmitting } = $el.state;
                    assert(isSubmitting === false);
                })
            ]);
        });

        it('should set formdata correctly', () => {
            let submit;
            let p = new Promise(resolve => {
                submit = args => {
                    resolve(args);
                    return { ok: true };
                };
            });

            let mock = procedures(null, {
                'thread/submitPost': submit,
                'thread/setComment': () => {},
                'thread/setFile': () => {},
                'thread/update': () => {}
            });

            store.dispatch(setAppThreads({
                url: URL,
                postform: {
                    action: 'http://example.net/submit-url',
                    hiddens: [
                        { name: 'hidden1', value: 'test hidden1' },
                        { name: 'hidden2', value: 'test hidden2' }
                    ],
                    file: 'dummy file'
                }
            }));
            let { postform } = store.getState().app.threads.get(URL);

            $el = render(<Postform {...{ ...props, postform, commit: mock }} />);

            $el.querySelector('form input[name=name]').value = 'test name';
            $el.querySelector('form input[name=email]').value = 'test email';
            $el.querySelector('form input[name=sub]').value = 'test sub';
            $el.querySelector('form textarea[name=com]').value = 'test com';
            $el.querySelector('form input[name=pwd]').value = 'test pwd';

            let $form = $el.querySelector('form');
            $form.dispatchEvent(new window.Event('submit'));

            return p.then(({ url, formdata }) => {
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
                    [ 'upfile', 'dummy file' ],
                    [ 'js', 'on' ]
                ];
                assert.deepStrictEqual(got, exp);
            });
        });

        it('should set cookie', () => {
            let update;
            let p = new Promise(resolve => update = resolve);

            let mock = procedures(null, {
                'thread/submitPost': () => ({ ok: true }),
                'thread/setComment': () => {},
                'thread/setFile': () => {},
                'thread/update': update
            });

            store.dispatch(setAppThreads({
                url: URL,
                postform: { comment: 'test comment' }
            }));
            let { postform } = store.getState().app.threads.get(URL);

            $el = render(<Postform {...{ ...props, postform, commit: mock }} />);

            $el.querySelector('form input[name=name]').value = 'test name';
            $el.querySelector('form input[name=pwd]').value = 'test pwd';

            $el.setState({ errmsg: 'test errmsg' }, () => {
                let $form = $el.querySelector('form');
                simulate.submit($form);
            });

            return p.then(() => {
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
                'thread/submitPost': () => ({ ok: false, statusText: 'error message' }),
                'thread/setComment': () => {},
                'thread/setFile': () => {},
                'thread/update': update
            });

            store.dispatch(setAppThreads({
                url: URL,
                postform: { comment: 'test comment' }
            }));
            let { postform } = store.getState().app.threads.get(URL);

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
});

function dispose() {
    cookie.remove('namec');
    cookie.remove('pwdc');
}
