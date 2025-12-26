import type { SignedUrl }   from '../storage/index.js'

import assert               from 'node:assert/strict'
import { beforeEach }       from 'node:test'
import { describe }         from 'node:test'
import { it }               from 'node:test'
import { mock }             from 'node:test'

import { Test }             from '@nestjs/testing'

import { SignedUrlService } from '../index.js'
import { GcsStorage }       from '../storage/index.js'
import { STORAGE }          from '../storage/index.js'

describe('SignedUrlService', () => {
  let signedUrlService: SignedUrlService
  const storageProvider = {
    provide: STORAGE,
    useFactory: (): GcsStorage => new GcsStorage(),
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
      const expected: SignedUrl = {
        url: 'test',
        fields: [],
      }
      const result = Promise.resolve(expected)
      const spy = mock.method(signedUrlService, 'generateWriteUrl', async () => result)

      const value = await signedUrlService.generateWriteUrl('test', 'test', {
        type: 'test',
      })

      assert.deepEqual(value, expected)

      spy.mock.restore()
    })
  })

  describe('generateReadUrl', () => {
    it('should return a generated read url', async () => {
      const expected: SignedUrl = {
        url: 'test',
        fields: [],
      }
      const result = Promise.resolve(expected)
      const spy = mock.method(signedUrlService, 'generateReadUrl', async () => result)

      const value = await signedUrlService.generateReadUrl('test', 'test')

      assert.deepEqual(value, expected)

      spy.mock.restore()
    })
  })
})
