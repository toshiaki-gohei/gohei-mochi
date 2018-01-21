'use strict';
import assert from 'assert';
import * as procedures from '~/content/procedures/thread';
import createStore from '~/content/reducers';
import { setAppThreads, setUiThread } from '~/content/reducers/actions';
import { pick, pluckFromMap as pluck } from '@/support/util';

describe(__filename, () => {
    let store;
    beforeEach(() => store = createStore());

    describe('export', () => {
        it('should export functions', () => {
            let got = Object.values(procedures).every(fn => typeof fn === 'function');
            assert(got === true);
        });
    });

    describe('load()', () => {
        const { load } = procedures;

        it('should load', () => {
            let url = 'https://may.2chan.net/b/res/123000.htm';

            let contents = {
                url,
                thread: {
                    posts: [ { no: '100' }, { no: '101' }, { no: '102' } ],
                    expire: { message: '12:34頃消えます', date: 'date' }
                },
                messages: { viewer: '1234人くらい' },
                postform: { action: 'http://example.net/post' },
                lastModified: '01/01/2017 10:23:45'
            };

            load(store, contents);

            let { domain, app } = store.getState();

            let got = domain.threads.get(url);
            let exp = {
                url,
                title: null,
                posts: [ 'may/b/100', 'may/b/101', 'may/b/102' ],
                expire: { message: '12:34頃消えます', date: 'date' },
                postnum: null,
                newPostnum: null,
                thumb: null
            };
            assert.deepStrictEqual(got, exp);

            got = pluck(domain.posts, 'id', 'no');
            exp = [
                { id: 'may/b/100', no: '100' },
                { id: 'may/b/101', no: '101' },
                { id: 'may/b/102', no: '102' }
            ];
            assert.deepStrictEqual(got, exp);

            got = pick(app.threads.get(url), 'messages', 'postform', 'updateHttpRes');
            exp = {
                messages: {
                    viewer: '1234人くらい',
                    notice: null, warning: null, deletedPostCount: null
                },
                postform: {
                    action: 'http://example.net/post',
                    hiddens: [], comment: null, file: null
                },
                updateHttpRes: {
                    status: null, statusText: null,
                    lastModified: 'Sun, 01 Jan 2017 01:23:45 GMT', etag: null
                }
            };
            assert.deepEqual(got, exp);
        });
    });

    describe('setDisplayThreshold()', () => {
        const { setDisplayThreshold } = procedures;

        const url = 'http://example.net/thread01';
        const getThreshold = () => store.getState().app.threads.get(url).displayThreshold;

        beforeEach(() => {
            store = createStore({ app: { current: { thread: url } } });
            store.dispatch(setAppThreads({ url }));
        });

        it('should set display threshold', () => {
            let got = getThreshold();
            assert(got === null);

            setDisplayThreshold(store, 200);

            got = getThreshold();
            assert(got === 200);
        });
    });

    describe('setComment()', () => {
        const { setComment } = procedures;

        const url = 'http://example.net/thread01';
        const getComment = () => store.getState().app.threads.get(url).postform.comment;

        beforeEach(() => {
            store = createStore({ app: { current: { thread: url } } });
            store.dispatch(setAppThreads({ url }));
        });

        it('should set comment', () => {
            setComment(store, 'foo bar');

            let got = getComment();
            assert(got === 'foo bar');
        });

        it('should not set comment if not change comment', () => {
            setComment(store, 'foo bar');
            let prev = store.getState();

            setComment(store, [ 'foo', 'bar' ].join(' '));

            let got = store.getState();
            assert(got === prev);
        });
    });

    describe('setFile()', () => {
        const { setFile } = procedures;

        const url = 'http://example.net/thread01';
        const getFile = () => store.getState().app.threads.get(url).postform.file;

        beforeEach(() => {
            store = createStore({ app: { current: { thread: url } } });
            store.dispatch(setAppThreads({ url }));
        });

        it('should set a file', () => {
            setFile(store, 'file object');

            let got = getFile();
            assert(got === 'file object');
        });

        it('should not set a file if not change a file', () => {
            setFile(store, 'file object');
            let prev = store.getState();

            setFile(store, 'file object');

            let got = store.getState();
            assert(got === prev);
        });
    });

    const getPanel = () => store.getState().ui.thread.panel;

    describe('openPanel()', () => {
        const { openPanel } = procedures;

        it('should open panel', () => {
            let got = getPanel();
            let exp = { isOpen: null, type: null };
            assert.deepStrictEqual(got, exp);

            openPanel(store, 'FORM_POST');

            got = getPanel();
            exp = { isOpen: true, type: 'FORM_POST' };
            assert.deepStrictEqual(got, exp);
        });

        it('should open panel if no type argument', () => {
            let panel = { type: 'DEL_REQ' };
            store.dispatch(setUiThread({ panel }));

            let got = getPanel();
            let exp = { isOpen: null, type: 'DEL_REQ' };
            assert.deepStrictEqual(got, exp);

            openPanel(store);

            got = getPanel();
            exp = { isOpen: true, type: 'DEL_REQ' };
            assert.deepStrictEqual(got, exp);
        });
    });

    describe('closePanel()', () => {
        const { closePanel } = procedures;

        it('should close panel', () => {
            let panel = { isOpen: true, type: 'FORM_POST' };
            store.dispatch(setUiThread({ panel }));

            closePanel(store);

            let got = getPanel();
            let exp = { isOpen: false, type: 'FORM_POST' };
            assert.deepStrictEqual(got, exp);
        });

        it('should do nothing if already closed', () => {
            let panel = { isOpen: false, type: 'FORM_POST' };
            store.dispatch(setUiThread({ panel }));
            let prev = getPanel();

            closePanel(store);

            let got = getPanel();
            let exp = { isOpen: false, type: 'FORM_POST' };
            assert.deepStrictEqual(got, exp);
            assert(got === prev);
        });
    });

    describe('setPanel()', () => {
        const { setPanel } = procedures;

        it('should set panel state', () => {
            let got = getPanel();
            let exp = { isOpen: null, type: null };
            assert.deepStrictEqual(got, exp);

            let panel = { isOpen: false, type: 'FORM_POST' };
            setPanel(store, panel);

            got = getPanel();
            exp = { isOpen: false, type: 'FORM_POST' };
            assert.deepStrictEqual(got, exp);
        });

        it('should set only isOpen', () => {
            let panel = { isOpen: true };
            setPanel(store, panel);

            let got = getPanel();
            let exp = { isOpen: true, type: null };
            assert.deepStrictEqual(got, exp);
        });

        it('should set only type', () => {
            let panel = { type: 'FORM_POST' };
            setPanel(store, panel);

            let got = getPanel();
            let exp = { isOpen: null, type: 'FORM_POST' };
            assert.deepStrictEqual(got, exp);
        });

        it('should ignore unknown properties', () => {
            let panel = { foo: 'bar', hoge: 'fuga' };
            setPanel(store, panel);

            let got = getPanel();
            let exp = { isOpen: null, type: null };
            assert.deepStrictEqual(got, exp);
        });
    });
});
