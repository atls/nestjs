import { Controller }               from '@nestjs/common'
import { GrpcStreamMethod }         from '@nestjs/microservices'
import { Observable }               from 'rxjs'
import { Subject }                  from 'rxjs'
import { status }                   from '@grpc/grpc-js'

import { ServerReflectionRequest }  from '../grpc'
import { ServerReflectionResponse } from '../grpc'
import { GrpcServicesRegistry }     from '../grpc'

@Controller()
export class GrpcReflectionController {
  constructor(private readonly registry: GrpcServicesRegistry) {}

  @GrpcStreamMethod('ServerReflection', 'ServerReflectionInfo')
  info(request: Observable<ServerReflectionRequest>): Observable<ServerReflectionResponse> {
    const response = new Subject<ServerReflectionResponse>()

    const onNext = (reflectionRequest: ServerReflectionRequest) => {
      if (reflectionRequest.listServices) {
        response.next({
          validHost: '',
          originalRequest: reflectionRequest,
          listServicesResponse: this.registry.getListServices(),
        })
      }

      if (reflectionRequest.fileContainingSymbol) {
        const fileDescriptorProto = this.registry.getFileDescriptorProtoByFileContainingSymbol(
          reflectionRequest.fileContainingSymbol
        )

        if (fileDescriptorProto) {
          response.next({
            validHost: '',
            originalRequest: reflectionRequest,
            fileDescriptorResponse: {
              fileDescriptorProto: [fileDescriptorProto],
            },
          })
        } else {
          response.next({
            validHost: '',
            originalRequest: reflectionRequest,
            errorResponse: {
              errorCode: status.NOT_FOUND,
              errorMessage: 'Definition not found',
            },
          })
        }
      }
    }

    request.subscribe({
      complete: () => response.complete(),
      next: onNext,
    })

    return response.asObservable()
  }
}
