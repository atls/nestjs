import type { NestInterceptor }  from '@nestjs/common'
import type { ExecutionContext } from '@nestjs/common'
import type { CallHandler }      from '@nestjs/common'

import { RequestContext }        from '@mikro-orm/core'
import { MikroORM }              from '@mikro-orm/core'
import { Injectable }            from '@nestjs/common'
import { Observable }            from 'rxjs'

@Injectable()
export class MikroORMRequestContextInterceptor implements NestInterceptor {
  constructor(private readonly orm: MikroORM) {}

  intercept(_: ExecutionContext, next: CallHandler): Observable<any> {
    return new Observable((subscriber) => {
      RequestContext.createAsync(
        this.orm.em,
        async () =>
          new Promise<void>((resolve) => {
            next.handle().subscribe(
              (result) => {
                subscriber.next(result)
                subscriber.complete()
                resolve()
              },
              (error) => {
                subscriber.error(error)
                resolve()
              }
            )
          })
      )
    })
  }
}
