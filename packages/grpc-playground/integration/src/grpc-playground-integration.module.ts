import { Module }               from '@nestjs/common'

import { GrpcPlaygroundModule } from '../../src'

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
