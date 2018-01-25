'use strict';
import React, { Component, Fragment } from 'react';
import Preview from './preview.jsx';
import { $, createElement, tagName } from '~/content/util/dom';
import { isFirefox } from '~/common/browser';

export default class File extends Component {
    constructor(props) {
        super(props);

        this._$input = null;

        this._handlers = {
            change: handleChangeInput.bind(this),
            detach: () => this._detach(),
            pasteImage: pasteImageHandler().bind(this)
        };
    }

    componentWillReceiveProps(nextProps) {
        let prev = this.props;
        let next = nextProps;

        if (prev.files !== next.files) {
            this._attach(next.files);
        }
    }

    _attach(files) {
        // Chrome : emit change event when set files to $input
        // Firefox: not emit change event when set files to $input
        this._$input.files = files;

        // a change event is emitted on Chrome
        if (isFirefox()) {
            let event = { target: { files } };
            this._handlers.change(event);
        }
    }

    _detach() {
        let { commit, file } = this.props;
        if (file == null) return;

        this._$input.value = null;
        commit('thread/setFile', null);
    }

    render() {
        let { file } = this.props;
        let { change, detach, pasteImage } = this._handlers;

        let styleDetachFileBtn = file ? null : { display: 'none' };

        return (
<Fragment>
  <input type="file" className="gohei-input-file" name="upfile"
         ref={$el => this._$input = $el} onChange={change} />
  <div className="gohei-font-smaller">
    (ドラッグ＆ドロップでファイルを添付できます)
    <PasteImageBtn {...{ pasteImage }} />
  </div>
  <div style={styleDetachFileBtn}>
    <button className="gohei-link-btn" type="button" onClick={detach}>[ファイルを削除]</button>
  </div>
  <Preview {...{ file }} />
</Fragment>
        );
    }
}

function PasteImageBtn({ pasteImage }) {
    if (!isFirefox()) return null;
    return <button className="gohei-link-btn" type="button"
                   title="クリップボードの画像を添付します"
                   onClick={pasteImage}>[貼り付け]</button>;
}

function handleChangeInput(event) {
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

    disposePasteBox();
}

const PASTE_BOX_ID = 'gohei-paste-box';

function disposePasteBox() {
    let $box = $(PASTE_BOX_ID);
    if ($box) $box.parentNode.removeChild($box);
}

function createPasteBoxOnFirefox() {
    let { pageXOffset: x, pageYOffset: y } = window;

    disposePasteBox();

    let $box = createElement('div', { id: PASTE_BOX_ID, contenteditable: '' });
    $box.style.width = 0;
    $box.style.height = 0;
    $box.style.overflow = 'hidden';
    $box.style.position = 'absolute';
    $box.style.top = y + 'px';
    $box.style.left = x + 'px';

    document.body.appendChild($box);
    return $box;
}
