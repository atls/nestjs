import type { PipeTransform }    from '@nestjs/common'
import type { ArgumentMetadata } from '@nestjs/common'
import type { Session }          from '@ory/kratos-client'

import { Injectable }            from '@nestjs/common'

import { KratosPublicApi }       from '../client/index.js'

@Injectable()
export class WhoamiPipe implements PipeTransform {
  constructor(private readonly kratos: KratosPublicApi) {}

  public async transform(
    value: Array<string>,
    metadata: ArgumentMetadata
  ): Promise<Session | null> {
    try {
      const { data } = await this.kratos.toSession({ cookie: value[0] })

      return data
    } catch {
      // TODO: Handle errors

      return null
    }
  }
}
