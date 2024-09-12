import { Module }                 from '@nestjs/common'

import { ExternalRendererModule } from '../../src'
import { ExecController }         from './exec.controller'
import { RenderController }       from './render.controller'

@Module({
  imports: [
    ExternalRendererModule.register({
      url: 'http://localhost:3000',
    }),
  ],
  controllers: [RenderController, ExecController],
})
export class ExternalRendererIntegrationModule {}
