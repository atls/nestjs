import { Event } from '@node-ts/bus-messages'

export class UserCreatedEvent extends Event {
  $name = 'app/user/user-created'
  $version = 1
  userId: number
  username: string

  public constructor(userId: number, username: string) {
    super()
    this.userId = userId
    this.username = username
  }
}
