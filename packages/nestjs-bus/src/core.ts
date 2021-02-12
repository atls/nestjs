import { ApplicationBootstrap, BUS_SYMBOLS } from '@node-ts/bus-core'
import { BUS_INTERNAL_SYMBOLS }              from '@node-ts/bus-core/dist/bus-symbols'
import { MessageAttributes }                 from '@node-ts/bus-messages'
import { Container }                         from 'inversify'

import { Logger, LoggerModule }              from '@atlantis-lab/nestjs-logger'
import {
  DynamicModule,
  Global,
  Module,
  OnApplicationBootstrap,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common'
import { ModuleRef }                         from '@nestjs/core'

import { Bus }                               from './bus'
import { HandlerRegistry }                   from './handler'
import { ExplorerService }                   from './services'

@Global()
@Module({})
export class BusCoreModule implements OnModuleInit, OnModuleDestroy, OnApplicationBootstrap {
  constructor(
    private readonly explorerService: ExplorerService,
    private readonly applicationBootstrap: ApplicationBootstrap,
    private readonly bus: Bus
  ) {}

  static forRoot(transportProvider: any): DynamicModule {
    const messageHandlingContextProvider = {
      provide: BUS_SYMBOLS.MessageHandlingContext,
      useValue: new MessageAttributes(),
    }
    const handlerRegistryProvider = {
      provide: HandlerRegistry,
      useFactory: (logger: any, moduleRef: any) => new HandlerRegistry(logger, moduleRef),
      inject: [Logger, ModuleRef],
    }
    const busProvider = {
      provide: Bus,
      useFactory: (
        transport: any,
        logger: any,
        handlerRegistry: any,
        messageHandlingContext: any,
        busHooks?: any,
        busConfiguration?: any,
        rawMessage?: any
      ) =>
        new Bus(
          transport,
          logger,
          handlerRegistry,
          messageHandlingContext,
          busHooks,
          busConfiguration,
          rawMessage
        ),
      inject: [BUS_SYMBOLS.Transport, Logger, HandlerRegistry, BUS_SYMBOLS.MessageHandlingContext],
    }
    const applicationBootstrapProvider = {
      provide: ApplicationBootstrap,
      useFactory: (bus: any, transport: any, handlerRegistry: any, logger: any) =>
        new ApplicationBootstrap(bus, transport, handlerRegistry, logger),
      inject: [Bus, BUS_SYMBOLS.Transport, HandlerRegistry, Logger],
    }
    return {
      module: BusCoreModule,
      imports: [LoggerModule.forRoot()],
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

  async onModuleInit(): Promise<void> {
    const { events } = this.explorerService.explore()
    events.map((event: any) => this.applicationBootstrap.registerHandler(event))
  }

  async onApplicationBootstrap(): Promise<void> {
    const container = new Container()
    container.bind(BUS_INTERNAL_SYMBOLS.SessionScopeBinder).toConstantValue((bind: any) => {
      bind(BUS_SYMBOLS.Bus).toConstantValue(this.bus)
    })

    // @ts-ignore
    await this.applicationBootstrap.initialize(container)
  }

  async onModuleDestroy(): Promise<void> {
    await this.applicationBootstrap.dispose()
  }
}
