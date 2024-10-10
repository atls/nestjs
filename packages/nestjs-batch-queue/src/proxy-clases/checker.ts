import type { CheckManager } from '../check-manager/index.js'
import type { CheckName }    from '../check-manager/index.js'

export class Checker {
  constructor(private checkManager: CheckManager) {}

  /**
   * Delegates to {@link CheckManager.createCheck}
   */
  public createCheck(checkName: CheckName, initialState: boolean): void {
    this.checkManager.createCheck(checkName, initialState)
  }

  /**
   * Delegates to {@link CheckManager.changeState}
   */
  public async changeState(checkName: CheckName, state: boolean): Promise<void> {
    await this.checkManager.changeState(checkName, state)
  }
}
