import type { INestMicroservice }          from '@nestjs/common'

import type { ServerReflectionClient }     from '../../src/index.js'
import type { ServerReflectionRequest }    from '../../src/index.js'

import assert                              from 'node:assert/strict'
import path                                from 'node:path'
import { after }                           from 'node:test'
import { before }                          from 'node:test'
import { describe }                        from 'node:test'
import { it }                              from 'node:test'
import { fileURLToPath }                   from 'node:url'

import { ClientsModule }                   from '@nestjs/microservices'
import { Transport }                       from '@nestjs/microservices'
import { Test }                            from '@nestjs/testing'
import * as googleDescriptorProto          from 'google-protobuf/google/protobuf/descriptor_pb.js'
import { ReplaySubject }                   from 'rxjs'
import { lastValueFrom }                   from 'rxjs'
import getPort                             from 'get-port'

import { GrpcReflectionIntegrationModule } from '../src/index.js'
import { serverOptions }                   from '../src/index.js'

const descriptorProto =
  'default' in googleDescriptorProto ? googleDescriptorProto.default : googleDescriptorProto

const moduleDir = path.dirname(fileURLToPath(import.meta.url))

describe('grpc reflection', () => {
  let service: INestMicroservice
  let serverReflection: ServerReflectionClient

  before(async () => {
    const servicePort = await getPort()

    const testingModule = await Test.createTestingModule({
      imports: [
        GrpcReflectionIntegrationModule,
        ClientsModule.register([
          {
            name: 'client',
            transport: Transport.GRPC,
            options: {
              url: `127.0.0.1:${servicePort}`,
              package: 'grpc.reflection.v1',
              protoPath: path.join(moduleDir, '../../proto/grpc/reflection/v1/reflection.proto'),
              loader: {
                arrays: true,
                keepCase: false,
                defaults: true,
                oneofs: true,
                includeDirs: [],
              },
            },
          },
        ]),
      ],
    }).compile()

    service = testingModule.createNestMicroservice({
      ...serverOptions,
      options: {
        ...serverOptions.options,
        url: `127.0.0.1:${servicePort}`,
      },
    })

    await service.init()

    await service.listen()

    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    serverReflection = service.get('client').getService('ServerReflection')
  })

  after(async () => {
    await service.close()
  })

  it(`list services`, async () => {
    const request = new ReplaySubject<ServerReflectionRequest>()

    request.next({
      host: '',
      listServices: 'true',
      fileByFilename: undefined,
      fileContainingSymbol: undefined,
      allExtensionNumbersOfType: undefined,
    })

    request.complete()

    const response = await lastValueFrom(
      serverReflection.serverReflectionInfo(request.asObservable())
    )

    const services = response.listServicesResponse?.service ?? []
    assert.ok(
      services.some(
        (reflectionService) => reflectionService.name === 'grpc.reflection.v1.ServerReflection'
      )
    )
  })

  it(`file containing symbol`, async () => {
    const request = new ReplaySubject<ServerReflectionRequest>()

    request.next({
      host: '',
      listServices: undefined,
      fileByFilename: undefined,
      allExtensionNumbersOfType: undefined,
      fileContainingSymbol: 'grpc.reflection.v1.ServerReflection',
    })

    request.complete()

    const response = await lastValueFrom(
      serverReflection.serverReflectionInfo(request.asObservable())
    )

    if (!response.fileDescriptorResponse) {
      return
    }

    const descriptor = descriptorProto.FileDescriptorProto.deserializeBinary(
      response.fileDescriptorResponse.fileDescriptorProto[0]
    )

    assert.ok(descriptor.toArray().includes('grpc_reflection_v1.proto'))
  })
})
