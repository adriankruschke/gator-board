import data from '../data/investigators.json';

export type Faction = 'guardian' | 'seeker' | 'rogue' | 'mystic' | 'survivor' | 'neutral';

export interface Investigator {
  code: string;
  name: string;
  subname: string;
  faction: Faction;
  health: number;
  sanity: number;
  /** Product the card was printed in. */
  set: string;
  /** Heading the start page groups it under. */
  section: string;
  kind: 'standard' | 'parallel' | 'scenario';
  /** Whether a back image exists. */
  back: boolean;
}

export const INVESTIGATORS = data as Investigator[];

/** Used for sessions saved before investigators could be chosen. */
export const LEGACY_INVESTIGATOR = '60201';

export const FACTIONS: Faction[] = ['guardian', 'seeker', 'rogue', 'mystic', 'survivor', 'neutral'];
export const FACTION_NAMES: Record<Faction, string> = {
  guardian: 'Guardian', seeker: 'Seeker', rogue: 'Rogue', mystic: 'Mystic', survivor: 'Survivor', neutral: 'Neutral',
};

export const findInvestigator = (code: string) => INVESTIGATORS.find((i) => i.code === code);

export const cardImage = (code: string) => `/inv/${code}.webp`;
export const thumbImage = (code: string) => `/inv/${code}-thumb.webp`;
export const backImage = (code: string) => `/inv/${code}-back.webp`;
