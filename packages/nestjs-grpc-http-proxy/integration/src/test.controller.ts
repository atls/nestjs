import type { Metadata }    from '@grpc/grpc-js'
import type { Observable }  from 'rxjs'

import { Controller }       from '@nestjs/common'
import { GrpcMethod }       from '@nestjs/microservices'
import { GrpcStreamMethod } from '@nestjs/microservices'
import { RpcException }     from '@nestjs/microservices'
import { Subject }          from 'rxjs'

@Controller()
export class TestController {
  @GrpcMethod('TestService', 'Test')
  test(input: { id: string }): { id: string } {
    return {
      id: input.id,
    }
  }

  @GrpcMethod('TestService', 'TestError')
  testError(input: { id: string }): void {
    throw new RpcException(new Error(input.id))
  }

  @GrpcStreamMethod('TestService', 'TestStream')
  testStream(request: Observable<{ id: string }>): Observable<{ id: string }> {
    const response = new Subject<{ id: string }>()

    request.subscribe({
      complete: () => {
        response.complete()
      },
      next: ({ id }) => {
        response.next({
          id,
        })
      },
    })

    return response.asObservable()
  }

  @GrpcMethod('TestService', 'TestAuth')
  auth(_: unknown, metadata: Metadata): { id: string } {
    const authorizationValues = metadata.get('authorization') as Array<Buffer | string>
    const authorizationValue = authorizationValues[0]
    let authorization = ''

    if (typeof authorizationValue === 'string') {
      authorization = authorizationValue
    }

    if (authorizationValue instanceof Buffer) {
      authorization = authorizationValue.toString()
    }

    return {
      id: authorization,
    }
  }
}
