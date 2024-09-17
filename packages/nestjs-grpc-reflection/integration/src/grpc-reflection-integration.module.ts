import { Module }               from '@nestjs/common'

import { GrpcReflectionModule } from '../../src/index.js'
import { serverOptions }        from './proto.options.js'

@Module({
  imports: [GrpcReflectionModule.register(serverOptions.options)],
})
export class GrpcReflectionIntegrationModule {}
