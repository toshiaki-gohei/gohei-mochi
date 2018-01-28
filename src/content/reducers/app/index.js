'use strict';
import { combineReducers } from 'redux';
import catalogs from './catalogs';
import current from './current';
import tasks from './tasks';
import threads from './threads';
import workers from './workers';

const reducer = combineReducers({ catalogs, current, tasks, threads, workers });

export default reducer;
