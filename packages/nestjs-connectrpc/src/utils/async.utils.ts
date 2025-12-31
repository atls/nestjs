import type { ResultOrDeferred } from '../connectrpc.interfaces.js'

import { Observable }            from 'rxjs'
import { Subject }               from 'rxjs'
import { from }                  from 'rxjs'
import { lastValueFrom }         from 'rxjs'

/**
 * Type guard to check if a given input is an AsyncGenerator.
 * @param {unknown} input - The input to check.
 * @returns {boolean} - True if the input is an AsyncGenerator, otherwise false.
 */
export function isAsyncGenerator<T>(input: unknown): input is AsyncGenerator<T> {
  return typeof input === 'object' && input !== null && Symbol.asyncIterator in input
}

/**
 * Utility function to create an async iterator for a Subject.
 * @param {Subject<T>} subject - The Subject to create an iterator from.
 * @returns {AsyncIterableIterator<T>} - The async iterator.
 */
async function* asyncIterator<T>(subject: Subject<T>): AsyncIterableIterator<T> {
  const nextValue = async (): Promise<T | null> =>
    new Promise<T | null>((resolve, reject) => {
      subject.subscribe({
        next: (val) => {
          resolve(val)
        },
        error: (err) => {
          reject(err)
        },
        complete: () => {
          resolve(null)
        },
      })
    })

  while (true) {
    // eslint-disable-next-line no-await-in-loop
    const item = await nextValue()
    if (item === null) return
    yield item
  }
}

/**
 * Converts an Observable to an AsyncGenerator, yielding items emitted by the Observable.
 * @param {Observable<T>} observable - The Observable to convert.
 * @returns {AsyncGenerator<T>} - An AsyncGenerator that yields each emitted value from the Observable.
 */
export async function* observableToAsyncGenerator<T>(observable: Observable<T>): AsyncGenerator<T> {
  const queue = new Subject<T>()

  const subscriber = observable.subscribe({
    next: (value) => {
      queue.next(value)
    },
    error: (error) => {
      queue.error(error)
    },
    complete: () => {
      queue.complete()
    },
  })

  try {
    for await (const item of asyncIterator(queue)) {
      yield item
    }
  } finally {
    subscriber.unsubscribe()
  }
}

/**
 * Type guard to check if a given object is an Observable.
 * @param {unknown} object - The object to check.
 * @returns {boolean} - True if the object is an Observable, otherwise false.
 */
export const isObservable = <T>(object: unknown): object is Observable<T> =>
  object instanceof Observable

type Subscriber = (observer: {
  next?: (value: unknown) => void
  error?: (error: unknown) => void
  complete?: () => void
}) => unknown

/**
 * Type guard to check if a given object has a subscribe method.
 * @param {unknown} object - The object to check.
 * @returns {boolean} - True if the object has a subscribe method, otherwise false.
 */
export const hasSubscribe = (object: unknown): object is { subscribe: Subscriber } =>
  typeof object === 'object' &&
  object !== null &&
  typeof (object as { subscribe?: () => void }).subscribe === 'function'

/**
 * Type guard to check if a given object has a toPromise method.
 * @param {unknown} object - The object to check.
 * @returns {boolean} - True if the object has a toPromise method, otherwise false.
 */
export const hasToPromise = (object: unknown): object is { toPromise: () => Promise<unknown> } =>
  typeof object === 'object' &&
  object !== null &&
  typeof (object as { toPromise?: () => Promise<unknown> }).toPromise === 'function'

/**
 * Converts various types to an Observable, supporting objects that are Observables, have a subscribe or toPromise method.
 * @param {ResultOrDeferred<T>} resultOrDeferred - The result or deferred value to convert.
 * @returns {Observable<T>} - An Observable that emits the result or deferred value.
 */
export const transformToObservable = <T>(resultOrDeferred: ResultOrDeferred<T>): Observable<T> => {
  if (isObservable(resultOrDeferred)) {
    return resultOrDeferred as Observable<T>
  }
  if (hasSubscribe(resultOrDeferred)) {
    return new Observable<T>((subscriber) => {
      ;(resultOrDeferred.subscribe as Subscriber)({
        next: (value) => {
          subscriber.next(value as T)
        },
        error: (error) => {
          subscriber.error(error)
        },
        complete: () => {
          subscriber.complete()
        },
      })
    })
  }
  if (hasToPromise(resultOrDeferred)) {
    return from(lastValueFrom(resultOrDeferred as Observable<T>))
  }
  return new Observable((subscriber) => {
    subscriber.next(resultOrDeferred)
    subscriber.complete()
  })
}

/**
 * Converts either an AsyncGenerator or an Observable to an AsyncGenerator.
 * @param {AsyncGenerator<T> | Observable<T>} input - The input to convert.
 * @returns {AsyncGenerator<T>} - An AsyncGenerator that yields values from the input.
 * @throws {TypeError} - If the input is not an AsyncGenerator or Observable.
 */
export async function* toAsyncGenerator<T>(
  input: AsyncGenerator<T> | Observable<T>
): AsyncGenerator<T> {
  if (isObservable(input)) {
    yield* observableToAsyncGenerator(input)
  } else if (isAsyncGenerator(input)) {
    yield* input
  } else {
    throw new TypeError('Unsupported input type. Expected an Observable or an AsyncGenerator.')
  }
}
