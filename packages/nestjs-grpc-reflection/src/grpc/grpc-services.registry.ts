import type { ServiceDefinition } from '@grpc/proto-loader'

import { Injectable }             from '@nestjs/common'
// @ts-expect-error
import { FileDescriptorProto }    from 'google-protobuf/google/protobuf/descriptor_pb'

@Injectable()
export class GrpcServicesRegistry {
  public readonly services: Array<ServiceDefinition> = []

  getServiceNameFromServiceDefinition(serviceDefinition: ServiceDefinition): string {
    const methodDefinition = Object.values(serviceDefinition).shift()

    return methodDefinition!.path.split('/')[1]
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
    // eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
  ): FileDescriptorProto | undefined {
    // eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
    return this.services.reduce<FileDescriptorProto | undefined>((fileDescriptorProto, service) => {
      if (fileDescriptorProto) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return fileDescriptorProto
      }

      // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-redundant-type-constituents
      return Object.values(service).reduce<FileDescriptorProto | undefined>((
        descriptor,
        method
      ) => {
        if (descriptor) {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-return
          return descriptor
        }

        if (method.path.includes(fileContainingSymbol)) {
          return method.requestType.fileDescriptorProtos.find((fdp) => {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-call
            const fileDescriptor = FileDescriptorProto.deserializeBinary(fdp)

            // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-call
            return fileContainingSymbol.includes(fileDescriptor.getPackage())
          })
        }

        return undefined
      }, undefined)
    }, undefined)
  }
}
