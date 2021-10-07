import { Controller }   from '@nestjs/common'
import { GrpcMethod }   from '@nestjs/microservices'
import { RpcException } from '@nestjs/microservices'
import { ErrorStatus }  from '@atls/grpc-error-status'

@Controller()
export class MoviesController {
  @GrpcMethod('ExampleService', 'getMovies')
  getMovies(_, metadata) {
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
  getMetadata(_, metadata) {
    return metadata.getMap()
  }

  @GrpcMethod('ExampleService', 'GetError')
  getError() {
    throw new RpcException(new ErrorStatus(3, 'Test').toServiceError())
  }

  @GrpcMethod('ExampleService', 'GetMustRename')
  getRenamed() {
    return {
      result: 'success',
    }
  }
}
