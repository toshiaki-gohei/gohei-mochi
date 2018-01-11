'use strict';
import { h } from 'preact';
import { CLASS_NAME as CN } from '~/content/constants';
import Header from './header.jsx';
import Body from './body.jsx';
import File from './file.jsx';
import Action from './action.jsx';

export default function Reply({ post, app, handlers, isActive = false }) {
    if (post == null) return null;

    let { idipIndex } = app || {};

    let { enter, leave, ...rest } = handlers || {};
    handlers = rest;

    return (
<div class={classes} onMouseenter={enter} onMouseleave={leave}>
  <Header {...{ post, idipIndex, handlers }} />
  <File {...{ post }} />
  <Body {...{ post, handlers }} />
  <Action {...{ post, handlers, isActive }} />
</div>
    );
}

const classes = `${CN.POST} gohei-reply`;
