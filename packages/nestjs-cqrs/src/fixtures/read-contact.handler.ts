import type { IQueryHandler } from '@nestjs/cqrs'

import { QueryHandler }       from '@nestjs/cqrs'

import { ReadContact }        from './read-contact.js'

@QueryHandler(ReadContact)
export class ReadContactHandler implements IQueryHandler<ReadContact> {
  async execute(): Promise<string> {
    return 'contact'
  }
}
