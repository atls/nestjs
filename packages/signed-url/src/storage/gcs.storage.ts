import { Injectable }      from '@nestjs/common'
import { OnModuleInit }    from '@nestjs/common'

import { AbstractStorage } from './abstract.storage.js'
import { SignUrlOptions }  from './storage.interfaces.js'
import { SignedUrl }       from './storage.interfaces.js'

@Injectable()
export class GcsStorage extends AbstractStorage implements OnModuleInit {
  storage: any

  bucket: string

  onModuleInit() {
    const { Storage } = require('@google-cloud/storage')

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

    const [url] = await this.storage.bucket(bucket).file(filename).getSignedUrl(params)

    return { url, fields: [] }
  }

  async generateReadUrl(bucket: string, filename: string): Promise<SignedUrl> {
    const params = {
      version: 'v4',
      action: 'read',
      expires: Date.now() + 15 * 60 * 1000,
    }

    const [url] = await this.storage.bucket(bucket).file(filename).getSignedUrl(params)

    return { url, fields: [] }
  }
}
