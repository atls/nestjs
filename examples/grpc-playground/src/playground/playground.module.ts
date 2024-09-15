import { Module }               from '@nestjs/common'

import { PlaygroundController } from './playground.controller.js'

@Module({
  controllers: [PlaygroundController],
})
export class PlaygroundModule {}
