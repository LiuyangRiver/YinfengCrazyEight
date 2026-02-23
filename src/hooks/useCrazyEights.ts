import { useState, useCallback, useEffect } from 'react';
import { CardData, GameState, Suit, Rank, GameStatus, Language } from '../types';
import { createDeck, shuffle } from '../constants';

export const useCrazyEights = () => {
  const [state, setState] = useState<GameState>({
    deck: [],
    playerHand: [],
    aiHand: [],
    discardPile: [],
    currentTurn: 'PLAYER',
    wildSuit: null,
    status: 'START',
    winner: null,
    lastAction: 'Welcome to YinFeng Crazy Eights!',
    scores: {
      player: 0,
      ai: 0,
    },
    settings: {
      language: 'zh-CN',
      bgColor: '#064e3b', // emerald-900
    },
  });

  const [pendingEight, setPendingEight] = useState<CardData | null>(null);

  const initGame = useCallback(() => {
    const fullDeck = createDeck();
    const pHand = fullDeck.splice(0, 8);
    const aHand = fullDeck.splice(0, 8);
    
    // Discard pile starts with one card, but it shouldn't be an 8 for simplicity in the first turn
    let firstDiscardIndex = 0;
    while (fullDeck[firstDiscardIndex].rank === Rank.EIGHT) {
      firstDiscardIndex++;
    }
    const firstDiscard = fullDeck.splice(firstDiscardIndex, 1)[0];

    setState(prev => ({
      ...prev,
      deck: fullDeck,
      playerHand: pHand,
      aiHand: aHand,
      discardPile: [firstDiscard],
      currentTurn: 'PLAYER',
      wildSuit: null,
      status: 'PLAYING',
      winner: null,
      lastAction: 'Game started! Your turn.',
    }));
  }, []);

  const goToHome = useCallback(() => {
    setState(prev => ({ ...prev, status: 'START' }));
  }, []);

  const setLanguage = useCallback((lang: Language) => {
    setState(prev => ({ ...prev, settings: { ...prev.settings, language: lang } }));
  }, []);

  const setBgColor = useCallback((color: string) => {
    setState(prev => ({ ...prev, settings: { ...prev.settings, bgColor: color } }));
  }, []);

  const checkPlayable = useCallback((card: CardData, topCard: CardData, wildSuit: Suit | null) => {
    if (card.rank === Rank.EIGHT) return true;
    if (wildSuit) return card.suit === wildSuit;
    return card.suit === topCard.suit || card.rank === topCard.rank;
  }, []);

  const playCard = useCallback((card: CardData, isPlayer: boolean) => {
    const topCard = state.discardPile[state.discardPile.length - 1];
    
    if (!checkPlayable(card, topCard, state.wildSuit)) return;

    if (card.rank === Rank.EIGHT) {
      if (isPlayer) {
        setPendingEight(card);
        setState(prev => ({ ...prev, status: 'SUIT_SELECTION' }));
        return;
      } else {
        // AI logic for 8: choose most frequent suit in hand
        const suitCounts: Record<Suit, number> = {
          [Suit.HEARTS]: 0, [Suit.DIAMONDS]: 0, [Suit.CLUBS]: 0, [Suit.SPADES]: 0
        };
        state.aiHand.forEach(c => { if (c.id !== card.id) suitCounts[c.suit]++; });
        const bestSuit = (Object.keys(suitCounts) as Suit[]).reduce((a, b) => suitCounts[a] > suitCounts[b] ? a : b);
        
        executePlay(card, isPlayer, bestSuit);
      }
    } else {
      executePlay(card, isPlayer, null);
    }
  }, [state, checkPlayable]);

  const executePlay = (card: CardData, isPlayer: boolean, chosenSuit: Suit | null) => {
    setState(prev => {
      const hand = isPlayer ? prev.playerHand : prev.aiHand;
      const opponentHand = isPlayer ? prev.aiHand : prev.playerHand;
      const newHand = hand.filter(c => c.id !== card.id);
      const isWinner = newHand.length === 0;

      let newScores = { ...prev.scores };
      if (isWinner) {
        const points = calculateScore(opponentHand);
        if (isPlayer) {
          newScores.player += points;
        } else {
          newScores.ai += points;
        }
      }

      return {
        ...prev,
        [isPlayer ? 'playerHand' : 'aiHand']: newHand,
        discardPile: [...prev.discardPile, card],
        wildSuit: chosenSuit,
        currentTurn: isPlayer ? 'AI' : 'PLAYER',
        status: isWinner ? 'GAME_OVER' : 'PLAYING',
        winner: isWinner ? (isPlayer ? 'PLAYER' : 'AI') : null,
        scores: newScores,
        lastAction: `${isPlayer ? 'You' : 'AI'} played ${card.rank} of ${card.suit}${chosenSuit ? `. New suit: ${chosenSuit}` : ''}`,
      };
    });
  };

  const calculateScore = (hand: CardData[]) => {
    return hand.reduce((total, card) => {
      if (card.rank === Rank.EIGHT) return total + 50;
      if ([Rank.KING, Rank.QUEEN, Rank.JACK, Rank.TEN].includes(card.rank)) return total + 10;
      if (card.rank === Rank.ACE) return total + 1;
      return total + parseInt(card.rank as string);
    }, 0);
  };

  const selectWildSuit = (suit: Suit) => {
    if (pendingEight) {
      executePlay(pendingEight, true, suit);
      setPendingEight(null);
    }
  };

  const drawCard = useCallback((isPlayer: boolean) => {
    setState(prev => {
      let currentDeck = [...prev.deck];
      let currentDiscard = [...prev.discardPile];

      if (currentDeck.length === 0) {
        // Reshuffle discard pile (except top card) into deck
        if (currentDiscard.length <= 1) {
          return {
            ...prev,
            currentTurn: isPlayer ? 'AI' : 'PLAYER',
            lastAction: `${isPlayer ? 'You' : 'AI'} had to skip (No cards left)`,
          };
        }
        
        const topCard = currentDiscard.pop()!;
        currentDeck = shuffle(currentDiscard);
        currentDiscard = [topCard];
      }

      const drawnCard = currentDeck.pop()!;
      const hand = isPlayer ? prev.playerHand : prev.aiHand;
      const newHand = [...hand, drawnCard];

      return {
        ...prev,
        deck: currentDeck,
        discardPile: currentDiscard,
        [isPlayer ? 'playerHand' : 'aiHand']: newHand,
        lastAction: `${isPlayer ? 'You' : 'AI'} drew a card.`,
        currentTurn: isPlayer ? 'AI' : 'PLAYER',
      };
    });
  }, []);

  // AI Turn Effect
  useEffect(() => {
    if (state.status === 'PLAYING' && state.currentTurn === 'AI') {
      const timer = setTimeout(() => {
        const topCard = state.discardPile[state.discardPile.length - 1];
        const playableCards = state.aiHand.filter(c => checkPlayable(c, topCard, state.wildSuit));

        if (playableCards.length > 0) {
          // AI Strategy: 
          // 1. Separate non-8s and 8s
          const nonEights = playableCards.filter(c => c.rank !== Rank.EIGHT);
          const eights = playableCards.filter(c => c.rank === Rank.EIGHT);

          if (nonEights.length > 0) {
            // Find the suit AI has most of
            const suitCounts: Record<Suit, number> = {
              [Suit.HEARTS]: 0, [Suit.DIAMONDS]: 0, [Suit.CLUBS]: 0, [Suit.SPADES]: 0
            };
            state.aiHand.forEach(c => suitCounts[c.suit]++);
            
            // Try to play a card of the most frequent suit
            const bestSuit = (Object.keys(suitCounts) as Suit[]).reduce((a, b) => suitCounts[a] > suitCounts[b] ? a : b);
            const bestCard = nonEights.find(c => c.suit === bestSuit) || nonEights[0];
            
            playCard(bestCard, false);
          } else {
            // Only 8s are playable
            playCard(eights[0], false);
          }
        } else {
          drawCard(false);
        }
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [state.currentTurn, state.status, state.aiHand, state.discardPile, state.wildSuit, checkPlayable, playCard, drawCard]);

  return {
    state,
    initGame,
    goToHome,
    setLanguage,
    setBgColor,
    playCard: (card: CardData) => playCard(card, true),
    drawCard: () => drawCard(true),
    selectWildSuit,
    checkPlayable: (card: CardData) => checkPlayable(card, state.discardPile[state.discardPile.length - 1], state.wildSuit)
  };
};
