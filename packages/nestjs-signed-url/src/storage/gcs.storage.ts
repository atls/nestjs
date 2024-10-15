import type { OnModuleInit }   from '@nestjs/common'

import type { SignUrlOptions } from './storage.interfaces.js'
import type { SignedUrl }      from './storage.interfaces.js'

import { Storage }             from '@google-cloud/storage'
import { Injectable }          from '@nestjs/common'

import { AbstractStorage }     from './abstract.storage.js'

@Injectable()
export class GcsStorage extends AbstractStorage implements OnModuleInit {
  storage: Storage

  bucket: string

  onModuleInit(): void {
    this.storage = new Storage()
  }

  async generateWriteUrl(
    bucketName: string,
    filename: string,
    options: SignUrlOptions
  ): Promise<SignedUrl> {
    const params = {
      version: 'v4' as const,
      action: 'write' as const,
      expires: Date.now() + 15 * 60 * 1000,
      contentType: options.type,
    }

    const bucket = this.storage.bucket(bucketName)
    const file = bucket.file(filename)
    const [url] = await file.getSignedUrl(params)

    return { url, fields: [] }
  }

  async generateReadUrl(bucket: string, filename: string): Promise<SignedUrl> {
    const params = {
      version: 'v4' as const,
      action: 'read' as const,
      expires: Date.now() + 15 * 60 * 1000,
    }

    const [url] = await this.storage.bucket(bucket).file(filename).getSignedUrl(params)

    return { url, fields: [] }
  }
}
