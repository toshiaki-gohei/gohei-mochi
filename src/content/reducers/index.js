'use strict';
import { combineReducers, createStore } from 'redux';
import domain from './domain';
import app from './app';
import ui from './ui';

// Domain data:
//   data that the application needs to show, use, or modify
//   (such as "all of the Todos retrieved from the server")
// App state:
//   data that is specific to the application's behavior
//   (such as "Todo #5 is currently selected", or "there is a request in progress to fetch Todos")
// UI state:
//   data that represents how the UI is currently displayed
//   (such as "The EditTodo modal dialog is currently open")
//
// cf. https://redux.js.org/docs/recipes/reducers/BasicReducerStructure.html

export default function (preloadedState) {
    const reducer = combineReducers({ domain, app, ui });
    return createStore(reducer, preloadedState);
}
