import { createParamDecorator } from '@nestjs/common'
import { ExecutionContext }     from '@nestjs/common'
import { Metadata }             from '@grpc/grpc-js'

export const Subject = createParamDecorator((data: unknown, context: ExecutionContext) => {
  if (context.getType() === 'rpc') {
    const metadata = context.getArgByIndex(1)

    if (metadata instanceof Metadata) {
      const identityMetadata = metadata.get('identity')

      try {
        const identity = JSON.parse(identityMetadata[0].toString())

        return identity.sub
      } catch {
        return null
      }
    }
  }

  return null
})
