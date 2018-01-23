'use strict';
import React, { Component, Fragment } from 'react';
import Thread from './thread.jsx';
import Console from './console.jsx';
import Panel from './panel.jsx';
import PopupContainer from '../popup-container.jsx';

export default class Main extends Component {
    constructor(props) {
        super(props);

        let { store, emitter } = this.props;
        if (store == null) throw new TypeError('store is required');

        this.state = store.getState();

        this._emitter = emitter;

        this._unsubscribe = store.subscribe(() => {
            let state = store.getState();
            this.setState(state);
        });
    }

    componentDidMount() {
        if (this._emitter) this._emitter.emit('thread:did-mount');
    }
    componentDidUpdate() {
        if (this._emitter) this._emitter.emit('thread:did-update');
    }
    componentWillUnmount() {
        this._unsubscribe();
    }

    render() {
        let { commit } = this.props;
        let { domain, app, ui } = this.state;

        let url = app.current.thread;
        let thread = domain.threads.get(url);
        let appThread = app.threads.get(url);

        return (
<Fragment>
  <Thread {...{ commit, thread, app: appThread }} />
  <Console {...{ commit, thread, app: appThread }} />
  <Panel {...{ commit, app, ui }} />
  <PopupContainer {...{ commit, popups: ui.popups }} />
</Fragment>
        );
    }
}
