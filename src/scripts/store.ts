// Tracker state, campaign log (undo/redo) and cookie persistence.

export type Stat = 'r' | 'h' | 's';

export interface Entry {
  k: Stat;
  from: number;
  to: number;
  /** Unix time in seconds. */
  t: number;
}

export interface State {
  r: number;
  h: number;
  s: number;
  log: Entry[];
  /** Number of log entries currently applied; entries at index >= cursor are redoable. */
  cursor: number;
}

export const DEFAULTS = { r: 5, h: 7, s: 8 } as const;
export const MIN = 0;
export const MAX = 99;
const MAX_ENTRIES = 500;
/** Rapid taps on the same stat within this window collapse into one log entry. */
const MERGE_WINDOW_S = 3;

const COOKIE = 'gb';
const CHUNK = 3500;
const MAX_CHUNKS = 20;
const COOKIE_MAX_AGE = 60 * 60 * 24 * 400;

export const initialState = (): State => ({ ...DEFAULTS, log: [], cursor: 0 });

const clamp = (n: number) => Math.min(MAX, Math.max(MIN, n));
const now = () => Math.floor(Date.now() / 1000);

export function change(state: State, k: Stat, delta: number): State {
  const from = state[k];
  const to = clamp(from + delta);
  if (to === from) return state;

  // Changing anything after an undo discards the redo branch.
  let log = state.log.slice(0, state.cursor);
  const last = log[log.length - 1];
  const t = now();

  if (last && last.k === k && t - last.t <= MERGE_WINDOW_S) {
    log = log.slice(0, -1);
    if (last.from !== to) log.push({ k, from: last.from, to, t });
  } else {
    log.push({ k, from, to, t });
  }
  if (log.length > MAX_ENTRIES) log = log.slice(log.length - MAX_ENTRIES);

  return { ...state, [k]: to, log, cursor: log.length };
}

export const canUndo = (s: State) => s.cursor > 0;
export const canRedo = (s: State) => s.cursor < s.log.length;

export function undo(state: State): State {
  if (!canUndo(state)) return state;
  const e = state.log[state.cursor - 1];
  return { ...state, [e.k]: e.from, cursor: state.cursor - 1 };
}

export function redo(state: State): State {
  if (!canRedo(state)) return state;
  const e = state.log[state.cursor];
  return { ...state, [e.k]: e.to, cursor: state.cursor + 1 };
}

// ---- Serialization: "v2|r|h|s|cursor|k<from>.<to>.<t36>,..." (cookie-safe characters only)

function serialize(s: State): string {
  const entries = s.log.map((e) => `${e.k}${e.from}.${e.to}.${e.t.toString(36)}`).join(',');
  return `v2|${s.r}|${s.h}|${s.s}|${s.cursor}|${entries}`;
}

function deserialize(raw: string): State | null {
  const parts = raw.split('|');
  // v1 predates the resource tracker: "v1|h|s|cursor|entries".
  if (parts[0] === 'v1' && parts.length === 5) parts.splice(0, 1, 'v2', String(DEFAULTS.r));
  if (parts.length !== 6 || parts[0] !== 'v2') return null;
  const [r, h, s, cursor] = parts.slice(1, 5).map(Number);
  const log: Entry[] = [];
  for (const item of parts[5] ? parts[5].split(',') : []) {
    const m = /^([rhs])(\d+)\.(\d+)\.([0-9a-z]+)$/.exec(item);
    if (!m) return null;
    log.push({ k: m[1] as Stat, from: clamp(+m[2]), to: clamp(+m[3]), t: parseInt(m[4], 36) });
  }
  const ok = (n: number) => Number.isInteger(n) && n >= MIN && n <= MAX;
  if (![r, h, s].every(ok) || !Number.isInteger(cursor) || cursor < 0 || cursor > log.length) return null;
  return { r, h, s, log, cursor };
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
    const drop = Math.max(1, Math.ceil(s.log.length / 10));
    s = { ...s, log: s.log.slice(drop), cursor: Math.max(0, s.cursor - drop) };
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
