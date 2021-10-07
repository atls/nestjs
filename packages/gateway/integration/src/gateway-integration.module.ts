import { Module }           from '@nestjs/common'

import { GatewayModule }    from '../../src'
import { MoviesController } from './movies.controller'

@Module({
  imports: [GatewayModule.register()],
  controllers: [MoviesController],
})
export class GatewayIntegrationModule {}
