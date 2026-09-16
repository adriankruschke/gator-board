// Tracker state, chaos bag, campaign log (undo/redo) and cookie persistence.

import {
  BAG_TOKENS, DEFAULT_CAMPAIGN, DEFAULT_DIFFICULTY, DIFFICULTIES, TOKENS, TOKEN_LIMITS,
  findCampaign, startingBag,
} from './tokens';
import type { Bag, Difficulty, Token } from './tokens';

export type Stat = 'r' | 'h' | 's';

/** A health / sanity / resource change. These are the entries undo and redo act on. */
export interface StatEntry {
  y: 'stat';
  k: Stat;
  from: number;
  to: number;
  /** Unix time in seconds. */
  t: number;
  undone?: boolean;
}

/** Tokens pulled from the bag in one pull ("draw another" adds to the same entry). */
export interface DrawEntry { y: 'draw'; tokens: Token[]; t: number }
/** Tokens put back where drawn bless / curse tokens left the bag. */
export interface ReturnEntry { y: 'return'; bless: number; curse: number; t: number }
/** A token count edited by hand (includes bless and curse). */
export interface CountEntry { y: 'count'; token: Token; from: number; to: number; t: number }
export interface SealEntry { y: 'seal' | 'release'; tokens: Token[]; t: number }
export interface SetupEntry { y: 'setup'; campaign: string; difficulty: Difficulty; t: number }

export type Entry = StatEntry | DrawEntry | ReturnEntry | CountEntry | SealEntry | SetupEntry;

export interface ChaosBag {
  campaign: string;
  difficulty: Difficulty;
  /** Composition of the bag, excluding bless and curse. */
  counts: Bag;
  bless: number;
  curse: number;
  /** Tokens currently out of the bag, in draw order. */
  drawn: Token[];
  /** Tokens set aside on cards; they can't be drawn until released. */
  sealed: Token[];
}

export interface State {
  r: number;
  h: number;
  s: number;
  bag: ChaosBag;
  log: Entry[];
}

export const DEFAULTS = { r: 5, h: 7, s: 8 } as const;
export const MIN = 0;
export const MAX = 99;
const MAX_ENTRIES = 500;
/** Rapid taps on the same counter within this window collapse into one log entry. */
const MERGE_WINDOW_S = 3;

const COOKIE = 'gb';
const CHUNK = 3500;
const MAX_CHUNKS = 20;
const COOKIE_MAX_AGE = 60 * 60 * 24 * 400;

export const initialBag = (campaign = DEFAULT_CAMPAIGN, difficulty: Difficulty = DEFAULT_DIFFICULTY): ChaosBag => ({
  campaign,
  difficulty,
  counts: startingBag(campaign, difficulty),
  bless: 0,
  curse: 0,
  drawn: [],
  sealed: [],
});

export const initialState = (): State => ({ ...DEFAULTS, bag: initialBag(), log: [] });

const clamp = (n: number) => Math.min(MAX, Math.max(MIN, n));
const now = () => Math.floor(Date.now() / 1000);

function pushEntry(log: Entry[], entry: Entry): Entry[] {
  const next = [...log, entry];
  return next.length > MAX_ENTRIES ? next.slice(next.length - MAX_ENTRIES) : next;
}

const lastEntry = (log: Entry[]): Entry | undefined => log[log.length - 1];

// ---- Stats with undo / redo

export function change(state: State, k: Stat, delta: number): State {
  const from = state[k];
  const to = clamp(from + delta);
  if (to === from) return state;

  // Changing anything after an undo discards the redo branch.
  let log = state.log.filter((e) => !(e.y === 'stat' && e.undone));
  const last = lastEntry(log);
  const t = now();

  if (last?.y === 'stat' && last.k === k && t - last.t <= MERGE_WINDOW_S) {
    log = log.slice(0, -1);
    if (last.from !== to) log.push({ y: 'stat', k, from: last.from, to, t });
  } else {
    log = pushEntry(log, { y: 'stat', k, from, to, t });
  }
  return { ...state, [k]: to, log };
}

function lastIndex(log: Entry[], match: (e: Entry) => boolean) {
  for (let i = log.length - 1; i >= 0; i--) if (match(log[i])) return i;
  return -1;
}

const undoIndex = (log: Entry[]) => lastIndex(log, (e) => e.y === 'stat' && !e.undone);
// Undone entries always form the tail of the stat history, so redo takes the earliest one.
const redoIndex = (log: Entry[]) => log.findIndex((e) => e.y === 'stat' && !!e.undone);

export const canUndo = (s: State) => undoIndex(s.log) >= 0;
export const canRedo = (s: State) => redoIndex(s.log) >= 0;

function setUndone(state: State, i: number, undone: boolean): State {
  const e = state.log[i] as StatEntry;
  const log = [...state.log];
  log[i] = { ...e, undone };
  return { ...state, [e.k]: undone ? e.from : e.to, log };
}

export function undo(state: State): State {
  const i = undoIndex(state.log);
  return i < 0 ? state : setUndone(state, i, true);
}

export function redo(state: State): State {
  const i = redoIndex(state.log);
  return i < 0 ? state : setUndone(state, i, false);
}

// ---- Chaos bag

const countOf = (list: Token[], token: Token) => list.reduce((n, t) => n + (t === token ? 1 : 0), 0);

/** Total of a token in the bag's composition, whether in the bag, drawn or sealed. */
export function total(bag: ChaosBag, token: Token): number {
  if (token === 'bless') return bag.bless;
  if (token === 'curse') return bag.curse;
  return bag.counts[token] ?? 0;
}

/** Drawn or sealed tokens; the composition can't drop below this. */
export const outOfBag = (bag: ChaosBag, token: Token) => countOf(bag.drawn, token) + countOf(bag.sealed, token);

/** How many of a token can currently be drawn. */
export const inBag = (bag: ChaosBag, token: Token) => Math.max(0, total(bag, token) - outOfBag(bag, token));

export const bagSize = (bag: ChaosBag) => TOKENS.reduce((n, t) => n + inBag(bag, t), 0);

function randomInt(max: number): number {
  const buf = new Uint32Array(1);
  crypto.getRandomValues(buf);
  return buf[0] % max;
}

/** Draws `count` tokens at random. Drawing from an empty bag returns everything instead. */
export function draw(state: State, count = 1): State {
  const { bag } = state;
  const pool: Token[] = [];
  for (const token of TOKENS) for (let i = inBag(bag, token); i > 0; i--) pool.push(token);
  if (!pool.length) return returnAll(state, false);

  const picked: Token[] = [];
  for (let i = 0; i < count && pool.length; i++) picked.push(pool.splice(randomInt(pool.length), 1)[0]);

  // Adding to an existing pull extends that pull's log entry.
  const last = lastEntry(state.log);
  const log = bag.drawn.length && last?.y === 'draw'
    ? [...state.log.slice(0, -1), { ...last, tokens: [...last.tokens, ...picked] }]
    : pushEntry(state.log, { y: 'draw', tokens: picked, t: now() });

  return { ...state, bag: { ...bag, drawn: [...bag.drawn, ...picked] }, log };
}

/**
 * Puts every drawn token back. Per the rules, drawn bless and curse tokens are removed from
 * the bag unless `keepBlessCurse` is set.
 */
export function returnAll(state: State, keepBlessCurse: boolean): State {
  const { bag } = state;
  if (!bag.drawn.length) return state;
  const bless = keepBlessCurse ? 0 : countOf(bag.drawn, 'bless');
  const curse = keepBlessCurse ? 0 : countOf(bag.drawn, 'curse');
  return {
    ...state,
    bag: { ...bag, drawn: [], bless: bag.bless - bless, curse: bag.curse - curse },
    log: bless || curse ? pushEntry(state.log, { y: 'return', bless, curse, t: now() }) : state.log,
  };
}

/** Returns a single drawn token; a returned bless or curse leaves the bag. */
export function returnOne(state: State, index: number): State {
  const { bag } = state;
  const token = bag.drawn[index];
  if (!token) return state;
  const bless = token === 'bless' ? 1 : 0;
  const curse = token === 'curse' ? 1 : 0;
  return {
    ...state,
    bag: { ...bag, drawn: bag.drawn.filter((_, i) => i !== index), bless: bag.bless - bless, curse: bag.curse - curse },
    log: bless || curse ? pushEntry(state.log, { y: 'return', bless, curse, t: now() }) : state.log,
  };
}

export const minCount = outOfBag;
export const maxCount = (token: Token) => TOKEN_LIMITS[token];

export function setCount(state: State, token: Token, value: number): State {
  const { bag } = state;
  const from = total(bag, token);
  const to = Math.min(maxCount(token), Math.max(minCount(bag, token), value));
  if (to === from) return state;

  const nextBag: ChaosBag = token === 'bless' ? { ...bag, bless: to }
    : token === 'curse' ? { ...bag, curse: to }
    : { ...bag, counts: { ...bag.counts, [token]: to } };

  const last = lastEntry(state.log);
  const t = now();
  let log: Entry[];
  if (last?.y === 'count' && last.token === token && t - last.t <= MERGE_WINDOW_S) {
    log = state.log.slice(0, -1);
    if (last.from !== to) log.push({ ...last, to, t });
  } else {
    log = pushEntry(state.log, { y: 'count', token, from, to, t });
  }
  return { ...state, bag: nextBag, log };
}

export function seal(state: State, token: Token): State {
  const { bag } = state;
  if (inBag(bag, token) < 1) return state;
  return {
    ...state,
    bag: { ...bag, sealed: [...bag.sealed, token] },
    log: pushEntry(state.log, { y: 'seal', tokens: [token], t: now() }),
  };
}

/** Releases one sealed token, or all of them when no index is given. */
export function release(state: State, index?: number): State {
  const { bag } = state;
  const released = index === undefined ? bag.sealed : bag.sealed.slice(index, index + 1);
  if (!released.length) return state;
  return {
    ...state,
    bag: { ...bag, sealed: index === undefined ? [] : bag.sealed.filter((_, i) => i !== index) },
    log: pushEntry(state.log, { y: 'release', tokens: released, t: now() }),
  };
}

/** Removes every bless and curse token, including drawn and sealed ones. */
export function clearBlessCurse(state: State): State {
  let s = state;
  const { bag } = s;
  const keep = (t: Token) => t !== 'bless' && t !== 'curse';
  s = { ...s, bag: { ...bag, drawn: bag.drawn.filter(keep), sealed: bag.sealed.filter(keep) } };
  s = setCount(s, 'bless', 0);
  return setCount(s, 'curse', 0);
}

/** Rebuilds the bag for a campaign and difficulty; everything drawn or sealed goes back. */
export function setupBag(state: State, campaign: string, difficulty: Difficulty): State {
  return {
    ...state,
    bag: initialBag(campaign, difficulty),
    log: pushEntry(state.log, { y: 'setup', campaign, difficulty, t: now() }),
  };
}

// ---- Serialization (JSON, URI-encoded so it is cookie-safe)

const isInt = (n: unknown): n is number => Number.isInteger(n);
const isStatValue = (n: unknown): n is number => isInt(n) && n >= MIN && n <= MAX;
const isToken = (x: unknown): x is Token => TOKENS.includes(x as Token);
const isTokenList = (x: unknown): x is Token[] => Array.isArray(x) && x.every(isToken);
const isDifficulty = (x: unknown): x is Difficulty => DIFFICULTIES.includes(x as Difficulty);

function validEntry(e: any): e is Entry {
  if (!e || !isInt(e.t)) return false;
  switch (e.y) {
    case 'stat': return ['r', 'h', 's'].includes(e.k) && isStatValue(e.from) && isStatValue(e.to);
    case 'draw':
    case 'seal':
    case 'release': return isTokenList(e.tokens);
    case 'return': return isInt(e.bless) && isInt(e.curse);
    case 'count': return isToken(e.token) && isInt(e.from) && isInt(e.to);
    case 'setup': return typeof e.campaign === 'string' && isDifficulty(e.difficulty);
    default: return false;
  }
}

function validBag(b: any): b is ChaosBag {
  if (!b || !findCampaign(b.campaign) || !isDifficulty(b.difficulty)) return false;
  if (!isInt(b.bless) || !isInt(b.curse) || !isTokenList(b.drawn) || !isTokenList(b.sealed)) return false;
  if (!b.counts || typeof b.counts !== 'object') return false;
  return Object.entries(b.counts).every(([k, v]) => BAG_TOKENS.includes(k as Token) && isInt(v) && (v as number) >= 0);
}

function serialize(s: State): string {
  return encodeURIComponent(JSON.stringify({ v: 3, r: s.r, h: s.h, s: s.s, bag: s.bag, log: s.log }));
}

function deserialize(raw: string): State | null {
  if (raw.startsWith('v1|') || raw.startsWith('v2|')) return deserializeLegacy(raw);
  const data = JSON.parse(decodeURIComponent(raw));
  if (data?.v !== 3 || ![data.r, data.h, data.s].every(isStatValue)) return null;
  if (!validBag(data.bag) || !Array.isArray(data.log) || !data.log.every(validEntry)) return null;
  return { r: data.r, h: data.h, s: data.s, bag: data.bag, log: data.log };
}

/** v1 "v1|h|s|cursor|entries" and v2 "v2|r|h|s|cursor|entries" predate the chaos bag. */
function deserializeLegacy(raw: string): State | null {
  const parts = raw.split('|');
  if (parts[0] === 'v1' && parts.length === 5) parts.splice(0, 1, 'v2', String(DEFAULTS.r));
  if (parts.length !== 6) return null;
  const [r, h, s, cursor] = parts.slice(1, 5).map(Number);
  const log: StatEntry[] = [];
  for (const item of parts[5] ? parts[5].split(',') : []) {
    const m = /^([rhs])(\d+)\.(\d+)\.([0-9a-z]+)$/.exec(item);
    if (!m) return null;
    log.push({ y: 'stat', k: m[1] as Stat, from: clamp(+m[2]), to: clamp(+m[3]), t: parseInt(m[4], 36) });
  }
  if (![r, h, s].every(isStatValue) || !isInt(cursor) || cursor < 0 || cursor > log.length) return null;
  log.forEach((e, i) => { if (i >= cursor) e.undone = true; });
  return { r, h, s, bag: initialBag(), log };
}

// ---- Cookies (chunked, since a single cookie is limited to ~4KB)

function readCookies(): Map<string, string> {
  const map = new Map<string, string>();
  for (const pair of document.cookie ? document.cookie.split('; ') : []) {
    const i = pair.indexOf('=');
    map.set(pair.slice(0, i), pair.slice(i + 1));
  }
  return map;
}

function writeCookie(name: string, value: string, maxAge: number) {
  const secure = location.protocol === 'https:' ? '; Secure' : '';
  document.cookie = `${name}=${value}; Max-Age=${maxAge}; Path=/; SameSite=Lax${secure}`;
}

export function load(): State {
  try {
    const cookies = readCookies();
    const count = Number(cookies.get(`${COOKIE}_n`));
    if (!Number.isInteger(count) || count < 1 || count > MAX_CHUNKS) return initialState();
    let raw = '';
    for (let i = 0; i < count; i++) {
      const chunk = cookies.get(`${COOKIE}_${i}`);
      if (chunk === undefined) return initialState();
      raw += chunk;
    }
    return deserialize(raw) ?? initialState();
  } catch {
    return initialState();
  }
}

/** Persists the state and returns it (with the oldest history trimmed if it didn't fit). */
export function save(state: State): State {
  let s = state;
  let raw = serialize(s);
  // Drop the oldest history if the log would outgrow the cookie budget.
  while (raw.length > CHUNK * MAX_CHUNKS && s.log.length > 0) {
    s = { ...s, log: s.log.slice(Math.max(1, Math.ceil(s.log.length / 10))) };
    raw = serialize(s);
  }
  const chunks: string[] = [];
  for (let i = 0; i < raw.length; i += CHUNK) chunks.push(raw.slice(i, i + CHUNK));
  const previous = Number(readCookies().get(`${COOKIE}_n`)) || 0;
  chunks.forEach((c, i) => writeCookie(`${COOKIE}_${i}`, c, COOKIE_MAX_AGE));
  for (let i = chunks.length; i < previous; i++) writeCookie(`${COOKIE}_${i}`, '', 0);
  writeCookie(`${COOKIE}_n`, String(chunks.length), COOKIE_MAX_AGE);
  return s;
}

export function clear() {
  for (const name of readCookies().keys()) {
    if (name === `${COOKIE}_n` || name.startsWith(`${COOKIE}_`)) writeCookie(name, '', 0);
  }
}
