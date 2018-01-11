'use strict';
import { combineReducers } from 'redux';
import catalogs from './catalogs';
import posts from './posts';
import threads from './threads';

const reducer = combineReducers({ catalogs, posts, threads });

export default reducer;
