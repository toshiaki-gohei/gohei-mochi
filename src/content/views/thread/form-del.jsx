'use strict';
import React, { Component, Fragment } from 'react';
import { THREAD_PANEL_TYPE as P_TYPE } from '~/content/constants';
import { hasCheckedTarget, setPwdc } from './util';
import jsCookie from 'js-cookie';

export default class Delform extends Component {
    constructor(props) {
        super(props);

        this.state = {
            isSubmitting: false,
            errmsg: null
        };

        this._$password = null;
        this._$onlyimgdel = null;

        this._handlers = {
            clickTarget: handleClickTarget.bind(this),
            clearTargets: handleClearTargets.bind(this),
            submit: handleSubmit.bind(this),
            setRefPassword: $el => this._$password = $el,
            setRefOnlyImgDel: $el => this._$onlyimgdel = $el
        };
    }

    _setCookie(form) {
        setPwdc(form.pwd);
    }

    render() {
        let { commit, panel, app } = this.props;
        let state = this.state;

        if (panel == null || app == null) return null;

        let handlers = this._handlers;

        let style = panel.type === P_TYPE.FORM_DEL ? null : { display: 'none' };

        return (
<div className="gohei-delform" style={style}>
  <div>レス削除</div>
  <LeftPane {...{ commit, app, handlers }} />
  <RightPane {...{ state, app, handlers }} />
</div>
        );
    }
}

function LeftPane({ commit, app, handlers }) {
    return (
<div className="gohei-left-pane">
  <div className="gohei-top-pane">
    <div className="gohei-row">削除するレス<ClearTargetsBtn {...{ handlers }} /></div>
    <div className="gohei-row gohei-scroll">
      <TargetList {...{ commit, app, handlers }} />
    </div>
  </div>
  <div className="gohei-bottom-pane"></div>
</div>
    );
}

function RightPane({ state, app, handlers }) {
    let { isSubmitting, errmsg } = state;

    return (
<div className="gohei-right-pane">
  <div className="gohei-top-pane">
    <div className="gohei-row"><DeleteKey {...{ handlers }} /></div>
    <div className="gohei-row"><OnlyImgDel {...{ handlers }} /></div>
    <div className="gohei-row">
      <span className="gohei-font-smaller">チェックの付いたレスを削除します。</span>
    </div>
    <SubmitBtn {...{ isSubmitting, app, handlers }} />
    <div className="gohei-row">
      <div className="gohei-text-error">{errmsg}</div>
    </div>
  </div>
  <div className="gohei-bottom-pane"></div>
</div>
    );
}

function TargetList({ commit, app, handlers }) {
    let { current, threads } = app;
    let { delform } = threads.get(current.thread);

    let $rows = [];
    for (let [ key, { post: postId, checked } ] of delform.targets) {
        let post = commit('sync/post', postId);
        let $row = <Target {...{ checked, post, handlers }} key={key} />;
        $rows.push($row);
    }

    if ($rows.length == 0) $rows = <EmptyList />;

    return (
<table className="gohei-list gohei-selectable-list">
  <tbody>{$rows}</tbody>
</table>
    );
}

function Target({ checked, post, handlers }) {
    let { id, index, no } = post;
    let { clickTarget } = handlers;

    return (
<tr className="gohei-tr" data-post-id={id} onClick={clickTarget}>
  <td className="gohei-td gohei-text-center">
    <input type="checkbox" checked={checked} onChange={noop} />
  </td>
  <td className="gohei-td">{index}</td>
  <td className="gohei-td">No.{no}</td>
</tr>
    );
}

const noop = () => {};

function EmptyList() {
    return (
<tr className="gohei-tr">
  <td className="gohei-td gohei-font-smaller">(削除するレスはありません)</td>
</tr>
    );
}

function DeleteKey({ handlers }) {
    let { setRefPassword } = handlers;
    let pwdc = jsCookie.get('pwdc');

    return (
<Fragment>
  削除キー
  <input type="password" className="gohei-input-password" maxLength="12"
         defaultValue={pwdc} ref={setRefPassword} />
</Fragment>
    );
}

function OnlyImgDel({ handlers }) {
    let { setRefOnlyImgDel } = handlers;
    // eslint-disable-next-line jsx-a11y/label-has-for
    return <label><input type="checkbox" ref={setRefOnlyImgDel} />画像だけ消す</label>;
}

function SubmitBtn({ isSubmitting, app, handlers }) {
    let { submit } = handlers;

    let labelSubmit = isSubmitting ? '送信中…' : 'レスを削除する';
    let isDisabled = false;

    if (!hasCheckedTarget(app, 'delform')) isDisabled = true;
    if (isSubmitting) isDisabled = true;

    return <button className="gohei-btn gohei-submit-btn" type="button"
                   disabled={isDisabled} onClick={submit}>{labelSubmit}</button>;
}

function ClearTargetsBtn({ handlers }) {
    let { clearTargets } = handlers;
    return <button className="gohei-link-btn gohei-clear-btn" type="button"
                   onClick={clearTargets}>[クリア]</button>;
}

function handleClickTarget(event) {
    event.stopPropagation();
    let $el = event.currentTarget;
    let { postId } = $el.dataset;

    let { commit, app } = this.props;
    let url = app.current.thread;
    let { delform } = app.threads.get(url);

    let target = delform.targets.get(postId);
    target = { ...target, checked: !target.checked };

    commit('thread/setDelformTargets', { url, target });
}

function handleClearTargets(event) {
    event.stopPropagation();
    let { commit } = this.props;
    commit('thread/clearDelformTargets');
}

async function handleSubmit(event) {
    event.stopPropagation();

    let { commit, app } = this.props;

    let url = app.current.thread;
    let { action, targets } = app.threads.get(url).delform;

    let posts = [];
    for (let [ , { post, checked } ] of targets) {
        if (!checked) continue;
        posts.push(post);
    }

    let form = {
        posts, mode: 'usrdel',
        onlyimgdel: this._$onlyimgdel.checked ? 'on' : null,
        pwd: this._$password.value,
    };

    this.setState({ isSubmitting: true, errmsg: null });

    let res = await commit('thread/submitDel', { url: action, ...form });

    this.setState({ isSubmitting: false });

    if (res.ok) {
        commit('thread/clearDelformTargets');
        this._setCookie(form);
    } else {
        this.setState({ errmsg: res.statusText });
    }

    commit('thread/update');
}
