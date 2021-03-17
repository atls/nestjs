import { Module } from '@nestjs/common'
import { BusModule, Bus } from '../../../src'
import { UserController } from './controllers'

@Module({
  imports: [BusModule.forMemory()],
  controllers: [UserController],
})
export class BusMemoryModule {}
