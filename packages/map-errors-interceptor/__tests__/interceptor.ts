import { MapValidationErrorsInterceptor } from '../src'

const interceptor = new MapValidationErrorsInterceptor()

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

const callHandler = {
  handle: () => {
    return {
      pipe: jest.fn(),
    }
  },
}

describe('MapValidationErrorsInterceptor', () => {
  it('should be defined', () => {
    expect(interceptor).toBeDefined()
  })
  describe('#intercept', () => {
    it('intercept', async () => {
      callHandler.handle().pipe.mockResolvedValueOnce(() => {})
      jest.spyOn(interceptor, 'intercept').mockImplementation(() => callHandler.handle().pipe())
      expect(await interceptor.intercept(executionContext, callHandler as any)).toBe(
        callHandler.handle().pipe(),
      )
    })
  })
})
