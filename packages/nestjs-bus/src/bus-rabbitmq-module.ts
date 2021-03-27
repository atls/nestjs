import { Module, DynamicModule, Global, OnModuleInit, Inject, OnApplicationBootstrap, OnModuleDestroy } from '@nestjs/common'
import * as NodeTSBusRabbitMQ from '@node-ts/bus-rabbitmq'
import { LOGGER_SYMBOLS } from '@node-ts/logger-core'
import { ApplicationBootstrap, BusModule } from '@node-ts/bus-core'
import { Container } from 'inversify'
import { Logger, LoggerModule } from '@atlantis-lab/nestjs-logger'
import { APPLICATION_CONTAINER, BUS_RABBITMQ_CONFIGURATION } from './symbols'
import { busService, handlerRegistry, applicationBootstrap, applicationContainer } from './providers'
import { ExplorerService } from './services'

@Global()
@Module({
  imports: [LoggerModule],
  providers: [busService, handlerRegistry, applicationBootstrap, applicationContainer, ExplorerService],
  exports: [busService, handlerRegistry, applicationBootstrap],
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
    this.applicationContainer.load(
      new NodeTSBusRabbitMQ.BusRabbitMqModule(),
    )

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
