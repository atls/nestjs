import { Module }                    from '@nestjs/common'

import { KetoModule }                from '../../src'
import { KetoIntegrationController } from './keto-integration.controller'

@Module({
  imports: [
    KetoModule.register({
      basePath: '127.0.0.1:4466',
    }),
  ],
  controllers: [KetoIntegrationController],
})
export class KetoIntegrationModule {}
