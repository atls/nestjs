import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common'
import { Observable, of, throwError }                                 from 'rxjs'

// eslint-disable-next-line
import { catchError }                                                 from 'rxjs/operators'

const mapErrors = (result, error) => {
  if (error.children && error.children.length > 0) {
    return {
      ...result,
      [error.property]: error.children.reduce(mapErrors, {}),
    }
  }

  return {
    ...result,
    [error.property]: Object.values(error.constraints)[0] || '',
  }
}

@Injectable()
export class MapValidationErrorsInterceptor implements NestInterceptor {
  // eslint-disable-next-line class-methods-use-this
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      catchError((error) => {
        if (error.response && error.response.message && Array.isArray(error.response.message)) {
          const errors = error.response.message

          return of({ errors: errors.reduce(mapErrors, {}) })
        }
        if (error.message && error.message.message && Array.isArray(error.message.message)) {
          const errors = error.message.message

          return of({ errors: errors.reduce(mapErrors, {}) })
        }

        return throwError(error)
      })
    )
  }
}
