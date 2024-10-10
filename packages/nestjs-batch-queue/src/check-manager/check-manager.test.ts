import type { ChangeStateCallback } from '../batch-queue/types/index.js'

import { describe }                 from '@jest/globals'
import { it }                       from '@jest/globals'
import { expect }                   from '@jest/globals'
import { beforeEach }               from '@jest/globals'
import { jest }                     from '@jest/globals'

import { CheckManager }             from './check-manager.js'

describe('CheckManager', () => {
  let checkManager: CheckManager

  beforeEach(() => {
    checkManager = new CheckManager()
  })

  it('should create a check with the initial state', () => {
    checkManager.createCheck('testCheck', true)
    expect(checkManager.getStateByCheckName('testCheck')).toBe(true)

    checkManager.createCheck('anotherCheck', false)
    expect(checkManager.getStateByCheckName('anotherCheck')).toBe(false)
  })

  it('should throw an error if check name not found', () => {
    expect(() => checkManager.getStateByCheckName('nonExistentCheck')).toThrow(
      'Check with name nonExistentCheck not found'
    )
  })

  it('should return the overall state as true when all checks are true', () => {
    checkManager.createCheck('check1', true)
    checkManager.createCheck('check2', true)
    expect(checkManager.getState()).toBe(true)
  })

  it('should return the overall state as false if one of the checks is false', () => {
    checkManager.createCheck('check1', true)
    checkManager.createCheck('check2', false)
    expect(checkManager.getState()).toBe(false)
  })

  it('should change the state of a specific check', async () => {
    checkManager.createCheck('check1', true)
    await checkManager.changeState('check1', false)
    expect(checkManager.getStateByCheckName('check1')).toBe(false)
  })

  it('should not trigger callback if state does not change', async () => {
    const mockCallback = jest.fn() as ChangeStateCallback

    checkManager.createCheck('check1', true)
    checkManager.handleChangeState('check1', mockCallback)

    await checkManager.changeState('check1', true) // Состояние не меняется
    expect(mockCallback).not.toHaveBeenCalled()
  })

  it('should trigger callback when state changes', async () => {
    const mockCallback = jest.fn() as ChangeStateCallback

    checkManager.createCheck('check1', true)
    checkManager.handleChangeState('check1', mockCallback)

    await checkManager.changeState('check1', false)
    expect(mockCallback).toHaveBeenCalledWith(false)
  })

  it('should call multiple callbacks when state changes', async () => {
    const callback1 = jest.fn() as ChangeStateCallback
    const callback2 = jest.fn() as ChangeStateCallback

    checkManager.createCheck('check1', true)
    checkManager.handleChangeState('check1', callback1)
    checkManager.handleChangeState('check1', callback2)

    await checkManager.changeState('check1', false)

    expect(callback1).toHaveBeenCalledWith(false)
    expect(callback2).toHaveBeenCalledWith(false)
  })
})
