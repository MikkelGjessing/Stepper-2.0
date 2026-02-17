// KB Loader Module
// Handles fetching KB from remote source, caching, and fallback to mock KB

import { findBestMatch as mockFindBestMatch, getAllArticles as mockGetAllArticles } from './kb.js';

// Storage keys
const STORAGE_KEY_KB = 'cached_kb';
const STORAGE_KEY_TIMESTAMP = 'cached_kb_timestamp';
const STORAGE_KEY_SOURCE_URL = 'kb_source_url';

// Default KB source URL (empty by default, can be set via options)
let kbSourceUrl = '';

// In-memory cache for current session
let cachedKB = null;

// Promise to track initialization status
let initPromise = null;

/**
 * Initialize the KB loader by loading the source URL from storage
 */
async function initKBLoader() {
  try {
    const result = await chrome.storage.local.get([STORAGE_KEY_SOURCE_URL]);
    if (result[STORAGE_KEY_SOURCE_URL]) {
      kbSourceUrl = result[STORAGE_KEY_SOURCE_URL];
    }
  } catch (error) {
    console.warn('Failed to load KB source URL from storage:', error);
  }
}

/**
 * Ensure initialization is complete before proceeding
 */
async function ensureInitialized() {
  if (initPromise) {
    await initPromise;
  }
}

/**
 * Set the KB source URL and save it to storage
 * @param {string} url - The URL to fetch KB from
 */
async function setKBSourceUrl(url) {
  kbSourceUrl = url;
  try {
    await chrome.storage.local.set({ [STORAGE_KEY_SOURCE_URL]: url });
  } catch (error) {
    console.error('Failed to save KB source URL:', error);
  }
}

/**
 * Get the current KB source URL
 * @returns {string} - The current KB source URL
 */
function getKBSourceUrl() {
  return kbSourceUrl;
}

/**
 * Fetch KB from remote URL
 * @param {string} url - The URL to fetch from
 * @returns {Promise<Array>} - Array of KB articles
 */
async function fetchRemoteKB(url) {
  if (!url || url.trim() === '') {
    throw new Error('No KB source URL configured');
  }

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const data = await response.json();
  
  // Validate that it's an array
  if (!Array.isArray(data)) {
    throw new Error('Invalid KB format: expected array of articles');
  }

  return data;
}

/**
 * Save KB to extension storage with timestamp
 * @param {Array} kb - The KB articles to cache
 */
async function cacheKB(kb) {
  try {
    const timestamp = Date.now();
    await chrome.storage.local.set({
      [STORAGE_KEY_KB]: kb,
      [STORAGE_KEY_TIMESTAMP]: timestamp
    });
    console.log('KB cached successfully at', new Date(timestamp).toISOString());
  } catch (error) {
    console.error('Failed to cache KB:', error);
  }
}

/**
 * Load KB from extension storage
 * @returns {Promise<Object|null>} - Object with kb and timestamp, or null if not found
 */
async function loadCachedKB() {
  try {
    const result = await chrome.storage.local.get([STORAGE_KEY_KB, STORAGE_KEY_TIMESTAMP]);
    if (result[STORAGE_KEY_KB] && result[STORAGE_KEY_TIMESTAMP]) {
      return {
        kb: result[STORAGE_KEY_KB],
        timestamp: result[STORAGE_KEY_TIMESTAMP]
      };
    }
  } catch (error) {
    console.error('Failed to load cached KB:', error);
  }
  return null;
}

/**
 * Get the mock KB as fallback
 * @returns {Array} - Mock KB articles
 */
function getMockKB() {
  return mockGetAllArticles();
}

/**
 * Load KB with the following priority:
 * 1. Use in-memory cache if available
 * 2. Try to fetch from remote URL if configured
 * 3. Use cached KB from storage if available
 * 4. Fallback to mock KB
 * @param {boolean} forceRefresh - If true, bypass cache and fetch fresh
 * @returns {Promise<Object>} - Object with kb array and metadata
 */
async function loadKB(forceRefresh = false) {
  // Ensure initialization is complete before proceeding
  await ensureInitialized();

  // Return in-memory cache if available and not forcing refresh
  if (!forceRefresh && cachedKB !== null) {
    return {
      kb: cachedKB,
      source: 'memory',
      timestamp: null
    };
  }

  // Try to fetch from remote URL if configured
  if (kbSourceUrl && kbSourceUrl.trim() !== '') {
    try {
      console.log('Fetching KB from remote URL:', kbSourceUrl);
      const kb = await fetchRemoteKB(kbSourceUrl);
      
      // Cache the fetched KB
      await cacheKB(kb);
      cachedKB = kb;
      
      return {
        kb: kb,
        source: 'remote',
        timestamp: Date.now()
      };
    } catch (error) {
      console.warn('Failed to fetch remote KB, trying cache:', error.message);
    }
  }

  // Try to load from cached storage
  const cached = await loadCachedKB();
  if (cached && cached.kb && cached.kb.length > 0) {
    cachedKB = cached.kb;
    return {
      kb: cached.kb,
      source: 'cache',
      timestamp: cached.timestamp
    };
  }

  // Fallback to mock KB
  console.log('Using mock KB as fallback');
  const mockKB = getMockKB();
  cachedKB = mockKB;
  
  return {
    kb: mockKB,
    source: 'mock',
    timestamp: null
  };
}

/**
 * Refresh the KB by forcing a fetch from remote source
 * @returns {Promise<Object>} - Result of loadKB with forceRefresh=true
 */
async function refreshKB() {
  cachedKB = null; // Clear in-memory cache
  return await loadKB(true);
}

/**
 * Search for the best matching article based on the user's issue
 * @param {string} query - The user's issue description
 * @returns {Promise<object|null>} - The best matching article or null if no match
 */
async function findBestMatch(query) {
  if (!query || query.trim().length === 0) {
    return null;
  }

  // Load KB (will use cache if available)
  const kbData = await loadKB();
  const knowledgeBase = kbData.kb;

  const queryLower = query.toLowerCase();
  const queryWords = queryLower.split(/\s+/);
  
  let bestMatch = null;
  let highestScore = 0;

  knowledgeBase.forEach(article => {
    let score = 0;
    
    // Check keyword matches
    if (article.keywords && Array.isArray(article.keywords)) {
      article.keywords.forEach(keyword => {
        const keywordLower = keyword.toLowerCase();
        if (queryLower.includes(keywordLower)) {
          score += 10; // Strong match for keyword
        }
        
        // Check for partial word matches
        queryWords.forEach(word => {
          if (word.length > 3 && keywordLower.includes(word)) {
            score += 5;
          }
        });
      });
    }
    
    // Check title matches
    if (article.title && queryLower.includes(article.title.toLowerCase())) {
      score += 15;
    }
    
    if (score > highestScore) {
      highestScore = score;
      bestMatch = article;
    }
  });

  // Return match only if score is above threshold
  return highestScore > 5 ? bestMatch : null;
}

/**
 * Get all available articles
 * @returns {Promise<array>} - All articles in the knowledge base
 */
async function getAllArticles() {
  const kbData = await loadKB();
  return kbData.kb;
}

/**
 * Get cache metadata
 * @returns {Promise<Object>} - Information about the current cache
 */
async function getCacheInfo() {
  // Ensure initialization is complete before proceeding
  await ensureInitialized();
  
  const cached = await loadCachedKB();
  return {
    hasCachedKB: cached !== null,
    timestamp: cached ? cached.timestamp : null,
    timestampDate: cached ? new Date(cached.timestamp).toISOString() : null,
    articleCount: cached ? cached.kb.length : 0,
    sourceUrl: kbSourceUrl
  };
}

// Initialize on module load and store the promise
initPromise = initKBLoader();

// Export functions for use in other modules
export { 
  findBestMatch, 
  getAllArticles, 
  loadKB, 
  refreshKB, 
  setKBSourceUrl, 
  getKBSourceUrl,
  getCacheInfo,
  initKBLoader 
};
