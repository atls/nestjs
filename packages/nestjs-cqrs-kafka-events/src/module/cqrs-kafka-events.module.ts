import type { KafkaConfig }                       from '@atls/nestjs-kafka'
import type { DynamicModule }                     from '@nestjs/common'
import type { OnModuleInit }                      from '@nestjs/common'
import type { Provider }                          from '@nestjs/common'

import type { CqrsKafkaEventsModuleOptions }      from './cqrs-kafka-events.module.interfaces.js'
import type { CqrsKafkaEventsModuleAsyncOptions } from './cqrs-kafka-events.module.interfaces.js'
import type { CqrsKafkaEventsOptionsFactory }     from './cqrs-kafka-events.module.interfaces.js'

import { Module }                                 from '@nestjs/common'
import { EventBus }                               from '@nestjs/cqrs'
import { EVENTS_HANDLER_METADATA }                from '@nestjs/cqrs/dist/decorators/constants.js'
import { ExplorerService }                        from '@nestjs/cqrs/dist/services/explorer.service.js'

import { KafkaModule }                            from '@atls/nestjs-kafka'
import { KafkaFactory }                           from '@atls/nestjs-kafka'
import { Kafka }                                  from '@atls/nestjs-kafka'

import { KafkaPublisher }                         from '../messaging/index.js'
import { KafkaSubscriber }                        from '../messaging/index.js'
import { CQRS_KAFKA_EVENTS_MODULE_OPTIONS }       from './cqrs-kafka-events.module.constants.js'

@Module({})
export class CqrsKafkaEventsModule implements OnModuleInit {
  constructor(
    private readonly eventBus: EventBus,
    private readonly kafkaPublisher: KafkaPublisher,
    private readonly kafkaSubscriber: KafkaSubscriber,
    private readonly explorerService: ExplorerService
  ) {}

  static register(options: CqrsKafkaEventsModuleOptions): DynamicModule {
    return {
      module: CqrsKafkaEventsModule,
      imports: [KafkaModule.register(options)],
      providers: [
        {
          provide: CQRS_KAFKA_EVENTS_MODULE_OPTIONS,
          useValue: options,
        },
        {
          provide: Kafka,
          useFactory: (kafkaFactory: KafkaFactory, config: Partial<KafkaConfig>): Kafka =>
            kafkaFactory.create(config),
          inject: [KafkaFactory, CQRS_KAFKA_EVENTS_MODULE_OPTIONS],
        },
        {
          provide: KafkaSubscriber,
          useFactory: (
            kafka: Kafka,
            moduleOptions: CqrsKafkaEventsModuleOptions
          ): KafkaSubscriber =>
            new KafkaSubscriber(
              kafka,
              moduleOptions.groupId || process.env.CQRS_KAFKA_EVENTS_GROUP_ID || 'default'
            ),
          inject: [Kafka, CQRS_KAFKA_EVENTS_MODULE_OPTIONS],
        },
        {
          provide: KafkaPublisher,
          useFactory: (kafka: Kafka): KafkaPublisher => new KafkaPublisher(kafka),
          inject: [Kafka],
        },
      ],
    }
  }

  static registerAsync(options: CqrsKafkaEventsModuleAsyncOptions): DynamicModule {
    return {
      module: CqrsKafkaEventsModule,
      imports: [KafkaModule.register(), ...(options.imports || [])],
      providers: [
        ...this.createAsyncProviders(options),
        {
          provide: Kafka,
          useFactory: (kafkaFactory: KafkaFactory, config: Partial<KafkaConfig>): Kafka =>
            kafkaFactory.create(config),
          inject: [KafkaFactory, CQRS_KAFKA_EVENTS_MODULE_OPTIONS],
        },
        {
          provide: KafkaSubscriber,
          useFactory: (
            kafka: Kafka,
            moduleOptions: CqrsKafkaEventsModuleOptions
          ): KafkaSubscriber =>
            new KafkaSubscriber(
              kafka,
              moduleOptions.groupId || process.env.CQRS_KAFKA_EVENTS_GROUP_ID || 'default'
            ),
          inject: [Kafka, CQRS_KAFKA_EVENTS_MODULE_OPTIONS],
        },
        {
          provide: KafkaPublisher,
          useFactory: (kafka: Kafka): KafkaPublisher => new KafkaPublisher(kafka),
          inject: [Kafka],
        },
      ],
    }
  }

  private static createAsyncProviders(options: CqrsKafkaEventsModuleAsyncOptions): Array<Provider> {
    if (options.useExisting || options.useFactory) {
      return [this.createAsyncOptionsProvider(options)]
    }

    if (!options.useClass) {
      throw new Error(
        'CqrsKafkaEventsModule requires useClass when useExisting/useFactory not provided'
      )
    }

    return [
      this.createAsyncOptionsProvider(options),
      {
        provide: options.useClass,
        useClass: options.useClass,
      },
    ]
  }

  private static createAsyncOptionsProvider(options: CqrsKafkaEventsModuleAsyncOptions): Provider {
    if (options.useFactory) {
      return {
        provide: CQRS_KAFKA_EVENTS_MODULE_OPTIONS,
        useFactory: options.useFactory,
        inject: options.inject || [],
      }
    }

    const injectTarget = options.useExisting ?? options.useClass
    if (!injectTarget) {
      throw new Error('CqrsKafkaEventsModule requires useExisting, useClass, or useFactory')
    }

    return {
      provide: CQRS_KAFKA_EVENTS_MODULE_OPTIONS,
      useFactory: (
        optionsFactory: CqrsKafkaEventsOptionsFactory
      ): CqrsKafkaEventsModuleOptions | Promise<CqrsKafkaEventsModuleOptions> =>
        optionsFactory.createCqrsKafkaEventsOptions(),

      inject: [injectTarget],
    }
  }

  async onModuleInit(): Promise<void> {
    await this.kafkaPublisher.connect()
    await this.kafkaSubscriber.connect(
      (this.explorerService.explore().events || [])
        .map(
          (handler) => Reflect.getMetadata(EVENTS_HANDLER_METADATA, handler) as FunctionConstructor
        )
        .flat()
    )

    this.eventBus.publisher = this.kafkaPublisher
    this.kafkaSubscriber.bridgeEventsTo(this.eventBus.subject$)
  }
}
