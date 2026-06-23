import type { Storage } from '@google-cloud/storage'

export interface TestingGcsStorageFactory {
  create: () => Storage
}
