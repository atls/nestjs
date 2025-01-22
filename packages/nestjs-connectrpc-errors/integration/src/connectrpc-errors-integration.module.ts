import { Module }           from '@nestjs/common'

import { ValidationModule } from '@atls/nestjs-validation'

import { TestController }   from './test.controller.js'

@Module({
  controllers: [TestController],
  imports: [ValidationModule.register()],
})
export class ConnectRpcErrorsIntegrationModule {}
