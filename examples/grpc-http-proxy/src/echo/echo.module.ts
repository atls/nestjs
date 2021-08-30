import { Module }         from '@nestjs/common'

import { EchoController } from './echo.controller'

@Module({
  controllers: [EchoController],
})
export class EchoModule {}
