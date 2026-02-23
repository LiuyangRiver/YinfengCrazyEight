export enum Suit {
  HEARTS = 'HEARTS',
  DIAMONDS = 'DIAMONDS',
  CLUBS = 'CLUBS',
  SPADES = 'SPADES',
}

export enum Rank {
  TWO = '2',
  THREE = '3',
  FOUR = '4',
  FIVE = '5',
  SIX = '6',
  SEVEN = '7',
  EIGHT = '8',
  NINE = '9',
  TEN = '10',
  JACK = 'J',
  QUEEN = 'Q',
  KING = 'K',
  ACE = 'A',
}

export interface CardData {
  id: string;
  suit: Suit;
  rank: Rank;
}

export type GameStatus = 'START' | 'PLAYING' | 'SUIT_SELECTION' | 'GAME_OVER';

export type Language = 'zh-CN' | 'zh-TW' | 'en-US';

export interface GameState {
  deck: CardData[];
  playerHand: CardData[];
  aiHand: CardData[];
  discardPile: CardData[];
  currentTurn: 'PLAYER' | 'AI';
  wildSuit: Suit | null;
  status: GameStatus;
  winner: 'PLAYER' | 'AI' | null;
  lastAction: string;
  scores: {
    player: number;
    ai: number;
  };
  settings: {
    language: Language;
    bgColor: string;
  };
}
