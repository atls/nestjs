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
    for (const service of this.services) {
      for (const method of Object.values(service)) {
        if (!method.path.includes(fileContainingSymbol)) {
          continue
        }
        const match = method.requestType.fileDescriptorProtos.find((fdp) => {
          const fileDescriptor = google.FileDescriptorProto.deserializeBinary(fdp)
          const filePackage = fileDescriptor.getPackage()
          return filePackage ? fileContainingSymbol.includes(filePackage) : false
        })
        if (match) {
          return match as unknown as google.FileDescriptorProto
        }
      }
    }

    return undefined
  }
}
