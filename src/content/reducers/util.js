'use strict';

// for avoid switch statements
// cf. https://redux.js.org/docs/recipes/reducers/RefactoringReducersExample.html
export function createReducer(initialState, handlers) {
    return function reducer(state = initialState, action = {}) {
        if (handlers.hasOwnProperty(action.type)) {
            return handlers[action.type](state, action);
        } else {
            return state;
        }
    };
}
