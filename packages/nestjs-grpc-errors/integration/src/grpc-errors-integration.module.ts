import { Module }         from '@nestjs/common'

import { TestController } from './test.controller.js'

@Module({
  controllers: [TestController],
})
export class GrpcErrorsIntegrationModule {}
