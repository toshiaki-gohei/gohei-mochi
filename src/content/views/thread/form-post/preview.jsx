'use strict';
import React, { Component } from 'react';

export default class Preview extends Component {
    constructor(props) {
        super(props);
        this.state = { image: null, video: null };
    }

    componentDidMount() {
        let { file } = this.props;
        this._setPreview(file);
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

        switch (true) {
        case /^image\//.test(file.type):
            image = await readAsDataUrl(file);
            break;
        case /^video\//.test(file.type):
            video = await readAsDataUrl(file);
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
}<img src={image} className="gohei-preview-img" style={styleImage} />
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
