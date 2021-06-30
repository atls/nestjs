import { RpcException }     from '@nestjs/microservices'
import { ExecutionContext } from '@nestjs/common'
import { CanActivate }      from '@nestjs/common'
import { Injectable }       from '@nestjs/common'
import { ErrorStatus }      from '@atls/grpc-error-status'
import { Metadata }         from 'grpc'
import { status }           from 'grpc'

import { JwtVerifier }      from '../jwt'

@Injectable()
export class GrpcJwtIdentityGuard implements CanActivate {
  constructor(private readonly verifier: JwtVerifier) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    if (context.getType() === 'rpc') {
      const metadata = context.getArgByIndex(1)

      if (metadata instanceof Metadata) {
        const authorization = metadata.get('authorization')

        if (authorization?.[0]) {
          const [scheme, credentials] = authorization[0].toString().split(' ')

          if (/^Bearer$/i.test(scheme)) {
            const identity = await this.verifier.verify(credentials)

            if (identity) {
              metadata.add('identity', JSON.stringify(identity))

              return true
            }
          }
        }
      }
    }

    throw new RpcException(
      new ErrorStatus(status.UNAUTHENTICATED, 'Unauthenticated').toServiceError()
    )
  }
}
