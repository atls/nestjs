import { Module }               from '@nestjs/common'

import { GrpcPlaygroundModule } from '../../src/index.js'

@Module({
  imports: [
    GrpcPlaygroundModule.register({
      options: {
        package: [],
        protoPath: [],
      },
    }),
  ],
})
export class GrpcPlaygroundIntegrationModule {}
