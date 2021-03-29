import { Handler }           from '@node-ts/bus-core'

import { HandlesMessage }    from '../../../../src'
import { CreateUserCommand } from '../messages'
import { UserModel }         from '../models'
import { userRepository }    from '../repository'

@HandlesMessage(CreateUserCommand)
export class CreateUserHandler implements Handler<CreateUserCommand> {
  public async handle(command: CreateUserCommand) {
    const user = new UserModel(command.id, command.username)
    userRepository.save(user)
  }
}
