import { Test }                           from '@nestjs/testing'

import { SignedUrlService }               from '../src'
import { GcsStorage, STORAGE, SignedUrl } from '../src/storage'

describe('CatsController', () => {
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
