import * as NodeTSBusRabbitMQ                                            from '@node-ts/bus-rabbitmq'
import { DynamicModule, Global, Inject, Module, OnModuleInit, Optional } from '@nestjs/common'
import { ApplicationBootstrap }                                          from '@node-ts/bus-core'
import { LOGGER_SYMBOLS }                                                from '@node-ts/logger-core'
import { Container }                                                     from 'inversify'

// eslint-disable-next-line
import { Logger, LoggerModule }                                          from '@atlantis-lab/nestjs-logger'

import { ExplorerService }                                               from './services'
import { APPLICATION_CONTAINER, BUS_RABBITMQ_CONFIGURATION }             from './symbols'
import { busRabbitMQConfigurationFactory }                               from './factory'
import {
  applicationBootstrapProviders,
  applicationContainer as applicationContainerProvider,
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
    applicationContainerProvider,
    ExplorerService,
  ],
  exports: [...busServiceProviders, ...applicationBootstrapProviders, ...handlerRegistryProviders],
})
export class BusCoreModule implements OnModuleInit {
  public constructor(
    @Inject(APPLICATION_CONTAINER)
    private readonly applicationContainer: Container,
    private readonly applicationBootstrap: ApplicationBootstrap,
    private readonly logger: Logger,
    private readonly explorerService: ExplorerService,
    @Optional()
    @Inject(BUS_RABBITMQ_CONFIGURATION)
    private readonly busRabbitmqConfiguration: NodeTSBusRabbitMQ.RabbitMqTransportConfiguration,
  ) {}

  public static forRabbitMQ(configuration: NodeTSBusRabbitMQ.RabbitMqTransportConfiguration) {
    const busRabbitMQConfiguration = busRabbitMQConfigurationFactory(configuration)
    const module: DynamicModule = {
      module: BusCoreModule,
      providers: [busRabbitMQConfiguration],
    }
    return module
  }

  public static forMemory() {
    const module: DynamicModule = {
      module: BusCoreModule,
    }
    return module
  }

  public onModuleInit() {
    this.applicationContainer.rebind(LOGGER_SYMBOLS.Logger).toConstantValue(this.logger)

    if (this.busRabbitmqConfiguration !== undefined) {
      this.applicationContainer.load(new NodeTSBusRabbitMQ.BusRabbitMqModule())

      this.applicationContainer
        .bind(NodeTSBusRabbitMQ.BUS_RABBITMQ_SYMBOLS.TransportConfiguration)
        .toConstantValue(this.busRabbitmqConfiguration)
    }

    const { events } = this.explorerService.explore()
    events.map((event: any) => this.applicationBootstrap.registerHandler(event))
  }

  public onApplicationBootstrap() {
    this.applicationBootstrap.initialize(this.applicationContainer)
  }

  public onModuleDestroy() {
    this.applicationBootstrap.dispose()
  }
}
