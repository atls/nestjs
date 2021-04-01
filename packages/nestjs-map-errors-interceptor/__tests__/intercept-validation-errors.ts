/* eslint-disable max-classes-per-file */

import { IsString, ValidateNested }       from 'class-validator'

import { MapValidationErrorsInterceptor } from '../src'
import { createFailedValidationHandler }  from './createFailedValidationHandler'

let interceptor: MapValidationErrorsInterceptor

const executionContext = {
  switchToHttp: jest.fn().mockReturnThis(),
  switchToRpc: jest.fn().mockReturnThis(),
  switchToWs: jest.fn().mockReturnThis(),
  getClass: jest.fn().mockReturnThis(),
  getArgs: jest.fn().mockReturnThis(),
  getArgByIndex: jest.fn().mockReturnThis(),
  getHandler: jest.fn().mockReturnThis(),
  getType: jest.fn().mockReturnThis(),
}

describe('MapValidationErrorsInterceptor', () => {
  beforeEach(() => {
    interceptor = new MapValidationErrorsInterceptor()
  })

  describe('when validate against class with scalar property', () => {
    it('should map error', () => {
      class Foo {
        // @ts-ignore
        @IsString({ each: true }) bar: any
      }
      const obj = new Foo()
      obj.bar = 1

      const expectedError = {
        errors: { bar: 'each value in bar must be a string' },
      }

      return expect(
        interceptor.intercept(executionContext, createFailedValidationHandler(obj)).toPromise(),
      ).resolves.toEqual(expectedError)
    })
  })

  describe('when validate against class with netsed object property', () => {
    it('should map error', () => {
      class NestedBar {
        // @ts-ignore
        @IsString({ each: true }) bar: any
      }
      class Foo {
        // @ts-ignore
        @ValidateNested() nestedBar: NestedBar
      }
      const nestedBar = new NestedBar()
      nestedBar.bar = 1

      const obj = new Foo()
      obj.nestedBar = nestedBar

      const expectedError = {
        errors: { nestedBar: { bar: 'each value in bar must be a string' } },
      }

      return expect(
        interceptor.intercept(executionContext, createFailedValidationHandler(obj)).toPromise(),
      ).resolves.toEqual(expectedError)
    })
  })

  describe('when validate against class with arrary property', () => {
    it('should map error', () => {
      class NestedBar {
        // @ts-ignore
        @IsString({ each: true }) bar: any
      }
      class Foo {
        // @ts-ignore
        @ValidateNested({ each: true }) nestedBar: Array<NestedBar>
      }
      const nestedBar1 = new NestedBar()
      nestedBar1.bar = 1
      const nestedBar2 = new NestedBar()
      nestedBar2.bar = 'str'
      const nestedBar3 = new NestedBar()
      nestedBar3.bar = null
      const nestedBar = [nestedBar1, nestedBar2, nestedBar3]
      const obj = new Foo()
      obj.nestedBar = nestedBar

      const expectedError = {
        errors: {
          nestedBar: [
            { bar: 'each value in bar must be a string' },
            {},
            { bar: 'each value in bar must be a string' },
          ],
        },
      }

      return expect(
        interceptor.intercept(executionContext, createFailedValidationHandler(obj)).toPromise(),
      ).resolves.toEqual(expectedError)
    })
  })
})
