'use strict';
import http from 'http';

const port = 30001;

export default function createServer() {
    let server = http.createServer();

    return new Promise(resolve => {
        server.listen(port, () => resolve(server));
    });
}
