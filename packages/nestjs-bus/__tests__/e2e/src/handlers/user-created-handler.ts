import { Handler } from '@node-ts/bus-core'
import { UserCreatedEvent } from '../messages'
import { HandlesMessage } from '../../../../src'

@HandlesMessage(UserCreatedEvent)
export class UserCreatedHandler implements Handler<UserCreatedEvent> {
  public async handle(event: UserCreatedEvent) {}
}
