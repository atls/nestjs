import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common'
import { Observable, of, throwError }                                 from 'rxjs'
import { catchError }                                                 from 'rxjs/operators'

const mapErrors = (result, error) => {
  if (error.children && error.children.length > 0) {
    const errors = Array.isArray(error.value)
      ? error.value.map((_, index) => {
          const itemError = error.children.find(({ property }) => property === index.toString())
          if (!itemError) return {}

          return itemError.children.reduce(mapErrors, {})
        })
      : error.children.reduce(mapErrors, {})
    return { ...result, [error.property]: errors }
  }

  return { ...result, [error.property]: Object.values(error.constraints)[0] || '' }
}

@Injectable()
export class MapValidationErrorsInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      catchError(error => {
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
