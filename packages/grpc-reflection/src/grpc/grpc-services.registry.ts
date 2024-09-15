import { ServiceDefinition }   from '@grpc/proto-loader'
import { Injectable }          from '@nestjs/common'
import { FileDescriptorProto } from 'google-protobuf/google/protobuf/descriptor_pb'

@Injectable()
export class GrpcServicesRegistry {
  public readonly services: Array<ServiceDefinition> = []

  getServiceNameFromServiceDefinition(serviceDefinition: ServiceDefinition) {
    const methodDefinition = Object.values(serviceDefinition).shift()

    return methodDefinition!.path.split('/')[1]
  }

  addService(service: ServiceDefinition) {
    this.services.push(service)
  }

  getListServices() {
    return {
      service: this.services.map((serviceDefinition) => ({
        name: this.getServiceNameFromServiceDefinition(serviceDefinition),
      })),
    }
  }

  getFileDescriptorProtoByFileContainingSymbol(fileContainingSymbol) {
    return this.services.reduce<FileDescriptorProto | undefined>((fileDescriptorProto, service) => {
      if (fileDescriptorProto) {
        return fileDescriptorProto
      }

      return Object.values(service).reduce<FileDescriptorProto | undefined>((
        descriptor,
        method
      ) => {
        if (descriptor) {
          return descriptor
        }

        if (method.path.includes(fileContainingSymbol)) {
          return method.requestType.fileDescriptorProtos.find((fdp) => {
            const fileDescriptor = FileDescriptorProto.deserializeBinary(fdp)

            return fileContainingSymbol.includes(fileDescriptor.getPackage())
          })
        }

        return undefined
      }, undefined)
    }, undefined)
  }
}
