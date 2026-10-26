import { EventsHandler } from '@nestjs/cqrs'

import { Received }      from './event.js'
@EventsHandler(Received)
export class Handler {
  received = false

  handle(): void {
    this.received = true
  }
}
