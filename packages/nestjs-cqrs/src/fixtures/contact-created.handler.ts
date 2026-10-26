import type { IEventHandler } from '@nestjs/cqrs'

import { EventsHandler }      from '@nestjs/cqrs'

import { ContactCreated }     from './contact-created.js'

@EventsHandler(ContactCreated)
export class ContactCreatedHandler implements IEventHandler<ContactCreated> {
  handled = false

  handle(): void {
    this.handled = true
  }
}
