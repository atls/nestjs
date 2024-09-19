import { PipeTransform }    from '@nestjs/common'
import { Injectable }       from '@nestjs/common'
import { ArgumentMetadata } from '@nestjs/common'

import { KratosPublicApi }  from '../client/index.js'

@Injectable()
export class WhoamiPipe implements PipeTransform {
  constructor(private readonly kratos: KratosPublicApi) {}

  public async transform(value: string[], metadata: ArgumentMetadata) {
    try {
      const { data } = await this.kratos.toSession({ cookie: value[0] })

      return data
    } catch {
      // TODO: Handle errors

      return null
    }
  }
}
