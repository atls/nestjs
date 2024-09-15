import { Module }               from '@nestjs/common'

import { GrpcPlaygroundModule } from '@atls/nestjs-grpc-playground'

import { PlaygroundModule }     from './playground/index.js'
import { serverOptions }        from './server.options.js'

@Module({
  imports: [GrpcPlaygroundModule.register({ options: serverOptions.options }), PlaygroundModule],
})
export class GrpcPlaygroundAppModule {}
