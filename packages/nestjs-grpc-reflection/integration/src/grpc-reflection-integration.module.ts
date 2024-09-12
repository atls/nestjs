import { Module }               from '@nestjs/common'

import { GrpcReflectionModule } from '../../src'
import { serverOptions }        from './proto.options'

@Module({
  imports: [GrpcReflectionModule.register(serverOptions.options)],
})
export class GrpcReflectionIntegrationModule {}
