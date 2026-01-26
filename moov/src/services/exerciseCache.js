/**
 * Exercise Cache Service
 * 
 * Caches generated exercises in localStorage to minimize API calls.
 * Uses profile hashing to identify when cached exercises are still valid.
 * 
 * Features:
 * - 24-hour cache duration (configurable)
 * - Profile-based cache keys
 * - Automatic cache invalidation on profile changes
 * - Storage size management
 */

// Cache configuration
const CACHE_KEY = 'moov_exercise_cache';
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
const MAX_CACHE_ENTRIES = 10; // Maximum number of profile caches to keep

/**
 * Generates a hash from user profile for cache keying
 * Changes to any relevant profile field will generate a different hash
 * 
 * @param {Object} profile - User's onboarding profile
 * @returns {string} Hash string
 */
export function generateProfileHash(profile) {
  // Extract relevant fields that affect exercise generation
  const relevantData = {
    movementPosition: profile.movementPosition || 'sitting',
    overheadRange: profile.overheadRange || 'full',
    gripStrength: profile.gripStrength || 'strong',
    energyFlow: profile.energyFlow || 'standard',
    redZones: (profile.redZones || []).sort().join(','),
    assistiveGear: (profile.assistiveGear || []).sort().join(','),
  };
  
  // Create a simple hash from the JSON string
  const jsonStr = JSON.stringify(relevantData);
  let hash = 0;
  for (let i = 0; i < jsonStr.length; i++) {
    const char = jsonStr.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  
  return `profile_${Math.abs(hash).toString(16)}`;
}

/**
 * Gets cached exercises for a profile hash
 * Returns null if cache is expired or doesn't exist
 * 
 * @param {string} profileHash - Profile hash from generateProfileHash
 * @returns {Array|null} Cached exercises or null
 */
export function getCachedExercises(profileHash) {
  try {
    const cacheStr = localStorage.getItem(CACHE_KEY);
    if (!cacheStr) return null;
    
    const cache = JSON.parse(cacheStr);
    const entry = cache[profileHash];
    
    if (!entry) return null;
    
    // Check if cache is expired
    const age = Date.now() - entry.timestamp;
    if (age > CACHE_DURATION) {
      console.log('Cache expired for profile:', profileHash);
      removeCacheEntry(profileHash);
      return null;
    }
    
    console.log(`Cache hit for profile ${profileHash}, age: ${Math.round(age / 1000 / 60)} minutes`);
    return entry.exercises;
    
  } catch (error) {
    console.error('Error reading exercise cache:', error);
    return null;
  }
}

/**
 * Caches exercises for a profile hash
 * 
 * @param {string} profileHash - Profile hash from generateProfileHash
 * @param {Array} exercises - Exercises to cache
 */
export function cacheExercises(profileHash, exercises) {
  try {
    const cacheStr = localStorage.getItem(CACHE_KEY);
    let cache = cacheStr ? JSON.parse(cacheStr) : {};
    
    // Add new entry
    cache[profileHash] = {
      exercises,
      timestamp: Date.now(),
      count: exercises.length,
    };
    
    // Prune old entries if we have too many
    const entries = Object.entries(cache);
    if (entries.length > MAX_CACHE_ENTRIES) {
      // Sort by timestamp (oldest first) and remove oldest
      entries.sort((a, b) => a[1].timestamp - b[1].timestamp);
      const toRemove = entries.slice(0, entries.length - MAX_CACHE_ENTRIES);
      toRemove.forEach(([key]) => delete cache[key]);
      console.log(`Pruned ${toRemove.length} old cache entries`);
    }
    
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
    console.log(`Cached ${exercises.length} exercises for profile ${profileHash}`);
    
  } catch (error) {
    console.error('Error caching exercises:', error);
    
    // If storage is full, clear cache and try again
    if (error.name === 'QuotaExceededError') {
      clearCache();
      try {
        localStorage.setItem(CACHE_KEY, JSON.stringify({
          [profileHash]: {
            exercises,
            timestamp: Date.now(),
            count: exercises.length,
          }
        }));
      } catch (retryError) {
        console.error('Failed to cache even after clearing:', retryError);
      }
    }
  }
}

/**
 * Removes a specific cache entry
 * 
 * @param {string} profileHash - Profile hash to remove
 */
export function removeCacheEntry(profileHash) {
  try {
    const cacheStr = localStorage.getItem(CACHE_KEY);
    if (!cacheStr) return;
    
    const cache = JSON.parse(cacheStr);
    delete cache[profileHash];
    
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
    console.log(`Removed cache entry for profile ${profileHash}`);
    
  } catch (error) {
    console.error('Error removing cache entry:', error);
  }
}

/**
 * Clears all cached exercises
 */
export function clearCache() {
  try {
    localStorage.removeItem(CACHE_KEY);
    console.log('Cleared exercise cache');
  } catch (error) {
    console.error('Error clearing cache:', error);
  }
}

/**
 * Gets cache statistics
 * 
 * @returns {Object} Cache statistics
 */
export function getCacheStats() {
  try {
    const cacheStr = localStorage.getItem(CACHE_KEY);
    if (!cacheStr) {
      return {
        entries: 0,
        totalExercises: 0,
        oldestEntry: null,
        newestEntry: null,
        sizeBytes: 0,
      };
    }
    
    const cache = JSON.parse(cacheStr);
    const entries = Object.entries(cache);
    
    if (entries.length === 0) {
      return {
        entries: 0,
        totalExercises: 0,
        oldestEntry: null,
        newestEntry: null,
        sizeBytes: cacheStr.length,
      };
    }
    
    const timestamps = entries.map(([, v]) => v.timestamp);
    const totalExercises = entries.reduce((sum, [, v]) => sum + (v.count || 0), 0);
    
    return {
      entries: entries.length,
      totalExercises,
      oldestEntry: new Date(Math.min(...timestamps)),
      newestEntry: new Date(Math.max(...timestamps)),
      sizeBytes: cacheStr.length,
      sizeKB: (cacheStr.length / 1024).toFixed(2),
    };
    
  } catch (error) {
    console.error('Error getting cache stats:', error);
    return { error: error.message };
  }
}

/**
 * Checks if cache needs refresh based on profile
 * 
 * @param {Object} profile - User's current profile
 * @returns {boolean} True if cache should be refreshed
 */
export function shouldRefreshCache(profile) {
  const profileHash = generateProfileHash(profile);
  const cached = getCachedExercises(profileHash);
  return cached === null;
}

/**
 * Gets the age of cached exercises for a profile
 * 
 * @param {Object} profile - User's profile
 * @returns {number|null} Age in milliseconds, or null if not cached
 */
export function getCacheAge(profile) {
  try {
    const profileHash = generateProfileHash(profile);
    const cacheStr = localStorage.getItem(CACHE_KEY);
    if (!cacheStr) return null;
    
    const cache = JSON.parse(cacheStr);
    const entry = cache[profileHash];
    
    if (!entry) return null;
    
    return Date.now() - entry.timestamp;
    
  } catch (error) {
    return null;
  }
}

/**
 * Updates the timestamp of a cache entry (extends its life)
 * Useful when exercises are actively being used
 * 
 * @param {string} profileHash - Profile hash to refresh
 */
export function refreshCacheTimestamp(profileHash) {
  try {
    const cacheStr = localStorage.getItem(CACHE_KEY);
    if (!cacheStr) return;
    
    const cache = JSON.parse(cacheStr);
    if (cache[profileHash]) {
      cache[profileHash].timestamp = Date.now();
      localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
    }
    
  } catch (error) {
    console.error('Error refreshing cache timestamp:', error);
  }
}
