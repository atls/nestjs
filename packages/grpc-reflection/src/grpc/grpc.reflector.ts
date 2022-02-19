import { ServiceDefinition }              from '@grpc/proto-loader'
import { Injectable }                     from '@nestjs/common'
import { OnModuleInit }       from '@nestjs/common'
import { Inject }                         from '@nestjs/common'
import { ServerGrpc }                     from '@nestjs/microservices'
import { loadPackageDefinition }          from '@grpc/grpc-js'
import { loadSync }                       from '@grpc/proto-loader'

import { GRPC_REFLECTION_MODULE_OPTIONS } from '../module'
import { GrpcReflectionModuleOptions }    from '../module'
import { GrpcServicesRegistry }           from './grpc-services.registry'

@Injectable()
export class GrpcReflector implements OnModuleInit {
  public readonly services: Array<ServiceDefinition> = []

  constructor(
    @Inject(GRPC_REFLECTION_MODULE_OPTIONS) private readonly options: GrpcReflectionModuleOptions,
    public readonly registry: GrpcServicesRegistry
  ) {}

  async onModuleInit() {
    const grpcServer = new ServerGrpc(this.options)

    const protoPaths = Array.isArray(this.options.protoPath)
      ? this.options.protoPath
      : [this.options.protoPath]

    for (const protoPath of protoPaths) {
      const packageDefinition = loadSync(protoPath, this.options.loader)
      const grpcContext = loadPackageDefinition(packageDefinition)

      const packageNames = Array.isArray(this.options.package)
        ? this.options.package
        : [this.options.package]

      for (const packageName of packageNames) {
        const grpcPkg = this.lookupPackage(grpcContext, packageName)

        if (grpcPkg) {
          for (const definition of grpcServer.getServiceNames(grpcPkg)) {
            this.registry.addService(definition.service.service)
          }
        }
      }
    }
  }

  public lookupPackage(root: any, packageName: string) {
    let pkg = root

    // eslint-disable-next-line no-restricted-syntax
    for (const name of packageName.split(/\./)) {
      if (pkg[name]) {
        pkg = pkg[name]
      } else {
        return null
      }
    }

    return pkg
  }
}
