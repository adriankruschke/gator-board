// SVG artwork for chaos tokens, emitted once as a <symbol> sprite and referenced with <use>.

import { TOKENS, TOKEN_NAMES } from './tokens';
import type { Token } from './tokens';

const PALE = '#ece5d3';

export const tokenId = (token: Token) => `tok-${token.replace('+', 'p').replace('-', 'm')}`;

/** Markup for a token that references the sprite. */
export const tokenUse = (token: Token, className = 'token') =>
  `<svg class="${className}" viewBox="0 0 100 100" role="img" aria-label="${TOKEN_NAMES[token]}"><use href="#${tokenId(token)}"/></svg>`;

const disc = (inner: string, outer: string, id: string) => `
  <radialGradient id="${id}-g" cx="42%" cy="38%" r="65%">
    <stop offset="0%" stop-color="${inner}"/><stop offset="100%" stop-color="${outer}"/>
  </radialGradient>
  <circle cx="50" cy="50" r="48" fill="url(#${id}-g)"/>
  <circle cx="50" cy="50" r="46.5" fill="none" stroke="rgb(255 255 255 / 0.18)" stroke-width="1.5"/>`;

function star(points: number, outer: number, inner: number, rotate = -90) {
  const pts: string[] = [];
  for (let i = 0; i < points * 2; i++) {
    const r = i % 2 ? inner : outer;
    const a = ((rotate + (i * 180) / points) * Math.PI) / 180;
    pts.push(`${(50 + r * Math.cos(a)).toFixed(2)},${(50 + r * Math.sin(a)).toFixed(2)}`);
  }
  return pts.join(' ');
}

function numeric(token: Token, id: string) {
  const plus = token === '+1';
  const label = TOKEN_NAMES[token];
  return `
    <radialGradient id="${id}-g" cx="42%" cy="38%" r="65%">
      <stop offset="0%" stop-color="#4f606c"/><stop offset="100%" stop-color="#27323a"/>
    </radialGradient>
    <radialGradient id="${id}-f" cx="45%" cy="40%" r="60%">
      <stop offset="0%" stop-color="${plus ? '#f6d488' : '#fffbf2'}"/><stop offset="100%" stop-color="${plus ? '#d7a444' : '#d9d1bd'}"/>
    </radialGradient>
    <circle cx="50" cy="50" r="48" fill="url(#${id}-g)"/>
    <circle cx="50" cy="50" r="37" fill="url(#${id}-f)" stroke="#1d262c" stroke-width="1.5"/>
    <text x="50" y="51" text-anchor="middle" dominant-baseline="central" font-family="'EB Garamond', Georgia, serif"
      font-weight="600" font-size="${label.length > 1 ? 42 : 48}" fill="#26323a" letter-spacing="-1">${label}</text>`;
}

const ART: Record<string, (id: string) => string> = {
  skull: (id) => `${disc('#8a2f12', '#4a1405', id)}
    <path fill="${PALE}" d="M50 20c-16 0-27 11-27 26 0 9 4 16 10 20v8c0 3 2 5 5 5h24c3 0 5-2 5-5v-8c6-4 10-11 10-20 0-15-11-26-27-26z"/>
    <ellipse cx="39.5" cy="48" rx="7.5" ry="8.5" fill="#4a1405"/><ellipse cx="60.5" cy="48" rx="7.5" ry="8.5" fill="#4a1405"/>
    <path fill="#4a1405" d="M50 57l-4.5 8h9z"/>
    <path stroke="#4a1405" stroke-width="2.4" d="M43 71v8M50 71v8M57 71v8"/>`,

  cultist: (id) => `${disc('#127352', '#003826', id)}
    <path fill="${PALE}" d="M50 16c-17 0-26 22-27 40-1 10-4 18-9 26h72c-5-8-8-16-9-26-1-18-10-40-27-40z"/>
    <path fill="#003826" d="M50 33c-10 0-16 11-16 23 0 11 7 18 16 18s16-7 16-18c0-12-6-23-16-23z"/>
    <ellipse cx="43.5" cy="55" rx="3.2" ry="2.2" fill="#f2d27a"/><ellipse cx="56.5" cy="55" rx="3.2" ry="2.2" fill="#f2d27a"/>`,

  tablet: (id) => `${disc('#0d5a8f', '#00243f', id)}
    <path fill="${PALE}" d="M33 20h34c4 0 6 2 6 6v48c0 4-2 6-6 6H33c-4 0-6-2-6-6V26c0-4 2-6 6-6z" transform="rotate(-8 50 50)"/>
    <g stroke="#00243f" stroke-width="3" stroke-linecap="round" transform="rotate(-8 50 50)">
      <path d="M36 32h10M52 32h12M36 41h6M47 41h17M36 50h14M55 50h9M36 59h8M49 59h15M36 68h18"/>
    </g>`,

  elder_thing: (id) => `${disc('#6f2a63', '#330f2d', id)}
    <g fill="${PALE}">
      ${[0, 1, 2, 3, 4].map((i) => `<path d="M50 50c-5-9-7-20-4-31 1-3 7-3 8 0 3 11 1 22-4 31z" transform="rotate(${i * 72} 50 50)"/>`).join('')}
      <circle cx="50" cy="50" r="10"/>
    </g>
    <circle cx="50" cy="50" r="4.5" fill="#330f2d"/>`,

  auto_fail: (id) => `${disc('#a52028', '#5c0a0f', id)}
    <path fill="none" stroke="${PALE}" stroke-width="11" stroke-linecap="round"
      d="M36 84c-6-16 0-28 14-34s20-16 14-26c-4-6-12-4-12 2 0 5 6 6 8 2"/>
    <g fill="#5c0a0f"><circle cx="40" cy="66" r="2.2"/><circle cx="50" cy="52" r="2.2"/><circle cx="62" cy="42" r="2"/><circle cx="64" cy="30" r="1.8"/></g>`,

  elder_sign: (id) => `${disc('#43a2ef', '#2a5b86', id)}
    <polygon points="${star(5, 38, 15)}" fill="none" stroke="${PALE}" stroke-width="5" stroke-linejoin="round"/>
    <path fill="${PALE}" d="M50 36c6 5 9 10 9 14s-3 9-9 14c-6-5-9-10-9-14s3-9 9-14z"/>
    <circle cx="50" cy="50" r="3.5" fill="#2a5b86"/>`,

  frost: (id) => `${disc('#56528a', '#27244a', id)}
    <g stroke="${PALE}" stroke-width="5" stroke-linecap="round" fill="none">
      ${[0, 60, 120].map((a) => `<path d="M50 16v68" transform="rotate(${a} 50 50)"/>`).join('')}
      ${[0, 60, 120, 180, 240, 300].map((a) => `<path d="M41 24l9 9 9-9" transform="rotate(${a} 50 50)"/>`).join('')}
    </g>`,

  blood: (id) => `${disc('#4a4a48', '#1c1d1c', id)}
    <path fill="#c22026" d="M50 17c-4 8-24 31-24 46a24 24 0 0 0 48 0c0-15-20-38-24-46z"/>
    <path fill="rgb(255 255 255 / 0.35)" d="M39 60c0-6 4-12 7-16-1 6-2 11 0 18-3 2-7 1-7-2z"/>`,

  bless: (id) => `${disc('#c0923d', '#5e4a1c', id)}
    <polygon points="${star(8, 38, 18, -90)}" fill="${PALE}"/>
    <circle cx="50" cy="50" r="12" fill="#8a6a2a"/><circle cx="50" cy="50" r="8" fill="${PALE}"/>`,

  curse: (id) => `${disc('#4e3355', '#241524', id)}
    <path fill="${PALE}" d="M28 22c-2 12 2 22 11 27-3 4-4 8-4 12 0 12 7 20 15 20s15-8 15-20c0-4-1-8-4-12 9-5 13-15 11-27-5 9-11 14-19 15-2-1-5-1-6-1s-4 0-6 1c-8-1-14-6-19-15z"/>
    <path fill="#241524" d="M40 57l7 3-1 6-7-2zM60 57l-7 3 1 6 7-2zM47 72h6l-3 4z"/>`,
};

/** A hidden SVG holding one <symbol> per token. */
export function tokenSprite(): string {
  const gradients: string[] = [];
  const symbols = TOKENS.map((token) => {
    const id = tokenId(token);
    // Gradients live in a shared <defs>; some browsers skip gradients nested inside <symbol>.
    const body = (ART[token] ? ART[token](id) : numeric(token, id))
      .replace(/<radialGradient[\s\S]*?<\/radialGradient>/g, (g) => (gradients.push(g), ''));
    return `<symbol id="${id}" viewBox="0 0 100 100">${body}</symbol>`;
  }).join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" width="0" height="0" style="position:absolute" aria-hidden="true"><defs>${gradients.join('')}</defs>${symbols}</svg>`;
}
