import { Module }           from '@nestjs/common'

import { GatewayModule }    from '../../src/index.js'
import { MoviesController } from './movies.controller.js'

@Module({
  imports: [GatewayModule.register()],
  controllers: [MoviesController],
})
export class GatewayIntegrationModule {}
