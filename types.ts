
import React from 'react';

export interface Article {
  id: string;
  title: string;
  description: string;
  content: string;
  date: string;
  category: string;
  location: string;
  url?: string;
}

export interface Entity {
  type: 'Person' | 'Company' | 'Location' | 'Date' | 'Event' | 'Concept';
  name: string;
  details: string;
}

export interface Relationship {
  source: string;
  target: string;
  description: string;
}

export interface Sentiment {
  tone: 'Positive' | 'Negative' | 'Neutral';
  confidence: number;
  justification: string;
  keyPhrases: string[];
}

export interface IntelligenceBriefing {
  entities: Entity[];
  relationships?: Relationship[];
  sentiment: Sentiment;
}

export interface GematriaResult {
  [cipher: string]: number;
}

export interface DecoderSection {
  id: string;
  title: string;
  headerContent?: React.ReactNode;
}

// Simplified types for analysis data to avoid excessive complexity.
// In a full app, these would be much more detailed.

export interface EnrichmentData {
  [entityName: string]: {
    summary: string;
    url?: string;
  };
}

export interface QliphothItem {
  name: string;
  title: string;
  description: string;
  lesson: string;
}

export interface EsotericMappings {
  tarot: { name: string; number: number; correspondence: string; meaning: string }[];
  periodic: { name: string; number: number; symbol: string; correspondence: string; meaning: string; }[];
  symbolic: { symbol: string; meaning: string; context: string; }[];
  numerologyMatches: { number: string; category: string; meaning: string; context: string; }[];
  ritualTiming: { event: string; significance: string; connection: string; }[];
  qliphoth: QliphothItem[];
}

export interface EtymologyItem {
  word: string;
  root: string;
  language: string;
  originalMeaning: string;
  modernConnection: string;
}

export interface EtymologyData {
  items: EtymologyItem[];
}

export interface CosmicData {
  planetaryPositions: { planet: string; sign: string; degrees: number }[];
  majorAspects: { aspect: string; planets: [string, string]; orb: number }[];
  lunarPhase: string;
  vedicAnalysis: string;
  fixedStars: { star: string; conjunction: string; significance: string; }[];
}

export interface CosmicWeather {
  outlook: string;
  metaphor: string;
}

export interface Archetype {
  name: string;
  role: string;
  activation: string;
}

export interface HiddenNarrative {
  stage: string;
  analysis: string;
  prediction: string;
}

export interface Synthesis {
  narrative: string;
  archetypes: Archetype[];
  hiddenNarrative: HiddenNarrative;
}

export interface FullAnalysisData {
  briefing: IntelligenceBriefing;
  enrichment: EnrichmentData;
  esotericMappings: EsotericMappings;
  etymology: EtymologyData;
  cosmicData: CosmicData;
  synthesis: Synthesis;
  cosmicWeather: CosmicWeather;
}

// Chronology Types
export interface ChronologyEvent {
  dateType: string; // e.g., "Date of Birth", "Founding Date"
  dateValue: string; // YYYY-MM-DD
  sourceUrl?: string;
  confidence: 'Verified' | 'Estimated' | 'Unknown';
}

export interface DateSpanAnalysis {
  totalDays: number;
  years: number;
  months: number;
  days: number;
  digitSum: number; // Recursive sum
  zeroDropped: number; // Value without zeros
  isControlMatch: boolean;
  controlMatchValue?: number;
}

export interface EntityChronology {
  entityName: string;
  entityType: string;
  events: ChronologyEvent[];
}

export interface DayCountRow {
  comparison: string; // e.g., "Birth → Death"
  startDate: string;
  endDate: string;
  dayCount: number;
  isInclusive: boolean;
  digitSum: number;
  zeroDropped: number;
  isControlMatch: boolean;
  controlMatchValue?: string; // e.g. "201 (Zero Drop)" or "33"
  notes: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: Date;
}

// Number Analysis Types
export interface NumberSymbolism {
    archetype: string;
    meaning: string;
    qualities: string;
}

// Notebook Types
export interface NotebookEntry {
  id: string;
  timestamp: number;
  type: 'text' | 'entity' | 'gematria' | 'cosmic' | 'narrative' | 'etymology' | 'qliphoth' | 'number_analysis' | 'article_header';
  title: string;
  content: string | any; // Can hold structured data
  tags: string[];
}
