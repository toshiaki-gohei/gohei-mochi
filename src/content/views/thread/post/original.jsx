'use strict';
import { h } from 'preact';
import { CLASS_NAME as CN } from '~/content/constants';
import Header from './header.jsx';
import Body from './body.jsx';
import File from './file.jsx';
import Action from './action.jsx';
import { isThreadLazyDisplay } from '../../util';

export default function OriginalPost({ post, expire, app, handlers, isActive = false }) {
    if (post == null) return null;

    let { messages, idipIndex } = app || {};

    let { enter, leave, displayAll, ...rest } = handlers || {};
    handlers = rest;

    return (
<div class={classes} onMouseenter={enter} onMouseleave={leave}>
  <File {...{ post }} />
  <Header {...{ post, idipIndex, handlers }} />
  <Body {...{ post, handlers }} />
  <Action {...{ post, handlers, isActive }} />
  <Expire {...{ expire }} />
  <Notice {...messages} />
  <Warning {...messages} />
  <DeletedPostCount {...messages} />
  <DisplayAllBtn {...{ app, displayAll }} />
</div>
    );
}

const classes = `${CN.POST} gohei-op`;

function Expire({ expire }) {
    if (expire == null || expire.message == null) return null;
    return <div class="gohei-font-smaller">{expire.message}</div>;
}

function Notice({ notice }) {
    if (notice == null) return null;
    return <div class="gohei-text-info">{notice}</div>;
}

function Warning({ warning }) {
    if (warning == null) return null;
    return <div class="gohei-text-danger">{warning}</div>;
}

function DeletedPostCount({ deletedPostCount: count }) {
    if (count == null) return null;
    return <div class="gohei-font-smaller">削除された記事が{count}件あります。</div>;
}

function DisplayAllBtn({ app, displayAll }) {
    if (!isThreadLazyDisplay(app)) return null;
    return <button class="gohei-link-btn gohei-display-all-btn" type="button"
                   onClick={displayAll}>スレを全て表示</button>;
}
