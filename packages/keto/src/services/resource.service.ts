import { Inject, Injectable } from '@nestjs/common'

import { RESOURCES_SCOPE }    from '../constants'

const SEPARATOR = ':'

@Injectable()
export class ResourceService {
  constructor(@Inject(RESOURCES_SCOPE) private scope: string) {}

  withScope(resource: string) {
    if (!resource) {
      return resource
    }

    if (!this.scope) {
      return resource
    }

    return [this.scope, resource].join(SEPARATOR)
  }

  withoutScope(resource: string) {
    if (!resource) {
      return resource
    }

    if (!this.scope) {
      return resource
    }

    if (resource.includes(this.scope)) {
      return resource.replace(this.scope, '').split(SEPARATOR).pop()
    }

    return resource
  }

  isMatchScope(resource: string) {
    return resource.startsWith(this.scope)
  }
}
