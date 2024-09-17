import type { DynamicModule }          from '@nestjs/common'
import type { OnApplicationBootstrap } from '@nestjs/common'
import type { IEvent }                 from '@nestjs/cqrs'

import { Module }                      from '@nestjs/common'
import { CommandBus }                  from '@nestjs/cqrs'
import { EventBus }                    from '@nestjs/cqrs'
import { EventPublisher }              from '@nestjs/cqrs'
import { QueryBus }                    from '@nestjs/cqrs'
import { UnhandledExceptionBus }       from '@nestjs/cqrs'
import { ExplorerService }             from '@nestjs/cqrs/dist/services/explorer.service.js'

@Module({
  providers: [
    CommandBus,
    QueryBus,
    EventBus,
    UnhandledExceptionBus,
    EventPublisher,
    ExplorerService,
  ],
  exports: [CommandBus, QueryBus, EventBus, UnhandledExceptionBus, EventPublisher, ExplorerService],
})
export class CqrsModule<EventBase extends IEvent = IEvent> implements OnApplicationBootstrap {
  constructor(
    private readonly explorerService: ExplorerService<EventBase>,
    private readonly eventBus: EventBus<EventBase>,
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus
  ) {}

  static forRoot(): DynamicModule {
    return {
      module: CqrsModule,
      global: true,
    }
  }

  onApplicationBootstrap(): void {
    const { events, queries, sagas, commands } = this.explorerService.explore()

    this.eventBus.register(events)
    this.commandBus.register(commands)
    this.queryBus.register(queries)
    this.eventBus.registerSagas(sagas)
  }
}
