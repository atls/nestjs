import type { EntityManager }                from '@mikro-orm/core'
import type { MikroORM }                     from '@mikro-orm/core'
import type { CallHandler }                  from '@nestjs/common'
import type { ExecutionContext }             from '@nestjs/common'

import assert                                from 'node:assert/strict'
import { it }                                from 'node:test'

import { RequestContext }                    from '@mikro-orm/core'
import { defer }                             from 'rxjs'
import { firstValueFrom }                    from 'rxjs'
import { of }                                from 'rxjs'

import { MikroORMRequestContextInterceptor } from './mikro-orm-request-context.interceptor.js'

it('runs the downstream observable in a forked MikroORM request context', async () => {
  const forkedEntityManager = { name: 'default' } as EntityManager
  const entityManager = {
    name: 'default',
    fork: () => forkedEntityManager,
  } as unknown as EntityManager
  const orm = { em: entityManager } as MikroORM
  const next: CallHandler = {
    handle: () =>
      defer(() => {
        assert.equal(RequestContext.getEntityManager(), forkedEntityManager)

        return of('result')
      }),
  }

  const interceptor = new MikroORMRequestContextInterceptor(orm)
  const result = await firstValueFrom(interceptor.intercept({} as ExecutionContext, next))

  assert.equal(result, 'result')
})
