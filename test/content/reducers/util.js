'use strict';
import assert from 'assert';
import * as util from '~/content/reducers/util';

describe(__filename, () => {
    describe('createReducer()', () => {
        const { createReducer } = util;

        const reducer1 = (state, action) => `reducer1: ${state} ${action.payload}`;
        const reducer2 = (state, action) => `reducer2: ${state} ${action.payload}`;

        const reducer = createReducer('initialState', {
            R1: reducer1,
            R2: reducer2
        });

        it('should create reducer', () => {
            let got = reducer('state', { type: 'R1', payload: 'R1-payload' });
            assert(got === 'reducer1: state R1-payload');

            got = reducer(undefined, { type: 'R2', payload: null });
            assert(got === 'reducer2: initialState null');
        });

        it('should not throw exception if unknown action type', () => {
            let got = reducer('state', { type: 'unknown' });
            assert(got === 'state');
        });

        it('should not throw exception if action is undefined', () => {
            let got = reducer('state');
            assert(got === 'state');
        });
    });
});
