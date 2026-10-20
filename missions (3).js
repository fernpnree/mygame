import { dailyText } from '../data/missions.js';
import { icon } from '../art/icons.js';
import { achievementList, claimAchievement, claimDaily } from '../logic/missions.js';
import { formatDuration } from '../logic/time.js';
import { bar, fmt, rewardText } from './common.js';

function msToMidnight(nowTs) {
  const d = new Date(nowTs);
  d.setHours(24, 0, 0, 0);
  return d.getTime() - nowTs;
}

function claimButton(done, claimed, attrs) {
  if (claimed) return `<span class="done-mark">${icon('check')}รับแล้ว</span>`;
  return `<button class="btn small mint" ${attrs} ${done ? '' : 'disabled'}>รับ</button>`;
}

export function renderMissions(g) {
  const s = g.state;
  const daily = s.daily.missions
    .map((m, i) => {
      const done = m.progress >= m.target;
      return (
        `<article class="panel mission ${m.claimed ? 'claimed' : ''}">` +
        `<div class="mission-top"><b>${dailyText(m)}</b><span class="chip">${rewardText(m.reward)}</span></div>` +
        `<div class="mission-row">${bar('mission', m.progress, m.target)}<span class="count">${fmt(m.progress)}/${fmt(m.target)}</span>${claimButton(done, m.claimed, `data-action="claimDaily" data-i="${i}"`)}</div>` +
        '</article>'
      );
    })
    .join('');

  const list = achievementList(s);
  const got = list.filter((a) => a.claimed).length;
  // รอรับก่อน แล้วค่อยที่ยังไม่สำเร็จ ที่รับแล้วไว้ท้ายสุด
  const order = (a) => (a.done && !a.claimed ? 0 : a.claimed ? 2 : 1);
  const ach = [...list]
    .sort((a, b) => order(a) - order(b))
    .map(
      (a) =>
        `<article class="panel mission ${a.claimed ? 'claimed' : ''}">` +
        `<div class="mission-top"><b>${icon('trophy')} ${a.name}</b><span class="chip">${rewardText({ coins: a.reward })}</span></div>` +
        `<span class="muted">${a.desc}</span>` +
        `<div class="mission-row">${bar('exp', a.value, a.target)}<span class="count">${fmt(a.value)}/${fmt(a.target)}</span>${claimButton(a.done, a.claimed, `data-action="claimAch" data-id="${a.id}"`)}</div>` +
        '</article>',
    )
    .join('');

  return (
    '<section class="section">' +
    `<div class="section-head"><h2>ภารกิจวันนี้</h2><span class="hint">ภารกิจใหม่ในอีก ${formatDuration(msToMidnight(g.now()))}</span></div>` +
    daily +
    '</section>' +
    '<section class="section">' +
    `<div class="section-head"><h2>ความสำเร็จ</h2><span class="hint">${got}/${list.length}</span></div>` +
    ach +
    '</section>'
  );
}

export const missionActions = {
  claimDaily(g, d) {
    const reward = claimDaily(g.state, Number(d.i));
    if (!reward) return;
    g.sound('success');
    g.toast('ภารกิจสำเร็จ รับรางวัลแล้ว', reward.coins ? 'coin' : reward.food);
    if (reward.coins) g.bumpCoins();
    g.refresh();
  },
  claimAch(g, d) {
    const reward = claimAchievement(g.state, d.id);
    if (!reward) return;
    g.sound('levelup');
    g.toast(`รับรางวัล +${fmt(reward.coins)} เหรียญ`, 'trophy');
    g.bumpCoins();
    g.refresh();
  },
};
