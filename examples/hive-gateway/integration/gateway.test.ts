import type { HiveGatewayDriverConfig }  from '@graphql-hive/nestjs'
import type { ServiceClientConstructor } from '@grpc/grpc-js'
import type { ServerUnaryCall }          from '@grpc/grpc-js'
import type { sendUnaryData }            from '@grpc/grpc-js'

import assert                            from 'node:assert/strict'
import { execFile }                      from 'node:child_process'
import { readFile }                      from 'node:fs/promises'
import { after }                         from 'node:test'
import { test }                          from 'node:test'
import { fileURLToPath }                 from 'node:url'
import { promisify }                     from 'node:util'

import { HiveGatewayDriver }             from '@graphql-hive/nestjs'
import { Server }                        from '@grpc/grpc-js'
import { ServerCredentials }             from '@grpc/grpc-js'
import { GraphQLModule }                 from '@nestjs/graphql'
import { Test }                          from '@nestjs/testing'
import { loadPackageDefinition }         from '@grpc/grpc-js'
import { load }                          from '@grpc/proto-loader'

interface PingRequest {
  value: string
}

interface PingResponse {
  value: string
  authorization: string
}

const protoPath = fileURLToPath(new URL('../proto/echo.proto', import.meta.url))
const yarnPath = fileURLToPath(new URL('../../../.yarn/releases/yarn.mjs', import.meta.url))
const repoPath = fileURLToPath(new URL('../../..', import.meta.url))
const server = new Server()

after(async () => {
  await new Promise<void>((resolve, reject) => {
    server.tryShutdown((error) => {
      if (error) {
        reject(error)
      } else {
        resolve()
      }
    })
  })
})

test('Compose SDL is served by the Hive Nest driver with gRPC metadata', async () => {
  await promisify(execFile)(
    process.execPath,
    [yarnPath, 'workspace', '@examples/hive-gateway', 'compose'],
    {
      cwd: repoPath,
    }
  )
  const supergraph = await readFile(new URL('../supergraph.graphql', import.meta.url), 'utf8')
  const protoDefinition = await load(protoPath, { defaults: true })
  const grpcPackage = loadPackageDefinition(protoDefinition)
  const echo = (grpcPackage.demo as Record<string, unknown>).Echo as ServiceClientConstructor

  server.addService(echo.service, {
    Ping(call: ServerUnaryCall<PingRequest, PingResponse>, callback: sendUnaryData<PingResponse>) {
      callback(null, {
        value: call.request.value,
        authorization: String(call.metadata.get('authorization')[0] ?? ''),
      })
    },
  })

  const port = await new Promise<number>((resolve, reject) => {
    server.bindAsync('127.0.0.1:0', ServerCredentials.createInsecure(), (error, boundPort) => {
      if (error) {
        reject(error)
      } else {
        resolve(boundPort)
      }
    })
  })

  const testingModule = await Test.createTestingModule({
    imports: [
      GraphQLModule.forRoot<HiveGatewayDriverConfig>({
        driver: HiveGatewayDriver,
        supergraph,
        transports: { grpc: import('@graphql-mesh/transport-grpc') },
        transportEntries: {
          Echo: { kind: 'grpc', location: `127.0.0.1:${port}` },
        },
        path: '/graphql',
        introspection: true,
        logging: false,
      }),
    ],
  }).compile()
  const app = testingModule.createNestApplication()

  try {
    await app.listen(0, '127.0.0.1')
    const response = await fetch(`${await app.getUrl()}/graphql`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        authorization: 'Bearer example-token',
      },
      body: JSON.stringify({
        query: 'mutation { demo_Echo_Ping(input: { value: "ready" }) { value authorization } }',
      }),
    })

    assert.equal(response.status, 200)
    assert.deepEqual(await response.json(), {
      data: {
        demo_Echo_Ping: { value: 'ready', authorization: 'Bearer example-token' },
      },
    })
  } finally {
    await app.close()
  }
})
