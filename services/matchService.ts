
export interface MatchDatabaseStatus {
  isLoaded: boolean;
  isLoading: boolean;
  recordCount: number;
  error: string | null;
}

export interface MatchResult {
  word: string;
  cipher: string;
}

// Key: The numerical value (e.g., 33)
// Value: An array of MatchResults (word + cipher)
let databaseIndex: Map<number, MatchResult[]> | null = null;

// The specific Google Sheet ID provided
const SHEET_ID = '1OMCA16fEZJqic6JoZKFBhYy3wnB0Rr346VdwQYw_gzM';
const CSV_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv`;

export const getDatabaseStatus = (): MatchDatabaseStatus => {
  return {
    isLoaded: databaseIndex !== null,
    isLoading: false,
    recordCount: databaseIndex ? 0 : 0, 
    error: null
  };
};

export const loadMatchDatabase = async (
  onProgress: (progress: number) => void
): Promise<number> => {
  try {
    const response = await fetch(CSV_URL);
    if (!response.ok) throw new Error(`Failed to fetch database: ${response.statusText}`);
    
    const reader = response.body?.getReader();
    const contentLength = +response.headers.get('Content-Length')! || 50000000; 
    
    if (!reader) throw new Error("Browser does not support stream reading");

    let receivedLength = 0;
    let chunks: Uint8Array[] = [];
    
    while(true) {
      const {done, value} = await reader.read();
      if (done) break;
      chunks.push(value);
      receivedLength += value.length;
      onProgress(Math.min(99, (receivedLength / contentLength) * 50)); 
    }

    const blob = new Blob(chunks);
    const text = await blob.text();
    
    // Parsing Phase
    onProgress(60);
    
    const rows = text.split('\n');
    const totalRows = rows.length;
    
    if (totalRows < 1) return 0;

    // Parse Headers from first row
    const headers = rows[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));

    // Initialize Index
    const newIndex = new Map<number, MatchResult[]>();
    
    for (let i = 1; i < totalRows; i++) { // Skip header
      const row = rows[i];
      if (!row) continue;

      const cols = row.split(',');
      if (cols.length < 2) continue;
      
      const phrase = cols[0].replace(/^"|"$/g, '').trim(); 
      if (!phrase) continue;

      // Iterate through all value columns (Col 1 to End)
      for (let c = 1; c < cols.length; c++) {
        const valStr = cols[c].trim();
        if (!valStr) continue;
        
        const val = parseInt(valStr, 10);
        if (!isNaN(val)) {
          if (!newIndex.has(val)) {
            newIndex.set(val, []);
          }
          
          const cipherName = headers[c] || `Cipher ${c}`;
          newIndex.get(val)?.push({ word: phrase, cipher: cipherName });
        }
      }

      if (i % 50000 === 0) {
        onProgress(60 + ((i / totalRows) * 40));
      }
    }

    databaseIndex = newIndex;
    return rows.length;

  } catch (error) {
    console.error("Database load failed", error);
    throw error;
  }
};

export const findMatchesInDatabase = (targetNumber: number): MatchResult[] => {
  if (!databaseIndex) return [];
  
  const rawMatches = databaseIndex.get(targetNumber);
  if (!rawMatches) return [];

  // Deduplicate based on word+cipher signature
  const unique = new Map<string, MatchResult>();
  rawMatches.forEach(m => {
    unique.set(`${m.word}|${m.cipher}`, m);
  });

  return Array.from(unique.values());
};

export const hasDatabaseMatches = (targetNumber: number): boolean => {
  return databaseIndex ? databaseIndex.has(targetNumber) : false;
};
