'use strict';
import assert from 'assert';
import * as procedures from '~/content/procedures/thread';
import createStore from '~/content/reducers';
import { pick, pluckFromMap as pluck } from '@/support/util';

describe(__filename, () => {
    let store;
    beforeEach(() => store = createStore());

    describe('load()', () => {
        const { load } = procedures;

        it('should load', () => {
            let url = 'https://may.2chan.net/b/res/123000.htm';

            let contents = {
                url,
                thread: {
                    posts: [ { no: '100' }, { no: '101' }, { no: '102' } ],
                    expire: { message: '12:34頃消えます', date: 'date' }
                },
                messages: { viewer: '1234人くらい' },
                postform: { action: 'http://example.net/post' },
                lastModified: '01/01/2017 10:23:45'
            };

            load(store, contents);

            let { domain, app } = store.getState();

            let got = domain.threads.get(url);
            let exp = {
                url,
                title: null,
                posts: [ 'may/b/100', 'may/b/101', 'may/b/102' ],
                expire: { message: '12:34頃消えます', date: 'date' },
                postnum: null,
                newPostnum: null,
                thumb: null
            };
            assert.deepStrictEqual(got, exp);

            got = pluck(domain.posts, 'id', 'no');
            exp = [
                { id: 'may/b/100', no: '100' },
                { id: 'may/b/101', no: '101' },
                { id: 'may/b/102', no: '102' }
            ];
            assert.deepStrictEqual(got, exp);

            got = pick(app.threads.get(url), 'messages', 'postform', 'updateHttpRes');
            exp = {
                messages: {
                    viewer: '1234人くらい',
                    notice: null, warning: null, deletedPostCount: null
                },
                postform: {
                    action: 'http://example.net/post',
                    hiddens: [], comment: null, file: null
                },
                updateHttpRes: {
                    status: null, statusText: null,
                    lastModified: 'Sun, 01 Jan 2017 01:23:45 GMT', etag: null
                }
            };
            assert.deepEqual(got, exp);
        });
    });
});
