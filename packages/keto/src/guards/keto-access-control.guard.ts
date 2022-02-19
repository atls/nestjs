import { CanActivate }            from '@nestjs/common'
import { ExecutionContext }       from '@nestjs/common'
import { Injectable }             from '@nestjs/common'
import { Reflector }              from '@nestjs/core'
import { GqlExecutionContext }    from '@nestjs/graphql'
import { EnginesApi }             from '@oryd/keto-client'

import { ACCESS_POLICY_METADATA } from '../constants'
import { ResourceService }        from '../services'

@Injectable()
export class KetoAccessControlGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private keto: EnginesApi,
    private resourceService: ResourceService
  ) {}

  getSubject(context: ExecutionContext) {
    if ((context.getType() as string) === 'graphql') {
      const gqlContext = GqlExecutionContext.create(context)

      return gqlContext.getContext().user
    }

    return context.switchToHttp().getRequest().get('x-user')
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const subject = this.getSubject(context)

    const policy = this.reflector.get<any>(ACCESS_POLICY_METADATA, context.getHandler())

    if (!policy) {
      return true
    }

    if (!subject) {
      return false
    }

    try {
      const { body } = await this.keto.doOryAccessControlPoliciesAllow(policy.flavor, {
        subject,
        resource: this.resourceService.withScope(policy.resource),
        action: policy.action,
        context: {},
      })

      return body.allowed
    } catch (error) {
      return false
    }
  }
}
