import { Handler } from '@node-ts/bus-core'
import { Inject } from '@nestjs/common'
import { CreateUserCommand } from '../messages'
import { userRepository } from '../repository'
import { UserModel } from '../models'
import { HandlesMessage } from '../../../../src'

@HandlesMessage(CreateUserCommand)
export class CreateUserHandler implements Handler<CreateUserCommand> {
  public async handle(command: CreateUserCommand) {
    const user = new UserModel(command.id, command.username)
    userRepository.save(user)
  }
}
