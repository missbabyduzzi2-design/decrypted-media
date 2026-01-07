
import { type GematriaResult } from '../types';

const ALPHABET = 'abcdefghijklmnopqrstuvwxyz';

const cleanText = (text: string): string => {
  return text.toLowerCase().replace(/[^a-z]/g, '');
};

// Reference Arrays
const PRIMES = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67, 71, 73, 79, 83, 89, 97, 101];
const FIBONACCI_MIRRORED = [1, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89, 144, 233, 233, 144, 89, 55, 34, 21, 13, 8, 5, 3, 2, 1, 1]; // A-Z
const PI_DIGITS = [3, 1, 4, 4, 6, 0, 5, 5, 1, 1, 2, 9, 9, 6, 9, 3, 1, 4, 4, 2, 7, 8, 2, 3, 4, 3]; // A-Z based on prompt
const SEPTENARY_SEQ = [1, 2, 3, 4, 5, 6, 7, 6, 5, 4, 3, 2, 1]; // Repeats for A-M, then N-Z

const CHALDEAN_MAP: { [key: string]: number } = {
  a: 1, b: 2, c: 3, d: 4, e: 5, f: 8, g: 3, h: 5, i: 1, j: 1, k: 2, l: 3, m: 4,
  n: 5, o: 7, p: 8, q: 1, r: 2, s: 3, t: 4, u: 6, v: 6, w: 6, x: 5, y: 1, z: 7
};
const ENGLISH_KABBALAH_MAP: { [key: string]: number } = {
  a: 1, b: 20, c: 13, d: 6, e: 25, f: 18, g: 11, h: 4, i: 23, j: 16, k: 9, l: 2, m: 21,
  n: 14, o: 7, p: 26, q: 19, r: 12, s: 5, t: 24, u: 17, v: 10, w: 3, x: 22, y: 15, z: 8
};
const TRIGRAMMATON_MAP: { [key: string]: number } = {
  a: 5, b: 20, c: 2, d: 23, e: 13, f: 12, g: 11, h: 3, i: 0, j: 7, k: 17, l: 1, m: 21,
  n: 24, o: 10, p: 4, q: 16, r: 14, s: 15, t: 9, u: 25, v: 22, w: 8, x: 6, y: 18, z: 19
};
const KEYPAD_MAP: { [key: string]: number } = {
  a: 2, b: 2, c: 2, d: 3, e: 3, f: 3, g: 4, h: 4, i: 4, j: 5, k: 5, l: 5, m: 6, n: 6, o: 6,
  p: 7, q: 7, r: 7, s: 7, t: 8, u: 8, v: 8, w: 9, x: 9, y: 9, z: 9
};

const reduceToSingleDigit = (num: number): number => {
  return (num - 1) % 9 + 1;
};

const getOrdinal = (char: string): number => ALPHABET.indexOf(char) + 1;

// Core Logic Functions for Single Characters
const CHAR_CALCULATORS: { [key: string]: (char: string) => number } = {
  'Chaldean': (char) => CHALDEAN_MAP[char] || 0,
  'Septenary': (char) => {
     const idx = ALPHABET.indexOf(char);
     return idx === -1 ? 0 : SEPTENARY_SEQ[idx % 13];
  },
  'Ordinal': (char) => getOrdinal(char) || 0,
  'Reduction': (char) => {
    const o = getOrdinal(char);
    return o ? reduceToSingleDigit(o) : 0;
  },
  'Sumerian': (char) => {
    const o = getOrdinal(char);
    return o ? o * 6 : 0;
  },
  'Latin': (char) => {
      const i = ALPHABET.indexOf(char);
      if (i === -1) return 0;
      if (i < 9) return i + 1; // A-I (1-9)
      if (char === 'j') return 600;
      if (char === 'k') return 10;
      if (char === 'l') return 20;
      if (char === 'm') return 30;
      if (char === 'n') return 40;
      if (char === 'o') return 50;
      if (char === 'p') return 60;
      if (char === 'q') return 70;
      if (char === 'r') return 80;
      if (char === 's') return 90;
      if (char === 't') return 100;
      if (char === 'u') return 200;
      if (char === 'v') return 700;
      if (char === 'w') return 900;
      if (char === 'x') return 300;
      if (char === 'y') return 400;
      if (char === 'z') return 500;
      return 0;
  },
  'Reverse Ordinal': (char) => {
    const o = getOrdinal(char);
    return o ? 27 - o : 0;
  },
  'Reverse Reduction': (char) => {
    const o = getOrdinal(char);
    return o ? reduceToSingleDigit(27 - o) : 0;
  },
  'Fibonacci': (char) => {
      const idx = ALPHABET.indexOf(char);
      return idx === -1 ? 0 : FIBONACCI_MIRRORED[idx];
  },
  'Primes': (char) => {
      const idx = ALPHABET.indexOf(char);
      return idx === -1 ? 0 : PRIMES[idx];
  },
  'Pi': (char) => {
      const idx = ALPHABET.indexOf(char);
      return idx === -1 ? 0 : PI_DIGITS[idx];
  },
  'Three Six Nine': (char) => {
      const idx = ALPHABET.indexOf(char);
      if (idx === -1) return 0;
      const pos = idx + 1;
      const mod = pos % 3;
      if (mod === 1) return 3;
      if (mod === 2) return 6;
      return 9;
  },
  'Keypad': (char) => KEYPAD_MAP[char] || 0,
  'Satanic': (char) => {
      const o = getOrdinal(char);
      return o ? o + 35 : 0;
  },
  'English Kabbalah': (char) => ENGLISH_KABBALAH_MAP[char] || 0,
  'Trigrammaton': (char) => TRIGRAMMATON_MAP[char] || 0,
  'Trigonal': (char) => {
      const n = getOrdinal(char);
      return n ? (n * (n + 1)) / 2 : 0;
  },
  'Standard': (char) => {
      const i = ALPHABET.indexOf(char);
      if (i === -1) return 0;
      const pos = (i % 9) + 1;
      const multiplier = Math.pow(10, Math.floor(i / 9));
      return pos * multiplier;
  },
  'Squares': (char) => {
      const n = getOrdinal(char);
      return n ? n * n : 0;
  }
};

const CIPHERS: { [key: string]: (text: string) => number } = {
  'Chaldean': (text) => cleanText(text).split('').reduce((sum, char) => sum + CHAR_CALCULATORS['Chaldean'](char), 0),
  'Septenary': (text) => cleanText(text).split('').reduce((sum, char) => sum + CHAR_CALCULATORS['Septenary'](char), 0),
  'Ordinal': (text) => cleanText(text).split('').reduce((sum, char) => sum + CHAR_CALCULATORS['Ordinal'](char), 0),
  'Reduction': (text) => cleanText(text).split('').reduce((sum, char) => sum + CHAR_CALCULATORS['Reduction'](char), 0),
  'Sumerian': (text) => cleanText(text).split('').reduce((sum, char) => sum + CHAR_CALCULATORS['Sumerian'](char), 0),
  'Latin': (text) => cleanText(text).split('').reduce((sum, char) => sum + CHAR_CALCULATORS['Latin'](char), 0),
  'Reverse Ordinal': (text) => cleanText(text).split('').reduce((sum, char) => sum + CHAR_CALCULATORS['Reverse Ordinal'](char), 0),
  'Reverse Reduction': (text) => cleanText(text).split('').reduce((sum, char) => sum + CHAR_CALCULATORS['Reverse Reduction'](char), 0),
  'Fibonacci': (text) => cleanText(text).split('').reduce((sum, char) => sum + CHAR_CALCULATORS['Fibonacci'](char), 0),
  'Primes': (text) => cleanText(text).split('').reduce((sum, char) => sum + CHAR_CALCULATORS['Primes'](char), 0),
  'Pi': (text) => cleanText(text).split('').reduce((sum, char) => sum + CHAR_CALCULATORS['Pi'](char), 0),
  'Three Six Nine': (text) => cleanText(text).split('').reduce((sum, char) => sum + CHAR_CALCULATORS['Three Six Nine'](char), 0),
  'Keypad': (text) => cleanText(text).split('').reduce((sum, char) => sum + CHAR_CALCULATORS['Keypad'](char), 0),
  'Satanic': (text) => cleanText(text).split('').reduce((sum, char) => sum + CHAR_CALCULATORS['Satanic'](char), 0),
  'English Kabbalah': (text) => cleanText(text).split('').reduce((sum, char) => sum + CHAR_CALCULATORS['English Kabbalah'](char), 0),
  'Trigrammaton': (text) => cleanText(text).split('').reduce((sum, char) => sum + CHAR_CALCULATORS['Trigrammaton'](char), 0),
  'Trigonal': (text) => cleanText(text).split('').reduce((sum, char) => sum + CHAR_CALCULATORS['Trigonal'](char), 0),
  'Standard': (text) => cleanText(text).split('').reduce((sum, char) => sum + CHAR_CALCULATORS['Standard'](char), 0),
  'Squares': (text) => cleanText(text).split('').reduce((sum, char) => sum + CHAR_CALCULATORS['Squares'](char), 0),
};

export const calculateAllCiphers = (text: string): GematriaResult => {
  const results: GematriaResult = {};
  for (const cipherName in CIPHERS) {
    results[cipherName] = CIPHERS[cipherName](text);
  }
  return results;
};

// Returns breakdown of text. Characters that are not letters will have value 0 or be skipped if desired.
// Here we return objects for every character in original string to maintain spacing for UI.
export const getCipherBreakdown = (text: string, cipher: string): { char: string, val: number }[] => {
    const calc = CHAR_CALCULATORS[cipher];
    if (!calc) return [];
    
    return text.split('').map(char => {
        const lower = char.toLowerCase();
        if (!ALPHABET.includes(lower)) {
            return { char, val: 0 };
        }
        return { char, val: calc(lower) };
    });
};

export const getCipherKeys = (): string[] => {
    return Object.keys(CIPHERS);
};
