import { Module }               from '@nestjs/common'

import { PlaygroundController } from './playground.controller'

@Module({
  controllers: [PlaygroundController],
})
export class PlaygroundModule {}
