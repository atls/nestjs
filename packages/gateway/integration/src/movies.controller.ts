import { ErrorStatus }  from '@atls/grpc-error-status'
import { Metadata }     from '@grpc/grpc-js'
import { Controller }   from '@nestjs/common'
import { GrpcMethod }   from '@nestjs/microservices'
import { RpcException } from '@nestjs/microservices'

@Controller()
export class MoviesController {
  @GrpcMethod('ExampleService', 'getMovies')
  // @ts-ignore
  getMovies(_, metadata: Metadata) {
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
  // @ts-ignore
  getMetadata(_, metadata: Metadata) {
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
