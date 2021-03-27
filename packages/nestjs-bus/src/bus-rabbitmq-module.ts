import * as NodeTSBusRabbitMQ                                from '@node-ts/bus-rabbitmq'
import {
  DynamicModule,
  Global,
  Inject,
  Module,
  OnApplicationBootstrap,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common'
import { ApplicationBootstrap, BusModule }                   from '@node-ts/bus-core'
import { LOGGER_SYMBOLS }                                    from '@node-ts/logger-core'
import { Container }                                         from 'inversify'

import { Logger, LoggerModule }                              from '@atlantis-lab/nestjs-logger'

import { ExplorerService }                                   from './services'
import { APPLICATION_CONTAINER, BUS_RABBITMQ_CONFIGURATION } from './symbols'
import {
  applicationBootstrapProviders,
  applicationContainer,
  busServiceProviders,
  handlerRegistryProviders,
} from './providers'

@Global()
@Module({
  imports: [LoggerModule.forRoot()],
  providers: [
    ...busServiceProviders,
    ...applicationBootstrapProviders,
    ...handlerRegistryProviders,
    applicationContainer,
    ExplorerService,
  ],
  exports: [...busServiceProviders, ...applicationBootstrapProviders, ...handlerRegistryProviders],
})
export class BusRabbitMQModule implements OnModuleInit, OnModuleDestroy, OnApplicationBootstrap {
  public constructor(
    @Inject(APPLICATION_CONTAINER)
    private readonly applicationContainer: Container,
    @Inject(BUS_RABBITMQ_CONFIGURATION)
    private readonly busRabbitMQOptions: NodeTSBusRabbitMQ.RabbitMqTransportConfiguration,
    private readonly logger: Logger,
    private readonly applicationBoorstrap: ApplicationBootstrap,
    private readonly explorerService: ExplorerService,
  ) {}

  public onModuleInit() {
    this.applicationContainer.load(new NodeTSBusRabbitMQ.BusRabbitMqModule())

    this.applicationContainer
      .bind(NodeTSBusRabbitMQ.BUS_RABBITMQ_SYMBOLS.TransportConfiguration)
      .toConstantValue(this.busRabbitMQOptions)

    this.applicationContainer.rebind(LOGGER_SYMBOLS.Logger).toConstantValue(this.logger)

    const { events } = this.explorerService.explore()
    events.map((event: any) => this.applicationBoorstrap.registerHandler(event))
  }

  public onApplicationBootstrap() {
    this.applicationBoorstrap.initialize(this.applicationContainer)
  }

  public onModuleDestroy() {
    this.applicationBoorstrap.dispose()
  }
}
