'use strict';
import React from 'react';
import { marginLeftForThumb } from './file.jsx';

export default function Header({ post, idipIndex, handlers }) {
    let { id, index, no, date, userId, userIp, del, sod, file } = post || {};
    let { popupPostsById, popupPostsByIp, delreq, soudane } = handlers || {};

    let marginLeft = index === 0 ? marginLeftForThumb(file) : null;
    let style = marginLeft ? { marginLeft } : null;

    return (
<div className="gohei-post-header" style={style}>
  <Index {...post} />
  <Subject {...post} />
  <Name {...post} />
  <Mailto {...post} />
  <span className="gohei-date">{date}</span>
  <span className="gohei-no">No.{no}</span>
  <UserId {...post} />
  <Counter {...{ idipIndex, idOrIp: userId, id, popupPostsBy: popupPostsById }} />
  <UserIp {...post} />
  <Counter {...{ idipIndex, idOrIp: userIp, id, popupPostsBy: popupPostsByIp }} />
  <Del {...{ del, delreq }} />
  <Sod {...{ sod, soudane }} />
</div>
    );
}

function Index({ index }) {
    if (index === 0) return null;
    return <span className="gohei-index">{index}</span>;
}

function Subject({ subject }) {
    if (subject == null) return null;
    return <span className="gohei-subject">{subject}</span>;
}

function Name({ name }) {
    if (name == null) return null;
    return <span className="gohei-name">{name}</span>;
}

function Mailto({ mailto }) {
    if (mailto == null) return null;
    return <span className="gohei-mailto">[{mailto}]</span>;
}

function UserId({ userId }) {
    if (userId == null) return null;
    return <span className="gohei-id">ID:{userId}</span>;
}

function UserIp({ userIp }) {
    if (userIp == null) return null;
    return <span className="gohei-ip">IP:{userIp}</span>;
}

function Del({ del, delreq }) {
    if (del == null) return null;
    return <button className="gohei-del gohei-link-btn" type="button"
                   onClick={delreq}>{del}</button>;
}

function Sod({ sod, soudane }) {
    if (sod == null) return null;

    let style = sod === 0 ? sodStyle : null;
    let text = sod === 0 ? '+' : `そうだねx${sod}`;

    return <button className="gohei-sod gohei-link-btn" type="button"
                   style={style} onClick={soudane}>{text}</button>;
}

const sodStyle = { paddingLeft: '4px', paddingRight: '4px' };

function Counter({ idipIndex, idOrIp, id, popupPostsBy }) {
    if (idipIndex == null) return null;
    if (idOrIp == null) return null;

    let count = idipIndex.countUp(idOrIp, id);
    if (count == null) return null;
    let { current, total } = count;

    return <span className="gohei-counter"
                 onMouseEnter={popupPostsBy}>[{current}/{total}]</span>;
}
