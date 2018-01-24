'use strict';
import React, { Component } from 'react';
import cookie from 'js-cookie';
import FormData from '~/content/util/form-data';
import { THREAD_PANEL_TYPE as P_TYPE } from '~/content/constants';
import { isFirefox } from '~/common/browser';
import { $, createElement, tagName } from '~/content/util/dom';

export default class Postform extends Component {
    constructor(props) {
        super(props);

        this.state = {
            name: cookie.get('namec'),
            pwd: cookie.get('pwdc'),
            files: null,

            isPosting: false,
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
        let prev = prevProps;
        let next = this.props;
        if (!prev.panel.isOpen && next.isOpen) this._focusComment();
    }

    _focusComment() {
        setTimeout(() => { this._$comment.focus(); }, 10);
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
        let name = formdata.get('name');
        let pwd = formdata.get('pwd');
        this.setState({ name, pwd });
        cookie.set('namec', name);
        cookie.set('pwdc', pwd);
    }

    render() {
        let { commit, panel, postform } = this.props;
        let { name, files, errmsg } = this.state;

        if (panel == null || postform == null) return null;

        let stylePostForm = panel.type === P_TYPE.FORM_POST ? null : { display: 'none' };

        let { action, hiddens, comment, file } = postform || {};
        let { submit, ...handlers } = this._handlers;

        return (
<div className="gohei-postform" style={stylePostForm}>
  <div className="gohei-err-msg gohei-text-error">{errmsg}</div>
  <form action={action} method="POST" encType="multipart/form-data"
        ref={$el => this._$form = $el} onSubmit={submit}>
    <Hiddens {...{ hiddens }} />
    <div className="gohei-row">
      <div className="gohei-col1">おなまえ</div>
      <div className="gohei-col2">
        <input type="text" className="gohei-input-name" name="name" defaultValue={name} />
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
        <Submit {...this.state} />
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
      <File {...{ commit, file, files }} />
    </div>
    <div className="gohei-row">
      <div className="gohei-col1">削除キー</div>
      <DeleteKey {...this.state} />
    </div>
  </form>
  <DropBox {...{ handlers }}>ここにファイルをドロップ</DropBox>
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

function Submit({ isPosting }) {
    let labelSubmit = isPosting ? '送信中…' : '送信する';
    let disabledSubmit = isPosting ? true : false;
    return <button type="submit" className="gohei-btn"
                   disabled={disabledSubmit}>{labelSubmit}</button>;
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

    this.setState({ isPosting: true, errmsg: null });

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

function handleChangeComment(event) {
    let { commit } = this.props;
    commit('thread/setComment', event.target.value);
}

class File extends Component {
    constructor(props) {
        super(props);

        this._$inputFile = null;

        this._handlers = {
            changeInputFile: handleChangeInputFile.bind(this),
            detachFile: () => this._detachFile(),
            pasteImage: pasteImageHandler().bind(this)
        };
    }

    componentWillReceiveProps(nextProps) {
        let prev = this.props;
        let next = nextProps;

        if (prev.files !== next.files) {
            let $el = this._$inputFile;

            // Chrome : emit change event when set files to $inputFile
            // Firefox: not emit change event when set files to $inputFile
            $el.files = next.files;

            // show file preview through change event of $inputFile
            if (isFirefox()) $el.dispatchEvent(new window.Event('change'));
        }
    }

    _detachFile() {
        let { commit, file } = this.props;
        if (file == null) return;

        this._$inputFile.value = null;
        commit('thread/setFile', null);
    }

    render() {
        let { file } = this.props;
        let { changeInputFile, detachFile, pasteImage } = this._handlers;

        let styleDetachFileBtn = file ? null : { display: 'none' };

        return (
<div className="gohei-col2">
  <input type="file" className="gohei-input-file" name="upfile"
         ref={$el => this._$inputFile = $el} onChange={changeInputFile} />
  <div className="gohei-font-smaller">
    (ドラッグ＆ドロップでファイルを添付できます)
    <PasteImageBtn {...{ pasteImage }} />
  </div>
  <div style={styleDetachFileBtn}>
    <button className="gohei-link-btn" type="button" onClick={detachFile}>[ファイルを削除]</button>
  </div>
  <Preview {...{ file }} />
</div>
        );
    }
}

function PasteImageBtn({ pasteImage }) {
    if (!isFirefox()) return null;
    return <button className="gohei-link-btn" type="button"
                   title="クリップボードの画像を添付します"
                   onClick={pasteImage}>[貼り付け]</button>;
}

function handleChangeInputFile(event) {
    let { files } = event.target;
    let { commit } = this.props;

    let file = files.length === 0 ? null : files[0];
    commit('thread/setFile', file);
}

function pasteImageHandler() {
    if (isFirefox()) return handlePasteImageOnFirefox;
    return () => {};
}

async function handlePasteImageOnFirefox() {
    let $box = createPasteBoxOnFirefox();
    $box.focus();
    document.execCommand('paste');

    let $img = $box.children[0];
    if ($img == null || tagName($img) !== 'img') return;
    let blob = await window.fetch($img.src).then(res => res.blob());

    if (!/^data:(.+?);/.test($img.src.split(',')[0])) return;
    let mime = RegExp.$1;
    let file = new window.File([ blob ], 'clipboard-image', { type: mime });

    let { commit } = this.props;
    commit('thread/setFile', file);

    this._focusComment();
}

function createPasteBoxOnFirefox() {
    const id = 'gohei-paste-box';
    let { pageXOffset: x, pageYOffset: y } = window;

    let $box = $(id);
    if ($box) $box.parentNode.removeChild($box);

    $box = createElement('div', { id, contenteditable: '' });
    $box.style.width = 0;
    $box.style.height = 0;
    $box.style.overflow = 'hidden';
    $box.style.position = 'absolute';
    $box.style.top = y + 'px';
    $box.style.left = x + 'px';

    document.body.appendChild($box);
    return $box;
}

class Preview extends Component {
    constructor(props) {
        super(props);
        this.state = { image: null, video: null };
    }

    componentWillReceiveProps(nextProps) {
        let prev = this.props;
        let next = nextProps;
        if (prev.file !== next.file) {
            this._setPreview(next.file);
        }
    }

    async _setPreview(file) {
        let image = null, video = null;

        if (file == null) {
            this.setState({ image, video });
            return;
        }

        let dataUrl = await readAsDataUrl(file);

        switch (true) {
        case /^image\//.test(file.type):
            image = dataUrl;
            break;
        case /^video\//.test(file.type):
            video = dataUrl;
            break;
        }

        this.setState({ image, video });
    }

    render() {
        let { image, video } = this.state;

        let styleImage = image ? null : { display: 'none' };
        let styleVideo = video ? null : { display: 'none' };

        return (
<div className="gohei-preview">{
    // eslint-disable-next-line jsx-a11y/alt-text
} <img src={image} className="gohei-preview-img" style={styleImage} />
  <video src={video} className="gohei-preview-video" style={styleVideo} />
</div>
        );
    }
}

function readAsDataUrl(file) {
    if (file == null) throw new TypeError('file is required');

    let reader = new window.FileReader();

    return new Promise(resolve => {
        reader.onloadend = () => { resolve(reader.result); };
        reader.readAsDataURL(file);
    });
}

class DropBox extends Component {
    constructor(props) {
        super(props);

        this.state = {
            isVisible: false
        };

        this._isInsideDragArea = false;
        this._isInsideChildren = false;

        this._handlers = {
            dragEnter: handleDragEnter.bind(this),
            dragLeave: handleDragLeave.bind(this),
            drop: handleDrop.bind(this)
        };
    }

    componentDidMount() {
        let { dragEnter, dragLeave } = this._handlers;
        document.body.addEventListener('dragenter', dragEnter);
        document.body.addEventListener('dragleave', dragLeave);
    }

    componentWillUnmount() {
        let { dragEnter, dragLeave } = this._handlers;
        document.body.removeEventListener('dragenter', dragEnter);
        document.body.removeEventListener('dragleave', dragLeave);
    }

    render() {
        let { children } = this.props;
        let { isVisible } = this.state;
        let { drop } = this._handlers;

        let style = isVisible ? DROP_BOX_VISIBLE_STYLE : null;

        return (
<div className="gohei-drop-box" style={style} onDragOver={preventDefault} onDrop={drop}>
  {children}
</div>
        );
    }
}

const DROP_BOX_VISIBLE_STYLE = { width: '100%', height: '100%' };

function handleDragEnter(event) {
    event.preventDefault();

    // fire event by child element
    if (this._isInsideDragArea) {
        this._isInsideChildren = true;
        return;
    }
    this._isInsideDragArea = true;
    this.setState({ isVisible: true });
}

function handleDragLeave(event) {
    event.preventDefault();

    if (this._isInsideChildren) {
        this._isInsideChildren = false;
        return;
    }
    this._isInsideDragArea = false;
    this.setState({ isVisible: false });
}

function handleDrop(event) {
    event.preventDefault();

    this._isInsideDragArea = false;
    this._isInsideChildren = false;
    this.setState({ isVisible: false });

    let { handlers } = this.props;
    let { files } = event.dataTransfer;
    handlers.setFiles(files);
}

function preventDefault(event) {
    event.preventDefault();
}

export const internal = {
    DropBox
};
