import type { ChangeStateCallback } from './check-manager.types.js'

import assert                       from 'node:assert/strict'
import { beforeEach }               from 'node:test'
import { describe }                 from 'node:test'
import { it }                       from 'node:test'
import { mock }                     from 'node:test'

import { CheckManager }             from './check-manager.js'

type MockedChangeStateCallback = ChangeStateCallback & {
  mock: {
    callCount: () => number
    calls: Array<{ arguments: Array<unknown> }>
  }
}

describe('CheckManager', () => {
  let checkManager: CheckManager

  beforeEach(() => {
    checkManager = new CheckManager()
  })

  it('should create a check with the initial state', () => {
    checkManager.createCheck('testCheck', true)
    assert.strictEqual(checkManager.getStateByCheckName('testCheck'), true)

    checkManager.createCheck('anotherCheck', false)
    assert.strictEqual(checkManager.getStateByCheckName('anotherCheck'), false)
  })

  it('should throw an error if check name not found', () => {
    assert.throws(
      () => checkManager.getStateByCheckName('nonExistentCheck'),
      new Error('Check with name nonExistentCheck not found')
    )
  })

  it('should return the overall state as true when all checks are true', () => {
    checkManager.createCheck('check1', true)
    checkManager.createCheck('check2', true)
    assert.strictEqual(checkManager.getState(), true)
  })

  it('should return the overall state as false if one of the checks is false', () => {
    checkManager.createCheck('check1', true)
    checkManager.createCheck('check2', false)
    assert.strictEqual(checkManager.getState(), false)
  })

  it('should change the state of a specific check', async () => {
    checkManager.createCheck('check1', true)
    await checkManager.changeState('check1', false)
    assert.strictEqual(checkManager.getStateByCheckName('check1'), false)
  })

  it('should not trigger callback if state does not change', async () => {
    const mockCallback = mock.fn() as MockedChangeStateCallback

    checkManager.createCheck('check1', true)
    checkManager.handleChangeState('check1', mockCallback)

    await checkManager.changeState('check1', true) // Состояние не меняется
    assert.strictEqual(mockCallback.mock.callCount(), 0)
  })

  it('should trigger callback when state changes', async () => {
    const mockCallback = mock.fn() as MockedChangeStateCallback

    checkManager.createCheck('check1', true)
    checkManager.handleChangeState('check1', mockCallback)

    await checkManager.changeState('check1', false)
    assert.deepEqual(mockCallback.mock.calls[0].arguments, [false])
  })

  it('should call multiple callbacks when state changes', async () => {
    const callback1 = mock.fn() as MockedChangeStateCallback
    const callback2 = mock.fn() as MockedChangeStateCallback

    checkManager.createCheck('check1', true)
    checkManager.handleChangeState('check1', callback1)
    checkManager.handleChangeState('check1', callback2)

    await checkManager.changeState('check1', false)

    assert.deepEqual(callback1.mock.calls[0].arguments, [false])
    assert.deepEqual(callback2.mock.calls[0].arguments, [false])
  })
})
