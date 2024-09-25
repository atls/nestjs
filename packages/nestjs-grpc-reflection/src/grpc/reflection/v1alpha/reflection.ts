import type { Metadata }    from '@grpc/grpc-js'

/* eslint-disable */
import { GrpcMethod }       from '@nestjs/microservices'
import { GrpcStreamMethod } from '@nestjs/microservices'
import { Observable }       from 'rxjs'
import Long                 from 'long'
import _m0                  from 'protobufjs/minimal.js'

export const protobufPackage = 'grpc.reflection.v1alpha'

/** The message sent by the client when calling ServerReflectionInfo method. */
export interface ServerReflectionRequest {
  host: string
  /** Find a proto file by the file name. */
  fileByFilename: string | undefined
  /**
   * Find the proto file that declares the given fully-qualified symbol name.
   * This field should be a fully-qualified symbol name
   * (e.g. <package>.<service>[.<method>] or <package>.<type>).
   */
  fileContainingSymbol: string | undefined
  /**
   * Find the proto file which defines an extension extending the given
   * message type with the given field number.
   */
  fileContainingExtension?: ExtensionRequest | undefined
  /**
   * Finds the tag numbers used by all known extensions of the given message
   * type, and appends them to ExtensionNumberResponse in an undefined order.
   * Its corresponding method is best-effort: it's not guaranteed that the
   * reflection service will implement this method, and it's not guaranteed
   * that this method will provide all extensions. Returns
   * StatusCode::UNIMPLEMENTED if it's not implemented.
   * This field should be a fully-qualified type name. The format is
   * <package>.<type>
   */
  allExtensionNumbersOfType: string | undefined
  /**
   * List the full names of registered services. The content will not be
   * checked.
   */
  listServices: string | undefined
}

/**
 * The type name and extension number sent by the client when requesting
 * file_containing_extension.
 */
export interface ExtensionRequest {
  /** Fully-qualified type name. The format should be <package>.<type> */
  containingType: string
  extensionNumber: number
}

/** The message sent by the server to answer ServerReflectionInfo method. */
export interface ServerReflectionResponse {
  validHost: string
  originalRequest?: ServerReflectionRequest
  /**
   * This message is used to answer file_by_filename, file_containing_symbol,
   * file_containing_extension requests with transitive dependencies. As
   * the repeated label is not allowed in oneof fields, we use a
   * FileDescriptorResponse message to encapsulate the repeated fields.
   * The reflection service is allowed to avoid sending FileDescriptorProtos
   * that were previously sent in response to earlier requests in the stream.
   */
  fileDescriptorResponse?: FileDescriptorResponse | undefined
  /** This message is used to answer all_extension_numbers_of_type requst. */
  allExtensionNumbersResponse?: ExtensionNumberResponse | undefined
  /** This message is used to answer list_services request. */
  listServicesResponse?: ListServiceResponse | undefined
  /** This message is used when an error occurs. */
  errorResponse?: ErrorResponse | undefined
}

/**
 * Serialized FileDescriptorProto messages sent by the server answering
 * a file_by_filename, file_containing_symbol, or file_containing_extension
 * request.
 */
export interface FileDescriptorResponse {
  /**
   * Serialized FileDescriptorProto messages. We avoid taking a dependency on
   * descriptor.proto, which uses proto2 only features, by making them opaque
   * bytes instead.
   */
  fileDescriptorProto: Uint8Array[]
}

/**
 * A list of extension numbers sent by the server answering
 * all_extension_numbers_of_type request.
 */
export interface ExtensionNumberResponse {
  /**
   * Full name of the base type, including the package name. The format
   * is <package>.<type>
   */
  baseTypeName: string
  extensionNumber: number[]
}

/** A list of ServiceResponse sent by the server answering list_services request. */
export interface ListServiceResponse {
  /**
   * The information of each service may be expanded in the future, so we use
   * ServiceResponse message to encapsulate it.
   */
  service: ServiceResponse[]
}

/**
 * The information of a single service used by ListServiceResponse to answer
 * list_services request.
 */
export interface ServiceResponse {
  /**
   * Full name of a registered service, including its package name. The format
   * is <package>.<service>
   */
  name: string
}

/** The error code and error message sent by the server when an error occurs. */
export interface ErrorResponse {
  /** This field uses the error codes defined in grpc::StatusCode. */
  errorCode: number
  errorMessage: string
}

export const GRPC_REFLECTION_V1ALPHA_PACKAGE_NAME = 'grpc.reflection.v1alpha'

export interface ServerReflectionClient {
  /**
   * The reflection service is structured as a bidirectional stream, ensuring
   * all related requests go to a single server.
   */

  serverReflectionInfo(
    request: Observable<ServerReflectionRequest>,
    metadata?: Metadata
  ): Observable<ServerReflectionResponse>
}

export interface ServerReflectionController {
  /**
   * The reflection service is structured as a bidirectional stream, ensuring
   * all related requests go to a single server.
   */

  serverReflectionInfo(
    request: Observable<ServerReflectionRequest>,
    metadata?: Metadata
  ): Observable<ServerReflectionResponse>
}

export function ServerReflectionControllerMethods() {
  return function (constructor: Function) {
    const grpcMethods: string[] = []
    for (const method of grpcMethods) {
      const descriptor: any = Reflect.getOwnPropertyDescriptor(constructor.prototype, method)
      GrpcMethod('ServerReflection', method)(constructor.prototype[method], method, descriptor)
    }
    const grpcStreamMethods: string[] = ['serverReflectionInfo']
    for (const method of grpcStreamMethods) {
      const descriptor: any = Reflect.getOwnPropertyDescriptor(constructor.prototype, method)
      GrpcStreamMethod('ServerReflection', method)(
        constructor.prototype[method],
        method,
        descriptor
      )
    }
  }
}

export const SERVER_REFLECTION_SERVICE_NAME = 'ServerReflection'

if (_m0.util.Long !== Long) {
  _m0.util.Long = Long as any
  _m0.configure()
}
