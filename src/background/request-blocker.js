'use strict';
import { isFutaba, type } from '~/common/url';
import { F } from '~/common/util';

const pass = F({ cancel: false });
const cancel = F({ cancel: true });

// status: null -> blocking -> done(content-scripts/bootstrap) -> null(onRemoved)
export default function blockFutabaRequest(store, { tabId, url }) {
    if (tabId === -1) return pass;

    let tab = store.tab(tabId);
    let isTarget = isFutaba(url);

    if (!isTarget && tab == null) {
        // eslint-disable-next-line no-console
        // console.log(`[${tabId}] not block(through url): ${url}`);
        return pass;
    }

    if (isTarget && tab == null) tab = store.add('tabs', { tabId });

    // eslint-disable-next-line no-console
    // console.log(`[${tabId}] block: ${tab && tab.status} ${url}`);

    if (tab.status === 'done') return pass;
    if (tab.status === 'blocking') return cancel;

    switch (type(url)) {
    case 'thread':
    case 'catalog':
        store.set('tabs', { tabId, status: 'blocking' });
        break;
    default:
        break;
    }

    return pass;
}
