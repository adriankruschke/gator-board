import {
  load, save, startSession, initialState, defaultsFor, change, undo, redo, canUndo, canRedo, MIN, MAX,
  draw, returnAll, returnOne, setCount, seal, release, clearBlessCurse, setupBag,
  total, inBag, outOfBag, bagSize, minCount, maxCount,
} from './store';
import type { Entry, State, Stat } from './store';
import { DIFFICULTY_NAMES, TOKENS, TOKEN_NAMES, findCampaign, startingBag } from './tokens';
import type { Difficulty, Token } from './tokens';
import { tokenUse } from './tokenArt';
import { BASE, LEGACY_INVESTIGATOR, backImage, cardImage, findInvestigator, thumbImage } from './investigators';
import { playClick, playDraw, playHorn } from './sound';

const STAT_NAMES: Record<Stat, string> = { c: 'Clues', r: 'Resources', h: 'Health', s: 'Sanity' };

const stage = document.getElementById('stage')!;
const $ = <T extends HTMLElement>(id: string) => document.getElementById(id) as T;
const $$ = <T extends Element>(sel: string, root: ParentNode = stage) => Array.from(root.querySelectorAll<T>(sel));

const logEl = $('log');
const logList = $('log-list');
const logScrim = stage.querySelector<HTMLElement>('.scrim')!;
const bagEl = $('bag');
const bagScrim = stage.querySelector<HTMLElement>('.bag-scrim')!;
const confirmEl = $('confirm');
const setupCampaign = $<HTMLSelectElement>('setup-campaign');

const saved = load();
// The board needs a session; without one, pick an investigator first.
if (!saved) location.replace(BASE);
let state: State = saved ?? initialState(LEGACY_INVESTIGATOR);
const investigator = findInvestigator(state.inv)!;
const defaults = defaultsFor(state.inv);

document.title = `${investigator.name} · Gator Board`;
$<HTMLImageElement>('card').src = cardImage(investigator.code);
$<HTMLImageElement>('card').alt = `${investigator.name}, ${investigator.subname}`;
// The blurred backdrop only needs the thumbnail; blurring the full-size card is expensive.
$('backdrop').style.backgroundImage = `url('${thumbImage(investigator.code)}')`;
stage.querySelector<HTMLElement>('[data-action="show-back"]')!.hidden = !investigator.back;
let setupDifficulty: Difficulty = state.bag.difficulty;
let pendingConfirm: (() => void) | null = null;
/** Set for the render right after a pull, so the token animates in only then. */
let drewTokens = false;

const timeFmt = new Intl.DateTimeFormat(undefined, { hour: 'numeric', minute: '2-digit' });
const dayFmt = new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric' });

function formatTime(t: number) {
  const d = new Date(t * 1000);
  const today = new Date().toDateString() === d.toDateString();
  return today ? timeFmt.format(d) : `${dayFmt.format(d)}, ${timeFmt.format(d)}`;
}

const campaignLabel = (id: string, difficulty: Difficulty) =>
  `${findCampaign(id)?.name ?? 'Custom'} · ${DIFFICULTY_NAMES[difficulty]}`;

const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? '' : 's'}`;

const tokenStrip = (tokens: Token[]) =>
  `<span class="token-strip">${tokens.map((t) => tokenUse(t, 'token mini')).join('')}</span>`;

// ---- Rendering

function renderStats() {
  for (const out of $$<HTMLOutputElement>('[data-value]')) {
    const v = String(state[out.dataset.value as Stat]);
    out.dataset.len = String(v.length);
    out.firstElementChild!.textContent = v;
  }
  for (const btn of $$<HTMLButtonElement>('.arrow')) {
    const v = state[btn.dataset.stat as Stat];
    btn.disabled = Number(btn.dataset.delta) < 0 ? v <= MIN : v >= MAX;
  }
  for (const b of $$<HTMLButtonElement>('[data-action="undo"]')) b.disabled = !canUndo(state);
  for (const b of $$<HTMLButtonElement>('[data-action="redo"]')) b.disabled = !canRedo(state);
  for (const el of $$<HTMLElement>('[data-summary]')) el.textContent = String(state[el.dataset.summary as Stat]);
}

function entryRow(e: Entry, current: boolean): string {
  const time = `<span class="entry-time">${formatTime(e.t)}</span>`;
  switch (e.y) {
    case 'stat': {
      const delta = e.to - e.from;
      return `<li class="entry entry-${e.k}${e.undone ? ' undone' : ''}${current ? ' current' : ''}">` +
        `<span class="entry-stat">${STAT_NAMES[e.k]}</span>` +
        `<span class="entry-change">${e.from} <span class="to">→</span> ${e.to}</span>` +
        `<span class="entry-delta">${delta > 0 ? '+' : '−'}${Math.abs(delta)}</span>` +
        (e.undone ? '<span class="entry-time">undone</span>' : time) + '</li>';
    }
    case 'draw':
      return `<li class="entry entry-bag"><span class="entry-stat">Drew</span>` +
        `<span class="entry-change">${tokenStrip(e.tokens)}</span>` +
        `<span class="entry-delta">${e.tokens.map((t) => TOKEN_NAMES[t]).join(', ')}</span>${time}</li>`;
    case 'return': {
      const parts = [e.bless && plural(e.bless, 'bless token'), e.curse && plural(e.curse, 'curse token')].filter(Boolean);
      return `<li class="entry entry-bag"><span class="entry-stat">Returned</span>` +
        `<span class="entry-change entry-wide">${parts.join(' and ')} removed from the bag</span>${time}</li>`;
    }
    case 'count': {
      const delta = e.to - e.from;
      return `<li class="entry entry-bag"><span class="entry-stat">${delta > 0 ? 'Added' : 'Removed'}</span>` +
        `<span class="entry-change">${tokenStrip([e.token])} ${TOKEN_NAMES[e.token]}</span>` +
        `<span class="entry-delta">${e.from} <span class="to">→</span> ${e.to}</span>${time}</li>`;
    }
    case 'seal':
    case 'release':
      return `<li class="entry entry-bag"><span class="entry-stat">${e.y === 'seal' ? 'Sealed' : 'Released'}</span>` +
        `<span class="entry-change">${tokenStrip(e.tokens)}</span>` +
        `<span class="entry-delta">${e.tokens.length > 1 ? plural(e.tokens.length, 'token') : TOKEN_NAMES[e.tokens[0]]}</span>${time}</li>`;
    case 'setup':
      return `<li class="entry entry-bag"><span class="entry-stat">New bag</span>` +
        `<span class="entry-change entry-wide">${campaignLabel(e.campaign, e.difficulty)}</span>${time}</li>`;
  }
}

function renderLog() {
  let currentIndex = -1;
  for (let i = state.log.length - 1; i >= 0; i--) {
    const e = state.log[i];
    if (e.y === 'stat' && !e.undone) { currentIndex = i; break; }
  }
  const rows: string[] = [];
  for (let i = state.log.length - 1; i >= 0; i--) rows.push(entryRow(state.log[i], i === currentIndex));
  rows.push(
    `<li class="entry origin"><span class="entry-stat">Start</span>` +
      `<span class="entry-change entry-wide">${investigator.name} · Clues ${defaults.c} · Resources ${defaults.r} · Health ${defaults.h} · Sanity ${defaults.s}</span></li>`,
  );
  logList.innerHTML = rows.join('');
}

function renderBag() {
  const { bag } = state;
  const size = bagSize(bag);
  $('bag-sub').textContent = `${campaignLabel(bag.campaign, bag.difficulty)} · ${plural(size, 'token')} in bag`;

  const drawn = bag.drawn;
  const latest = drawn.length - 1;
  $('drawn-row').innerHTML = drawn.slice(0, -1)
    .map((t, i) => `<button class="drawn" data-return="${i}" aria-label="Return ${TOKEN_NAMES[t]}">${tokenUse(t)}</button>`)
    .join('');

  const big = $<HTMLButtonElement>('big-token');
  if (drawn.length) {
    big.innerHTML = tokenUse(drawn[latest], 'token');
    big.classList.remove('empty');
    big.classList.toggle('drew', drewTokens);
    big.setAttribute('aria-label', drawn.length === 1 ? 'Return tokens' : `Return ${TOKEN_NAMES[drawn[latest]]}`);
  } else {
    big.innerHTML = `<span class="tap">${size ? 'Tap to draw' : 'Bag is empty'}</span>`;
    big.classList.add('empty');
    big.classList.remove('drew');
    big.setAttribute('aria-label', 'Draw a token');
  }
  big.disabled = !drawn.length && !size;

  $('draw-hint').textContent = drawn.length
    ? drawn.length === 1 ? 'Tap the token to put it back.' : `${drawn.length} tokens out · tap one to put it back.`
    : '';
  $('draw-idle').hidden = drawn.length > 0;
  $('draw-active').hidden = drawn.length === 0;
  for (const b of $$<HTMLButtonElement>('[data-draw]')) b.disabled = size < (drawn.length ? 1 : Number(b.dataset.draw));
  stage.querySelector<HTMLElement>('[data-action="return-keep"]')!.hidden =
    !drawn.some((t) => t === 'bless' || t === 'curse');

  $('sealed').hidden = bag.sealed.length === 0;
  $('sealed-row').innerHTML = bag.sealed
    .map((t, i) => `<button class="drawn" data-release="${i}" aria-label="Release ${TOKEN_NAMES[t]}">${tokenUse(t)}</button>`)
    .join('');

  for (const row of $$<HTMLElement>('.bag-row')) {
    const token = row.dataset.token as Token;
    const count = total(bag, token);
    const out = outOfBag(bag, token);
    row.classList.toggle('zero', count === 0);
    row.querySelector('output')!.textContent = String(count);
    const [dec, inc] = $$<HTMLButtonElement>('[data-count]', row);
    dec.disabled = count <= minCount(bag, token);
    inc.disabled = count >= maxCount(token);
    row.querySelector<HTMLButtonElement>('[data-seal]')!.disabled = inBag(bag, token) < 1;
    const drawnCount = bag.drawn.filter((t) => t === token).length;
    const notes = [drawnCount && `${drawnCount} drawn`, out - drawnCount && `${out - drawnCount} sealed`].filter(Boolean);
    row.querySelector('.row-note')!.textContent = notes.length ? ` · ${notes.join(', ')}` : '';
  }
  stage.querySelector<HTMLElement>('[data-action="clear-blurse"]')!.hidden = bag.bless + bag.curse === 0;

  renderSetup();
  drewTokens = false;
}

function renderSetup() {
  if (!findCampaign(setupCampaign.value)) setupCampaign.value = state.bag.campaign;
  for (const b of $$<HTMLButtonElement>('[data-difficulty]')) {
    b.setAttribute('aria-pressed', String(b.dataset.difficulty === setupDifficulty));
  }
  const preview = startingBag(setupCampaign.value, setupDifficulty);
  $('setup-preview').innerHTML = TOKENS.filter((t) => preview[t])
    .map((t) => `<span class="preview-item">${tokenUse(t, 'token mini')}<span>×${preview[t]}</span></span>`)
    .join('');
}

function render() {
  renderStats();
  renderLog();
  renderBag();
  stage.classList.add('ready');
}

function commit(next: State) {
  if (next === state) return;
  state = save(next);
  render();
}

// ---- Panels and dialogs

function setPanel(el: HTMLElement, scrim: HTMLElement, open: boolean) {
  el.classList.toggle('open', open);
  el.setAttribute('aria-hidden', String(!open));
  el.toggleAttribute('inert', !open);
  scrim.hidden = !open;
}

const bagOpen = () => bagEl.classList.contains('open');

function openBag() {
  setupCampaign.value = state.bag.campaign;
  setupDifficulty = state.bag.difficulty;
  renderSetup();
  setPanel(bagEl, bagScrim, true);
}

function selectTab(name: string) {
  for (const tab of $$<HTMLButtonElement>('[data-tab]')) tab.setAttribute('aria-selected', String(tab.dataset.tab === name));
  $('tab-contents').hidden = name !== 'contents';
  $('tab-setup').hidden = name !== 'setup';
}

function askConfirm(title: string, text: string, ok: string, onConfirm: () => void) {
  $('confirm-title').textContent = title;
  $('confirm-text').innerHTML = text;
  stage.querySelector<HTMLElement>('[data-action="confirm-ok"]')!.textContent = ok;
  pendingConfirm = onConfirm;
  confirmEl.hidden = false;
  stage.querySelector<HTMLButtonElement>('[data-action="confirm-cancel"]')!.focus();
}

function closeConfirm() {
  confirmEl.hidden = true;
  pendingConfirm = null;
}

const fsTarget = document.documentElement as HTMLElement & { webkitRequestFullscreen?: () => void };
const fsDoc = document as Document & { webkitFullscreenElement?: Element; webkitExitFullscreen?: () => void };
stage.querySelector<HTMLElement>('[data-action="fullscreen"]')!.hidden =
  !(fsTarget.requestFullscreen || fsTarget.webkitRequestFullscreen);

function toggleFullscreen() {
  if (document.fullscreenElement || fsDoc.webkitFullscreenElement) {
    (document.exitFullscreen?.bind(document) ?? fsDoc.webkitExitFullscreen?.bind(document))?.();
  } else {
    (fsTarget.requestFullscreen?.bind(fsTarget) ?? fsTarget.webkitRequestFullscreen?.bind(fsTarget))?.();
  }
}

// ---- Actions

function pullTokens(count: number) {
  const before = state.bag.drawn.length;
  drewTokens = true;
  commit(draw(state, count));
  const pulled = state.bag.drawn.slice(before);
  if (!pulled.length) drewTokens = false;
  // The auto-fail gets the losing horn instead of the usual pull sound.
  else if (pulled.includes('auto_fail')) playHorn();
  else playDraw();
}

const actions: Record<string, () => void> = {
  undo: () => commit(undo(state)),
  redo: () => commit(redo(state)),
  'open-log': () => {
    setPanel(logEl, logScrim, true);
    logList.scrollTop = 0;
  },
  'close-log': () => setPanel(logEl, logScrim, false),
  'open-bag': openBag,
  'close-bag': () => setPanel(bagEl, bagScrim, false),
  // With one token out, tapping it ends the pull; with several, it returns just that token.
  'big-token': () => {
    const { drawn } = state.bag;
    if (!drawn.length) pullTokens(1);
    else if (drawn.length === 1) commit(returnAll(state, false));
    else commit(returnOne(state, drawn.length - 1));
  },
  'space-draw': () => (state.bag.drawn.length ? commit(returnAll(state, false)) : pullTokens(1)),
  'return-all': () => commit(returnAll(state, false)),
  'return-keep': () => commit(returnAll(state, true)),
  'release-all': () => commit(release(state)),
  'clear-blurse': () =>
    askConfirm('Remove bless & curse?', 'Every bless and curse token leaves the bag, including drawn and sealed ones.',
      'Remove them', () => commit(clearBlessCurse(state))),
  'ask-setup': () => {
    const campaign = setupCampaign.value;
    const difficulty = setupDifficulty;
    askConfirm('Set up a new bag?',
      `The chaos bag is rebuilt for <strong>${campaignLabel(campaign, difficulty)}</strong>. ` +
      'Your current contents, bless and curse tokens, and sealed tokens are replaced.',
      'Set up bag', () => {
        commit(setupBag(state, campaign, difficulty));
        selectTab('contents');
      });
  },
  'ask-reset': () =>
    askConfirm('Reset the campaign?',
      `Clues, resources, health and sanity go back to <strong>${defaults.c}</strong>, <strong>${defaults.r}</strong>, ` +
      `<strong>${defaults.h}</strong> and ` +
      `<strong>${defaults.s}</strong>, the chaos bag returns to its default setup, and the entire campaign log is erased. ` +
      'This can’t be undone.',
      'Reset everything', () => {
        state = startSession(state.inv);
        render();
      }),
  'show-back': () => {
    const img = $<HTMLImageElement>('card-back-img');
    if (!img.getAttribute('src')) img.src = backImage(investigator.code);
    $('card-back').hidden = false;
  },
  'hide-back': () => {
    $('card-back').hidden = true;
  },
  'confirm-cancel': closeConfirm,
  'confirm-ok': () => {
    const run = pendingConfirm;
    closeConfirm();
    run?.();
  },
  fullscreen: toggleFullscreen,
};

stage.addEventListener('click', (ev) => {
  const target = (ev.target as Element).closest<HTMLElement>(
    '[data-action], [data-stat], [data-draw], [data-return], [data-release], [data-count], [data-seal], [data-tab], [data-difficulty]',
  );
  if (!target || (target as HTMLButtonElement).disabled) return;
  const d = target.dataset;
  const rowToken = () => target.closest<HTMLElement>('.bag-row')!.dataset.token as Token;

  if (d.stat) {
    const delta = Number(d.delta);
    const before = state[d.stat as Stat];
    commit(change(state, d.stat as Stat, delta));
    if (state[d.stat as Stat] !== before) playClick(delta > 0);
  }
  else if (d.draw) pullTokens(Number(d.draw));
  else if (d.return) commit(returnOne(state, Number(d.return)));
  else if (d.release) commit(release(state, Number(d.release)));
  else if (d.count) commit(setCount(state, rowToken(), total(state.bag, rowToken()) + Number(d.count)));
  else if (d.seal !== undefined) commit(seal(state, rowToken()));
  else if (d.tab) selectTab(d.tab);
  else if (d.difficulty) {
    setupDifficulty = d.difficulty as Difficulty;
    renderSetup();
  } else actions[d.action!]?.();
});

setupCampaign.addEventListener('change', renderSetup);

confirmEl.addEventListener('click', (ev) => {
  if (ev.target === confirmEl) closeConfirm();
});

document.addEventListener('keydown', (ev) => {
  if (ev.key === 'Escape') {
    if (!confirmEl.hidden) closeConfirm();
    else if (!$('card-back').hidden) actions['hide-back']();
    else if (bagOpen()) actions['close-bag']();
    else actions['close-log']();
    return;
  }
  if (!confirmEl.hidden || (ev.target as Element).closest('select')) return;

  const mod = ev.metaKey || ev.ctrlKey;
  if (mod && ev.key.toLowerCase() === 'z') {
    ev.preventDefault();
    actions[ev.shiftKey ? 'redo' : 'undo']();
  } else if (mod && ev.key.toLowerCase() === 'y') {
    ev.preventDefault();
    actions.redo();
  } else if (bagOpen() && !mod) {
    // Keyboard: 1–9 draw that many, space draws or returns everything, 0 / enter return everything.
    if (/^[1-9]$/.test(ev.key)) pullTokens(Number(ev.key));
    else if (ev.key === ' ') actions['space-draw']();
    else if (ev.key === '0' || ev.key === 'Enter') actions['return-all']();
    else return;
    ev.preventDefault();
  }
});

// Keep iPad pinch / double-tap gestures from zooming the board.
document.addEventListener('gesturestart', (ev) => ev.preventDefault());
document.addEventListener('dblclick', (ev) => ev.preventDefault());

render();
