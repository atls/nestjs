import { DynamicModule, Module } from '@nestjs/common'

import { BusCoreModule }         from './bus-core-module'
import { Transport }             from './enums'
import { BusModuleOptions }      from './interfaces'

@Module({})
export class BusModule {
  public static forRoot = (options: BusModuleOptions): DynamicModule => {
    const module: DynamicModule = {
      module: BusModule,
      imports: [],
      providers: [],
    }

    switch (options.transport) {
      case Transport.Memory:
        module.imports.push(BusCoreModule.forMemory())
        break
      case Transport.RabbitMQ:
        module.imports.push(BusCoreModule.forRabbitMQ(options.configuration))
        break
      default:
        throw new Error('Unknown transport')
    }

    return module
  }
}
