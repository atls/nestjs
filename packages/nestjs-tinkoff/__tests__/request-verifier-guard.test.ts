import { RequestVerifierGuard } from '../src'

const requestVerifierGuard = new RequestVerifierGuard()

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
  verifyRequest: jest.fn(),
}

describe('Tinkoff Service', () => {
  it('should be defined', () => {
    expect(requestVerifierGuard).toBeDefined()
  })

  describe('requestVerifierGuard', () => {
    it('should check request verifier guard', async () => {
      const result = new Promise(resolve => {
        resolve({})
      })
      executionContext.switchToHttp().getRequest = () => {
        return {
          body: {
            Token: 'test',
          },
        }
      }
      callHandler.verifyRequest.mockResolvedValueOnce(() => result)
      jest
        .spyOn(requestVerifierGuard, 'canActivate')
        .mockImplementation(() => callHandler.verifyRequest())
      expect(requestVerifierGuard.canActivate(executionContext)).toEqual(result)
    })
  })
})
