import type { CheckManager }        from '../check-manager/index.js'
import type { CheckName }           from '../check-manager/index.js'
import type { ChangeStateCallback } from '../check-manager/index.js'

export class StateHandler {
  constructor(private checkManager: CheckManager) {}

  /**
   * Delegates to {@link CheckManager.handleChangeState}
   */
  public handleChangeState(checkName: CheckName, callback: ChangeStateCallback): void {
    this.checkManager.handleChangeState(checkName, callback)
  }
}
