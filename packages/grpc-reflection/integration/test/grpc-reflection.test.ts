/**
 * @jest-environment node
 */

import { INestMicroservice }                         from '@nestjs/common'
import { ClientsModule }                             from '@nestjs/microservices'
import { Transport }                                 from '@nestjs/microservices'
import { Test }                                      from '@nestjs/testing'
import { describe }                                  from '@jest/globals'
import { beforeAll }                       from '@jest/globals'
import { it }                   from '@jest/globals'
import { expect }           from '@jest/globals'
import { afterAll } from '@jest/globals'
// @ts-ignore
import { FileDescriptorProto }                       from 'google-protobuf/google/protobuf/descriptor_pb'
import { ReplaySubject }                             from 'rxjs'
import getPort                                       from 'get-port'
import path                                          from 'path'

import { ServerReflectionClient }                    from '../../src/index.js'
import { ServerReflectionRequest }                   from '../../src/index.js'
import { GrpcReflectionIntegrationModule }           from '../src/index.js'
import { serverOptions }                             from '../src/index.js'

describe('grpc reflection', () => {
  let service: INestMicroservice
  let serverReflection: ServerReflectionClient

  beforeAll(async () => {
    const servicePort = await getPort()

    const module = await Test.createTestingModule({
      imports: [
        GrpcReflectionIntegrationModule,
        ClientsModule.register([
          {
            name: 'client',
            transport: Transport.GRPC,
            options: {
              url: `0.0.0.0:${servicePort}`,
              package: 'grpc.reflection.v1alpha',
              protoPath: path.join(
                __dirname,
                '../../proto/grpc/reflection/v1alpha/reflection.proto'
              ),
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

    service = module.createNestMicroservice({
      ...serverOptions,
      options: {
        ...serverOptions.options,
        url: `0.0.0.0:${servicePort}`,
      },
    })

    await service.init()

    await service.listen()

    serverReflection = service.get('client').getService('ServerReflection')
  })

  afterAll(async () => {
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

    const response = await serverReflection.serverReflectionInfo(request.asObservable()).toPromise()

    expect(response?.listServicesResponse?.service).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          name: 'grpc.reflection.v1alpha.ServerReflection',
        }),
      ])
    )
  })

  it(`file containing symbol`, async () => {
    const request = new ReplaySubject<ServerReflectionRequest>()

    request.next({
      host: '',
      listServices: undefined,
      fileByFilename: undefined,
      allExtensionNumbersOfType: undefined,
      fileContainingSymbol: 'grpc.reflection.v1alpha.ServerReflection',
    })

    request.complete()

    const response = await serverReflection.serverReflectionInfo(request.asObservable()).toPromise()

    const descriptor = FileDescriptorProto.deserializeBinary(
      response?.fileDescriptorResponse?.fileDescriptorProto[0]
    )

    expect(descriptor.array).toContain('grpc_reflection_v1alpha.proto')
  })
})
