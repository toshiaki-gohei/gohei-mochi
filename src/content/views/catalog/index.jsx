'use strict';
import { h, Component } from 'preact';
import Catalog from './catalog.jsx';
import Nav from './nav.jsx';

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
        if (this._emitter) this._emitter.emit('thread:loaded');
    }
    componentDidUpdate() {
        // if (this._emitter) this._emitter.emit('thread:loaded');
    }
    componentWillUnmount() {
        this._unsubscribe();
    }

    render({ commit }, state) {
        let url = state.app.current.catalog;

        let catalog = state.domain.catalogs.get(url);
        let app = state.app.catalogs.get(url);
        let { preferences } = state.ui;

        return (
<main>
  <Nav {...{ commit, catalog, app }} />
  <h2 class="gohei-mode-title">カタログモード</h2>
  <Catalog {...{ commit, catalog, app, preferences }} />
</main>
        );
    }
}
