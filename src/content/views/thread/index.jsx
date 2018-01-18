'use strict';
import { h, Component } from 'preact';
import Thread from './thread.jsx';
import Console from './console.jsx';
import Panel from './panel.jsx';
import PopupContainer from '../popup-container.jsx';

export default class Main extends Component {
    constructor({ store, commit, emitter }) {
        super({ commit });
        if (store == null) throw new TypeError('store is required');

        this.state = store.getState();

        this._$el = null;
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

    render({ commit }, state) {
        let { domain, app, ui } = state;

        let url = app.current.thread;
        let thread = domain.threads.get(url);
        let appThread = app.threads.get(url);

        return (
<main ref={$el => this._$el = $el}>
  <Thread {...{ commit, thread, app: appThread }} />
  <Console {...{ commit, thread, app: appThread }} />
  <Panel {...{ commit, app, ui }} />
  <PopupContainer {...{ commit, popups: ui.popups }} />
</main>
        );
    }
}
