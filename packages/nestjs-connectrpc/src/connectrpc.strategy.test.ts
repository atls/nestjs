import type { Server as HttpServer } from 'node:http'

import assert                        from 'node:assert/strict'
import { it }                        from 'node:test'

import { ServerProtocol }            from './connectrpc.interfaces.js'
import { ConnectRpcServer }          from './connectrpc.strategy.js'

it('exposes native server events through the NestJS transport contract', async () => {
  const transport = new ConnectRpcServer({ protocol: ServerProtocol.HTTP, port: 0 })
  let listening = false

  transport.on('listening', () => {
    listening = true
  })

  await new Promise<void>((resolve, reject) => {
    transport
      .listen((error) => {
        if (error) {
          reject(error)
        } else {
          resolve()
        }
      })
      .catch(reject)
  })

  let closed = false

  try {
    const server = transport.unwrap<HttpServer>()

    assert.equal(server.listening, true)
    assert.equal(listening, true)

    transport.on('close', () => {
      closed = true
    })
  } finally {
    await transport.close()
  }

  assert.equal(closed, true)
})
