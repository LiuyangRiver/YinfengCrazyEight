/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useCrazyEights } from './hooks/useCrazyEights';
import { Card } from './components/Card';
import { Suit, Rank } from './types';
import { SUIT_SYMBOLS, SUIT_COLORS } from './constants';
import { Trophy, RotateCcw, Info, Layers, Home, Settings, X, Check, Music, Music2 } from 'lucide-react';
import { TRANSLATIONS } from './constants';
import { Language } from './types';

export default function App() {
  const { state, initGame, goToHome, setLanguage, setBgColor, playCard, drawCard, selectWildSuit, checkPlayable } = useCrazyEights();
  const [showSettings, setShowSettings] = useState(false);
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const [isSfxEnabled, setIsSfxEnabled] = useState(true);
  
  const bgmRef = useRef<HTMLAudioElement | null>(null);
  const sfxRefs = useRef<{
    play: HTMLAudioElement[];
    draw: HTMLAudioElement[];
    win: HTMLAudioElement;
    loss: HTMLAudioElement;
  } | null>(null);

  const t = TRANSLATIONS[state.settings.language];

  // Initialize Audio
  useEffect(() => {
    bgmRef.current = new Audio();
    bgmRef.current.loop = true;
    bgmRef.current.volume = 0.2;

    sfxRefs.current = {
      play: [
        new Audio('https://actions.google.com/sounds/v1/foley/paper_shuffle.ogg'),
        new Audio('https://actions.google.com/sounds/v1/foley/book_page_flip.ogg'),
      ],
      draw: [
        new Audio('https://actions.google.com/sounds/v1/foley/card_fan_deck.ogg'), // This might not exist, but let's try common ones
        new Audio('https://actions.google.com/sounds/v1/foley/draw_bridge_close.ogg'), // Just for variety if others fail
      ].map(a => { a.volume = 0.4; return a; }),
      win: new Audio('https://actions.google.com/sounds/v1/cartoon/conga_drum_hit.ogg'),
      loss: new Audio('https://actions.google.com/sounds/v1/cartoon/wood_plank_flick.ogg'),
    };

    // Fallback for draw sounds if they are too weird
    sfxRefs.current.draw = [
      new Audio('https://actions.google.com/sounds/v1/foley/paper_shuffle.ogg'),
      new Audio('https://actions.google.com/sounds/v1/foley/book_page_flip.ogg'),
    ];

    return () => {
      if (bgmRef.current) {
        bgmRef.current.pause();
        bgmRef.current = null;
      }
    };
  }, []);

  // Handle BGM Transitions
  useEffect(() => {
    if (!bgmRef.current) return;

    const menuBgm = 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3';
    const gameBgm = 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3';
    const gameOverBgm = 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3';
    
    let targetSrc = menuBgm;
    if (state.status === 'PLAYING' || state.status === 'SUIT_SELECTION') {
      targetSrc = gameBgm;
    } else if (state.status === 'GAME_OVER') {
      targetSrc = gameOverBgm;
    }
    
    if (bgmRef.current.src !== targetSrc) {
      bgmRef.current.src = targetSrc;
      if (isMusicPlaying) {
        bgmRef.current.play().catch(e => console.error("BGM play error:", e));
      }
    }
  }, [state.status, isMusicPlaying]);

  // Handle SFX for Game Events
  const prevDiscardCount = useRef(state.discardPile.length);
  const prevHandCount = useRef(state.playerHand.length + state.aiHand.length);
  const prevStatus = useRef(state.status);

  useEffect(() => {
    if (!sfxRefs.current || !isSfxEnabled) return;

    // Play Card SFX (with variety)
    if (state.discardPile.length > prevDiscardCount.current && state.status === 'PLAYING') {
      const sounds = sfxRefs.current.play;
      const sound = sounds[Math.floor(Math.random() * sounds.length)];
      sound.currentTime = 0;
      sound.play().catch(() => {});
    }
    prevDiscardCount.current = state.discardPile.length;

    // Draw Card SFX (with variety)
    const currentHandCount = state.playerHand.length + state.aiHand.length;
    if (currentHandCount > prevHandCount.current && state.status === 'PLAYING') {
      const sounds = sfxRefs.current.draw;
      const sound = sounds[Math.floor(Math.random() * sounds.length)];
      sound.currentTime = 0;
      sound.play().catch(() => {});
    }
    prevHandCount.current = currentHandCount;

    // Win/Loss SFX
    if (state.status === 'GAME_OVER' && prevStatus.current !== 'GAME_OVER') {
      if (state.winner === 'PLAYER') {
        sfxRefs.current.win.currentTime = 0;
        sfxRefs.current.win.play().catch(() => {});
      } else {
        sfxRefs.current.loss.currentTime = 0;
        sfxRefs.current.loss.play().catch(() => {});
      }
    }
    prevStatus.current = state.status;
  }, [state.discardPile.length, state.playerHand.length, state.aiHand.length, state.status, state.winner, isSfxEnabled]);

  const toggleMusic = () => {
    if (!bgmRef.current) return;
    
    if (isMusicPlaying) {
      bgmRef.current.pause();
    } else {
      bgmRef.current.play().catch(err => console.error("Audio play failed:", err));
    }
    setIsMusicPlaying(!isMusicPlaying);
  };
  const topDiscard = state.discardPile[state.discardPile.length - 1];

  const bgColors = [
    { name: 'Emerald', value: '#064e3b' },
    { name: 'Slate', value: '#0f172a' },
    { name: 'Indigo', value: '#1e1b4b' },
    { name: 'Rose', value: '#4c0519' },
    { name: 'Amber', value: '#451a03' },
  ];

  return (
    <div 
      className="min-h-screen text-white font-sans selection:bg-emerald-700 overflow-hidden flex flex-col transition-colors duration-500"
      style={{ backgroundColor: state.settings.bgColor }}
    >
      <AnimatePresence mode="wait">
        {state.status === 'START' ? (
          <motion.div 
            key="start-screen"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col items-center justify-center p-6"
          >
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-2xl w-full bg-black/30 backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-8 sm:p-12 shadow-2xl text-center relative"
            >
              {/* Settings & Music Buttons on Start Screen */}
              <div className="absolute top-6 right-6 flex gap-2">
                <button 
                  onClick={toggleMusic}
                  className={`p-3 rounded-2xl transition-all border ${
                    isMusicPlaying 
                      ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400' 
                      : 'bg-white/5 border-white/5 text-white/40 hover:bg-white/10'
                  }`}
                  title={t.music}
                >
                  {isMusicPlaying ? <Music size={24} /> : <Music2 size={24} />}
                </button>
                <button 
                  onClick={() => setShowSettings(true)}
                  className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl transition-all border border-white/5"
                >
                  <Settings size={24} />
                </button>
              </div>

              <div className="mb-8 inline-flex p-6 bg-white rounded-3xl shadow-xl transform -rotate-6">
                <span className="text-emerald-900 font-black text-6xl">8</span>
              </div>
              
              <h1 className="text-4xl sm:text-5xl font-black mb-4 tracking-tight">{t.welcome}</h1>
              <p className="text-white/60 mb-10 text-lg">{t.subtitle}</p>
              
              <div className="text-left space-y-6 mb-12 bg-white/5 p-6 rounded-2xl border border-white/5">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <Info size={20} className="text-emerald-400" />
                  {t.howToPlay}
                </h2>
                <ul className="space-y-3 text-sm sm:text-base text-white/70">
                  <li className="flex gap-3">
                    <span className="text-emerald-400 font-bold">01.</span>
                    <span>{t.rule1}</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-emerald-400 font-bold">02.</span>
                    <span>{t.rule2}</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-emerald-400 font-bold">03.</span>
                    <span>{t.rule3}</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-emerald-400 font-bold">04.</span>
                    <span>{t.rule4}</span>
                  </li>
                </ul>
              </div>
              
              <button 
                onClick={initGame}
                className="w-full py-5 bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-black rounded-2xl transition-all shadow-lg shadow-emerald-500/20 text-xl uppercase tracking-widest"
              >
                {t.start}
              </button>
            </motion.div>
            
            <p className="mt-8 text-white/20 text-xs font-mono uppercase tracking-[0.3em]">
              Designed by {t.author}
            </p>
          </motion.div>
        ) : (
          <motion.div 
            key="game-screen"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col"
          >
            {/* Header */}
            <header className="p-4 flex justify-between items-center bg-black/20 backdrop-blur-sm border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-lg transform -rotate-6">
                  <span className="text-emerald-900 font-black text-xl">8</span>
                </div>
                <h1 className="text-xl font-bold tracking-tight">{t.title}</h1>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-3 bg-black/30 px-4 py-1.5 rounded-2xl border border-white/10">
                  <div className="flex flex-col items-center">
                    <span className="text-[10px] uppercase font-bold text-white/40 tracking-tighter leading-none mb-1">{t.you}</span>
                    <span className="font-black text-lg leading-none text-emerald-400">{state.scores.player}</span>
                  </div>
                  <div className="w-px h-6 bg-white/10 mx-1"></div>
                  <div className="flex flex-col items-center">
                    <span className="text-[10px] uppercase font-bold text-white/40 tracking-tighter leading-none mb-1">{t.ai}</span>
                    <span className="font-black text-lg leading-none text-amber-400">{state.scores.ai}</span>
                  </div>
                </div>
                
                <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full text-sm">
                  <Layers size={16} />
                  <span>{t.draw}: {state.deck.length}</span>
                </div>
                <button 
                  onClick={toggleMusic}
                  className={`p-2 rounded-full transition-colors ${
                    isMusicPlaying ? 'text-emerald-400 hover:bg-emerald-400/10' : 'text-white/40 hover:bg-white/10'
                  }`}
                  title={t.music}
                >
                  {isMusicPlaying ? <Music size={20} /> : <Music2 size={20} />}
                </button>
                <button 
                  onClick={initGame}
                  className="p-2 hover:bg-white/10 rounded-full transition-colors"
                  title={t.restart}
                >
                  <RotateCcw size={20} />
                </button>
                <button 
                  onClick={goToHome}
                  className="p-2 hover:bg-white/10 rounded-full transition-colors text-white/60 hover:text-white"
                  title={t.home}
                >
                  <Home size={20} />
                </button>
                <button 
                  onClick={() => setShowSettings(true)}
                  className="p-2 hover:bg-white/10 rounded-full transition-colors text-white/60 hover:text-white"
                  title={t.settings}
                >
                  <Settings size={20} />
                </button>
              </div>
            </header>

            {/* Game Board */}
            <main className="flex-1 relative p-4 flex flex-col items-center justify-between max-w-6xl mx-auto w-full">
              
              {/* AI Hand */}
              <div className="w-full flex flex-col items-center gap-2">
                <div className="flex items-center gap-2 text-white/60 text-sm font-medium uppercase tracking-widest mb-2">
                  <span>{t.ai}</span>
                  <span className="px-2 py-0.5 bg-white/10 rounded text-xs">{state.aiHand.length}{t.cardsCount}</span>
                </div>
                <div className="flex -space-x-12 sm:-space-x-16 justify-center">
                  {state.aiHand.map((card, idx) => (
                    <Card key={card.id} card={card} isFaceUp={false} className="transform scale-90 origin-bottom" />
                  ))}
                </div>
              </div>

              {/* Center Area: Deck & Discard */}
              <div className="flex items-center gap-8 sm:gap-16 my-8">
                {/* Draw Pile */}
                <div className="flex flex-col items-center gap-3">
                  <div className="relative">
                    {state.deck.length > 0 ? (
                      <Card 
                        card={state.deck[0]} 
                        isFaceUp={false} 
                        isPlayable={state.currentTurn === 'PLAYER' && state.status === 'PLAYING'}
                        onClick={drawCard}
                        className="shadow-2xl"
                      />
                    ) : (
                      <div className="w-20 h-28 sm:w-24 sm:h-36 rounded-xl border-2 border-dashed border-white/20 flex items-center justify-center">
                        <span className="text-white/20 text-xs uppercase font-bold">Empty</span>
                      </div>
                    )}
                    {state.deck.length > 1 && (
                      <div className="absolute -top-1 -left-1 w-full h-full bg-indigo-800 rounded-xl -z-10 border-2 border-indigo-900 shadow-md"></div>
                    )}
                  </div>
                  <span className="text-xs font-bold text-white/40 uppercase tracking-tighter">{t.draw}</span>
                </div>

                {/* Discard Pile */}
                <div className="flex flex-col items-center gap-3">
                  <div className="relative">
                    <AnimatePresence mode="popLayout">
                      {topDiscard && (
                        <Card 
                          key={topDiscard.id} 
                          card={topDiscard} 
                          className="shadow-2xl ring-4 ring-white/10"
                        />
                      )}
                    </AnimatePresence>
                    
                    {/* Wild Suit Indicator */}
                    {state.wildSuit && (
                      <motion.div 
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="absolute -top-4 -right-4 w-10 h-10 bg-white rounded-full shadow-xl flex items-center justify-center border-2 border-emerald-500"
                      >
                        <span className={`text-2xl ${SUIT_COLORS[state.wildSuit]}`}>
                          {SUIT_SYMBOLS[state.wildSuit]}
                        </span>
                      </motion.div>
                    )}
                  </div>
                  <span className="text-xs font-bold text-white/40 uppercase tracking-tighter">{t.played}</span>
                </div>
              </div>

              {/* Player Hand */}
              <div className="w-full flex flex-col items-center gap-4">
                {state.currentTurn === 'PLAYER' && state.status === 'PLAYING' && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-emerald-500/20 border border-emerald-500/30 px-4 py-2 rounded-full text-emerald-400 text-sm font-bold animate-bounce"
                  >
                    {t.playerTurnPrompt}
                  </motion.div>
                )}
                <div className="flex items-center gap-4 w-full justify-center">
                   <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
                   <div className="flex items-center gap-2 text-white/80 text-sm font-bold uppercase tracking-widest">
                    <span>{t.you}</span>
                    <span className="px-2 py-0.5 bg-white/20 rounded text-xs">{state.playerHand.length}{t.cardsCount}</span>
                  </div>
                  <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
                </div>
                
                <div className="flex flex-wrap justify-center gap-2 sm:gap-4 max-w-4xl">
                  {state.playerHand.map((card) => (
                    <Card 
                      key={card.id} 
                      card={card} 
                      isPlayable={state.currentTurn === 'PLAYER' && state.status === 'PLAYING' && checkPlayable(card)}
                      onClick={() => playCard(card)}
                    />
                  ))}
                </div>
              </div>
            </main>

            {/* Footer / Status Bar */}
            <footer className="p-4 bg-black/40 backdrop-blur-md border-t border-white/10">
              <div className="max-w-6xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full animate-pulse ${state.currentTurn === 'PLAYER' ? 'bg-emerald-400' : 'bg-amber-400'}`}></div>
                  <p className="text-sm font-medium text-white/90">
                    {state.currentTurn === 'PLAYER' ? t.playerTurn : t.aiThinking}
                  </p>
                </div>
                <div className="px-4 py-1.5 bg-white/5 rounded-lg border border-white/10 text-xs font-mono text-white/60">
                  {state.lastAction}
                </div>
              </div>
            </footer>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Suit Selection Modal */}
      <AnimatePresence>
        {state.status === 'SUIT_SELECTION' && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-slate-900 border border-white/10 p-8 rounded-3xl shadow-2xl max-w-md w-full text-center"
            >
              <h2 className="text-2xl font-bold mb-2">{t.rule2}</h2>
              <p className="text-white/60 mb-8">{t.selectSuit}:</p>
              
              <div className="grid grid-cols-2 gap-4">
                {(Object.values(Suit)).map((suit) => (
                  <button
                    key={suit}
                    onClick={() => selectWildSuit(suit)}
                    className="flex flex-col items-center gap-2 p-6 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl transition-all hover:scale-105 active:scale-95"
                  >
                    <span className={`text-4xl ${SUIT_COLORS[suit]}`}>{SUIT_SYMBOLS[suit]}</span>
                    <span className="text-xs font-bold uppercase tracking-widest opacity-60">{suit}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Game Over Modal */}
      <AnimatePresence>
        {state.status === 'GAME_OVER' && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4"
          >
            <motion.div 
              initial={{ scale: 0.8, y: 40 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-gradient-to-b from-slate-800 to-slate-950 border border-white/20 p-10 rounded-[2.5rem] shadow-2xl max-w-md w-full text-center relative overflow-hidden"
            >
              {/* Decorative Background */}
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-emerald-500 to-transparent"></div>
              
              <div className="mb-6 inline-flex p-4 bg-emerald-500/20 rounded-full text-emerald-400">
                <Trophy size={48} />
              </div>
              
              <h2 className="text-4xl font-black mb-2 tracking-tight">
                {state.winner === 'PLAYER' ? t.winner : t.gameOver}
              </h2>
              
              <div className="flex justify-center gap-8 mb-8 mt-4">
                <div className="text-center">
                  <div className="text-[10px] uppercase font-bold text-white/40 tracking-widest mb-1">{t.you}</div>
                  <div className="text-3xl font-black text-emerald-400">{state.scores.player}</div>
                </div>
                <div className="w-px h-12 bg-white/10"></div>
                <div className="text-center">
                  <div className="text-[10px] uppercase font-bold text-white/40 tracking-widest mb-1">{t.ai}</div>
                  <div className="text-3xl font-black text-amber-400">{state.scores.ai}</div>
                </div>
              </div>

              <p className="text-white/60 mb-10 text-lg">
                {state.winner === 'PLAYER' 
                  ? t.rule4 
                  : t.aiTurn}
              </p>
              
              <div className="flex flex-col gap-3">
                <button
                  onClick={initGame}
                  className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-bold rounded-2xl transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 text-lg"
                >
                  <RotateCcw size={20} />
                  {t.playAgain}
                </button>
                <button
                  onClick={goToHome}
                  className="w-full py-4 bg-white/5 hover:bg-white/10 text-white font-bold rounded-2xl transition-all border border-white/10 flex items-center justify-center gap-2 text-lg"
                >
                  <Home size={20} />
                  {t.home}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Settings Modal */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/60 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-zinc-900 border border-white/10 w-full max-w-md rounded-[2rem] p-8 shadow-2xl relative"
            >
              <button 
                onClick={() => setShowSettings(false)}
                className="absolute top-6 right-6 p-2 hover:bg-white/5 rounded-full transition-colors"
              >
                <X size={24} />
              </button>

              <h2 className="text-2xl font-black mb-8 flex items-center gap-3">
                <Settings className="text-emerald-400" />
                {t.settings}
              </h2>

              <div className="space-y-8">
                {/* Music Selection */}
                <div>
                  <label className="text-xs font-bold uppercase tracking-widest text-white/40 mb-4 block">
                    {t.music}
                  </label>
                  <button
                    onClick={toggleMusic}
                    className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all ${
                      isMusicPlaying 
                        ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400' 
                        : 'bg-white/5 border-white/5 hover:border-white/10'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {isMusicPlaying ? <Music size={20} /> : <Music2 size={20} className="opacity-40" />}
                      <span className="font-medium">{isMusicPlaying ? t.on : t.off}</span>
                    </div>
                    {isMusicPlaying && <Check size={18} />}
                  </button>
                </div>

                {/* SFX Selection */}
                <div>
                  <label className="text-xs font-bold uppercase tracking-widest text-white/40 mb-4 block">
                    {t.sfx}
                  </label>
                  <button
                    onClick={() => setIsSfxEnabled(!isSfxEnabled)}
                    className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all ${
                      isSfxEnabled 
                        ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400' 
                        : 'bg-white/5 border-white/5 hover:border-white/10'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Layers size={20} className={isSfxEnabled ? "" : "opacity-40"} />
                      <span className="font-medium">{isSfxEnabled ? t.on : t.off}</span>
                    </div>
                    {isSfxEnabled && <Check size={18} />}
                  </button>
                </div>

                {/* Language Selection */}
                <div>
                  <label className="text-xs font-bold uppercase tracking-widest text-white/40 mb-4 block">
                    {t.language}
                  </label>
                  <div className="grid grid-cols-1 gap-2">
                    {[
                      { id: 'zh-CN', name: '简体中文' },
                      { id: 'zh-TW', name: '繁體中文' },
                      { id: 'en-US', name: 'English' },
                    ].map((lang) => (
                      <button
                        key={lang.id}
                        onClick={() => setLanguage(lang.id as Language)}
                        className={`flex items-center justify-between p-4 rounded-xl border transition-all ${
                          state.settings.language === lang.id 
                            ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400' 
                            : 'bg-white/5 border-white/5 hover:border-white/10'
                        }`}
                      >
                        <span className="font-medium">{lang.name}</span>
                        {state.settings.language === lang.id && <Check size={18} />}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Background Color */}
                <div>
                  <label className="text-xs font-bold uppercase tracking-widest text-white/40 mb-4 block">
                    {t.bgColor}
                  </label>
                  <div className="flex flex-wrap gap-3">
                    {bgColors.map((color) => (
                      <button
                        key={color.value}
                        onClick={() => setBgColor(color.value)}
                        className={`w-10 h-10 rounded-full border-2 transition-all transform hover:scale-110 ${
                          state.settings.bgColor === color.value ? 'border-white scale-110' : 'border-transparent'
                        }`}
                        style={{ backgroundColor: color.value }}
                        title={color.name}
                      />
                    ))}
                  </div>
                </div>

                {/* Info Section */}
                <div className="pt-6 border-t border-white/5 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-white/40">{t.copyright}</span>
                    <span className="text-white/80 font-medium">{t.author}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-white/40">{t.version}</span>
                    <span className="text-white/80 font-medium">V1.0</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setShowSettings(false)}
                className="w-full mt-8 py-4 bg-white text-black font-black rounded-xl hover:bg-zinc-200 transition-colors uppercase tracking-widest text-sm"
              >
                {t.back}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
