'use strict';
import React, { Component, Fragment } from 'react';
import Catalog from './catalog.jsx';
import Nav from './nav.jsx';
import performance from '~/common/performance';

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
        if (this._emitter) this._emitter.emit('catalog:did-mount');
    }
    componentWillUpdate() {
        // performance.start('render catalog');
    }
    componentDidUpdate() {
        // performance.end('render catalog');
        performance.print('render catalog');
        if (this._emitter) this._emitter.emit('catalog:did-update');
    }
    componentWillUnmount() {
        this._unsubscribe();
    }

    render() {
        let { commit } = this.props;
        let { domain, app, ui } = this.state;

        let url = app.current.catalog;
        let catalog = domain.catalogs.get(url);
        let appCatalog = app.catalogs.get(url);
        let { preferences } = ui;

        return (
<Fragment>
  <Nav {...{ commit, catalog, app: appCatalog }} />
  <h2 className="gohei-mode-title">カタログモード</h2>
  <Catalog {...{ commit, catalog, app: appCatalog, preferences }} />
</Fragment>
        );
    }
}
