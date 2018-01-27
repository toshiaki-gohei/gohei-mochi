'use strict';
import assert from 'assert';
import * as procedures from '~/content/procedures/thread';
import createStore from '~/content/reducers';
import { setUiThread } from '~/content/reducers/actions';

describe(__filename, () => {
    let store;
    beforeEach(() => store = createStore());

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
