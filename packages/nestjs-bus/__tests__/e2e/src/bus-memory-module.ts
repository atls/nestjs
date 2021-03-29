import { Module }               from '@nestjs/common'

import { BusModule, Transport } from '../../../src'
import { UserController }       from './controllers'
import { CreateUserHandler }    from './handlers'

@Module({
  imports: [
    BusModule.forRoot({
      transport: Transport.Memory,
    }),
  ],
  providers: [CreateUserHandler],
  controllers: [UserController],
})
export class BusMemoryModule {}
