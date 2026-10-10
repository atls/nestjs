import type { Server as HttpServer } from 'node:http'

import assert                        from 'node:assert/strict'
import { createServer }              from 'node:http'
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

it('reports native startup errors to registered listeners and the NestJS callback', async () => {
  const occupied = createServer()

  await new Promise<void>((resolve) => {
    occupied.listen(0, resolve)
  })

  const address = occupied.address()
  assert.ok(address && typeof address !== 'string')

  const transport = new ConnectRpcServer({ protocol: ServerProtocol.HTTP, port: address.port })
  let emittedError: Error | undefined
  let timeout: NodeJS.Timeout | undefined

  transport.on('error', (error: Error) => {
    emittedError = error
  })

  try {
    const startupError = await Promise.race([
      new Promise<unknown>((resolve, reject) => {
        transport
          .listen((error) => {
            resolve(error)
          })
          .catch(reject)
      }),
      new Promise<never>((_, reject) => {
        timeout = setTimeout(() => {
          reject(new Error('Timed out waiting for startup failure'))
        }, 5000)
      }),
    ])

    assert.ok(startupError instanceof Error)
    assert.equal((startupError as NodeJS.ErrnoException).code, 'EADDRINUSE')
    assert.equal(emittedError, startupError)
  } finally {
    if (timeout) clearTimeout(timeout)

    await new Promise<void>((resolve, reject) => {
      occupied.close((error) => {
        if (error) reject(error)
        else resolve()
      })
    })
  }
})
