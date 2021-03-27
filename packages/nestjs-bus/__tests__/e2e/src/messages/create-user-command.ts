import { Command } from '@node-ts/bus-messages'

export class CreateUserCommand extends Command {
  $name = 'app/user/create-user'

  $version = 1

  id: number

  username: string

  public constructor(id: number, username: string) {
    super()
    this.id = id
    this.username = username
  }
}
