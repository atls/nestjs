import { Module }                 from '@nestjs/common'

import { ExternalRendererModule } from '../../src/index.js'
import { ExecController }         from './exec.controller.js'
import { RenderController }       from './render.controller.js'

@Module({
  imports: [
    ExternalRendererModule.register({
      url: 'http://localhost:3000',
    }),
  ],
  controllers: [RenderController, ExecController],
})
export class ExternalRendererIntegrationModule {}
