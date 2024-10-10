import type { CheckManager }        from './check-manager.js'
import type { ChangeStateCallback } from './types/index.js'
import type { CheckName }           from './types/index.js'

export class Checker {
  constructor(private checkManager: CheckManager) {}

  public createCheck(checkName: CheckName, initialState: boolean): void {
    this.checkManager.createCheck(checkName, initialState)
  }

  public async changeState(checkName: CheckName, state: boolean): Promise<void> {
    await this.checkManager.changeState(checkName, state)
  }

  public handleChangeState(checkName: CheckName, changeStateCallback: ChangeStateCallback): void {
    this.checkManager.handleChangeState(checkName, changeStateCallback)
  }
}
