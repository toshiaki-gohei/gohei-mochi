'use strict';
import React, { Component } from 'react';
import { F } from '~/common/util';

export default class Delreq extends Component {
    constructor(props) {
        super(props);

        this.state = {
            reason: null,
            isVisibleReasons: false,
            errmsg: null,
            checked: createChecked(null, props)
        };

        this._handlers = {
            openReasons: handleVisibleReasons.bind(this, true),
            closeReasons: handleVisibleReasons.bind(this, false),
            toggleReasons: handleVisibleReasons.bind(this, null),

            clickDelreqList: handleClickDelreqList.bind(this),
            clearDelreqList: handleClearDelreqList.bind(this),
            changeReason: handleChangeReason.bind(this),
            addToTasks: handleAddToTasks.bind(this)
        };
    }

    componentWillReceiveProps(nextProps) {
        let checked = createChecked(this.state, nextProps);
        this.setState({ checked });
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
    let { errmsg } = state;

    return (
<div className="gohei-left-pane">
  <div className="gohei-top-pane">
    <div className="gohei-row">送信前の削除依頼<ClearDelreqListBtn {...{ handlers }} /></div>
    <div className="gohei-row gohei-scroll">
      <CandidateList {...{ commit, state, app, handlers }} />
    </div>
  </div>
  <div className="gohei-bottom-pane">
    <div className="gohei-row"><SelectedReason {...{ state, handlers }} /></div>
    <div className="gohei-row"><span className="gohei-font-smaller">
      チェックの付いたレスを、選択した理由で削除依頼します。</span></div>
    <DelreqBtn {...{ state, handlers }} />
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

function CandidateList({ commit, state, app, handlers }) {
    let { current, delreqs } = app;
    let { delreqs: delreqList } = app.threads.get(current.thread);

    let $rows = delreqList.map(postId => {
        let post = commit('sync/post', postId);
        return isCandidate(postId, app)
            ? <Candidate {...{ post, state, handlers }} key={postId} />
            : <NoCandidate {...{ post, delreqs }} key={postId} />;
    });

    if ($rows.length == 0) $rows = <EmptyDelreqList />;

    return <table className="gohei-delreq-list"><tbody>{$rows}</tbody></table>;
}

function isCandidate(postId, app) {
    let { delreqs } = app;
    let delreq = delreqs.get(postId);
    if (delreq == null) return true;
    if (delreq.status == null) return true;
    return false;
}

function Candidate({ post, state, handlers }) {
    let { id, index, no } = post;
    let { checked } = state;
    let { clickDelreqList } = handlers;

    let isChecked = checked.get(id);

    return (
<tr className="gohei-tr" data-post-id={id} onClick={clickDelreqList}>
  <td className="gohei-td gohei-text-center gohei-selectable">
    <input type="checkbox" defaultChecked={isChecked} />
  </td>
  <td className="gohei-td gohei-selectable">{index}</td>
  <td className="gohei-td gohei-selectable">No.{no}</td>
</tr>
    );
}

function NoCandidate({ post, delreqs }) {
    let { id, index, no } = post;
    let { status } = delreqs.get(id);

    return (
<tr className="gohei-tr">
  <td className="gohei-td gohei-text-center">{DELREQ_STATUS_TEXT[status]}</td>
  <td className="gohei-td">{index}</td>
  <td className="gohei-td">No.{no}</td>
</tr>
    );
}

function TaskList({ commit, app }) {
    let { delreqs, workers } = app;
    let { tasks } = workers.delreq;

    let $rows = tasks.map(id => {
        let delreq = delreqs.get(id);
        let { post, form: { reason }, status, res } = delreq;

        let { index } = commit('sync/post', post);

        let statusText = '';
        if (res != null) statusText = res.ok ? '' : res.statusText;

        let reasonText = REASON_TEXT[reason];

        return (
<tr className="gohei-tr" key={id}>
  <td className="gohei-td" title={statusText}>{DELREQ_STATUS_TEXT[status]}</td>
  <td className="gohei-td">{index}</td>
  <td className="gohei-td" title={reasonText}>{shorthand(reasonText, 6)}</td>
</tr>
        );
    });

    if ($rows.length == 0) $rows = <EmptyDelreqList />;

    return <table className="gohei-delreq-list"><tbody>{$rows}</tbody></table>;
}

function EmptyDelreqList() {
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

function DelreqBtn({ state, handlers }) {
    let { reason, checked } = state;
    let { addToTasks } = handlers;

    let isDisabled = false;
    if (reason == null) isDisabled = true;
    if (checkedList(checked).length === 0) isDisabled = true;

    return <button className="gohei-btn gohei-delreq-btn" type="button"
                   disabled={isDisabled} onClick={addToTasks}>削除依頼をする</button>;
}

function ClearDelreqListBtn({ handlers }) {
    let { clearDelreqList } = handlers;
    return <button className="gohei-link-btn gohei-clear-btn" type="button"
                   onClick={clearDelreqList}>[クリア]</button>;
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

function handleClickDelreqList(event) {
    let $el = event.currentTarget;

    let { checked } = this.state;
    checked = new Map(checked);

    let id = $el.dataset.postId;
    checked.set(id, !checked.get(id));
    this.setState({ checked });
}

function handleClearDelreqList() {
    let { commit } = this.props;
    commit('thread/clearDelreqs');
}

function handleChangeReason(event) {
    let reason = +event.target.value;
    this.setState({ reason });
}

async function handleAddToTasks() {
    let { commit, app } = this.props;
    let { reason, checked } = this.state;
    if (reason == null) return;

    let url = app.current.thread;

    let posts = [];
    let newChecked = new Map();

    for (let [ postId, isChecked ] of checked) {
        if (isChecked) {
            let post = commit('sync/post', postId);
            posts.push(post);
            continue;
        }
        newChecked.set(postId, isChecked);
    }

    this.setState({ checked: newChecked, isVisibleReasons: false });

    await commit('thread/registerDelreqTasks', { url, posts, reason });
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

function createChecked(state, nextProps) {
    let { checked = new Map() } = state || {};
    let { app } = nextProps || {};

    if (app == null) return checked;

    let { current, delreqs } = app;
    let { delreqs: delreqList } = app.threads.get(current.thread);

    let newChecked = delreqList.reduce((map, postId) => {
        let delreq = delreqs.get(postId);

        let isChecked = true; // initial check is true

        if (checked.has(postId)) {
            isChecked = checked.get(postId);
        } else if (delreq != null && delreq.status != null) {
            isChecked = null;
        }

        map.set(postId, isChecked);
        return map;
    }, new Map());

    return newChecked;
}

function checkedList(checked) {
    let list = [];
    for (let [ key, value ] of checked) {
        if (value !== true) continue;
        list.push(key);
    }
    return list;
}

export const internal = {
    createChecked,
    checkedList
};
