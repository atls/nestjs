import assert                    from 'node:assert/strict'
import { it }                    from 'node:test'

import { Module }                from '@nestjs/common'
import { NestFactory }           from '@nestjs/core'
import { CommandBus }            from '@nestjs/cqrs'
import { QueryBus }              from '@nestjs/cqrs'
import { EventBus }              from '@nestjs/cqrs'

import { CqrsModule }            from './cqrs.module.js'
import { ContactCreatedHandler } from './fixtures/contact-created.handler.js'
import { ContactCreated }        from './fixtures/contact-created.js'
import { CreateContactHandler }  from './fixtures/create-contact.handler.js'
import { CreateContact }         from './fixtures/create-contact.js'
import { ReadContactHandler }    from './fixtures/read-contact.handler.js'
import { ReadContact }           from './fixtures/read-contact.js'

@Module({
  imports: [CqrsModule.forRoot()],
  providers: [CreateContactHandler, ReadContactHandler, ContactCreatedHandler],
})
class ContactModule {}

it('discovers and dispatches commands, queries and events during application bootstrap', async () => {
  const application = await NestFactory.createApplicationContext(ContactModule, { logger: false })

  try {
    assert.equal(await application.get(CommandBus).execute(new CreateContact()), 'created')
    assert.equal(await application.get(QueryBus).execute(new ReadContact()), 'contact')

    application.get(EventBus).publish(new ContactCreated())

    assert.equal(application.get(ContactCreatedHandler).handled, true)
  } finally {
    await application.close()
  }
})
