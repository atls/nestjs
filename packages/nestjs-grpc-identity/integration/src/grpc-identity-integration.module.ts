import { Module }             from '@nestjs/common'
import { promises as fs }     from 'fs'
import { join }               from 'path'

import { GrpcIdentityModule } from '../../src/index.js'
import { TestController }     from './test.controller.js'

@Module({
  imports: [
    GrpcIdentityModule.register({
      jwks: {
        jwksUri: join(__dirname, '.jwks.json'),
        fetcher: async (jwksUri) => {
          const data = await fs.readFile(jwksUri)

          return JSON.parse(data.toString())
        },
        cache: true,
        jwksRequestsPerMinute: 5,
      },
    }),
  ],
  controllers: [TestController],
})
export class GrpcIdentityIntegrationModule {}
