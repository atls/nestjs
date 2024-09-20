import { Module }               from '@nestjs/common'

import { GrpcReflectionModule } from '@atls/nestjs-grpc-reflection'

import { EchoModule }           from './echo/index.js'
import { serverOptions }        from './server.options.js'

@Module({
  imports: [GrpcReflectionModule.register(serverOptions.options), EchoModule],
})
export class GrpcReflectionAppModule {}
