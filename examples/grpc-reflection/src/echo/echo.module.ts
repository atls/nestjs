import { Module }         from '@nestjs/common'

import { EchoController } from './echo.controller.js'

@Module({
  controllers: [EchoController],
})
export class EchoModule {}
