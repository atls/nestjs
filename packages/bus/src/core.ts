import { DynamicModule, Global, Inject, Module }                 from '@nestjs/common'
import { OnApplicationBootstrap, OnModuleDestroy, OnModuleInit } from '@nestjs/common'
import { ModuleRef }                                             from '@nestjs/core'
import { ApplicationBootstrap, BUS_SYMBOLS }                     from '@node-ts/bus-core'
import { BUS_INTERNAL_SYMBOLS }                                  from '@node-ts/bus-core/dist/bus-symbols'
import { MessageAttributes }                                     from '@node-ts/bus-messages'
import { Container }                                             from 'inversify'

// @ts-ignore
import { Logger }                                                from '@atls/nestjs-logger'

import { Bus }                                                   from './bus'
import { HandlerRegistry }                                       from './handler'
import { ExplorerService }                                       from './services'

@Global()
@Module({})
export class BusCoreModule implements OnModuleInit, OnModuleDestroy, OnApplicationBootstrap {
  @Inject(ApplicationBootstrap)
  private readonly applicationBootstrap: ApplicationBootstrap

  private readonly bus: Bus

  constructor(private readonly explorerService: ExplorerService) {}

  static forRoot(transportProvider: any): DynamicModule {
    const messageHandlingContextProvider = {
      provide: BUS_SYMBOLS.MessageHandlingContext,
      useValue: new MessageAttributes(),
    }

    const handlerRegistryProvider = {
      provide: HandlerRegistry,
      useFactory: (logger, moduleRef) => new HandlerRegistry(logger, moduleRef),
      inject: [Logger, ModuleRef],
    }

    const busProvider = {
      provide: Bus,
      useFactory: (transport, logger, handlerRegistry, messageHandlingContext) =>
        // @ts-ignore
        new Bus(transport, logger, handlerRegistry, messageHandlingContext),
      inject: [BUS_SYMBOLS.Transport, Logger, HandlerRegistry, BUS_SYMBOLS.MessageHandlingContext],
    }

    const applicationBootstrapProvider = {
      provide: ApplicationBootstrap,
      useFactory: (bus, transport, handlerRegistry, logger) =>
        new ApplicationBootstrap(bus, transport, handlerRegistry, logger),
      inject: [Bus, BUS_SYMBOLS.Transport, HandlerRegistry, Logger],
    }

    return {
      module: BusCoreModule,
      providers: [
        ExplorerService,
        messageHandlingContextProvider,
        handlerRegistryProvider,
        transportProvider,
        busProvider,
        applicationBootstrapProvider,
      ],
      exports: [busProvider, applicationBootstrapProvider, handlerRegistryProvider],
    }
  }

  async onModuleInit() {
    const { events } = this.explorerService.explore()

    events.forEach((event) => {
      this.applicationBootstrap.registerHandler(event)
    })
  }

  async onApplicationBootstrap() {
    const container = new Container()

    container.bind(BUS_INTERNAL_SYMBOLS.SessionScopeBinder).toConstantValue((bind) => {
      bind(BUS_SYMBOLS.Bus).toConstantValue(this.bus)
    })

    await this.applicationBootstrap.initialize(container)
  }

  async onModuleDestroy() {
    await this.applicationBootstrap.dispose()
  }
}
