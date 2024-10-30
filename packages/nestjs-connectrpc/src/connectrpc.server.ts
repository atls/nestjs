import type { ConnectRouter }        from '@connectrpc/connect'

import type { Http2InsecureOptions } from './connectrpc.interfaces.js'
import type { Http2Options }         from './connectrpc.interfaces.js'
import type { ServerTypeOptions }    from './connectrpc.interfaces.js'
import type { HttpsOptions }         from './connectrpc.interfaces.js'
import type { HttpOptions }          from './connectrpc.interfaces.js'
import type { ServerInstance }       from './connectrpc.interfaces.js'

import { connectNodeAdapter }        from '@connectrpc/connect-node'
import * as http                     from 'http'
import * as http2                    from 'http2'
import * as https                    from 'https'

import { ServerProtocol }            from './connectrpc.interfaces.js'

export class HTTPServer {
  private serverPrivate: ServerInstance = null

  constructor(
    private readonly options: ServerTypeOptions,
    private readonly router: (router: ConnectRouter) => void
  ) {}

  set server(value: http.Server | http2.Http2Server | https.Server | null) {
    this.serverPrivate = value
  }

  get server(): http.Server | http2.Http2Server | https.Server | null {
    return this.serverPrivate
  }

  async listen(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.startServer(resolve, reject)
    })
  }

  createHttpServer(): http.Server {
    const { serverOptions = {}, connectOptions = {} } = this.options as HttpOptions

    return http.createServer(
      serverOptions,
      connectNodeAdapter({
        ...connectOptions,
        routes: this.router,
      })
    )
  }

  createHttpsServer(): https.Server {
    const { serverOptions = {}, connectOptions = {} } = this.options as HttpsOptions

    return https.createServer(
      serverOptions,
      connectNodeAdapter({ ...connectOptions, routes: this.router })
    )
  }

  createHttp2Server(): http2.Http2Server {
    const { serverOptions = {}, connectOptions = {} } = this.options as Http2Options

    return http2.createSecureServer(
      serverOptions,
      connectNodeAdapter({ ...connectOptions, routes: this.router })
    )
  }

  createHttp2InsecureServer(): http2.Http2Server {
    const { serverOptions = {}, connectOptions = {} } = this.options as Http2InsecureOptions

    return http2.createServer(
      serverOptions,
      connectNodeAdapter({ ...connectOptions, routes: this.router })
    )
  }

  startServer(resolve: () => void, reject: (error: Error) => void): void {
    try {
      switch (this.options.protocol) {
        case ServerProtocol.HTTP: {
          this.server = this.createHttpServer()
          break
        }
        case ServerProtocol.HTTPS: {
          this.server = this.createHttpsServer()
          break
        }
        case ServerProtocol.HTTP2: {
          this.server = this.createHttp2Server()
          break
        }
        case ServerProtocol.HTTP2_INSECURE: {
          this.server = this.createHttp2InsecureServer()
          break
        }
        default: {
          throw new Error('Invalid protocol option')
        }
      }

      this.server.listen(this.options.port, () => {
        if (this.options.callback) this.options.callback()
        resolve()
      })
    } catch (error) {
      if (error instanceof Error) {
        reject(error)
      } else {
        reject(new Error('Unknown error occurred'))
      }
    }
  }

  async close(callback?: () => void): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.server === null) {
        reject(new Error('Server is not running'))
      } else {
        this.server.close(() => {
          this.server = null
          if (callback) callback()
          resolve()
        })
      }
    })
  }
}
