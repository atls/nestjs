import type { TestingModule }                  from '@nestjs/testing'

import type { TestingSignedUrlGateway }        from '../../tests/fixtures/signer.interfaces.js'

import assert                                  from 'node:assert/strict'
import { afterEach }                           from 'node:test'
import { describe }                            from 'node:test'
import { it }                                  from 'node:test'

import { Test }                                from '@nestjs/testing'

import { SIGNED_URL_GATEWAY }                  from '../../src/constants.js'
import { SignedUrlModule }                     from '../../src/module/index.js'
import { SignedUrlSigner }                     from '../../src/signer.js'
import { TESTING_SIGNED_URL_GATEWAY }          from './fixtures/constants.js'
import { TestingSignedUrlGatewayConsumer }     from './fixtures/consumer.js'
import { TestingSignedUrlGatewayImpl }         from './fixtures/gateway.js'
import { createTestingSignedUrlGateway }       from '../../tests/fixtures/signer.fixture.js'
import { createTestingSignedUrlGatewayModule } from './fixtures/module.js'

describe('SignedUrlModule register APIs', () => {
  let moduleRef: TestingModule | undefined

  afterEach(async () => {
    await moduleRef?.close()
    moduleRef = undefined
  })

  it('wires a gateway through register useValue', async () => {
    const gateway = createTestingSignedUrlGateway()

    moduleRef = await Test.createTestingModule({
      imports: [SignedUrlModule.register({ useValue: gateway })],
      providers: [TestingSignedUrlGatewayConsumer],
    }).compile()

    const signer = moduleRef.get(SignedUrlSigner)
    const signedUrlGateway = moduleRef.get<TestingSignedUrlGateway>(SIGNED_URL_GATEWAY)
    const consumer = moduleRef.get(TestingSignedUrlGatewayConsumer)

    assert.equal(signedUrlGateway, gateway)
    assert.equal(consumer.gateway, gateway)

    const value = await signer.generateWriteUrl('bucket', 'file.png', {
      contentType: 'image/png',
      expiresAt: 1730000000000,
    })

    assert.deepEqual(value, {
      url: 'write-url',
      fields: [],
    })
    assert.deepEqual(gateway.writeCalls, [
      {
        bucket: 'bucket',
        filename: 'file.png',
        options: {
          contentType: 'image/png',
          expiresAt: 1730000000000,
        },
      },
    ])
  })

  it('wires a gateway through register useExisting', async () => {
    const gateway = createTestingSignedUrlGateway()

    moduleRef = await Test.createTestingModule({
      imports: [
        SignedUrlModule.register({
          imports: [createTestingSignedUrlGatewayModule(gateway)],
          useExisting: TESTING_SIGNED_URL_GATEWAY,
        }),
      ],
      providers: [TestingSignedUrlGatewayConsumer],
    }).compile()

    const signedUrlGateway = moduleRef.get<TestingSignedUrlGateway>(SIGNED_URL_GATEWAY)
    const consumer = moduleRef.get(TestingSignedUrlGatewayConsumer)

    assert.equal(signedUrlGateway, gateway)
    assert.equal(consumer.gateway, gateway)
  })

  it('wires a gateway through register useClass', async () => {
    const gateway = createTestingSignedUrlGateway()

    moduleRef = await Test.createTestingModule({
      imports: [
        SignedUrlModule.register({
          imports: [createTestingSignedUrlGatewayModule(gateway)],
          useClass: TestingSignedUrlGatewayImpl,
        }),
      ],
    }).compile()

    const signer = moduleRef.get(SignedUrlSigner)

    await signer.generateReadUrl('bucket', 'file.png')

    assert.deepEqual(gateway.readCalls, [
      {
        bucket: 'bucket',
        filename: 'file.png',
        options: undefined,
      },
    ])
  })

  it('wires a gateway through registerAsync useFactory', async () => {
    const gateway = createTestingSignedUrlGateway()

    moduleRef = await Test.createTestingModule({
      imports: [
        SignedUrlModule.registerAsync<[TestingSignedUrlGateway]>({
          imports: [createTestingSignedUrlGatewayModule(gateway)],
          inject: [TESTING_SIGNED_URL_GATEWAY],
          useFactory: (signedUrlGateway: TestingSignedUrlGateway) => signedUrlGateway,
        }),
      ],
    }).compile()

    const signer = moduleRef.get(SignedUrlSigner)

    const value = await signer.generateReadUrl('bucket', 'file.png', {
      expiresInSeconds: 60,
    })

    assert.deepEqual(value, {
      url: 'read-url',
      fields: [],
    })
    assert.deepEqual(gateway.readCalls, [
      {
        bucket: 'bucket',
        filename: 'file.png',
        options: {
          expiresInSeconds: 60,
        },
      },
    ])
  })

  it('wires a gateway through registerAsync useClass', async () => {
    const gateway = createTestingSignedUrlGateway()

    moduleRef = await Test.createTestingModule({
      imports: [
        SignedUrlModule.registerAsync({
          imports: [createTestingSignedUrlGatewayModule(gateway)],
          useClass: TestingSignedUrlGatewayImpl,
        }),
      ],
    }).compile()

    const signer = moduleRef.get(SignedUrlSigner)

    await signer.generateReadUrl('bucket', 'file.png')

    assert.deepEqual(gateway.readCalls, [
      {
        bucket: 'bucket',
        filename: 'file.png',
        options: undefined,
      },
    ])
  })

  it('wires a gateway through registerAsync useExisting', async () => {
    const gateway = createTestingSignedUrlGateway()

    moduleRef = await Test.createTestingModule({
      imports: [
        SignedUrlModule.registerAsync({
          imports: [createTestingSignedUrlGatewayModule(gateway)],
          useExisting: TESTING_SIGNED_URL_GATEWAY,
        }),
      ],
    }).compile()

    const signer = moduleRef.get(SignedUrlSigner)

    await signer.generateReadUrl('bucket', 'file.png')

    assert.deepEqual(gateway.readCalls, [
      {
        bucket: 'bucket',
        filename: 'file.png',
        options: undefined,
      },
    ])
  })
})
