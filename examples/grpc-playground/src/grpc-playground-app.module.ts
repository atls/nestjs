import { Module }               from '@nestjs/common'

import { GrpcPlaygroundModule } from '@atls/nestjs-grpc-playground'

import { serverOptions }        from './server.options'
import { PlaygroundModule }     from './playground'

@Module({
  imports: [GrpcPlaygroundModule.register({ options: serverOptions.options }), PlaygroundModule],
})
export class GrpcPlaygroundAppModule {}
