/* eslint-disable max-classes-per-file */

import { Logger }                    from '@atls/logger'
import { OnModuleInit }              from '@nestjs/common'
import { Injectable }                from '@nestjs/common'
import { EntitySubscriberInterface } from 'typeorm'
import { InsertEvent }               from 'typeorm'
import { UpdateEvent }               from 'typeorm'
import { Connection }                from 'typeorm'

import { TypesenseMetadataRegistry } from '@atls/nestjs-typesense'

import { EntityToDocumentMapper }    from '../typesense'

@Injectable()
export class TypeOrmListenersBuilder implements OnModuleInit {
  private readonly logger = new Logger(TypeOrmListenersBuilder.name)

  constructor(
    private readonly registry: TypesenseMetadataRegistry,
    private readonly mapper: EntityToDocumentMapper,
    private readonly connection: Connection
  ) {}

  onModuleInit() {
    this.build()
  }

  build() {
    for (const target of this.registry.getTargets()) {
      const Subscriber = class EntitySubscriber implements EntitySubscriberInterface<any> {
        constructor(
          private readonly mapper: EntityToDocumentMapper,
          connection: Connection
        ) {
          connection.subscribers.push(this)
        }

        listenTo() {
          return target
        }

        afterInsert(event: InsertEvent<any>) {
          this.mapper.insert(event.entity)
        }

        afterUpdate(event: UpdateEvent<any>) {
          this.mapper.update(event.entity)
        }
      }

      // eslint-disable-next-line no-new
      new Subscriber(this.mapper, this.connection)
    }
  }
}
