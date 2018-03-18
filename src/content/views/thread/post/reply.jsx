'use strict';
import React from 'react';
import { CLASS_NAME as CN } from '~/content/constants';
import Header from './header.jsx';
import Body from './body.jsx';
import File from './file.jsx';
import Action from './action.jsx';

export default function Reply(props) {
    let { commit, post, idipIndex, handlers,
          isChecked, isActive = false, isHidden = false } = props;
    if (post == null) return null;

    let style = isHidden ? { display: 'none' } : null;
    let { enter, leave } = handlers || {};

    return (
<div className={CLASS_NAME} style={style} onMouseEnter={enter} onMouseLeave={leave}>
  <Header {...{ post, idipIndex, handlers, isChecked }} />
  <File {...{ commit, post }} />
  <Body {...{ post, handlers }} />
  <Action {...{ post, handlers, isActive }} />
</div>
    );
}

const CLASS_NAME = `${CN.POST} gohei-reply`;
