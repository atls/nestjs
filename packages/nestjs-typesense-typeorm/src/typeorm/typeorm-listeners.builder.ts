/* eslint-disable max-classes-per-file */

import type { OnModuleInit }              from '@nestjs/common'
import type { EntitySubscriberInterface } from 'typeorm'
import type { InsertEvent }               from 'typeorm'
import type { UpdateEvent }               from 'typeorm'

import { Logger }                         from '@atls/logger'
import { Injectable }                     from '@nestjs/common'
import { DataSource }                     from 'typeorm'

import { TypesenseMetadataRegistry }      from '@atls/nestjs-typesense'

import { EntityToDocumentMapper }         from '../typesense/index.js'

@Injectable()
export class TypeOrmListenersBuilder implements OnModuleInit {
  private readonly logger = new Logger(TypeOrmListenersBuilder.name)

  constructor(
    private readonly registry: TypesenseMetadataRegistry,
    private readonly mapper: EntityToDocumentMapper,
    private readonly connection: DataSource
  ) {}

  onModuleInit(): void {
    this.build()
  }

  build(): void {
    for (const target of this.registry.getTargets()) {
      const Subscriber = class EntitySubscriber implements EntitySubscriberInterface {
        constructor(
          private readonly mapper: EntityToDocumentMapper,
          connection: DataSource
        ) {
          connection.subscribers.push(this)
        }

        listenTo() {
          return target
        }

        afterInsert(event: InsertEvent<unknown>): void {
          this.mapper.insert(event.entity as Record<string, unknown> & { id?: number | string })
        }

        afterUpdate(event: UpdateEvent<unknown>): void {
          this.mapper.update(event.entity as Record<string, unknown> & { id?: number | string })
        }
      }

      // eslint-disable-next-line no-new
      new Subscriber(this.mapper, this.connection)
    }
  }
}
