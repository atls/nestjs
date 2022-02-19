import { Metadata }                     from '@grpc/grpc-js'
/* eslint-disable */
import { GrpcMethod }                   from '@nestjs/microservices'

import { GrpcStreamMethod } from '@nestjs/microservices'

import _m0                              from 'protobufjs/minimal'
import Long                             from 'long'
import { Observable }                   from 'rxjs'

export const protobufPackage = 'examples.playground.v1'

export enum Corpus {
  CORPUS_UNIVERSAL_UNSPECIFIED = 0,
  CORPUS_WEB = 1,
  CORPUS_IMAGES = 2,
  CORPUS_LOCAL = 3,
  CORPUS_NEWS = 4,
  CORPUS_PRODUCTS = 5,
  CORPUS_VIDEO = 6,
  UNRECOGNIZED = -1,
}

export interface EchoRequest {
  ping: string
}

export interface EchoResponse {
  pong: string
}

export interface SwitchRequest {
  value: boolean
}

export interface SwitchResponse {
  value: boolean
}

export interface TextRequest {
  message: string
}

export interface TextResponse {
  message: string
}

export interface NumberRequest {
  int32: number
  int64: number
  uint32: number
  uint64: number
  sint32: number
  sint64: number
  fixed32: number
  fixed64: number
  sfixed32: number
  sfixed64: number
  double: number
  float: number
}

export interface NumberResponse {
  int32: number
  int64: number
  uint32: number
  uint64: number
  sint32: number
  sint64: number
  fixed32: number
  fixed64: number
  sfixed32: number
  sfixed64: number
  double: number
  float: number
}

export interface EnumRequest {
  corpus: Corpus
}

export interface EnumResponse {
  corpus: Corpus
}

export interface NestedGrandChild {
  id: string
  value: string
}

export interface NestedChild {
  value: string
  grandChild?: NestedGrandChild
}

export interface NestedResult {
  message: string
  child?: NestedChild
}

export interface NestedRequest {
  result?: NestedResult
}

export interface NestedResponse {
  result?: NestedResult
}

export interface RepeatedResult {
  url: string
  title: string
  snippets: string[]
}

export interface RepeatedRequest {
  results: RepeatedResult[]
}

export interface RepeatedResponse {
  results: RepeatedResult[]
}

export interface KitchenSinkAmount {
  amount: string
  currency: string
}

export interface KitchenSinkDocument {
  id: string
  type: string
}

export interface KitchenSinkInfo {
  title: string
  description: string
  url: string
}

export interface KitchenSinkItemField {
  key: string
  value: string
}

export interface KitchenSinkItem {
  price: string
  currency: string
  quantity: number
  fields: KitchenSinkItemField[]
}

export interface KitchenSinkRequest {
  paymentMethod: string
  billingAccountId: string
  amount?: KitchenSinkAmount
  document?: KitchenSinkDocument
  info?: KitchenSinkInfo
  items: KitchenSinkItem[]
}

export interface KitchenSinkResponse {
  paymentMethod: string
  billingAccountId: string
  amount?: KitchenSinkAmount
  document?: KitchenSinkDocument
  info?: KitchenSinkInfo
  items: KitchenSinkItem[]
}

export const EXAMPLES_PLAYGROUND_V1_PACKAGE_NAME = 'examples.playground.v1'

export interface PlaygroundServiceClient {
  echo(request: EchoRequest, metadata?: Metadata): Observable<EchoResponse>

  switch(request: SwitchRequest, metadata?: Metadata): Observable<SwitchResponse>

  text(request: TextRequest, metadata?: Metadata): Observable<TextResponse>

  number(request: NumberRequest, metadata?: Metadata): Observable<NumberResponse>

  enum(request: EnumRequest, metadata?: Metadata): Observable<EnumResponse>

  nested(request: NestedRequest, metadata?: Metadata): Observable<NestedResponse>

  repeated(request: RepeatedRequest, metadata?: Metadata): Observable<RepeatedResponse>

  kitchenSink(request: KitchenSinkRequest, metadata?: Metadata): Observable<KitchenSinkResponse>
}

export interface PlaygroundServiceController {
  echo(
    request: EchoRequest,
    metadata?: Metadata
  ): Promise<EchoResponse> | Observable<EchoResponse> | EchoResponse

  switch(
    request: SwitchRequest,
    metadata?: Metadata
  ): Promise<SwitchResponse> | Observable<SwitchResponse> | SwitchResponse

  text(
    request: TextRequest,
    metadata?: Metadata
  ): Promise<TextResponse> | Observable<TextResponse> | TextResponse

  number(
    request: NumberRequest,
    metadata?: Metadata
  ): Promise<NumberResponse> | Observable<NumberResponse> | NumberResponse

  enum(
    request: EnumRequest,
    metadata?: Metadata
  ): Promise<EnumResponse> | Observable<EnumResponse> | EnumResponse

  nested(
    request: NestedRequest,
    metadata?: Metadata
  ): Promise<NestedResponse> | Observable<NestedResponse> | NestedResponse

  repeated(
    request: RepeatedRequest,
    metadata?: Metadata
  ): Promise<RepeatedResponse> | Observable<RepeatedResponse> | RepeatedResponse

  kitchenSink(
    request: KitchenSinkRequest,
    metadata?: Metadata
  ): Promise<KitchenSinkResponse> | Observable<KitchenSinkResponse> | KitchenSinkResponse
}

export function PlaygroundServiceControllerMethods() {
  return function (constructor: Function) {
    const grpcMethods: string[] = [
      'echo',
      'switch',
      'text',
      'number',
      'enum',
      'nested',
      'repeated',
      'kitchenSink',
    ]
    for (const method of grpcMethods) {
      const descriptor: any = Reflect.getOwnPropertyDescriptor(constructor.prototype, method)
      GrpcMethod('PlaygroundService', method)(constructor.prototype[method], method, descriptor)
    }
    const grpcStreamMethods: string[] = []
    for (const method of grpcStreamMethods) {
      const descriptor: any = Reflect.getOwnPropertyDescriptor(constructor.prototype, method)
      GrpcStreamMethod('PlaygroundService', method)(
        constructor.prototype[method],
        method,
        descriptor
      )
    }
  }
}

export const PLAYGROUND_SERVICE_NAME = 'PlaygroundService'

if (_m0.util.Long !== Long) {
  _m0.util.Long = Long as any
  _m0.configure()
}
