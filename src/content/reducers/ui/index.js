'use strict';
import { combineReducers } from 'redux';
import preferences from './preferences';
import popups from './popups';
import thread from './thread';

const reducer = combineReducers({ preferences, popups, thread });

export default reducer;
