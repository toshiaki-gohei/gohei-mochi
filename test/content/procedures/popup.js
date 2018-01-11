import assert from 'assert';
import * as procedures from '~/content/procedures/popup';
import createStore from '~/content/reducers';
import { pluckFromMap as pluck } from '@/support/util';

describe(__filename, () => {
    let store;
    beforeEach(() => store = createStore());

    const getPopups = () => store.getState().ui.popups;

    describe('export', () => {
        it('should export functions', () => {
            let got = Object.values(procedures).every(fn => typeof fn === 'function');
            assert(got === true);
        });
    });

    describe('open()', () => {
        const { open, add } = procedures;

        it('should be equal to add()', () => {
            assert(open === add);
        });
    });

    describe('close()', () => {
        const { close, remove } = procedures;

        it('should be equal to remove()', () => {
            assert(close === remove);
        });
    });

    describe('add()', () => {
        const { add } = procedures;

        it('should add popup', () => {
            let id1 = add(store, { component: 'popup01' });
            let id2 = add(store, { component: 'popup02' });

            assert(getPopups().size === 2);

            let got = pluck(getPopups(), 'id', 'component');
            let exp = [
                { id: id1, component: 'popup01' },
                { id: id2, component: 'popup02' }
            ];
            assert.deepStrictEqual(got, exp);
        });

        it('should add correct popup', () => {
            const Popup = () => {};
            let opts = { component: Popup, props: 'popup-props' };

            let popupId = add(store, opts);

            let popups = getPopups();
            assert(popups.size === 1);

            let { id, ...rest } = popups.get(popupId);
            assert(/^gohei-popup-\d{13}-\d{1,8}$/.test(id));
            let got = rest;
            let exp = { component: Popup, props: 'popup-props' };
            assert.deepStrictEqual(got, exp);
        });

        it('should not add popup if popup is null', () => {
            add(store, null);
            let got = getPopups();
            assert.deepStrictEqual(got, new Map());
        });
    });

    describe('remove()', () => {
        const { remove } = procedures;

        let initialState;
        beforeEach(() => {
            let popups = new Map([
                [ 'popup01', { id: 'popup01' } ],
                [ 'popup02', { id: 'popup02' } ],
                [ 'popup03', { id: 'popup03' } ]
            ]);
            store = createStore({ ui: { popups } });

            initialState = store.getState();
        });

        it('should remove popups', () => {
            remove(store, [ 'popup01', 'popup03' ]);

            let got = pluck(getPopups(), 'id');
            let exp = [ { id: 'popup02' } ];
            assert.deepStrictEqual(got, exp);
        });

        it('should remove a popup', () => {
            remove(store, 'popup02');

            let got = pluck(getPopups(), 'id');
            let exp = [ { id: 'popup01' }, { id: 'popup03' } ];
            assert.deepStrictEqual(got, exp);
        });

        it('should do nothing if removed popup does not exist', () => {
            remove(store, 'nonexistent id');

            let popups = getPopups();
            let got = pluck(popups, 'id');
            let exp = [ { id: 'popup01' }, { id: 'popup02' }, { id: 'popup03' } ];
            assert.deepStrictEqual(got, exp);

            assert(popups === initialState.ui.popups);
        });

        it('should not remove if pass empty list', () => {
            remove(store, []);

            let popups = getPopups();
            let got = pluck(popups, 'id');
            let exp = [ { id: 'popup01' }, { id: 'popup02' }, { id: 'popup03' } ];
            assert.deepStrictEqual(got, exp);

            assert(popups === initialState.ui.popups);
        });

        it('should not remove if pass null', () => {
            remove(store, null);

            let popups = getPopups();
            let got = pluck(popups, 'id');
            let exp = [ { id: 'popup01' }, { id: 'popup02' }, { id: 'popup03' } ];
            assert.deepStrictEqual(got, exp);

            assert(popups === initialState.ui.popups);
        });

        it('should do nothing if popups is empty', () => {
            store = createStore();
            initialState = store.getState();

            remove(store, 'nonexistent id');

            let popups = getPopups();
            assert(popups.size === 0);
            assert(popups === initialState.ui.popups);
        });
    });
});
