// Chaos token images (the game's own token art, in public/tok).

import { TOKEN_NAMES } from './tokens';
import type { Token } from './tokens';
import { BASE } from './investigators';

/** File name for a token; "+" and "-" aren't handy in file names. */
export const tokenFile = (token: Token) => token.replace('+', 'p').replace('-', 'm');

export const tokenImage = (token: Token) => `${BASE}tok/${tokenFile(token)}.webp`;

/** Markup for a token image. */
export const tokenUse = (token: Token, className = 'token') =>
  `<img class="${className}" src="${tokenImage(token)}" alt="${TOKEN_NAMES[token]}" draggable="false">`;
