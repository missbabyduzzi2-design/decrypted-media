
import React, { useState } from 'react';
import { type CosmicData } from '../../../types';

// Constants
const VIEWBOX_SIZE = 500;
const CENTER = VIEWBOX_SIZE / 2;
const ZODIAC_RING_RADIUS = VIEWBOX_SIZE / 2 - 30;
const PLANET_RING_RADIUS = 150;

// Unicode Symbols
const ZODIAC_SIGNS = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
];

const ZODIAC_SYMBOLS: Record<string, string> = {
  'Aries': '♈', 'Taurus': '♉', 'Gemini': '♊', 'Cancer': '♋', 'Leo': '♌', 'Virgo': '♍',
  'Libra': '♎', 'Scorpio': '♏', 'Sagittarius': '♐', 'Capricorn': '♑', 'Aquarius': '♒', 'Pisces': '♓'
};

// Map planet names from API to Unicode
const PLANET_SYMBOLS: Record<string, string> = {
  Sun: '☉', Moon: '☾', Mercury: '☿', Venus: '♀', Mars: '♂',
  Jupiter: '♃', Saturn: '♄', Uranus: '♅', Neptune: '♆', Pluto: '♇'
};

const PLANET_MEANINGS: { [key: string]: string } = {
  Sun: "Leadership, visibility, authority, ego, central power",
  Moon: "Public emotion, psychology, collective mood, cycles",
  Mercury: "Information, communication, media, technology",
  Venus: "Culture, values, relationships, harmony, aesthetics",
  Mars: "Conflict, aggression, action, force, war energy",
  Jupiter: "Expansion, growth, amplification, optimism",
  Saturn: "Control, law, restriction, discipline, karma",
  Uranus: "Shock, rebellion, disruption, sudden change",
  Neptune: "Illusion, deception, dreams, propaganda, spirituality",
  Pluto: "Destruction, transformation, death/rebirth, hidden power"
};

// Normalization function to handle fuzzy matches from AI output
const normalizeSign = (input: string): string | null => {
    if (!input) return null;
    const lower = input.toLowerCase().trim();
    const map: Record<string, string> = {
        'aries': 'Aries', 'ari': 'Aries',
        'taurus': 'Taurus', 'tau': 'Taurus',
        'gemini': 'Gemini', 'gem': 'Gemini',
        'cancer': 'Cancer', 'can': 'Cancer',
        'leo': 'Leo',
        'virgo': 'Virgo', 'vir': 'Virgo',
        'libra': 'Libra', 'lib': 'Libra',
        'scorpio': 'Scorpio', 'sco': 'Scorpio', 'scorpius': 'Scorpio',
        'sagittarius': 'Sagittarius', 'sag': 'Sagittarius',
        'capricorn': 'Capricorn', 'cap': 'Capricorn',
        'aquarius': 'Aquarius', 'aq': 'Aquarius', 'aqua': 'Aquarius',
        'pisces': 'Pisces', 'pis': 'Pisces'
    };
    // First try direct map, then check if any key is contained in input
    if (map[lower]) return map[lower];
    
    // Fuzzy search
    const found = Object.keys(map).find(key => lower.includes(key));
    return found ? map[found] : null;
};

// Normalization for Planets
const normalizePlanet = (input: string): string | null => {
    if (!input) return null;
    const lower = input.toLowerCase().trim();
    const map: Record<string, string> = {
        'sun': 'Sun', 'the sun': 'Sun',
        'moon': 'Moon', 'the moon': 'Moon',
        'mercury': 'Mercury',
        'venus': 'Venus',
        'mars': 'Mars',
        'jupiter': 'Jupiter',
        'saturn': 'Saturn',
        'uranus': 'Uranus',
        'neptune': 'Neptune',
        'pluto': 'Pluto'
    };
    if (map[lower]) return map[lower];
    const found = Object.keys(map).find(key => lower.includes(key));
    return found ? map[found] : null;
};

// Helper function to convert astrological degree to SVG coordinates
const degreeToPoint = (degree: number, radius: number) => {
  const angleRad = (180 - degree) * (Math.PI / 180);
  return {
    x: CENTER + radius * Math.cos(angleRad),
    y: CENTER + radius * Math.sin(angleRad),
  };
};

interface AstroWheelProps {
  planetaryPositions: CosmicData['planetaryPositions'];
  onPlanetClick: (planetName: string) => void;
}

export const AstroWheel: React.FC<AstroWheelProps> = ({ planetaryPositions, onPlanetClick }) => {
  const [hoveredPlanet, setHoveredPlanet] = useState<string | null>(null);

  const getPlanetTotalDegree = (planet: CosmicData['planetaryPositions'][0]): number => {
    const normalizedSign = normalizeSign(planet.sign);
    if (!normalizedSign) return 0;
    
    const signIndex = ZODIAC_SIGNS.indexOf(normalizedSign);
    if (signIndex === -1) return 0;
    return (signIndex * 30) + planet.degrees;
  };

  return (
    <svg viewBox={`0 0 ${VIEWBOX_SIZE} ${VIEWBOX_SIZE}`} className="w-full h-full text-zinc-300 select-none">
      <defs>
        <filter id="astro-glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>
      
      <g>
        {/* Zodiac Ring */}
        <circle cx={CENTER} cy={CENTER} r={ZODIAC_RING_RADIUS} fill="none" stroke="currentColor" strokeWidth="1" className="text-zinc-700" />
        <circle cx={CENTER} cy={CENTER} r={ZODIAC_RING_RADIUS + 15} fill="none" stroke="currentColor" strokeWidth="0.5" className="text-zinc-800" />

        {ZODIAC_SIGNS.map((_, index) => {
          const startPoint = degreeToPoint(index * 30, ZODIAC_RING_RADIUS - 10);
          const endPoint = degreeToPoint(index * 30, ZODIAC_RING_RADIUS + 10);
          return <line key={index} x1={startPoint.x} y1={startPoint.y} x2={endPoint.x} y2={endPoint.y} stroke="currentColor" strokeWidth="1" className="text-zinc-800" />;
        })}

        {/* Zodiac Symbols */}
        {ZODIAC_SIGNS.map((sign, index) => {
          const position = degreeToPoint(index * 30 + 15, ZODIAC_RING_RADIUS + 2);
          const symbol = ZODIAC_SYMBOLS[sign];
          return (
            <text 
                key={sign} 
                x={position.x} 
                y={position.y} 
                textAnchor="middle" 
                dominantBaseline="central"
                fontSize="24"
                className="fill-zinc-600 font-sans"
            >
              {symbol}
            </text>
          );
        })}
        
        {/* Planet Glyphs */}
        {planetaryPositions.map(planet => {
          const normalizedName = normalizePlanet(planet.planet);
          if (!normalizedName) return null;
          
          const totalDegree = getPlanetTotalDegree(planet);
          const position = degreeToPoint(totalDegree, PLANET_RING_RADIUS);
          const symbol = PLANET_SYMBOLS[normalizedName];
          
          if (!symbol) return null;

          return (
             <g 
                key={planet.planet} 
                className="group cursor-pointer transition-colors"
                onClick={() => onPlanetClick(planet.planet)}
                onMouseEnter={() => setHoveredPlanet(planet.planet)}
                onMouseLeave={() => setHoveredPlanet(null)}
                role="button"
                tabIndex={0}
            >
                <circle 
                    cx={position.x} 
                    cy={position.y} 
                    r={16} 
                    fill="transparent"
                    className="stroke-emerald-500/50 opacity-0 group-hover:opacity-100 transition-opacity"
                    strokeWidth="1"
                />
                <text
                    x={position.x}
                    y={position.y}
                    textAnchor="middle"
                    dominantBaseline="central"
                    fontSize="22"
                    className="fill-emerald-400 group-hover:fill-emerald-300 drop-shadow-[0_0_2px_rgba(0,0,0,0.8)] font-sans"
                >
                    {symbol}
                </text>
             </g>
          );
        })}

        {/* Inner circle */}
        <circle cx={CENTER} cy={CENTER} r={PLANET_RING_RADIUS - 30} fill="none" stroke="currentColor" strokeWidth="0.5" className="text-zinc-800" />
      </g>

      {/* Active Tooltip - Rendered last to ensure it's on top of everything */}
      {hoveredPlanet && (() => {
           const planet = planetaryPositions.find(p => p.planet === hoveredPlanet);
           if (!planet) return null;
           
           const normalizedName = normalizePlanet(planet.planet);
           if (!normalizedName) return null;
           
           const totalDegree = getPlanetTotalDegree(planet);
           const position = degreeToPoint(totalDegree, PLANET_RING_RADIUS);
           const meaning = PLANET_MEANINGS[normalizedName] || '';
           
           const tooltipWidth = 180;
           const tooltipHeight = 55;
           const tooltipX = position.x - tooltipWidth / 2;
           const tooltipHeightWithMargin = tooltipHeight + 15;
           const tooltipY = position.y - tooltipHeightWithMargin;

           return (
               <foreignObject
                  x={tooltipX}
                  y={tooltipY}
                  width={tooltipWidth}
                  height={tooltipHeight}
                  className="pointer-events-none"
               >
                   <div className="bg-zinc-900 border border-white/10 p-3 rounded-lg shadow-xl text-center flex flex-col justify-center h-full backdrop-blur-sm animate-in fade-in duration-200">
                      <strong className="block text-emerald-400 text-xs mb-1">{normalizedName} in {planet.sign}</strong>
                      <span className="text-[9px] text-zinc-300 leading-tight">{meaning}</span>
                   </div>
               </foreignObject>
           )
       })()}
    </svg>
  );
};
