import React from 'react';
import { motion } from 'motion/react';
import { CardData, Suit } from '../types';
import { SUIT_SYMBOLS, SUIT_COLORS } from '../constants';

interface CardProps {
  card: CardData;
  isFaceUp?: boolean;
  onClick?: () => void;
  isPlayable?: boolean;
  className?: string;
}

export const Card: React.FC<CardProps> = ({ 
  card, 
  isFaceUp = true, 
  onClick, 
  isPlayable = false,
  className = ""
}) => {
  if (!card) return null;

  return (
    <motion.div
      layout
      initial={{ scale: 0.8, opacity: 0, y: 20 }}
      animate={{ 
        scale: 1, 
        opacity: 1, 
        y: 0,
        boxShadow: isPlayable 
          ? "0 0 25px rgba(250, 204, 21, 0.6)" 
          : "0 10px 15px -3px rgb(0 0 0 / 0.1)"
      }}
      whileHover={isPlayable ? { y: -20, scale: 1.1, rotate: 2 } : {}}
      whileTap={isPlayable ? { scale: 0.95 } : {}}
      onClick={isPlayable ? onClick : undefined}
      className={`
        relative w-20 h-28 sm:w-24 sm:h-36 rounded-xl border-2 
        ${isFaceUp ? 'bg-white border-slate-200' : 'bg-indigo-700 border-indigo-900'}
        ${isPlayable ? 'cursor-pointer ring-2 ring-yellow-400 ring-offset-2' : ''}
        flex flex-col items-center justify-center select-none overflow-hidden
        ${className}
      `}
    >
      {isFaceUp ? (
        <>
          {/* Minimalist Landscape Pattern */}
          <div className="absolute inset-0 opacity-[0.12] pointer-events-none overflow-hidden rounded-xl flex items-end">
            <div className="relative w-full h-2/3">
              {/* Sun/Moon */}
              <div className={`absolute top-0 left-1/4 w-8 h-8 rounded-full border-2 border-current ${SUIT_COLORS[card.suit]}`}></div>
              
              {/* Distant Mountains */}
              <svg className={`absolute bottom-4 w-full h-12 ${SUIT_COLORS[card.suit]}`} viewBox="0 0 100 40" preserveAspectRatio="none">
                <path d="M0 40 L20 10 L40 30 L60 5 L80 25 L100 15 L100 40 Z" fill="none" stroke="currentColor" strokeWidth="0.5" />
              </svg>
              
              {/* River/Water */}
              <div className={`absolute bottom-0 w-full h-4 opacity-30 ${card.suit === Suit.HEARTS || card.suit === Suit.DIAMONDS ? 'bg-red-400' : 'bg-slate-400'}`}>
                <div className="w-full h-px bg-current mt-1 opacity-20"></div>
                <div className="w-full h-px bg-current mt-1 opacity-20 ml-2"></div>
              </div>
            </div>
          </div>

          <div className={`absolute top-2 left-2 text-sm sm:text-lg font-bold ${SUIT_COLORS[card.suit]}`}>
            {card.rank}
          </div>
          
          <div className="relative flex flex-col items-center">
            <div className={`text-3xl sm:text-5xl ${SUIT_COLORS[card.suit]} drop-shadow-sm`}>
              {SUIT_SYMBOLS[card.suit]}
            </div>
          </div>

          <div className={`absolute bottom-2 right-2 text-sm sm:text-lg font-bold rotate-180 ${SUIT_COLORS[card.suit]}`}>
            {card.rank}
          </div>
        </>
      ) : (
        <div className="w-full h-full flex items-center justify-center p-1 bg-[#E60012]">
          <div className="w-full h-full border-4 border-[#FFD700]/40 rounded-lg flex items-center justify-center relative overflow-hidden">
            {/* Traditional Pattern Background */}
            <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(#FFD700 1px, transparent 0)', backgroundSize: '10px 10px' }}></div>
            
            {/* Central Festive Character/Symbol */}
            <div className="relative z-10 flex flex-col items-center">
               <div className="w-12 h-12 sm:w-16 sm:h-16 border-2 border-[#FFD700] rounded-full flex items-center justify-center">
                 <div className="text-[#FFD700] text-3xl sm:text-4xl font-serif font-bold">福</div>
               </div>
               <div className="mt-2 text-[#FFD700]/60 text-[8px] sm:text-[10px] font-bold tracking-[0.2em] uppercase">YinFeng</div>
            </div>

            {/* Corner Accents */}
            <div className="absolute top-1 left-1 w-3 h-3 border-t-2 border-l-2 border-[#FFD700]/60"></div>
            <div className="absolute top-1 right-1 w-3 h-3 border-t-2 border-r-2 border-[#FFD700]/60"></div>
            <div className="absolute bottom-1 left-1 w-3 h-3 border-b-2 border-l-2 border-[#FFD700]/60"></div>
            <div className="absolute bottom-1 right-1 w-3 h-3 border-b-2 border-r-2 border-[#FFD700]/60"></div>
          </div>
        </div>
      )}
    </motion.div>
  );
};
