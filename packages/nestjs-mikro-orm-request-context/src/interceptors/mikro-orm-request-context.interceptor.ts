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

  intercept<T>(_: ExecutionContext, next: CallHandler): Observable<T> {
    return new Observable<T>((subscriber) => {
      RequestContext.createAsync(
        this.orm.em,
        async () =>
          new Promise<void>((resolve) => {
            const stream = next.handle() as Observable<T>

            stream.subscribe({
              next: (result) => {
                subscriber.next(result)
                subscriber.complete()
                resolve()
              },
              error: (error: unknown) => {
                subscriber.error(error)
                resolve()
              },
              complete: () => {
                subscriber.complete()
                resolve()
              },
            })
          })
      )
    })
  }
}
