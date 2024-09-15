import { Module }               from '@nestjs/common'

import { GrpcHttpProxyModule }  from '@atls/nestjs-grpc-http-proxy'
import { GrpcReflectionModule } from '@atls/nestjs-grpc-reflection'

import { EchoModule }           from './echo/index.js'
import { serverOptions }        from './server.options.js'

@Module({
  imports: [
    // @ts-ignore
    GrpcReflectionModule.register(serverOptions.options),
    // @ts-ignore
    GrpcHttpProxyModule.register({ options: serverOptions.options }),
    EchoModule,
  ],
})
export class GrpcHttpProxyAppModule {}
