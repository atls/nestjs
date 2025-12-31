import { promises as fs }     from 'node:fs'
import { join }               from 'node:path'
import { fileURLToPath }      from 'node:url'

import { Module }             from '@nestjs/common'

import { GrpcIdentityModule } from '../../src/index.js'
import { TestController }     from './test.controller.js'

const moduleDir = fileURLToPath(new URL('.', import.meta.url))

@Module({
  imports: [
    GrpcIdentityModule.register({
      jwks: {
        jwksUri: join(moduleDir, '.jwks.json'),
        fetcher: async (jwksUri) => {
          const data = await fs.readFile(jwksUri)

          // eslint-disable-next-line @typescript-eslint/no-unsafe-return
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
