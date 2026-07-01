import { Module }        from '@nestjs/common'

import { GatewayModule } from '../../src/index.js'

@Module({
  imports: [GatewayModule.register()],
})
export class ApplicationModule {}
