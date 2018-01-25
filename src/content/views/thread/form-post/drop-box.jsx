'use strict';
import React, { Component } from 'react';

export default class DropBox extends Component {
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
        let { isVisible } = this.state;
        let { drop } = this._handlers;

        let style = isVisible ? DROP_BOX_VISIBLE_STYLE : null;

        return (
<div className="gohei-drop-box" style={style} onDragOver={preventDefault} onDrop={drop}>
  ここにファイルをドロップ
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

    let { files } = event.dataTransfer;
    let { setFiles } = this.props;
    setFiles(files);
}

function preventDefault(event) {
    event.preventDefault();
}
