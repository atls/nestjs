import type * as http from 'http'
import type * as http2 from 'http2'
import type * as https from 'https'
import type { ConnectRouterOptions } from '@connectrpc/connect'
import type { Observable } from 'rxjs'

export interface ConnectRpcPattern {
  service: string
  rpc: string
  streaming: MethodType
}

export enum MethodType {
  NO_STREAMING = 'no_stream',
  RX_STREAMING = 'rx_stream',
}

export enum ServerProtocol {
  HTTP = 'http',
  HTTPS = 'https',
  HTTP2_INSECURE = 'http2_insecure',
  HTTP2 = 'http2',
}

export interface BaseServerOptions {
  port: number
  connectOptions?: ConnectRouterOptions
  callback?: () => void
}

export interface HttpOptions extends BaseServerOptions {
  protocol: ServerProtocol.HTTP
  serverOptions?: http.ServerOptions
}

export interface HttpsOptions extends BaseServerOptions {
  protocol: ServerProtocol.HTTPS
  serverOptions: https.ServerOptions
}

export interface Http2Options extends BaseServerOptions {
  protocol: ServerProtocol.HTTP2
  serverOptions: http2.SecureServerOptions
}

export interface Http2InsecureOptions extends BaseServerOptions {
  protocol: ServerProtocol.HTTP2_INSECURE
  serverOptions?: http2.ServerOptions
}

export type ServerTypeOptions =
  | Http2InsecureOptions
  | Http2Options
  | HttpOptions
  | HttpsOptions

export type ServerInstance =
  | http.Server
  | http2.Http2Server
  | https.Server
  | null

export interface ConstructorWithPrototype {
  prototype: Record<string, PropertyDescriptor>
}

export interface MethodKey {
  key: string
  methodType: MethodType
}

export type MethodKeys = Array<MethodKey>

export interface FunctionPropertyDescriptor extends PropertyDescriptor {
  value: (...arguments_: Array<never>) => never
}

export type ResultOrDeferred<T> =
  | Observable<T>
  | T
  | { subscribe: () => void }
  | { toPromise: () => Promise<T> }
