import { ErrorStatus }  from '@atls/grpc-error-status'
import { Metadata }     from '@grpc/grpc-js'
import { Controller }   from '@nestjs/common'
import { GrpcMethod }   from '@nestjs/microservices'
import { RpcException } from '@nestjs/microservices'

type Movie = {
  name: string
  rating: number
  year: number
}

@Controller()
export class MoviesController {
  @GrpcMethod('ExampleService', 'getMovies')
  getMovies(_: unknown, metadata: Metadata): { result: Array<Movie> } {
    return {
      result: [
        {
          name: 'Mission: Impossible Rogue Nation',
          rating: 0.97,
          year: 2015,
        },
      ],
    }
  }

  @GrpcMethod('ExampleService', 'GetMetadata')
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type, @typescript-eslint/explicit-module-boundary-types
  getMetadata(_: unknown, metadata: Metadata) {
    return metadata.getMap()
  }

  @GrpcMethod('ExampleService', 'GetError')
  getError(): void {
    throw new RpcException(new ErrorStatus(3, 'Test').toServiceError())
  }

  @GrpcMethod('ExampleService', 'GetMustRename')
  getRenamed(): { result: string } {
    return {
      result: 'success',
    }
  }
}
