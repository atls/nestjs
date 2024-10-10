import type { CheckName }           from '../batch-queue/types/index.js'
import type { ChangeStateCallback } from '../batch-queue/types/index.js'

export class CheckManager {
  private checkStates: Map<CheckName, boolean> = new Map()

  private changeStateCallbacks: Map<CheckName, Array<ChangeStateCallback>> = new Map()

  public getStateByCheckName(checkName: CheckName): boolean {
    const state = this.checkStates.get(checkName)
    if (state === undefined) throw new Error(`Check with name ${checkName.toString()} not found`)
    return state
  }

  public getState(): boolean {
    return Array.from(this.checkStates.values()).reduce((acc, state) => acc && state, true)
  }

  public createCheck(checkName: CheckName, initialState: boolean): void {
    this.checkStates.set(checkName, initialState)
  }

  public async changeState(checkName: CheckName, state: boolean): Promise<void> {
    const stateBefore = this.checkStates.get(checkName)
    this.checkStates.set(checkName, state)
    if (stateBefore === state) return
    const callbacks = this.changeStateCallbacks.get(checkName)
    if (!callbacks || callbacks.length === 0) return
    await Promise.all(callbacks.map(async (callback) => callback(state)))
  }

  public handleChangeState(checkName: CheckName, changeStateCallback: ChangeStateCallback): void {
    const callbacks = this.changeStateCallbacks.get(checkName)
    if (!callbacks) {
      this.changeStateCallbacks.set(checkName, [changeStateCallback])
      return
    }
    callbacks.push(changeStateCallback)
  }
}
