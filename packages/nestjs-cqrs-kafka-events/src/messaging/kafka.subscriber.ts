import type { Consumer }        from '@atls/nestjs-kafka'
import type { Kafka }           from '@atls/nestjs-kafka'
import type { OnModuleDestroy } from '@nestjs/common'
import type { IEvent }          from '@nestjs/cqrs'
import type { IMessageSource }  from '@nestjs/cqrs'
import type { Subject }         from 'rxjs'

import { parse }                from 'telejson'

export class KafkaSubscriber implements IMessageSource, OnModuleDestroy {
  private readonly kafkaConsumer: Consumer

  private bridge?: Subject<IEvent>

  constructor(kafka: Kafka, groupId: string) {
    this.kafkaConsumer = kafka.consumer({ groupId })
  }

  async onModuleDestroy(): Promise<void> {
    await this.kafkaConsumer.disconnect()
  }

  async connect(events: Array<FunctionConstructor>): Promise<void> {
    await this.kafkaConsumer.connect()

    for await (const event of events) {
      await this.kafkaConsumer.subscribe({ topic: event.name, fromBeginning: false })
    }

    await this.kafkaConsumer.run({
      eachMessage: async ({ topic, message }) => {
        if (!this.bridge) return

        for (const Event of events) {
          if (Event.name === topic) {
            const parsedJson = parse((message.value || '').toString())
            const receivedEvent: IEvent = Object.assign(new Event(), parsedJson)

            this.bridge.next(receivedEvent)
          }
        }
      },
    })
  }

  bridgeEventsTo<T extends IEvent>(subject: Subject<T>): void {
    this.bridge = subject as unknown as Subject<IEvent>
  }
}
