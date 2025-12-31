import type { ServiceDefinition }           from '@grpc/proto-loader'
import type { OnModuleInit }                from '@nestjs/common'

import type { GrpcReflectionModuleOptions } from '../module/index.js'

import { Injectable }                       from '@nestjs/common'
import { Inject }                           from '@nestjs/common'
import { ServerGrpc }                       from '@nestjs/microservices'
import { loadPackageDefinition }            from '@grpc/grpc-js'
import { loadSync }                         from '@grpc/proto-loader'

import { GRPC_REFLECTION_MODULE_OPTIONS }   from '../module/index.js'
import { GrpcServicesRegistry }             from './grpc-services.registry.js'

@Injectable()
export class GrpcReflector implements OnModuleInit {
  public readonly services: Array<ServiceDefinition> = []

  constructor(
    @Inject(GRPC_REFLECTION_MODULE_OPTIONS) private readonly options: GrpcReflectionModuleOptions,
    public readonly registry: GrpcServicesRegistry
  ) {}

  async onModuleInit(): Promise<void> {
    const grpcServer = new ServerGrpc(this.options)

    const protoPaths = Array.isArray(this.options.protoPath)
      ? this.options.protoPath
      : [this.options.protoPath]

    for (const protoPath of protoPaths) {
      if (protoPath) {
        // eslint-disable-next-line n/no-sync
        const packageDefinition = loadSync(protoPath, this.options.loader)
        const grpcContext = loadPackageDefinition(packageDefinition)

        const packageNames = Array.isArray(this.options.package)
          ? this.options.package
          : [this.options.package]

        for (const packageName of packageNames) {
          const grpcPkg = this.lookupPackage(grpcContext, packageName)

          if (grpcPkg) {
            for (const definition of grpcServer.getServiceNames(grpcPkg)) {
              // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
              this.registry.addService(definition.service.service)
            }
          }
        }
      }
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public lookupPackage(root: any, packageName: string): any {
    let pkg = root

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
