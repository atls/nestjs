import { Module }                    from '@nestjs/common'

import { KetoModule }                from '../../src/index.js'
import { KetoIntegrationController } from './keto-integration.controller.js'

@Module({
  imports: [
    KetoModule.register({
      basePath: '127.0.0.1:4466',
    }),
  ],
  controllers: [KetoIntegrationController],
})
export class KetoIntegrationModule {}
