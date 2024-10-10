import type { CheckName }           from './check-manager.types.js'
import type { ChangeStateCallback } from './check-manager.types.js'

export class CheckManager {
  private checkStates: Map<CheckName, boolean> = new Map()

  private changeStateCallbacks: Map<CheckName, Array<ChangeStateCallback>> = new Map()

  /**
   * Retrieves the current state (boolean) of a check by its name.
   * @param {CheckName} checkName - The name of the check to retrieve.
   * @returns {boolean} - The current state of the check.
   * @throws Will throw an error if the check name is not found.
   */
  public getStateByCheckName(checkName: CheckName): boolean {
    const state = this.checkStates.get(checkName)
    if (state === undefined) throw new Error(`Check with name ${checkName.toString()} not found`)
    return state
  }

  /**
   * Returns the aggregated state of all checks. Returns `true` only if all checks are in a `true` state.
   * @returns {boolean} - `true` if all checks are in a `true` state, otherwise `false`.
   */
  public getState(): boolean {
    return Array.from(this.checkStates.values()).reduce((acc, state) => acc && state, true)
  }

  /**
   * Creates a new check with a given name and an initial state.
   * @param {CheckName} checkName - The name of the check to create.
   * @param {boolean} initialState - The initial state of the check.
   */
  public createCheck(checkName: CheckName, initialState: boolean): void {
    this.checkStates.set(checkName, initialState)
  }

  /**
   * Changes the state of a check and triggers any registered callbacks if the state has changed.
   * @param {CheckName} checkName - The name of the check whose state is changing.
   * @param {boolean} state - The new state of the check.
   * @returns {Promise<void>} - A promise that resolves when all callbacks have been invoked.
   */
  public async changeState(checkName: CheckName, state: boolean): Promise<void> {
    const stateBefore = this.checkStates.get(checkName)
    this.checkStates.set(checkName, state)
    if (stateBefore === state) return
    const callbacks = this.changeStateCallbacks.get(checkName)
    if (!callbacks || callbacks.length === 0) return
    await Promise.all(callbacks.map(async (callback) => callback(state)))
  }

  /**
   * Registers a callback to be invoked whenever the state of a specific check changes.
   * @param {CheckName} checkName - The name of the check to monitor for state changes.
   * @param {ChangeStateCallback} changeStateCallback - The callback function to invoke when the state changes.
   */
  public handleChangeState(checkName: CheckName, changeStateCallback: ChangeStateCallback): void {
    const callbacks = this.changeStateCallbacks.get(checkName)
    if (!callbacks) {
      this.changeStateCallbacks.set(checkName, [changeStateCallback])
      return
    }
    callbacks.push(changeStateCallback)
  }
}
