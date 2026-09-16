// Chaos token definitions and the starting bag for each campaign and difficulty.

export type Token =
  | '+1' | '0' | '-1' | '-2' | '-3' | '-4' | '-5' | '-6' | '-7' | '-8'
  | 'skull' | 'cultist' | 'tablet' | 'elder_thing' | 'auto_fail' | 'elder_sign'
  | 'frost' | 'blood' | 'bless' | 'curse';

/** Every token, in display order. */
export const TOKENS: Token[] = [
  '+1', '0', '-1', '-2', '-3', '-4', '-5', '-6', '-7', '-8',
  'skull', 'cultist', 'tablet', 'elder_thing', 'auto_fail', 'elder_sign',
  'frost', 'blood', 'bless', 'curse',
];

/** Tokens whose count is part of the bag composition (bless and curse are tracked separately). */
export const BAG_TOKENS = TOKENS.filter((t) => t !== 'bless' && t !== 'curse');

export const TOKEN_NAMES: Record<Token, string> = {
  '+1': '+1', '0': '0', '-1': '−1', '-2': '−2', '-3': '−3', '-4': '−4',
  '-5': '−5', '-6': '−6', '-7': '−7', '-8': '−8',
  skull: 'Skull', cultist: 'Cultist', tablet: 'Tablet', elder_thing: 'Elder Thing',
  auto_fail: 'Auto-fail', elder_sign: 'Elder Sign', frost: 'Frost', blood: 'Blood',
  bless: 'Bless', curse: 'Curse',
};

/** How many of each token physically exist, which caps editing. */
export const TOKEN_LIMITS: Record<Token, number> = {
  '+1': 3, '0': 4, '-1': 5, '-2': 4, '-3': 3, '-4': 2, '-5': 2, '-6': 2, '-7': 1, '-8': 1,
  skull: 4, cultist: 4, tablet: 4, elder_thing: 4, auto_fail: 2, elder_sign: 2,
  frost: 8, blood: 12, bless: 10, curse: 10,
};

export type Bag = Partial<Record<Token, number>>;

export type Difficulty = 'easy' | 'standard' | 'hard' | 'expert';
export const DIFFICULTIES: Difficulty[] = ['easy', 'standard', 'hard', 'expert'];
export const DIFFICULTY_NAMES: Record<Difficulty, string> = {
  easy: 'Easy', standard: 'Standard', hard: 'Hard', expert: 'Expert',
};

type BagsByDifficulty = Record<Difficulty, Bag>;

const NOTZ: BagsByDifficulty = {
  easy: { '+1': 2, '0': 3, '-1': 3, '-2': 2, skull: 2, cultist: 1, tablet: 1, auto_fail: 1, elder_sign: 1 },
  standard: { '+1': 1, '0': 2, '-1': 3, '-2': 2, '-3': 1, '-4': 1, skull: 2, cultist: 1, tablet: 1, auto_fail: 1, elder_sign: 1 },
  hard: { '0': 3, '-1': 2, '-2': 2, '-3': 2, '-4': 1, '-5': 1, skull: 2, cultist: 1, tablet: 1, auto_fail: 1, elder_sign: 1 },
  expert: { '0': 1, '-1': 2, '-2': 2, '-3': 2, '-4': 2, '-5': 1, '-6': 1, '-8': 1, skull: 2, cultist: 1, tablet: 1, auto_fail: 1, elder_sign: 1 },
};

const COB: BagsByDifficulty = {
  easy: { '+1': 2, '0': 3, '-1': 3, '-2': 2, skull: 2, tablet: 1, elder_thing: 1, auto_fail: 1, elder_sign: 1 },
  standard: { '+1': 1, '0': 2, '-1': 3, '-2': 2, '-3': 1, '-4': 1, skull: 2, tablet: 1, elder_thing: 1, auto_fail: 1, elder_sign: 1 },
  hard: { '0': 3, '-1': 2, '-2': 2, '-3': 2, '-4': 1, '-5': 1, skull: 2, tablet: 1, elder_thing: 1, auto_fail: 1, elder_sign: 1, blood: 1 },
  expert: { '0': 1, '-1': 2, '-2': 2, '-3': 2, '-4': 2, '-5': 1, '-6': 1, '-8': 1, skull: 2, tablet: 1, elder_thing: 1, auto_fail: 1, elder_sign: 1, blood: 2 },
};

/** Shared by several campaigns: skull ×2, tablet, elder thing. */
const SKULL_TABLET_ELDER: BagsByDifficulty = {
  easy: { '+1': 2, '0': 3, '-1': 3, '-2': 2, skull: 2, tablet: 1, elder_thing: 1, auto_fail: 1, elder_sign: 1 },
  standard: { '+1': 1, '0': 2, '-1': 3, '-2': 2, '-3': 1, '-4': 1, skull: 2, tablet: 1, elder_thing: 1, auto_fail: 1, elder_sign: 1 },
  hard: { '0': 3, '-1': 2, '-2': 2, '-3': 2, '-4': 1, '-5': 1, skull: 2, tablet: 1, elder_thing: 1, auto_fail: 1, elder_sign: 1 },
  expert: { '0': 1, '-1': 2, '-2': 2, '-3': 2, '-4': 2, '-5': 1, '-6': 1, '-8': 1, skull: 2, tablet: 1, elder_thing: 1, auto_fail: 1, elder_sign: 1 },
};

const DWL: BagsByDifficulty = {
  easy: { '+1': 2, '0': 3, '-1': 3, '-2': 2, skull: 2, cultist: 1, auto_fail: 1, elder_sign: 1 },
  standard: { '+1': 1, '0': 2, '-1': 3, '-2': 2, '-3': 1, '-4': 1, skull: 2, cultist: 1, auto_fail: 1, elder_sign: 1 },
  hard: { '0': 3, '-1': 2, '-2': 2, '-3': 2, '-4': 1, '-5': 1, skull: 2, cultist: 1, auto_fail: 1, elder_sign: 1 },
  expert: { '0': 1, '-1': 2, '-2': 2, '-3': 2, '-4': 2, '-5': 1, '-6': 1, '-8': 1, skull: 2, cultist: 1, auto_fail: 1, elder_sign: 1 },
};

const PTC: BagsByDifficulty = {
  easy: { '+1': 2, '0': 3, '-1': 3, '-2': 2, skull: 3, auto_fail: 1, elder_sign: 1 },
  standard: { '+1': 1, '0': 2, '-1': 3, '-2': 2, '-3': 1, '-4': 1, skull: 3, auto_fail: 1, elder_sign: 1 },
  hard: { '0': 3, '-1': 2, '-2': 2, '-3': 2, '-4': 1, '-5': 1, skull: 3, auto_fail: 1, elder_sign: 1 },
  expert: { '0': 1, '-1': 2, '-2': 2, '-3': 3, '-4': 2, '-5': 1, '-6': 1, '-8': 1, skull: 3, auto_fail: 1, elder_sign: 1 },
};

const TFA: BagsByDifficulty = {
  easy: { '+1': 2, '0': 3, '-1': 2, '-2': 1, '-3': 1, skull: 2, elder_thing: 1, auto_fail: 1, elder_sign: 1 },
  standard: { '+1': 1, '0': 3, '-1': 1, '-2': 2, '-3': 1, '-5': 1, skull: 2, elder_thing: 1, auto_fail: 1, elder_sign: 1 },
  hard: { '+1': 1, '0': 2, '-1': 1, '-2': 1, '-3': 2, '-4': 1, '-6': 1, skull: 2, elder_thing: 1, auto_fail: 1, elder_sign: 1 },
  expert: { '0': 1, '-1': 1, '-2': 2, '-3': 2, '-4': 2, '-6': 1, '-8': 1, skull: 2, elder_thing: 1, auto_fail: 1, elder_sign: 1 },
};

const TCU: BagsByDifficulty = {
  easy: { '+1': 2, '0': 3, '-1': 2, '-2': 1, '-3': 1, skull: 2, auto_fail: 1, elder_sign: 1 },
  standard: { '+1': 1, '0': 2, '-1': 2, '-2': 2, '-3': 1, '-4': 1, skull: 2, auto_fail: 1, elder_sign: 1 },
  hard: { '0': 2, '-1': 2, '-2': 2, '-3': 1, '-4': 1, '-5': 1, skull: 2, auto_fail: 1, elder_sign: 1 },
  expert: { '0': 1, '-1': 2, '-2': 2, '-3': 1, '-4': 1, '-6': 1, '-8': 1, skull: 2, auto_fail: 1, elder_sign: 1 },
};

const TDEA: BagsByDifficulty = {
  easy: { '+1': 2, '0': 3, '-1': 2, '-2': 2, cultist: 1, tablet: 2, auto_fail: 1, elder_sign: 1 },
  standard: { '+1': 1, '0': 2, '-1': 2, '-2': 2, '-3': 1, '-4': 1, cultist: 1, tablet: 2, auto_fail: 1, elder_sign: 1 },
  hard: { '0': 2, '-1': 2, '-2': 2, '-3': 2, '-4': 1, '-5': 1, cultist: 1, tablet: 2, auto_fail: 1, elder_sign: 1 },
  expert: { '0': 1, '-1': 2, '-2': 2, '-3': 1, '-4': 2, '-5': 1, '-6': 1, '-8': 1, cultist: 1, tablet: 2, auto_fail: 1, elder_sign: 1 },
};

const TDEB: BagsByDifficulty = {
  easy: { '+1': 2, '0': 3, '-1': 3, '-2': 2, skull: 2, cultist: 1, elder_thing: 2, auto_fail: 1, elder_sign: 1 },
  standard: { '+1': 1, '0': 2, '-1': 3, '-2': 2, '-3': 1, '-4': 1, skull: 2, cultist: 1, elder_thing: 2, auto_fail: 1, elder_sign: 1 },
  hard: { '0': 3, '-1': 2, '-2': 2, '-3': 2, '-4': 1, '-5': 1, skull: 2, cultist: 1, elder_thing: 2, auto_fail: 1, elder_sign: 1 },
  expert: { '0': 1, '-1': 2, '-2': 2, '-3': 2, '-4': 2, '-5': 1, '-6': 1, '-8': 1, skull: 2, cultist: 1, elder_thing: 2, auto_fail: 1, elder_sign: 1 },
};

const TIC: BagsByDifficulty = {
  easy: { '+1': 2, '0': 3, '-1': 3, '-2': 2, skull: 2, cultist: 2, tablet: 2, elder_thing: 2, auto_fail: 1, elder_sign: 1 },
  standard: { '+1': 1, '0': 2, '-1': 3, '-2': 2, '-3': 1, '-4': 1, skull: 2, cultist: 2, tablet: 2, elder_thing: 2, auto_fail: 1, elder_sign: 1 },
  hard: { '0': 3, '-1': 2, '-2': 2, '-3': 2, '-4': 1, '-5': 1, skull: 2, cultist: 2, tablet: 2, elder_thing: 2, auto_fail: 1, elder_sign: 1 },
  expert: { '0': 1, '-1': 2, '-2': 2, '-3': 2, '-4': 2, '-5': 1, '-6': 1, '-8': 1, skull: 2, cultist: 2, tablet: 2, elder_thing: 2, auto_fail: 1, elder_sign: 1 },
};

const EOE: BagsByDifficulty = {
  easy: { '+1': 3, '0': 2, '-1': 3, '-2': 2, skull: 2, cultist: 1, tablet: 1, auto_fail: 1, elder_sign: 1 },
  standard: { '+1': 1, '0': 2, '-1': 3, '-2': 2, '-3': 1, '-4': 1, frost: 1, skull: 2, cultist: 1, tablet: 1, auto_fail: 1, elder_sign: 1 },
  hard: { '0': 2, '-1': 2, '-2': 2, '-3': 1, '-4': 2, '-5': 1, frost: 2, skull: 2, cultist: 1, tablet: 1, auto_fail: 1, elder_sign: 1 },
  expert: { '0': 1, '-1': 1, '-2': 2, '-3': 1, '-4': 2, '-5': 1, '-7': 1, frost: 3, skull: 2, cultist: 1, tablet: 1, auto_fail: 1, elder_sign: 1 },
};

const FHV: BagsByDifficulty = {
  easy: { '+1': 2, '0': 3, '-1': 3, '-2': 2, '-3': 1, skull: 2, elder_sign: 1 },
  standard: { '+1': 1, '0': 2, '-1': 3, '-2': 2, '-3': 2, '-4': 1, skull: 2, elder_sign: 1 },
  hard: { '0': 3, '-1': 2, '-2': 2, '-3': 2, '-5': 2, '-7': 1, skull: 2, elder_sign: 1 },
  expert: { '0': 1, '-1': 2, '-2': 2, '-3': 2, '-4': 1, '-5': 2, '-6': 2, '-8': 1, skull: 2, elder_sign: 1 },
};

const DARK_MATTER: BagsByDifficulty = {
  easy: { '+1': 2, '0': 3, '-1': 2, '-2': 2, skull: 2, cultist: 2, auto_fail: 1, elder_sign: 1 },
  standard: { '+1': 1, '0': 2, '-1': 3, '-2': 2, '-3': 1, '-4': 1, skull: 2, cultist: 2, auto_fail: 1, elder_sign: 1 },
  hard: { '0': 3, '-1': 2, '-2': 2, '-3': 2, '-4': 1, '-5': 1, skull: 2, cultist: 2, auto_fail: 1, elder_sign: 1 },
  expert: { '0': 1, '-1': 1, '-2': 2, '-3': 2, '-4': 2, '-5': 1, '-6': 1, '-8': 1, skull: 2, cultist: 2, auto_fail: 1, elder_sign: 1 },
};

const ALICE: BagsByDifficulty = {
  easy: { '+1': 2, '0': 3, '-1': 3, '-2': 2, skull: 2, elder_thing: 1, auto_fail: 1, elder_sign: 1 },
  standard: { '+1': 1, '0': 2, '-1': 3, '-2': 2, '-3': 1, '-4': 1, skull: 2, elder_thing: 1, auto_fail: 1, elder_sign: 1 },
  hard: { '+1': 1, '0': 1, '-1': 2, '-2': 2, '-3': 2, '-4': 1, '-5': 1, '-6': 1, skull: 2, elder_thing: 1, auto_fail: 1, elder_sign: 1 },
  expert: { '0': 1, '-1': 2, '-2': 1, '-3': 1, '-4': 1, '-5': 1, '-6': 1, '-7': 1, '-8': 1, skull: 2, elder_thing: 1, auto_fail: 1, elder_sign: 1 },
};

const CYCLOPEAN: BagsByDifficulty = {
  easy: { '+1': 2, '0': 3, '-1': 3, '-2': 2, skull: 3, tablet: 1, auto_fail: 1, elder_sign: 1 },
  standard: { '+1': 1, '0': 2, '-1': 3, '-2': 2, '-3': 1, '-4': 1, skull: 3, tablet: 1, auto_fail: 1, elder_sign: 1 },
  hard: { '0': 2, '-1': 3, '-2': 2, '-3': 1, '-4': 1, '-5': 1, skull: 3, tablet: 1, auto_fail: 1, elder_sign: 1 },
  expert: { '0': 1, '-1': 3, '-2': 2, '-3': 1, '-4': 1, '-5': 1, '-7': 1, skull: 3, tablet: 1, auto_fail: 1, elder_sign: 1 },
};

const CROWN_OF_EGIL: BagsByDifficulty = {
  easy: { '+1': 2, '0': 3, '-1': 2, '-2': 2, skull: 3, auto_fail: 1, elder_sign: 1 },
  standard: { '+1': 1, '0': 2, '-1': 3, '-2': 2, '-3': 1, '-4': 1, skull: 3, auto_fail: 1, elder_sign: 1 },
  hard: { '0': 3, '-1': 2, '-2': 1, '-3': 2, '-4': 1, '-5': 1, skull: 3, auto_fail: 1, elder_sign: 1 },
  expert: { '0': 1, '-1': 2, '-2': 2, '-3': 2, '-4': 2, '-5': 1, '-6': 1, '-8': 1, skull: 3, auto_fail: 1, elder_sign: 1 },
};

const PLAGUEBEARER: BagsByDifficulty = {
  easy: { '+1': 3, '0': 3, '-1': 3, '-2': 1, skull: 2, cultist: 1, tablet: 2, auto_fail: 1, elder_sign: 1 },
  standard: { '+1': 1, '0': 2, '-1': 3, '-2': 2, '-3': 1, '-4': 1, skull: 2, cultist: 1, tablet: 2, auto_fail: 1, elder_sign: 1 },
  hard: { '0': 2, '-1': 2, '-2': 1, '-3': 3, '-4': 1, '-5': 1, skull: 2, cultist: 1, tablet: 2, auto_fail: 1, elder_sign: 1 },
  expert: { '0': 1, '-1': 1, '-2': 2, '-3': 2, '-4': 3, '-6': 1, skull: 2, cultist: 1, tablet: 2, auto_fail: 1, elder_sign: 1 },
};

const GOB: BagsByDifficulty = {
  easy: { '+1': 2, '0': 2, '-1': 3, '-2': 2, '-3': 2, '-4': 1, '-6': 1, skull: 3, cultist: 1, tablet: 1, elder_thing: 1, auto_fail: 1, elder_sign: 1 },
  standard: { '+1': 2, '0': 2, '-1': 3, '-2': 2, '-3': 2, '-4': 1, '-6': 1, skull: 3, cultist: 1, tablet: 1, elder_thing: 1, auto_fail: 1, elder_sign: 1 },
  hard: { '+1': 1, '0': 2, '-1': 3, '-2': 3, '-3': 2, '-4': 2, '-5': 1, '-7': 1, skull: 3, cultist: 1, tablet: 1, elder_thing: 1, auto_fail: 1, elder_sign: 1 },
  expert: { '+1': 1, '0': 2, '-1': 3, '-2': 3, '-3': 2, '-4': 2, '-5': 1, '-7': 1, skull: 3, cultist: 1, tablet: 1, elder_thing: 1, auto_fail: 1, elder_sign: 1 },
};

const FOF: BagsByDifficulty = {
  easy: { '+1': 1, '0': 2, '-1': 1, '-2': 2, '-3': 2, '-4': 1, '-5': 1, skull: 2, cultist: 1, tablet: 1, elder_thing: 1, auto_fail: 1, elder_sign: 1 },
  standard: { '+1': 1, '0': 2, '-1': 1, '-2': 2, '-3': 2, '-4': 1, '-5': 1, skull: 2, cultist: 1, tablet: 1, elder_thing: 1, auto_fail: 1, elder_sign: 1 },
  hard: { '0': 2, '-1': 2, '-2': 2, '-3': 2, '-6': 1, '-7': 1, skull: 2, cultist: 1, tablet: 1, elder_thing: 1, auto_fail: 1, elder_sign: 1 },
  expert: { '0': 2, '-1': 2, '-2': 2, '-3': 2, '-6': 1, '-7': 1, skull: 2, cultist: 1, tablet: 1, elder_thing: 1, auto_fail: 1, elder_sign: 1 },
};

const HEART_OF_DARKNESS: BagsByDifficulty = {
  easy: { '+1': 2, '0': 3, '-1': 3, '-2': 2, skull: 2, cultist: 2, auto_fail: 1, elder_sign: 1 },
  standard: { '+1': 1, '0': 2, '-1': 3, '-2': 2, '-3': 1, '-4': 1, skull: 2, cultist: 2, auto_fail: 1, elder_sign: 1 },
  hard: { '0': 3, '-1': 2, '-2': 2, '-3': 2, '-4': 1, '-5': 1, skull: 2, cultist: 2, auto_fail: 1, elder_sign: 1 },
  expert: { '0': 1, '-1': 2, '-2': 2, '-3': 2, '-4': 2, '-5': 1, '-6': 1, '-7': 1, '-8': 1, skull: 2, cultist: 2, auto_fail: 1, elder_sign: 1 },
};

const OZ: BagsByDifficulty = {
  easy: { '+1': 2, '0': 3, '-1': 3, '-2': 1, '-3': 1, skull: 2, elder_thing: 1, auto_fail: 1, elder_sign: 1 },
  standard: { '+1': 1, '0': 2, '-1': 3, '-2': 2, '-3': 1, '-4': 1, skull: 2, elder_thing: 1, auto_fail: 1, elder_sign: 1 },
  hard: { '0': 2, '-1': 3, '-2': 2, '-3': 1, '-4': 1, '-5': 1, skull: 2, elder_thing: 1, auto_fail: 1, elder_sign: 1 },
  expert: { '0': 1, '-1': 3, '-2': 2, '-3': 1, '-4': 1, '-5': 1, '-6': 1, skull: 2, elder_thing: 1, auto_fail: 1, elder_sign: 1 },
};

const AGES_UNWOUND: BagsByDifficulty = {
  easy: { '+1': 2, '0': 3, '-1': 3, '-2': 2, skull: 3, cultist: 1, tablet: 1, auto_fail: 1, elder_sign: 1 },
  standard: { '+1': 1, '0': 2, '-1': 3, '-2': 2, '-3': 1, '-4': 1, skull: 3, cultist: 1, tablet: 1, auto_fail: 1, elder_sign: 1 },
  hard: { '0': 3, '-1': 2, '-2': 2, '-3': 2, '-4': 1, '-5': 1, skull: 3, cultist: 1, tablet: 1, auto_fail: 1, elder_sign: 1 },
  expert: { '0': 1, '-1': 2, '-2': 2, '-3': 2, '-4': 2, '-5': 1, '-6': 1, '-8': 1, skull: 3, cultist: 1, tablet: 1, auto_fail: 1, elder_sign: 1 },
};

export interface Campaign {
  /** Stable id stored in cookies; never change an existing one. */
  id: string;
  name: string;
  group: 'Campaigns' | 'Return to…' | 'Fan-made';
  bags: BagsByDifficulty;
}

export const CAMPAIGNS: Campaign[] = [
  { id: 'core', name: 'Night of the Zealot', group: 'Campaigns', bags: NOTZ },
  { id: 'dwl', name: 'The Dunwich Legacy', group: 'Campaigns', bags: DWL },
  { id: 'ptc', name: 'The Path to Carcosa', group: 'Campaigns', bags: PTC },
  { id: 'tfa', name: 'The Forgotten Age', group: 'Campaigns', bags: TFA },
  { id: 'tcu', name: 'The Circle Undone', group: 'Campaigns', bags: TCU },
  { id: 'tdea', name: 'The Dream-Eaters: The Dream-Quest', group: 'Campaigns', bags: TDEA },
  { id: 'tdeb', name: 'The Dream-Eaters: The Web of Dreams', group: 'Campaigns', bags: TDEB },
  { id: 'tic', name: 'The Innsmouth Conspiracy', group: 'Campaigns', bags: TIC },
  { id: 'eoe', name: 'Edge of the Earth', group: 'Campaigns', bags: EOE },
  { id: 'tskc', name: 'The Scarlet Keys', group: 'Campaigns', bags: SKULL_TABLET_ELDER },
  { id: 'fhv', name: 'The Feast of Hemlock Vale', group: 'Campaigns', bags: FHV },
  { id: 'tdc', name: 'The Drowned City', group: 'Campaigns', bags: SKULL_TABLET_ELDER },
  { id: 'boa', name: 'Brethren of Ash', group: 'Campaigns', bags: SKULL_TABLET_ELDER },
  { id: 'cob', name: 'Children of Blood', group: 'Campaigns', bags: COB },
  { id: 'gob', name: 'Guardians of the Abyss', group: 'Campaigns', bags: GOB },
  { id: 'fof', name: 'Fortune and Folly', group: 'Campaigns', bags: FOF },
  { id: 'standalone', name: 'Standalone', group: 'Campaigns', bags: NOTZ },
  { id: 'rtnotz', name: 'Return to the Night of the Zealot', group: 'Return to…', bags: NOTZ },
  { id: 'rtdwl', name: 'Return to The Dunwich Legacy', group: 'Return to…', bags: DWL },
  { id: 'rtptc', name: 'Return to The Path to Carcosa', group: 'Return to…', bags: PTC },
  { id: 'rttfa', name: 'Return to The Forgotten Age', group: 'Return to…', bags: TFA },
  { id: 'rttcu', name: 'Return to The Circle Undone', group: 'Return to…', bags: TCU },
  { id: 'zdm', name: 'Dark Matter', group: 'Fan-made', bags: DARK_MATTER },
  { id: 'zaw', name: 'Alice in Wonderland', group: 'Fan-made', bags: ALICE },
  { id: 'zce', name: 'Crown of Egil', group: 'Fan-made', bags: CROWN_OF_EGIL },
  { id: 'zcp', name: 'Call of the Plaguebearer', group: 'Fan-made', bags: PLAGUEBEARER },
  { id: 'zcf', name: 'Cyclopean Foundations', group: 'Fan-made', bags: CYCLOPEAN },
  { id: 'zhod', name: 'Heart of Darkness', group: 'Fan-made', bags: HEART_OF_DARKNESS },
  { id: 'rttic', name: 'The (Unofficial) Return to the Innsmouth Conspiracy', group: 'Fan-made', bags: TIC },
  { id: 'zoz', name: 'The Colour Out of Oz', group: 'Fan-made', bags: OZ },
  { id: 'zau', name: 'Ages Unwound', group: 'Fan-made', bags: AGES_UNWOUND },
];

export const DEFAULT_CAMPAIGN = 'core';
export const DEFAULT_DIFFICULTY: Difficulty = 'standard';

export const findCampaign = (id: string) => CAMPAIGNS.find((c) => c.id === id);

export function startingBag(campaignId: string, difficulty: Difficulty): Bag {
  const campaign = findCampaign(campaignId) ?? findCampaign(DEFAULT_CAMPAIGN)!;
  return { ...campaign.bags[difficulty] };
}
