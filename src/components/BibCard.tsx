import React from 'react';
import { Participant, ThemeType } from '@/types';
import { cn } from '@/lib/utils';

interface BibCardProps {
  participant: Participant;
  theme: ThemeType;
  backgroundImage?: string;
  barcodeDataURL: string;
  isPreview?: boolean;
  className?: string;
}

export const BibCard: React.FC<BibCardProps> = ({
  participant,
  theme,
  backgroundImage,
  barcodeDataURL,
  isPreview = false,
  className
}) => {
  const cardStyle = backgroundImage && theme !== 'theme-transparent' 
    ? {
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }
    : {};

  const getBibNumberColor = () => {
    if (backgroundImage && theme !== 'theme-transparent') {
      return '#fff';
    }
    
    // Auto-select based on theme brightness
    const brightThemes = ['theme-green', 'theme-orange'];
    return brightThemes.includes(theme) ? '#222' : '#fff';
  };

  const getBibNumberShadow = () => {
    if (backgroundImage && theme !== 'theme-transparent') {
      return '2px 2px 10px rgba(0,0,0,0.35), 0 0 2px rgba(0,0,0,0.35)';
    }
    
    const brightThemes = ['theme-green', 'theme-orange'];
    return brightThemes.includes(theme) 
      ? '1px 1px 8px rgba(255,255,255,0.35), 0 0 2px rgba(255,255,255,0.35)'
      : '2px 2px 8px rgba(0,0,0,0.35), 0 0 2px rgba(0,0,0,0.35)';
  };

  const getFontSize = () => {
    if (participant.bibNumber.length > 6) return '3rem';
    if (participant.bibNumber.length > 4) return '3.5rem';
    return '4rem';
  };

  return (
    <div 
      className={cn(
        'bib-card flex flex-col justify-between p-6 text-black relative',
        theme,
        isPreview && 'bib-card-preview',
        className
      )}
      style={cardStyle}
      data-bib={participant.bibNumber}
    >
      {/* Hole punches */}
      <div className="hole-punch hole-top-left" />
      <div className="hole-punch hole-top-right" />
      <div className="hole-punch hole-bottom-left" />
      <div className="hole-punch hole-bottom-right" />
      
      {/* Event Header */}
      <header className="text-center p-4 bg-white/90 rounded-lg shadow-md backdrop-blur-sm z-10" style={{ marginTop: '1cm' }}>
        <h1 className="text-xl font-bold mb-2 text-gray-900">
          {participant.eventName}
        </h1>
        <div className="inline-block bg-white/60 px-4 py-1 rounded-full text-sm">
          {participant.raceCategory}
        </div>
      </header>
      
      {/* BIB Number */}
      <div className="flex-1 flex items-center justify-center">
        <div 
          className="font-bold break-words text-center leading-none"
          style={{
            fontSize: getFontSize(),
            color: getBibNumberColor(),
            textShadow: getBibNumberShadow()
          }}
        >
          {participant.bibNumber}
        </div>
      </div>
      
      {/* Barcode Section */}
      <div className="bg-white rounded-xl p-4 shadow-lg mx-auto max-w-[80%] z-10">
        <div className="bg-white rounded p-2 flex items-center justify-center h-20 overflow-hidden">
          <img 
            src={barcodeDataURL} 
            alt="Barcode" 
            className="max-w-full h-auto"
          />
        </div>
        <div className="text-center text-xs font-bold text-gray-700 mt-1">
          BIB: {participant.bibNumber}
        </div>
      </div>
      
      {/* Participant Info */}
      <footer className="text-center p-4 bg-white/90 rounded-lg shadow-md backdrop-blur-sm z-10">
        <div className="font-bold text-lg mb-1 text-gray-900">
          {participant.participantName}
        </div>
        <div className="text-sm text-gray-700">
          {participant.date}
        </div>
      </footer>
      
      {/* Tagline */}
      <div className="absolute bottom-5 left-1/2 transform -translate-x-1/2 text-xs font-bold opacity-80 z-10">
        <span style={{ color: getBibNumberColor(), textShadow: getBibNumberShadow() }}>
          RUN • ACHIEVE • INSPIRE
        </span>
      </div>
    </div>
  );
};