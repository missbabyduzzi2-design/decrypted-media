
import { type IntelligenceBriefing, type CosmicData, type Synthesis, type EnrichmentData, type EsotericMappings, type Entity, type CosmicWeather, type EntityChronology, type EtymologyData, type NumberSymbolism, type Article } from '../types';

/**
 * DECRYPTED MEDIA ANALYST - AI SERVICE (GROQ EDITION)
 * Replaces Gemini with Groq for high-speed, free-tier Llama 3.3/3.1 inference.
 */

const GROQ_ENDPOINT = '/api/groq';

// Llama 3.3 70B for high intelligence, 3.1 8B for speed
const INTELLIGENT_MODEL = 'llama-3.3-70b-versatile';
const FAST_MODEL = 'llama-3.1-8b-instant';

const BASE_INSTRUCTION = `You are a high-speed intelligence analyst.
Output MUST be valid JSON matching the schema provided. 
No preamble. No explanations. Return ONLY the JSON object.

CRITICAL PROTOCOLS:
1. FACTUAL GROUNDING: Analyze source text strictly. 
2. OBJECTIVE TONE: Detached, analytical, professional.
3. SCHEMA ADHERENCE: Strictly follow provided JSON keys.
`;

// Helper for local YYYY-MM-DD
const getLocalDateString = () => {
    const d = new Date();
    const offset = d.getTimezoneOffset();
    const local = new Date(d.getTime() - (offset * 60 * 1000));
    return local.toISOString().split('T')[0];
};

const SYMBOLIC_INSTRUCTION = `
Identify esoteric, ritual, and mythic meanings.
Symbols: Phoenix (Rebirth), Lion (Authority), Serpent (Knowledge), Black cube (Saturn), Pyramid (Hierarchy), Fire (Sacrifice).
Numbers: 33 (Master), 322 (Skull), 201 (Jesuit), 911 (Trauma).
Qliphoth: Identify shadow currents (Thaumiel, Ghagiel, etc.) based on narrative tone.
`;

const requestCache = new Map<string, Promise<any>>();

/**
 * Generic Fetch-based call to Groq
 */
async function callGroq<T>(prompt: string, schema: string, model: string = INTELLIGENT_MODEL, retries = 3): Promise<T> {
    const cacheKey = `${prompt.substring(0, 100)}-${model}`;
    if (requestCache.has(cacheKey)) return requestCache.get(cacheKey);

    const performCall = async (): Promise<T> => {
        let lastError: any;
        for (let i = 0; i < retries; i++) {
            try {
                const response = await fetch(GROQ_ENDPOINT, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        model: model,
                        messages: [
                            { role: 'system', content: `${BASE_INSTRUCTION}\nSchema:\n${schema}` },
                            { role: 'user', content: prompt }
                        ],
                        temperature: 0.1,
                        response_format: { type: 'json_object' }
                    })
                });

                if (!response.ok) {
                    const errData = await response.json();
                    throw new Error(errData.error?.message || `Groq API Error: ${response.status}`);
                }

                const data = await response.json();
                return JSON.parse(data.choices[0].message.content) as T;

            } catch (error: any) {
                lastError = error;
                const delay = 1000 * Math.pow(2, i); // Exponential backoff
                console.warn(`Groq retry ${i+1}/${retries} due to: ${error.message}`);
                if (i < retries - 1) await new Promise(r => setTimeout(r, delay));
            }
        }
        throw lastError;
    };

    const promise = performCall();
    requestCache.set(cacheKey, promise);
    return promise;
}

// --- Schemas for Prompting ---

const briefingSchema = `
{
  "entities": [{"type": "Person|Company|Location|Concept", "name": "string", "details": "string"}],
  "relationships": [{"source": "string", "target": "string", "description": "string"}],
  "sentiment": {"tone": "Positive|Negative|Neutral", "confidence": 0.0-1.0, "justification": "string", "keyPhrases": ["string"]}
}`;

const enrichmentSchema = `
{
  "enrichmentList": [{"name": "string", "summary": "string", "url": "string"}]
}`;

const esotericSchema = `
{
  "tarot": [{"name": "string", "number": 0, "correspondence": "string", "meaning": "string"}],
  "periodic": [{"name": "string", "symbol": "string", "number": 0, "correspondence": "string", "meaning": "string"}],
  "symbolic": [{"symbol": "string", "meaning": "string", "context": "string"}],
  "numerologyMatches": [{"number": "string", "category": "string", "meaning": "string", "context": "string"}],
  "ritualTiming": [{"event": "string", "significance": "string", "connection": "string"}],
  "qliphoth": [{"name": "string", "title": "string", "description": "string", "lesson": "string"}]
}`;

const unifiedCosmicSchema = `
{
  "cosmicData": {
    "planetaryPositions": [{"planet": "string", "sign": "string", "degrees": 0}],
    "majorAspects": [{"aspect": "string", "planets": ["string"], "orb": 0}],
    "lunarPhase": "string",
    "vedicAnalysis": "string",
    "fixedStars": [{"star": "string", "conjunction": "string", "significance": "string"}]
  },
  "synthesis": {
    "narrative": "string",
    "archetypes": [{"name": "string", "role": "string", "activation": "string"}],
    "hiddenNarrative": {"stage": "string", "analysis": "string", "prediction": "string"}
  },
  "cosmicWeather": {"outlook": "string", "metaphor": "string"}
}`;

// --- Exported Functions ---

export const getIntelligenceBriefing = (articleText: string): Promise<IntelligenceBriefing> => {
    const prompt = `Perform Intelligence Briefing. Extract entities and sentiment. Article: ${articleText.substring(0, 15000)}`;
    return callGroq<IntelligenceBriefing>(prompt, briefingSchema, FAST_MODEL);
};

export const getEnhancedEntities = (articleText: string): Promise<Entity[]> => {
    const prompt = `Extract all named entities and concepts. Article: ${articleText.substring(0, 15000)}`;
    return callGroq<{entities: Entity[]}>(prompt, '{ "entities": [...] }', FAST_MODEL).then(r => r.entities);
};

export const getEnrichment = async (input: Entity[] | string): Promise<EnrichmentData> => {
    const content = typeof input === 'string' ? input.substring(0, 10000) : input.map(e => e.name).join(', ');
    const prompt = `Provide encyclopedic enrichment data for these entities: ${content}`;
    const result = await callGroq<{enrichmentList: {name: string, summary: string, url?: string}[]}>(prompt, enrichmentSchema, INTELLIGENT_MODEL);
    
    const map: EnrichmentData = {};
    result.enrichmentList?.forEach(item => {
        map[item.name] = { summary: item.summary, url: item.url };
    });
    return map;
};

export const getEsotericMappings = (articleText: string, articleDate: string): Promise<EsotericMappings> => {
    const prompt = `Esoteric analysis for date ${articleDate}. Context: ${articleText.substring(0, 15000)}. ${SYMBOLIC_INSTRUCTION}`;
    return callGroq<EsotericMappings>(prompt, esotericSchema, INTELLIGENT_MODEL);
};

export const getEtymology = (articleText: string): Promise<EtymologyData> => {
    const prompt = `Extract 5-8 root words and their etymology. Article: ${articleText.substring(0, 10000)}`;
    const schema = '{ "items": [{"word": "string", "root": "string", "language": "string", "originalMeaning": "string", "modernConnection": "string"}] }';
    return callGroq<EtymologyData>(prompt, schema, FAST_MODEL);
};

export const getUnifiedCosmicAnalysis = (date: string, location: string, articleText: string): Promise<{cosmicData: CosmicData, synthesis: Synthesis, cosmicWeather: CosmicWeather}> => {
    const prompt = `Cosmic Snapshot for ${date} at ${location}. Article context: ${articleText.substring(0, 10000)}`;
    return callGroq(prompt, unifiedCosmicSchema, INTELLIGENT_MODEL);
};

export const getEntityChronology = (entities: {name: string, type: string}[]): Promise<EntityChronology[]> => {
    const prompt = `Find key historical dates (Birth/Founding/Significant) for: ${entities.map(e => e.name).join(', ')}`;
    const schema = '{ "chronology": [{"entityName": "string", "entityType": "string", "events": [{"dateType": "string", "dateValue": "YYYY-MM-DD", "confidence": "Verified|Estimated"}]}] }';
    return callGroq<{chronology: EntityChronology[]}>(prompt, schema, INTELLIGENT_MODEL).then(r => r.chronology);
};

export const getNumberSymbolism = (number: number): Promise<NumberSymbolism> => {
    const prompt = `What is the esoteric meaning of number ${number}?`;
    const schema = '{ "archetype": "string", "meaning": "string", "qualities": "string" }';
    return callGroq<NumberSymbolism>(prompt, schema, INTELLIGENT_MODEL);
};

export const getChatResponse = async (history: any[], newMessage: string, articleContext: string): Promise<string> => {
    // Standard chat doesn't need JSON schema enforcement, use basic prompt
    const response = await fetch(GROQ_ENDPOINT, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            model: INTELLIGENT_MODEL,
            messages: [
                { role: 'system', content: `You are an AI intelligence analyst. Use this article context to answer the user: ${articleContext.substring(0, 20000)}` },
                ...history.map(h => ({ role: h.role === 'model' ? 'assistant' : 'user', content: h.parts[0].text })),
                { role: 'user', content: newMessage }
            ],
            temperature: 0.7
        })
    });
    
    if (!response.ok) return "Communication link severed. (Groq API Error)";
    const data = await response.json();
    return data.choices[0].message.content;
};

export const processManualInput = async (input: string): Promise<Article> => {
    const isUrl = /^(http|https):\/\/[^ "]+$/.test(input.trim());
    let extractedText = '';
    let extractedTitle = '';

    if (isUrl) {
        try {
            const extractRes = await fetch('/api/extract', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url: input })
            });
            if (extractRes.ok) {
                const data = await extractRes.json();
                extractedText = data.text || '';
                extractedTitle = data.title || '';
            }
        } catch (e) {
            console.warn("URL extraction failed, falling back to Groq summary", e);
        }
    }

    const sourceText = isUrl ? (extractedText || input) : input;
    const prompt = `Summarize this text into JSON: ${sourceText.substring(0, 5000)}`;
    const schema = '{ "title": "string", "description": "string", "date": "YYYY-MM-DD", "category": "string", "location": "string" }';
    const result = await callGroq<any>(prompt, schema, FAST_MODEL);

    return {
        id: `manual-${Date.now()}`,
        title: extractedTitle || result.title || "Manual Transmission",
        description: result.description || "Unidentified Data Stream",
        content: isUrl ? (extractedText || sourceText) : input,
        date: result.date || getLocalDateString(),
        category: result.category || "Classified",
        location: result.location || "Unknown",
        url: isUrl ? input : undefined
    };
};

export const searchGlobalNews = async (searchTerm: string, category: string): Promise<Article[]> => {
    // Note: Groq doesn't have live search. We simulate search results based on the model's training data.
    const query = searchTerm || `Significant events in ${category}`;
    const prompt = `Based on your world knowledge, provide 6 real historical news articles that match this query: ${query}. Return as JSON list.`;
    const schema = '{ "articles": [{"title": "string", "description": "string", "content": "string", "date": "YYYY-MM-DD", "category": "string", "sourceUrl": "string"}] }';
    
    try {
        const result = await callGroq<{articles: any[]}>(prompt, schema, INTELLIGENT_MODEL);
        return (result.articles || []).map((a, i) => ({
            ...a,
            id: `groq-archived-${Date.now()}-${i}`,
            location: "Global"
        }));
    } catch (e) {
        return [];
    }
};
