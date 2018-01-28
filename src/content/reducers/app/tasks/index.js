'use strict';
import { combineReducers } from 'redux';
import delreqs from './delreqs';
import postdels from './postdels';

const reducer = combineReducers({ delreqs, postdels });

export default reducer;
