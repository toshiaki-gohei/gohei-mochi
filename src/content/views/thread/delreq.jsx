'use strict';
import React, { Component } from 'react';
import { F } from '~/common/util';

export default class Delreq extends Component {
    constructor(props) {
        super(props);

        this.state = {
            reason: null,
            isVisibleReasons: false,
            errmsg: null
        };

        this._handlers = {
            openReasons: handleVisibleReasons.bind(this, true),
            closeReasons: handleVisibleReasons.bind(this, false),
            toggleReasons: handleVisibleReasons.bind(this, null),

            clickTargets: handleClickTargets.bind(this),
            clearTargets: handleClearTargets.bind(this),
            changeReason: handleChangeReason.bind(this),
            addToTasks: handleAddToTasks.bind(this)
        };
    }

    render() {
        let { commit, panel, app } = this.props;
        let state = this.state;

        if (panel == null || app == null) return null;

        let { changeReason, ...rest } = this._handlers;
        let handlers = rest;

        let styleDelreq = panel.type === 'DELREQ' ? null : { display: 'none' };

        return (
<div className="gohei-delreq" style={styleDelreq}>
  <div>削除依頼</div>
  <LeftPane {...{ commit, state, app, handlers }} />
  <RightPane {...{ commit, state, app, changeReason }} />
</div>
        );
    }
}

function LeftPane({ commit, state, app, handlers }) {
    let { errmsg, reason } = state;

    return (
<div className="gohei-left-pane">
  <div className="gohei-top-pane">
    <div className="gohei-row">送信前の削除依頼<ClearTargetsBtn {...{ handlers }} /></div>
    <div className="gohei-row gohei-scroll">
      <TargetList {...{ commit, app, handlers }} />
    </div>
  </div>
  <div className="gohei-bottom-pane">
    <div className="gohei-row"><SelectedReason {...{ state, handlers }} /></div>
    <div className="gohei-row"><span className="gohei-font-smaller">
      チェックの付いたレスを、選択した理由で削除依頼します。</span></div>
    <DelreqBtn {...{ app, reason, handlers }} />
    <div className="gohei-row gohei-text-error">{errmsg}</div>
  </div>
</div>
    );
}

function RightPane({ commit, state, app, changeReason }) {
    let { isVisibleReasons } = state;

    let style = isVisibleReasons ? { display: 'none' } : null;

    return (
<div className="gohei-right-pane">
  <div className="gohei-top-pane" style={style}>
    <div className="gohei-row">送信中の削除依頼</div>
    <div className="gohei-row gohei-scroll">
      <TaskList {...{ commit, state, app }} />
    </div>
  </div>
  <div className="gohei-bottom-pane" style={style}></div>
  <Reasons {...{ state, changeReason }} />
</div>
    );
}

function TargetList({ commit, app, handlers }) {
    let { current, threads, delreqs } = app;
    let { delreq } = threads.get(current.thread);

    let $rows = [];
    for (let [ key, { post: postId, checked } ] of delreq.targets) {
        let post = commit('sync/post', postId);
        let delreq = delreqs.get(key);
        let $row = isTarget(delreq)
            ? <Target {...{ checked, post, handlers }} key={key} />
            : <NonTarget {...{ delreq, post }} key={key} />;
        $rows.push($row);
    }

    if ($rows.length == 0) $rows = <EmptyList />;

    return <table className="gohei-delreq-list"><tbody>{$rows}</tbody></table>;
}

function isTarget(delreq) {
    if (delreq == null) return true;
    if (delreq.status == null) return true;
    return false;
}

function Target({ checked, post, handlers }) {
    let { id, index, no } = post;
    let { clickTargets } = handlers;

    return (
<tr className="gohei-tr" data-post-id={id} onClick={clickTargets}>
  <td className="gohei-td gohei-text-center gohei-selectable">
    <input type="checkbox" checked={checked} onChange={noop} />
  </td>
  <td className="gohei-td gohei-selectable">{index}</td>
  <td className="gohei-td gohei-selectable">No.{no}</td>
</tr>
    );
}

const noop = () => {};

function NonTarget({ delreq, post }) {
    let { status, res } = delreq;
    let { index, no } = post;

    let statusText = getStatusText(res);

    return (
<tr className="gohei-tr">
  <td className="gohei-td gohei-text-center" title={statusText}>{DELREQ_STATUS_TEXT[status]}</td>
  <td className="gohei-td">{index}</td>
  <td className="gohei-td">No.{no}</td>
</tr>
    );
}

function getStatusText(res) {
    if (res == null) return '';
    return res.ok ? '' : res.statusText;
}

function TaskList({ commit, app }) {
    let { delreqs, workers } = app;
    let { tasks } = workers.delreq;

    let $rows = tasks.map(id => {
        let delreq = delreqs.get(id);
        let { post, form: { reason }, status, res } = delreq;

        let { index } = commit('sync/post', post);

        let statusText = getStatusText(res);
        let reasonText = REASON_TEXT[reason];

        return (
<tr className="gohei-tr" key={id}>
  <td className="gohei-td" title={statusText}>{DELREQ_STATUS_TEXT[status]}</td>
  <td className="gohei-td">{index}</td>
  <td className="gohei-td" title={reasonText}>{shorthand(reasonText, 6)}</td>
</tr>
        );
    });

    if ($rows.length == 0) $rows = <EmptyList />;

    return <table className="gohei-delreq-list"><tbody>{$rows}</tbody></table>;
}

function EmptyList() {
    return (
<tr className="gohei-tr">
  <td className="gohei-td gohei-font-smaller">(削除依頼はありません)</td>
</tr>
    );
}

function SelectedReason({ state: { reason }, handlers }) {
    let text = REASON_TEXT[reason];

    let $reason = text == null
        ? <ToggleReasonsLink {...{ handlers }}>(未選択)</ToggleReasonsLink>
        : <span className="gohei-font-bolder" title={text}>{text}</span>;

    return (
<div>
  <div className="gohei-float-left">
    <ToggleReasonsLink {...{ handlers }}>削除理由</ToggleReasonsLink>:
  </div>
  <div className="gohei-select-reason gohei-text-ellipsis">{$reason}</div>
</div>
    );
}

function ToggleReasonsLink({ children, handlers }) {
    let { toggleReasons } = handlers;
    return <button className="gohei-link-btn" title="削除理由を表示します"
                   onClick={toggleReasons}>{children}</button>;
}

function DelreqBtn({ app, reason, handlers }) {
    let { addToTasks } = handlers;

    let isDisabled = false;
    if (reason == null) isDisabled = true;
    if (!hasChecked(app)) isDisabled = true;

    return <button className="gohei-btn gohei-delreq-btn" type="button"
                   disabled={isDisabled} onClick={addToTasks}>削除依頼をする</button>;
}

function ClearTargetsBtn({ handlers }) {
    let { clearTargets } = handlers;
    return <button className="gohei-link-btn gohei-clear-btn" type="button"
                   onClick={clearTargets}>[クリア]</button>;
}

function Reasons({ state, changeReason }) {
    let { reason, isVisibleReasons } = state;
    let style = isVisibleReasons ? null : { display: 'none' };

    let $radios1 = [ 101, 102, 103, 104, 105, 106, 107, 108, 110, 111 ].map(value => {
        return <Radio {...{ reason, value, changeReason }} key={value} />;
    });
    let $radios2 = [ 201, 202 ].map(value => {
        return <Radio {...{ reason, value, changeReason }} key={value} />;
    });
    let $radios3 = [ 301, 302, 303, 304 ].map(value => {
        return <Radio {...{ reason, value, changeReason }} key={value} />;
    });

    return (
<div className="gohei-reasons" style={style}>
  <span>文字・画像</span>
  {$radios1}
  <span>２次画像</span>
  {$radios2}
  <span>３次画像</span>
  {$radios3}
</div>
    );
}

function Radio({ reason, value, changeReason }) {
    let id = `gohei-radio-reason-${value}`;

    return (
<label className="gohei-radio" htmlFor={id}>
  <input id={id} type="radio" value={value} name="reason"
         className="gohei-radio-btn" checked={value === reason} onChange={changeReason} />
  {REASON_TEXT[value]}
</label>
    );
}

function handleVisibleReasons(isVisible) {
    if (isVisible == null) isVisible = !this.state.isVisibleReasons;
    this.setState({ isVisibleReasons: isVisible });
}

function handleClickTargets(event) {
    let $el = event.currentTarget;
    let { postId } = $el.dataset;

    let { commit, app } = this.props;
    let url = app.current.thread;
    let { delreq } = app.threads.get(url);

    let target = delreq.targets.get(postId);
    target = { ...target, checked: !target.checked };

    commit('thread/setDelreqTargets', { url, target });
}

function handleClearTargets() {
    let { commit } = this.props;
    commit('thread/clearDelreqTargets');
}

function handleChangeReason(event) {
    let reason = +event.target.value;
    this.setState({ reason });
}

async function handleAddToTasks() {
    let { commit, app } = this.props;
    let { reason } = this.state;
    if (reason == null) return;

    let url = app.current.thread;

    this.setState({ isVisibleReasons: false });

    await commit('thread/registerDelreqTasks', { url, reason });
    commit('worker/run', 'delreq');
}

const REASON_TEXT = F({
    101: '中傷・侮辱・名誉毀損',
    102: '脅迫・自殺',
    103: '個人情報・プライバシー',
    104: 'つきまとい・ストーカー',
    105: '連投・負荷増大・無意味な羅列',
    106: '広告・spam',
    107: '売春・援交',
    108: '侵害・妨害',
    110: '荒らし・嫌がらせ・混乱の元',
    111: '政治・宗教・民族',

    201: 'グロ画像(２次)',
    202: '猥褻画像・無修正画像(２次)',

    301: 'グロ画像(３次)',
    302: 'エロ画像(３次)',
    303: '児童ポルノ画像(３次)',
    304: '猥褻画像・無修正画像(３次)',
});

const DELREQ_STATUS_TEXT = F({
    null: '',
    stanby: '待機中',
    posting: '送信中',
    complete: '完了',
    cancel: 'キャンセル',
    error: 'エラー'
});

function shorthand(text, length) {
    if (text == null) return text;
    if (text.length <= length) return text;
    return `${text.substr(0, length)}...`;
}

function hasChecked(app) {
    let { current, threads } = app;
    let { delreq } = threads.get(current.thread);

    for (let [ , { checked } ] of delreq.targets) {
        if (checked) return true;
    }
    return false;
}

export const internal = {
    hasChecked
};
