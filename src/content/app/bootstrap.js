'use strict';
import { sendMessage } from './util';
import { $, createElement } from '~/content/util/dom';

const done = { type: 'store', set: { status: 'done' } };

export default class Bootstrap {
    run(app) {
        if (app == null) return;

        if (app.runBeforeDOMContentLoaded) {
            app.runBeforeDOMContentLoaded();
        }

        document.addEventListener('DOMContentLoaded', async () => {
            if (!checkPage()) {
                sendMessage(done);
                return;
            }

            app.init();

            await sendMessage(done);

            app.run();
        }, { once: true });

        window.addEventListener('beforeunload', () => {
            // for page reload: first(null -> done) -(reload)-> seconde(...)
            sendMessage({ type: 'store', set: { status: null } });
        }, { once: true });
    }

    _enableHiddenBody() {
        if (document.head == null) return;
        if ($('gohei-hidden-body') != null) return;

        let $style = createElement('style', {
            type: 'text/css',
            id: 'gohei-hidden-body'
        });
        $style.textContent = 'body { display: none; }';
        document.head.appendChild($style);
    }

    _disableHiddenBody() {
        let $style = $('gohei-hidden-body');
        if ($style == null) return;
        $style.parentNode.removeChild($style);
    }
}

function checkPage() {
    let title = document.title;

    if (title === '404 File Not Found') return false;

    // 522
    if (title === 'Website is offline | 522: Connection timed out') return false;
    if (/^.+\.2chan\.net \| 522: Connection timed out$/.test(title)) return false;

    // 524
    if (title === 'Website is offline | 524: A timeout occurred') return false;

    return true;
}

export const internal = {
    checkPage
};
