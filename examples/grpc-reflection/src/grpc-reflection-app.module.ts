import { Module }               from '@nestjs/common'

import { GrpcReflectionModule } from '@atls/nestjs-grpc-reflection'

import { EchoModule }           from './echo'
import { serverOptions }        from './server.options'

@Module({
  imports: [GrpcReflectionModule.register(serverOptions.options), EchoModule],
})
export class GrpcReflectionAppModule {}
