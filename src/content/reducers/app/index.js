'use strict';
import { combineReducers } from 'redux';
import catalogs from './catalogs';
import current from './current';
import delreqs from './delreqs';
import threads from './threads';
import workers from './workers';

const reducer = combineReducers({ catalogs, current, delreqs, threads, workers });

export default reducer;
