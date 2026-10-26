import type { ICommandHandler } from '@nestjs/cqrs'

import { CommandHandler }       from '@nestjs/cqrs'

import { CreateContact }        from './create-contact.js'

@CommandHandler(CreateContact)
export class CreateContactHandler implements ICommandHandler<CreateContact> {
  async execute(): Promise<string> {
    return 'created'
  }
}
