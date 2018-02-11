'use strict';
import React, { Component, Fragment } from 'react';
import File from './file.jsx';
import DropBox from './drop-box.jsx';
import { setNamec, setPwdc } from '../util';
import FormData from '~/content/util/form-data';
import { THREAD_PANEL_TYPE as P_TYPE } from '~/content/constants';
import jsCookie from 'js-cookie';

export default class Postform extends Component {
    constructor(props) {
        super(props);

        this.state = {
            files: null,
            isSubmitting: false,
            errmsg: null
        };

        this._$form = null;
        this._$comment = null;

        this._handlers = {
            submit: handleSubmit.bind(this),
            oekaki: () => alert('not implement: oekaki'),
            changeComment: handleChangeComment.bind(this),
            setRefComment: $el => this._$comment = $el,
            setFiles: files => this.setState({ files })
        };
    }

    componentDidUpdate(prevProps) {
        if (this._focusesCommentOnDidUpdate(prevProps, this.props)) {
            this._focusComment();
        }
    }

    _focusesCommentOnDidUpdate(prev, next) {
        if (!prev.panel.isOpen && next.panel.isOpen) return true;
        if (prev.postform.file !== next.postform.file) return true;
        return false;
    }

    _focusComment() {
        setTimeout(() => this._$comment.focus(), 1);
    }

    _isEmptyForm(formdata) {
        let comment = formdata.get('com');
        if (comment != null && comment !== '') return false;

        let { file } = this.props.postform;
        if (file != null) return false;

        return true;
    }

    _resetForm() {
        let { commit } = this.props;
        this._$form.reset();
        commit('thread/setComment', null);
        commit('thread/setFile', null);
    }

    _setCookie(formdata) {
        let { postform: { action } } = this.props;
        let name = formdata.get('name');
        let pwd = formdata.get('pwd');
        setNamec(name, action);
        setPwdc(pwd);
    }

    render() {
        let { commit, panel, postform } = this.props;
        let { files, errmsg } = this.state;

        if (panel == null || postform == null) return null;

        let namec = jsCookie.get('namec');
        let pwdc = jsCookie.get('pwdc');

        let style = panel.type === P_TYPE.FORM_POST ? null : { display: 'none' };

        let { action, hiddens, comment, file } = postform || {};
        let { submit, setFiles, ...handlers } = this._handlers;

        return (
<div className="gohei-postform" style={style}>
  <div className="gohei-err-msg gohei-text-error">{errmsg}</div>
  <form action={action} method="POST" encType="multipart/form-data"
        ref={$el => this._$form = $el} onSubmit={submit}>
    <Hiddens {...{ hiddens }} />
    <div className="gohei-row">
      <div className="gohei-col1">おなまえ</div>
      <div className="gohei-col2">
        <input type="text" className="gohei-input-name" name="name" defaultValue={namec} />
      </div>
    </div>
    <div className="gohei-row">
      <div className="gohei-col1">E-mail</div>
      <div className="gohei-col2">
        <input type="text" className="gohei-input-email" name="email" />
      </div>
    </div>
    <div className="gohei-row">
      <div className="gohei-col1">題名</div>
      <div className="gohei-col2">
        <input type="text" className="gohei-input-subject" name="sub" />
        <SubmitBtn {...this.state} />
      </div>
    </div>
    <div className="gohei-row">
      <div className="gohei-col1"><LabelComment {...{ handlers }} /></div>
      <div className="gohei-col2">
        <div id="swfContents"></div>
        <Comment {...{ comment, handlers }} />
      </div>
    </div>
    <div className="gohei-row">
      <div className="gohei-col1">添付File</div>
      <div className="gohei-col2"><File {...{ commit, file, files }} /></div>
    </div>
    <div className="gohei-row">
      <div className="gohei-col1">削除キー</div>
      <div className="gohei-col2"><DeleteKey {...{ pwdc }} /></div>
    </div>
  </form>
  <DropBox {...{ setFiles }} />
</div>
        );
    }
}

function Hiddens({ hiddens }) {
    let $hiddens = hiddens.map(({ name, value }) => {
        return <input type="hidden" name={name} value={value} key={name} />;
    });
    return <div className="gohei-hiddens">{$hiddens}</div>;
}

function SubmitBtn({ isSubmitting }) {
    let labelSubmit = isSubmitting ? '送信中…' : '送信する';
    let isDisabled = isSubmitting ? true : false;
    return <button type="submit" className="gohei-btn"
                   disabled={isDisabled}>{labelSubmit}</button>;
}

function LabelComment({ handlers }) {
    let { oekaki } = handlers; // eslint-disable-line no-unused-vars
    return (
<div className="gohei-label-comment">
  コメント
  {/*<button className="gohei-link-btn" type="button" onClick={oekaki}>手書き</button>*/}
</div>
    );
}

function Comment({ comment, handlers }) {
    let { changeComment, setRefComment } = handlers;
    let value = comment == null ? '' : comment;
    return <textarea className="gohei-input-comment" name="com" value={value}
                     ref={setRefComment} onChange={changeComment} />;
}

function DeleteKey({ pwdc }) {
    return (
<Fragment>
  <input type="password" className="gohei-input-password" name="pwd"
         maxLength="12" defaultValue={pwdc} />
  <span className="gohei-font-smaller">(削除用。英数字で8字以内)</span>
  <object type="application/x-shockwave-flash" id="cnt" data="/bin/count.swf" width="0" height="0" aria-label="" aria-hidden="true"></object>
</Fragment>
    );
}

async function handleSubmit(event) {
    event.preventDefault();

    let $form = event.target;
    let url = $form.action;

    let { commit, postform: { file } } = this.props;

    let fd = new FormData($form);
    if (file) fd.set('upfile', file, file.name);
    fd.set('js', 'on');

    if (this._isEmptyForm(fd)) {
        this.setState({ errmsg: '何か書いて下さい' });
        this._focusComment();
        return;
    }

    this.setState({ isSubmitting: true, errmsg: null });

    let res = await commit('thread/submitPost', { url, formdata: fd });

    this.setState({ isSubmitting: false });

    if (res.ok) {
        this._setCookie(fd);
        this._resetForm();
    } else {
        this.setState({ errmsg: res.statusText });
    }

    this._focusComment();
    commit('thread/update');
}

function handleChangeComment(event) {
    let { commit } = this.props;
    commit('thread/setComment', event.target.value);
}
