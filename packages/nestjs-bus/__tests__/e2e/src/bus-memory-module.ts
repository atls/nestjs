import { Module } from '@nestjs/common'
import { CreateUserHandler } from './handlers'
import { BusModule, Transport } from '../../../src'
import { UserController } from './controllers'

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
