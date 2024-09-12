import { Module }                    from '@nestjs/common'

import { KetoModule }                from '../../src/index.js'
import { KetoIntegrationController } from './keto-integration.controller.js'

@Module({
  imports: [
    KetoModule.register({
      read: '127.0.0.1:4466',
      write: '127.0.0.1:4467',
    }),
  ],
  controllers: [KetoIntegrationController],
})
export class KetoIntegrationModule {}
