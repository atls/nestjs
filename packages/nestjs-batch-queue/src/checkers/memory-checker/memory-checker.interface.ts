export interface MemoryCheckerOptions {
  limitMemoryUsage: {
    rss: number
    heapTotal: number
    heapUsed: number
    external: number
    arrayBuffers: number
  }
  schedule: {
    intervalSec: number
  }
}
