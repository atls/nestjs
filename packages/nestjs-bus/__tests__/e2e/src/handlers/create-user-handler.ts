import { Handler } from '@node-ts/bus-core'
import { CreateUserCommand, UserCreatedEvent } from '../messages'
import { userRepository } from '../repository'
import { UserModel } from '../models'
import { Bus, HandlesMessage } from '../../../../src'

@HandlesMessage(CreateUserCommand)
export class UserCreatedHandler implements Handler<CreateUserCommand> {
  public constructor(
    private readonly bus: Bus,
  ) {}

  public async handle(command: CreateUserCommand) {
    const user = new UserModel(command.id, command.username)
    
    userRepository.save(user)

    await this.bus.publish(new UserCreatedEvent(command.id, command.username))
  }
}
