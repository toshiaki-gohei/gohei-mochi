'use strict';
import React from 'react';
import { CLASS_NAME as CN } from '~/content/constants';
import Header from './header.jsx';
import Body from './body.jsx';
import File from './file.jsx';
import Action from './action.jsx';

export default function Reply(props) {
    let { commit, post, app, handlers, isActive = false } = props;
    if (post == null) return null;

    let { idipIndex } = app || {};

    let { enter, leave, ...rest } = handlers || {};
    handlers = rest;

    return (
<div className={CLASS_NAME} onMouseEnter={enter} onMouseLeave={leave}>
  <Header {...{ post, idipIndex, handlers }} />
  <File {...{ commit, post }} />
  <Body {...{ post, handlers }} />
  <Action {...{ post, handlers, isActive }} />
</div>
    );
}

const CLASS_NAME = `${CN.POST} gohei-reply`;
