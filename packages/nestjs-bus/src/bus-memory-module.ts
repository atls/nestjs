import { Module, DynamicModule, OnModuleInit, Global, Inject, OnModuleDestroy, OnApplicationBootstrap } from '@nestjs/common'
import { MetadataScanner } from '@nestjs/core'
import { ApplicationBootstrap, BusModule, BUS_SYMBOLS } from '@node-ts/bus-core'
import { LOGGER_SYMBOLS } from '@node-ts/logger-core'
import { Container } from 'inversify'
import { Logger, LoggerModule } from '@atlantis-lab/nestjs-logger'
import { busServiceProviders, applicationBootstrapProviders, handlerRegistryProviders, applicationContainer } from './providers'
import { APPLICATION_CONTAINER } from './symbols'
import { ExplorerService } from './services'

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
  exports: [
    ...busServiceProviders,
    ...applicationBootstrapProviders,
    ...handlerRegistryProviders,
  ],
})
export class BusMemoryModule implements OnModuleInit, OnModuleDestroy, OnApplicationBootstrap {
  public constructor(
    @Inject(APPLICATION_CONTAINER)
    private readonly applicationContainer: Container,
    private readonly applicationBootstrap: ApplicationBootstrap,
    private readonly logger: Logger,
    private readonly explorerService: ExplorerService,
  ) {}

  public onModuleInit() {
    this.applicationContainer.rebind(LOGGER_SYMBOLS.Logger).toConstantValue(this.logger)
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
