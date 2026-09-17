import { load, startSession } from './store';
import { DIFFICULTY_NAMES, findCampaign } from './tokens';
import { BASE, FACTION_NAMES, backImage, cardImage, findInvestigator, thumbImage } from './investigators';
import type { Investigator } from './investigators';

const $ = <T extends HTMLElement>(id: string) => document.getElementById(id) as T;
const $$ = <T extends Element>(sel: string) => Array.from(document.querySelectorAll<T>(sel));

const session = load();
const current = session && findInvestigator(session.inv);

const dateFmt = new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });

// ---- Session in progress

if (session && current) {
  $('session').hidden = false;
  $<HTMLImageElement>('session-thumb').src = thumbImage(current.code);
  $('session-title').textContent = `${current.name}, ${current.subname}`;
  $('session-stats').innerHTML =
    `<span class="pip clue">${session.c}</span> Clues ` +
    `<span class="pip resource">${session.r}</span> Resources ` +
    `<span class="pip health">${session.h}</span> Health ` +
    `<span class="pip sanity">${session.s}</span> Sanity`;
  const bag = `${findCampaign(session.bag.campaign)?.name ?? 'Custom'} · ${DIFFICULTY_NAMES[session.bag.difficulty]}`;
  const last = session.log[session.log.length - 1];
  $('session-meta').textContent = last ? `${bag} · Last change ${dateFmt.format(new Date(last.t * 1000))}` : bag;
}

// ---- Filtering

let faction = 'all';

function applyFilters() {
  const query = $<HTMLInputElement>('search').value.trim().toLowerCase();
  let shown = 0;
  for (const group of $$<HTMLElement>('.group')) {
    let visible = 0;
    for (const tile of group.querySelectorAll<HTMLElement>('.tile')) {
      const match = (faction === 'all' || tile.dataset.faction === faction) &&
        (!query || tile.dataset.search!.includes(query));
      tile.parentElement!.hidden = !match;
      if (match) visible++;
    }
    group.hidden = visible === 0;
    shown += visible;
  }
  $('empty').hidden = shown > 0;
}

$('search').addEventListener('input', applyFilters);

// ---- Detail sheet and starting a session

let selected: Investigator | null = null;
let showingBack = false;

function showSide(back: boolean) {
  if (!selected) return;
  showingBack = back && selected.back;
  const img = $<HTMLImageElement>('detail-img');
  img.src = showingBack ? backImage(selected.code) : cardImage(selected.code);
  img.alt = `${selected.name} card ${showingBack ? 'back' : 'front'}`;
  $('detail-flip').querySelector('span')!.textContent = showingBack ? 'Show front' : 'Show back';
}

function openDetail(inv: Investigator) {
  selected = inv;
  $('detail-faction').textContent = FACTION_NAMES[inv.faction];
  $('detail-faction').className = `eyebrow f-${inv.faction}`;
  $('detail-name').textContent = inv.name;
  $('detail-sub').textContent = inv.subname;
  $('detail-set').textContent = inv.set;
  $('detail-health').textContent = String(inv.health);
  $('detail-sanity').textContent = String(inv.sanity);
  $('detail-flip').hidden = !inv.back;
  // The thumbnail stands in while the full-size card loads.
  $('detail-img').style.backgroundImage = `url('${thumbImage(inv.code)}')`;
  showSide(false);
  $('detail').hidden = false;
  document.body.classList.add('locked');
}

function closeDetail() {
  $('detail').hidden = true;
  document.body.classList.remove('locked');
}

function begin(inv: Investigator) {
  startSession(inv.code);
  location.href = `${BASE}play/`;
}

function choose() {
  if (!selected) return;
  if (!session || !current) return begin(selected);
  $('confirm-text').innerHTML =
    `Your session as <strong>${current.name}</strong> will be erased, including its campaign log and chaos bag, ` +
    `and a new one starts as <strong>${selected.name}</strong>. This can’t be undone.`;
  $('confirm').hidden = false;
  $<HTMLButtonElement>('confirm').querySelector<HTMLButtonElement>('[data-action="cancel-new"]')!.focus();
}

document.addEventListener('click', (ev) => {
  const target = (ev.target as Element).closest<HTMLElement>('[data-action], [data-code], .filter');
  if ((ev.target as Element).classList.contains('sheet-scrim')) {
    if ((ev.target as HTMLElement).id === 'confirm') $('confirm').hidden = true;
    else closeDetail();
    return;
  }
  if (!target) return;

  if (target.classList.contains('filter')) {
    faction = target.dataset.faction!;
    for (const b of $$<HTMLElement>('.filter')) b.setAttribute('aria-pressed', String(b === target));
    applyFilters();
  } else if (target.dataset.code) {
    const inv = findInvestigator(target.dataset.code);
    if (inv) openDetail(inv);
  } else {
    switch (target.dataset.action) {
      case 'close-detail': return closeDetail();
      case 'flip': return showSide(!showingBack);
      case 'choose': return choose();
      case 'cancel-new':
        $('confirm').hidden = true;
        return;
      case 'confirm-new':
        if (selected) begin(selected);
        return;
    }
  }
});

document.addEventListener('keydown', (ev) => {
  if (ev.key !== 'Escape') return;
  if (!$('confirm').hidden) $('confirm').hidden = true;
  else if (!$('detail').hidden) closeDetail();
});
