'use strict';
import React, { Component } from 'react';
import cookie from 'js-cookie';
import FormData from '~/content/util/form-data';
import { THREAD_PANEL_TYPE as P_TYPE } from '~/content/constants';
import { isFirefox } from '~/common/browser';

export default class Postform extends Component {
    constructor(props) {
        super(props);

        this.state = {
            name: cookie.get('namec'),
            pwd: cookie.get('pwdc'),

            isPosting: false,
            errmsg: null,

            styleDropMsg: { display: 'none' },

            previewImage: null,
            previewVideo: null
        };

        this._$form = null;
        this._$comment = null;
        this._$inputFile = null;

        this._isInsideDropBox = false;
        this._isInsideChildren = false;

        this._handlers = {
            submit: handleSubmit.bind(this),
            oekaki: () => alert('not implement: oekaki'),
            changeInputFile: handleChangeInputFile.bind(this),
            changeComment: handleChangeComment.bind(this),
            detachFile: () => this._detachFile(),

            dragEnter: handleDragEnter.bind(this),
            dragLeave: handleDragLeave.bind(this),
            drop: handleDrop.bind(this),
        };
    }

    componentDidUpdate(prevProps) {
        let prev = prevProps.panel;
        let next = this.props.panel;
        if (!prev.isOpen && next.isOpen) this._focusComment();
    }

    _focusComment() {
        setTimeout(() => { this._$comment.focus(); }, 10);
    }

    _hasAttachedFile() {
        if (this._$inputFile == null) return false;
        return this._$inputFile.files.length === 0 ? false : true;
    }

    _detachFile() {
        if (!this._hasAttachedFile) return;
        this._$inputFile.value = null;
        this._hidePreview();
    }

    async _showPreview() {
        let [ file ] = this._$inputFile.files;
        let dataUrl = await readAsDataUrl(file);

        this._hidePreview();

        switch (true) {
        case /^image\//.test(file.type):
            this.setState({ previewImage: dataUrl });
            break;
        case /^video\//.test(file.type):
            this.setState({ previewVideo: dataUrl });
            break;
        default:
            break;
        }
    }

    _hidePreview() {
        this.setState({ previewImage: null, previewVideo: null });
    }

    _isEmptyForm(formdata) {
        let comment = formdata.get('com');
        if (comment != null && comment !== '') return false;
        if (this._hasAttachedFile()) return false;
        return true;
    }

    _resetForm() {
        let { commit } = this.props;
        this._$form.reset();
        commit('thread/setComment', null);
        this._hidePreview();
    }

    _setCookie(formdata) {
        let name = formdata.get('name');
        let pwd = formdata.get('pwd');
        this.setState({ name, pwd });
        cookie.set('namec', name);
        cookie.set('pwdc', pwd);
    }

    render() {
        let { panel, postform } = this.props;
        let { errmsg, styleDropMsg } = this.state;

        if (panel == null || postform == null) return null;

        let stylePostForm = panel.type === P_TYPE.FORM_POST ? null : { display: 'none' };

        let { action, hiddens, comment } = postform || {};
        let { dragEnter, dragLeave, drop, submit } = this._handlers;

        return (
<div className="gohei-postform" style={stylePostForm} ref={$el => this._$el = $el}
     onDragEnter={dragEnter} onDragLeave={dragLeave} onDragOver={preventDefault} onDrop={drop}>
  <div className="gohei-err-msg gohei-text-error">{errmsg}</div>
  <form action={action} method="POST" encType="multipart/form-data"
        ref={$el => this._$form = $el} onSubmit={submit}>
    <Hiddens {...{ hiddens }} />
    <div className="gohei-row">
      <div className="gohei-col1">おなまえ</div>
      <div className="gohei-col2"><Name {...this.state} /></div>
    </div>
    <div className="gohei-row">
      <div className="gohei-col1">E-mail</div>
      <div className="gohei-col2"><Email /></div>
    </div>
    <div className="gohei-row">
      <div className="gohei-col1">題名</div>
      <div className="gohei-col2"><Subject /><Submit {...this.state} /></div>
    </div>
    <div className="gohei-row">
      <div className="gohei-col1"><LabelComment {...{ ctx: this }} /></div>
      <div className="gohei-col2">
        <div id="swfContents"></div>
        <Comment {...{ comment, ctx: this }} />
      </div>
    </div>
    <div className="gohei-row">
      <div className="gohei-col1">添付File</div>
      <File {...{ state: this.state, ctx: this }} />
    </div>
    <div className="gohei-row">
      <div className="gohei-col1">削除キー</div>
      <DeleteKey {...this.state} />
    </div>
  </form>
  <div className="gohei-drop-msg" style={styleDropMsg}>ここにファイルをドロップ</div>
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

function Name({ name }) {
    return <input type="text" className="gohei-input-name" name="name" defaultValue={name} />;
}

function Email() {
    return <input type="text" className="gohei-input-email" name="email" />;
}

function Subject() {
    return <input type="text" className="gohei-input-subject" name="sub" />;
}

function Submit({ isPosting }) {
    let labelSubmit = isPosting ? '送信中…' : '送信する';
    let disabledSubmit = isPosting ? true : false;
    return <button type="submit" className="gohei-btn"
                   disabled={disabledSubmit}>{labelSubmit}</button>;
}

function LabelComment({ ctx }) {
    let { oekaki } = ctx._handlers;
    return (
<div className="gohei-label-comment">
  コメント
  <button className="gohei-link-btn" type="button" onClick={oekaki}>手書き</button>
</div>
    );
}

function Comment({ comment, ctx }) {
    let { changeComment } = ctx._handlers;
    let value = comment == null ? '' : comment;
    return <textarea className="gohei-input-comment" name="com" value={value}
                     ref={$el => ctx._$comment = $el} onChange={changeComment} />;
}

function File({ state, ctx }) {
    let { previewImage, previewVideo } = state;
    let { changeInputFile, detachFile } = ctx._handlers;
    let styleDetachFileBtn = ctx._hasAttachedFile() ? null : { display: 'none' };

    return (
<div className="gohei-col2">
  <input type="file" className="gohei-input-file" name="upfile"
         ref={$el => ctx._$inputFile = $el} onChange={changeInputFile} />
  <div className="gohei-font-smaller">(ドラッグ＆ドロップでファイルを添付できます)</div>
  <div style={styleDetachFileBtn}>
    <button className="gohei-link-btn" type="button" onClick={detachFile}>[ファイルを削除]</button>
  </div>
  <Preview {...{ image: previewImage, video: previewVideo }} />
</div>
    );
}

function DeleteKey({ pwd }) {
    return (
<div className="gohei-col2">
  <input type="password" className="gohei-input-password" name="pwd"
         maxLength="12" defaultValue={pwd} />
  <span className="gohei-font-smaller">(削除用。英数字で8字以内)</span>
  <object type="application/x-shockwave-flash" id="cnt" data="/bin/count.swf" width="0" height="0" aria-label="" aria-hidden="true"></object>
</div>
    );
}

function Preview({ image, video }) {
    let styleImage = image ? null : { display: 'none' };
    let styleVideo = video ? null :  { display: 'none' };

    // eslint-disable-next-line jsx-a11y/alt-text
    let $img = <img src={image} className="gohei-preview-img" style={styleImage} />;

    return (
<div className="gohei-preview">
  {$img}
  <video src={video} className="gohei-preview-video" style={styleVideo} />
</div>
    );
}

async function handleSubmit(event) {
    event.preventDefault();

    let $form = event.target;
    let url = $form.action;

    let fd = new FormData($form);
    fd.set('js', 'on');

    if (this._isEmptyForm(fd)) {
        this.setState({ errmsg: '何か書いて下さい' });
        this._focusComment();
        return;
    }

    this.setState({ isPosting: true, errmsg: null });

    let { commit } = this.props;
    let res = await commit('thread/submit', { url, formdata: fd });

    this.setState({ isPosting: false });

    if (res.ok) {
        this._setCookie(fd);
        this._resetForm();
    } else {
        this.setState({ errmsg: res.statusText });
    }

    this._focusComment();
    commit('thread/update');
}

function handleChangeInputFile(event) {
    let { files } = event.target;
    if (files.length === 0) return;
    this._showPreview();
}

function handleChangeComment(event) {
    let { commit } = this.props;
    commit('thread/setComment', event.target.value);
}

function handleDragEnter(event) {
    event.preventDefault();

    // fire event by child element
    if (this._isInsideDropBox) {
        this._isInsideChildren = true;
        return;
    }
    this._isInsideDropBox = true;
    this.setState({ styleDropMsg: null });
}

function handleDragLeave(event) {
    event.preventDefault();

    if (this._isInsideChildren) {
        this._isInsideChildren = false;
        return;
    }
    this._isInsideDropBox = false;
    this.setState({ styleDropMsg: { display: 'none' } });
}

function handleDrop(event) {
    event.preventDefault();

    this._isInsideDropBox = false;
    this._isInsideChildren = false;
    this.setState({ styleDropMsg: { display: 'none' } });

    let { files } = event.dataTransfer;
    let $el = this._$inputFile;

    // Chrome : emit change event when set files to $inputFile
    // Firefox: not emit change event when set files to $inputFile
    $el.files = files;

    // show file preview through change event of $inputFile
    if (isFirefox()) $el.dispatchEvent(new window.Event('change'));
}

function preventDefault(event) {
    event.preventDefault();
}

function readAsDataUrl(file) {
    if (file == null) throw new TypeError('file is required');

    let reader = new window.FileReader();

    return new Promise(resolve => {
        reader.onloadend = () => { resolve(reader.result); };
        reader.readAsDataURL(file);
    });
}
