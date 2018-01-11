'use strict';
import assert from 'assert';
import * as procedures from '~/content/procedures/delreq';
import createStore from '~/content/reducers';
import { setup, teardown } from '@/support/dom';
import { externals, pluckFromMap as pluck } from '@/support/util';

describe(__filename, () => {
    before(() => setup());
    after(() => teardown());

    let store;
    beforeEach(() => store = createStore());

    const createPosts = nolist => {
        return nolist.map((no, index) => ({ id: `may/b/${no}`, index, no }));
    };
    const getDelreqs = () => store.getState().app.delreqs;

    const url = 'https://may.2chan.net/b/res/123456789.htm';
    const delreqUrl = 'https://may.2chan.net/del.php?guid=on';

    describe('export', () => {
        it('should export functions', () => {
            let got = externals(procedures).every(fn => typeof fn === 'function');
            assert(got === true);
        });
    });

    describe('add()', () => {
        const { add } = procedures;

        it('should add delreqs', () => {
            let posts = createPosts([ '100', '101', '102' ]);

            add(store, { url, posts });

            let got = pluck(getDelreqs(), 'post', 'url', 'form', 'status');
            let exp = [
                { post: 'may/b/100', url: delreqUrl,
                  form: { reason: null, mode: 'post', b: 'b', d: '100', dlv: 0 },
                  status: null },
                { post: 'may/b/101', url: delreqUrl,
                  form: { reason: null, mode: 'post', b: 'b', d: '101', dlv: 0 },
                  status: null },
                { post: 'may/b/102', url: delreqUrl,
                  form: { reason: null, mode: 'post', b: 'b', d: '102', dlv: 0 },
                  status: null },
            ];
            assert.deepStrictEqual(got, exp);
        });

        it('should add delreqs with reason and status', () => {
            let posts = createPosts([ '100', '101', '102' ]);
            let reason = 110;
            let status = 'stanby';

            add(store, { url, posts, reason, status });

            let got = pluck(getDelreqs(), 'post', 'url', 'form', 'status');
            let exp = [
                { post: 'may/b/100', url: delreqUrl,
                  form: { reason: 110, mode: 'post', b: 'b', d: '100', dlv: 0 },
                  status: 'stanby' },
                { post: 'may/b/101', url: delreqUrl,
                  form: { reason: 110, mode: 'post', b: 'b', d: '101', dlv: 0 },
                  status: 'stanby' },
                { post: 'may/b/102', url: delreqUrl,
                  form: { reason: 110, mode: 'post', b: 'b', d: '102', dlv: 0 },
                  status: 'stanby' },
            ];
            assert.deepStrictEqual(got, exp);
        });

        it('should add delreqs except already added', () => {
            let delreqs = new Map([
                [ 'may/b/100', { post: 'may/b/100', url: null, form: {}, status: 'complete' } ],
                [ 'may/b/101', { post: 'may/b/101', url: null, form: {}, status: null } ]
            ]);
            store = createStore({ app: { delreqs } });

            let posts = createPosts([ '100', '101', '102' ]);
            let reason = 110;
            let status = 'stanby';
            add(store, { url, posts, reason, status });

            let got = pluck(getDelreqs(), 'post', 'url', 'form', 'status');
            let exp = [
                { post: 'may/b/100', url: null, form: {}, status: 'complete' },
                { post: 'may/b/101', url: null, form: {}, status: null },
                { post: 'may/b/102', url: delreqUrl,
                  form: { reason: 110, mode: 'post', b: 'b', d: '102', dlv: 0 },
                  status: 'stanby' },
            ];
            assert.deepStrictEqual(got, exp);
        });
    });

    describe('delreqUrl', () => {
        const { delreqUrl } = procedures.internal;

        it('should return delreq url', () => {
            let got = delreqUrl('https://may.2chan.net/b/res/123456789.htm');
            assert(got === 'https://may.2chan.net/del.php?guid=on');

            got = delreqUrl('https://may.2chan.net/b/futaba.php?mode=cat');
            assert(got === 'https://may.2chan.net/del.php?guid=on');

            got = delreqUrl('http://may.2chan.net/b/res/123456789.htm');
            assert(got === 'http://may.2chan.net/del.php?guid=on');
            got = delreqUrl('http://may.2chan.net/b/futaba.php?mode=cat');
            assert(got === 'http://may.2chan.net/del.php?guid=on');
        });

        it('should throw exception if arg url is not correct url', () => {
            let got, exp;
            try { delreqUrl('http://www.2chan.net/'); } catch (e) { got = e.message; }
            exp = 'thread url or catalog url is required: http://www.2chan.net/';
            assert(got === exp);

            try { delreqUrl('http://example.net'); } catch (e) { got = e.message; }
            exp = 'thread url or catalog url is required: http://example.net';
            assert(got === exp);
        });
    });
});
