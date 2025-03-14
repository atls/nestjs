import type { ServiceDefinition } from '@grpc/proto-loader'

import { Injectable }             from '@nestjs/common'
import google                     from 'google-protobuf/google/protobuf/descriptor_pb.js'

@Injectable()
export class GrpcServicesRegistry {
  public readonly services: Array<ServiceDefinition> = []

  getServiceNameFromServiceDefinition(serviceDefinition: ServiceDefinition): string {
    const methodDefinition = Object.values(serviceDefinition).shift()

    return methodDefinition?.path.split('/')[1] || ''
  }

  addService(service: ServiceDefinition): void {
    this.services.push(service)
  }

  getListServices(): { service: Array<{ name: string }> } {
    return {
      service: this.services.map((serviceDefinition) => ({
        name: this.getServiceNameFromServiceDefinition(serviceDefinition),
      })),
    }
  }

  getFileDescriptorProtoByFileContainingSymbol(
    fileContainingSymbol: string
  ): google.FileDescriptorProto | undefined {
    // @ts-expect-error correct return type
    return this.services.reduce<FileDescriptorProto | undefined>((fileDescriptorProto, service) => {
      if (fileDescriptorProto) {
        return fileDescriptorProto
      }
      // @ts-expect-error correct return type
      return Object.values(service).reduce<FileDescriptorProto | undefined>((
        descriptor,
        method
      ) => {
        if (descriptor) {
          return descriptor
        }

        if (method.path.includes(fileContainingSymbol)) {
          return method.requestType.fileDescriptorProtos.find((fdp) => {
            const fileDescriptor = google.FileDescriptorProto.deserializeBinary(fdp)

            const filePackage = fileDescriptor.getPackage()

            return filePackage ? fileContainingSymbol.includes(filePackage) : false
          })
        }

        return undefined
      }, undefined)
    }, undefined)
  }
}
