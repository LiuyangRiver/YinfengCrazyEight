import { Suit, Rank, CardData, Language } from './types';

export const TRANSLATIONS: Record<Language, any> = {
  'zh-CN': {
    title: '疯狂 8',
    welcome: '欢迎来到疯狂 8',
    subtitle: '经典的策略与运气卡牌游戏。',
    start: '开始游戏',
    howToPlay: '游戏规则',
    rule1: '匹配弃牌堆顶牌的数字或花色。',
    rule2: '8是万能牌！随时出8可以改变当前花色。',
    rule3: '如果你没有牌可出，必须从牌堆摸牌。',
    rule4: '第一个清空手牌的玩家获胜。',
    settings: '设置',
    language: '语言',
    bgColor: '背景颜色',
    music: '背景音乐',
    sfx: '音效',
    on: '开启',
    off: '关闭',
    copyright: '版权所有',
    author: '尹锋',
    version: '版本',
    back: '返回',
    home: '首页',
    restart: '重新开始',
    playerTurn: '你的回合',
    aiTurn: 'AI 回合',
    draw: '摸牌',
    selectSuit: '选择一个花色',
    winner: '获胜者！',
    gameOver: '游戏结束',
    playAgain: '再玩一次',
    aiThinking: 'AI 正在思考...',
    you: '我 (玩家)',
    ai: 'AI (对手)',
    cardsCount: '张牌',
    playerTurnPrompt: '轮到你了！出牌或摸牌',
    played: '出了',
    drew: '摸了一张牌',
    newSuit: '新花色',
    skip: '跳过（牌堆已空）',
  },
  'zh-TW': {
    title: '瘋狂 8',
    welcome: '歡迎來到瘋狂 8',
    subtitle: '經典的策略與運氣卡牌遊戲。',
    start: '開始遊戲',
    howToPlay: '遊戲規則',
    rule1: '匹配棄牌堆頂牌的數字或花色。',
    rule2: '8是萬能牌！隨時出8可以改變當前花色。',
    rule3: '如果你沒有牌可出，必須從牌堆摸牌。',
    rule4: '第一個清空手牌的玩家獲勝。',
    settings: '設置',
    language: '語言',
    bgColor: '背景顏色',
    music: '背景音樂',
    sfx: '音效',
    on: '開啟',
    off: '關閉',
    copyright: '版權所有',
    author: '尹鋒',
    version: '版本',
    back: '返回',
    home: '首頁',
    restart: '重新開始',
    playerTurn: '你的回合',
    aiTurn: 'AI 回合',
    draw: '摸牌',
    selectSuit: '選擇一個花色',
    winner: '獲勝者！',
    gameOver: '遊戲結束',
    playAgain: '再玩一次',
    aiThinking: 'AI 正在思考...',
    you: '我 (玩家)',
    ai: 'AI (對手)',
    cardsCount: '張牌',
    playerTurnPrompt: '輪到你了！出牌或摸牌',
    played: '出了',
    drew: '摸了一張牌',
    newSuit: '新花色',
    skip: '跳過（牌堆已空）',
  },
  'en-US': {
    title: 'Crazy Eights',
    welcome: 'Welcome to Crazy Eights',
    subtitle: 'A classic card game of strategy and luck.',
    start: 'Start Game',
    howToPlay: 'How to Play',
    rule1: 'Match the Rank or Suit of the top card.',
    rule2: '8s are Wild! Play them anytime to change suit.',
    rule3: "If you can't play, you must draw from the deck.",
    rule4: 'First player to empty their hand wins.',
    settings: 'Settings',
    language: 'Language',
    bgColor: 'Background Color',
    music: 'Background Music',
    sfx: 'Sound Effects',
    on: 'On',
    off: 'Off',
    copyright: 'Copyright',
    author: 'yinfeng',
    version: 'Version',
    back: 'Back',
    home: 'Home',
    restart: 'Restart',
    playerTurn: 'Your Turn',
    aiTurn: 'AI Turn',
    draw: 'Draw',
    selectSuit: 'Select a Suit',
    winner: 'Winner!',
    gameOver: 'Game Over',
    playAgain: 'Play Again',
    aiThinking: 'AI is thinking...',
    you: 'Me (Player)',
    ai: 'AI (Opponent)',
    cardsCount: 'cards',
    playerTurnPrompt: "It's your turn! Play or draw",
    played: 'played',
    drew: 'drew a card',
    newSuit: 'New suit',
    skip: 'skipped (Deck empty)',
  }
};

export const SUITS = [Suit.HEARTS, Suit.DIAMONDS, Suit.CLUBS, Suit.SPADES];
export const RANKS = [
  Rank.ACE, Rank.TWO, Rank.THREE, Rank.FOUR, Rank.FIVE, Rank.SIX, 
  Rank.SEVEN, Rank.EIGHT, Rank.NINE, Rank.TEN, Rank.JACK, Rank.QUEEN, Rank.KING
];

export const SUIT_SYMBOLS: Record<Suit, string> = {
  [Suit.HEARTS]: '♥',
  [Suit.DIAMONDS]: '♦',
  [Suit.CLUBS]: '♣',
  [Suit.SPADES]: '♠',
};

export const SUIT_COLORS: Record<Suit, string> = {
  [Suit.HEARTS]: 'text-red-600',
  [Suit.DIAMONDS]: 'text-red-600',
  [Suit.CLUBS]: 'text-slate-900',
  [Suit.SPADES]: 'text-slate-900',
};

export const createDeck = (): CardData[] => {
  const deck: CardData[] = [];
  for (const suit of SUITS) {
    for (const rank of RANKS) {
      deck.push({
        id: `${rank}-${suit}`,
        suit,
        rank,
      });
    }
  }
  return shuffle(deck);
};

export const shuffle = <T,>(array: T[]): T[] => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};
