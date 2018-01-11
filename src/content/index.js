'use strict';
import Bootstrap from './app/bootstrap';
import CatalogApp from './app/catalog';
import ThreadApp from './app/thread';
import { type } from '~/common/url';

main();

function main() {
    let app = dispatch();

    let bootstrap = new Bootstrap();
    bootstrap.run(app);
}

function dispatch() {
    switch (type(document.documentURI)) {
    case 'thread':
        return new ThreadApp();
    case 'catalog':
        return new CatalogApp();
    }
    return null;
}
