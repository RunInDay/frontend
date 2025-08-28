interface CacheItem<T> {
  data: T
  timestamp: number
  ttl: number // Time to live in milliseconds
}

interface CacheStorage {
  [key: string]: CacheItem<unknown>
}

const CACHE_PREFIX = 'tour_cache_'
const MAX_CACHE_ENTRIES = 100

export class ApiCache {
  private storage: Storage | null

  constructor(useSessionStorage = true) {
    // Check if we're in a browser environment
    if (typeof window !== 'undefined') {
      this.storage = useSessionStorage ? sessionStorage : localStorage
    } else {
      this.storage = null
    }
  }

  private generateKey(endpoint: string, params: Record<string, unknown>): string {
    // Sort parameters to ensure consistent cache keys
    const sortedParams = Object.keys(params)
      .sort()
      .reduce((result: Record<string, unknown>, key) => {
        if (params[key] !== undefined && params[key] !== '') {
          result[key] = params[key]
        }
        return result
      }, {})

    const paramString = new URLSearchParams(
      Object.entries(sortedParams).map(([key, value]) => [key, String(value)])
    ).toString()

    return `${CACHE_PREFIX}${endpoint}_${paramString}`
  }

  private isExpired(item: CacheItem<unknown>): boolean {
    return Date.now() - item.timestamp > item.ttl
  }

  private getAllCacheKeys(): string[] {
    if (!this.storage) return []
    
    const keys: string[] = []
    for (let i = 0; i < this.storage.length; i++) {
      const key = this.storage.key(i)
      if (key && key.startsWith(CACHE_PREFIX)) {
        keys.push(key)
      }
    }
    return keys
  }

  private enforceCacheLimit(): void {
    const cacheKeys = this.getAllCacheKeys()
    
    if (cacheKeys.length <= MAX_CACHE_ENTRIES) {
      return
    }

    // Get all cache items with their timestamps
    const cacheItems = cacheKeys
      .map(key => {
        try {
          const item = JSON.parse(this.storage?.getItem(key) || '{}')
          return { key, timestamp: item.timestamp || 0 }
        } catch {
          return { key, timestamp: 0 }
        }
      })
      .sort((a, b) => a.timestamp - b.timestamp) // Sort by oldest first

    // Remove oldest entries
    const itemsToRemove = cacheItems.slice(0, cacheKeys.length - MAX_CACHE_ENTRIES + 10)
    itemsToRemove.forEach(item => {
      this.storage?.removeItem(item.key)
    })
  }

  get<T>(endpoint: string, params: Record<string, unknown>): T | null {
    if (!this.storage) return null
    
    const key = this.generateKey(endpoint, params)
    
    try {
      const cached = this.storage.getItem(key)
      if (!cached) {
        return null
      }

      const item: CacheItem<T> = JSON.parse(cached)
      
      if (this.isExpired(item)) {
        this.storage.removeItem(key)
        return null
      }

      return item.data
    } catch (error) {
      console.warn('Failed to read from cache:', error)
      this.storage.removeItem(key)
      return null
    }
  }

  set<T>(endpoint: string, params: Record<string, unknown>, data: T, ttlMinutes: number = 15): void {
    if (!this.storage) return
    
    const key = this.generateKey(endpoint, params)
    const item: CacheItem<T> = {
      data,
      timestamp: Date.now(),
      ttl: ttlMinutes * 60 * 1000
    }

    try {
      this.storage.setItem(key, JSON.stringify(item))
      this.enforceCacheLimit()
    } catch (error) {
      console.warn('Failed to write to cache:', error)
      // If storage is full, try to clear some space and retry
      this.clearExpired()
      try {
        this.storage.setItem(key, JSON.stringify(item))
      } catch (retryError) {
        console.warn('Failed to write to cache after cleanup:', retryError)
      }
    }
  }

  clearExpired(): number {
    const cacheKeys = this.getAllCacheKeys()
    let removedCount = 0

    cacheKeys.forEach(key => {
      try {
        const cached = this.storage?.getItem(key)
        if (!cached) return

        const item: CacheItem<unknown> = JSON.parse(cached)
        if (this.isExpired(item)) {
          this.storage?.removeItem(key)
          removedCount++
        }
      } catch (error) {
        // Remove corrupted cache entries
        this.storage?.removeItem(key)
        removedCount++
      }
    })

    return removedCount
  }

  clear(): void {
    if (!this.storage) return
    
    const cacheKeys = this.getAllCacheKeys()
    cacheKeys.forEach(key => {
      this.storage?.removeItem(key)
    })
  }

  getCacheStats(): { total: number; expired: number; size: string } {
    const cacheKeys = this.getAllCacheKeys()
    let expired = 0
    let totalSize = 0

    cacheKeys.forEach(key => {
      try {
        const cached = this.storage?.getItem(key) || ''
        totalSize += cached.length
        
        const item: CacheItem<unknown> = JSON.parse(cached)
        if (this.isExpired(item)) {
          expired++
        }
      } catch {
        expired++
      }
    })

    return {
      total: cacheKeys.length,
      expired,
      size: `${(totalSize / 1024).toFixed(2)} KB`
    }
  }
}

// Default cache instance using sessionStorage
export const apiCache = new ApiCache(true)

// Initialize cache cleanup on app start
if (typeof window !== 'undefined') {
  // Clean expired entries on load
  const cleanupCount = apiCache.clearExpired()
  if (cleanupCount > 0) {
    console.log(`Cleaned up ${cleanupCount} expired cache entries`)
  }
}