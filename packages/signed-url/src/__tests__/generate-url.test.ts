import { Test }             from '@nestjs/testing'
import { describe }         from '@jest/globals'
import { expect }           from '@jest/globals'
import { it }               from '@jest/globals'
import { beforeEach }       from '@jest/globals'
import { jest }             from '@jest/globals'

import { SignedUrlService } from '../index.js'
import { GcsStorage }       from '../storage/index.js'
import { STORAGE }          from '../storage/index.js'
import { SignedUrl }        from '../storage/index.js'

describe('SignedUrlService', () => {
  let signedUrlService: SignedUrlService
  const storageProvider = {
    provide: STORAGE,
    useFactory: () => new GcsStorage(),
  }

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [SignedUrlService, storageProvider],
      exports: [SignedUrlService],
    }).compile()

    signedUrlService = moduleRef.get<SignedUrlService>(SignedUrlService)
  })

  describe('generateWriteUrl', () => {
    it('should return a generated write url', async () => {
      const result = new Promise<SignedUrl>((resolve, reject) => {
        resolve({
          url: 'test',
          fields: [],
        })
      })
      jest.spyOn(signedUrlService, 'generateWriteUrl').mockImplementation(() => result)

      expect(
        signedUrlService.generateWriteUrl('test', 'test', {
          type: 'test',
        })
      ).toBe(result)
    })
  })

  describe('generateReadUrl', () => {
    it('should return a generated read url', async () => {
      const result = new Promise<SignedUrl>((resolve, reject) => {
        resolve({
          url: 'test',
          fields: [],
        })
      })
      jest.spyOn(signedUrlService, 'generateReadUrl').mockImplementation(() => result)

      expect(signedUrlService.generateReadUrl('test', 'test')).toBe(result)
    })
  })
})
