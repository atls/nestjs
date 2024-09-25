import type { OnModuleInit }   from '@nestjs/common'

import type { SignUrlOptions } from './storage.interfaces.js'
import type { SignedUrl }      from './storage.interfaces.js'

import { Injectable }          from '@nestjs/common'

import { AbstractStorage }     from './abstract.storage.js'

@Injectable()
export class GcsStorage extends AbstractStorage implements OnModuleInit {
  storage: any

  bucket: string

  onModuleInit(): void {
    // eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-var-requires
    const { Storage } = require('@google-cloud/storage')

    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    this.storage = new Storage()
  }

  async generateWriteUrl(
    bucket: string,
    filename: string,
    options: SignUrlOptions
  ): Promise<SignedUrl> {
    const params = {
      version: 'v4',
      action: 'write',
      expires: Date.now() + 15 * 60 * 1000,
      contentType: options.type,
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    const [url] = await this.storage.bucket(bucket).file(filename).getSignedUrl(params)

    return { url, fields: [] }
  }

  async generateReadUrl(bucket: string, filename: string): Promise<SignedUrl> {
    const params = {
      version: 'v4',
      action: 'read',
      expires: Date.now() + 15 * 60 * 1000,
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    const [url] = await this.storage.bucket(bucket).file(filename).getSignedUrl(params)

    return { url, fields: [] }
  }
}
