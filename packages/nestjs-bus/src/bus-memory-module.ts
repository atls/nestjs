import {
  Global,
  Inject,
  Module,
  OnApplicationBootstrap,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common'
import { ApplicationBootstrap }  from '@node-ts/bus-core'
import { LOGGER_SYMBOLS }        from '@node-ts/logger-core'
import { Container }             from 'inversify'

import { Logger, LoggerModule }  from '@atlantis-lab/nestjs-logger'

import { ExplorerService }       from './services'
import { APPLICATION_CONTAINER } from './symbols'
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
