import type { ResultOrDeferred } from './connectrpc.interfaces.js'

import { Observable }            from 'rxjs'

export function isAsyncGenerator<T>(input: unknown): input is AsyncGenerator<T> {
  return typeof input === 'object' && input !== null && Symbol.asyncIterator in input
}

export async function* observableToAsyncGenerator<T>(observable: Observable<T>): AsyncGenerator<T> {
  const queue: Array<T> = []
  let didComplete = false
  let error: unknown = null

  const subscriber = observable.subscribe({
    next: (value) => {
      queue.push(value)
    },
    error: (innerError) => {
      error = innerError
      didComplete = true
    },
    complete: () => {
      didComplete = true
    },
  })

  try {
    while (!didComplete || queue.length > 0) {
      if (queue.length > 0) {
        const item = queue.shift()
        if (item !== undefined) {
          yield item
        }
      } else {
        // eslint-disable-next-line no-await-in-loop, no-promise-executor-return
        await new Promise((resolve) => setTimeout(resolve, 10))
      }
    }

    if (error) {
      throw new Error(String(error))
    }
  } finally {
    subscriber.unsubscribe()
  }
}

export const isObservable = <T>(object: unknown): object is Observable<T> =>
  object instanceof Observable

export const hasSubscribe = (object: unknown): object is { subscribe: () => void } =>
  typeof object === 'object' &&
  object !== null &&
  typeof (object as { subscribe?: () => void }).subscribe === 'function'

export const hasToPromise = (object: unknown): object is { toPromise: () => Promise<unknown> } =>
  typeof object === 'object' &&
  object !== null &&
  typeof (object as { toPromise?: () => Promise<unknown> }).toPromise === 'function'

export const transformToObservable = <T>(resultOrDeferred: ResultOrDeferred<T>): Observable<T> => {
  if (isObservable<T>(resultOrDeferred)) {
    return resultOrDeferred
  }
  if (hasSubscribe(resultOrDeferred)) {
    return new Observable(() => {
      resultOrDeferred.subscribe()
    })
  }
  if (hasToPromise(resultOrDeferred)) {
    return new Observable((subscriber) => {
      resultOrDeferred
        .toPromise()
        .then((response: T) => {
          subscriber.next(response)
          subscriber.complete()
        })
        .catch((error: unknown) => {
          subscriber.error(error)
        })
    })
  }
  return new Observable((subscriber) => {
    subscriber.next(resultOrDeferred)
    subscriber.complete()
  })
}

export async function* toAsyncGenerator<T>(
  input: AsyncGenerator<T> | Observable<T>
): AsyncGenerator<T> {
  if (isObservable(input)) {
    yield* observableToAsyncGenerator(input)
  } else if (isAsyncGenerator(input)) {
    yield* input
  } else {
    throw new Error('Unsupported input type. Expected an Observable or an AsyncGenerator.')
  }
}
