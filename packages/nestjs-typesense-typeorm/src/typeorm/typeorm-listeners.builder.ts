/* eslint-disable max-classes-per-file */

import type { OnModuleInit }              from '@nestjs/common'
import type { EntitySubscriberInterface } from 'typeorm'
import type { InsertEvent }               from 'typeorm'
import type { UpdateEvent }               from 'typeorm'

import { Logger }                         from '@atls/logger'
import { Injectable }                     from '@nestjs/common'
import { Connection }                     from 'typeorm'

import { TypesenseMetadataRegistry }      from '@atls/nestjs-typesense'

import { EntityToDocumentMapper }         from '../typesense/index.js'

@Injectable()
export class TypeOrmListenersBuilder implements OnModuleInit {
  private readonly logger = new Logger(TypeOrmListenersBuilder.name)

  constructor(
    private readonly registry: TypesenseMetadataRegistry,
    private readonly mapper: EntityToDocumentMapper,
    private readonly connection: Connection
  ) {}

  onModuleInit(): void {
    this.build()
  }

  build(): void {
    for (const target of this.registry.getTargets()) {
      const Subscriber = class EntitySubscriber implements EntitySubscriberInterface {
        constructor(
          private readonly mapper: EntityToDocumentMapper,
          connection: Connection
        ) {
          connection.subscribers.push(this)
        }

        // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
        listenTo() {
          return target
        }

        afterInsert(event: InsertEvent<any>): void {
          this.mapper.insert(event.entity)
        }

        afterUpdate(event: UpdateEvent<any>): void {
          this.mapper.update(event.entity)
        }
      }

      // eslint-disable-next-line no-new
      new Subscriber(this.mapper, this.connection)
    }
  }
}
