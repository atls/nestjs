import { Module }           from '@nestjs/common'

import { MoviesController } from './movies.controller.js'

@Module({
  controllers: [MoviesController],
})
export class ServiceModule {}
