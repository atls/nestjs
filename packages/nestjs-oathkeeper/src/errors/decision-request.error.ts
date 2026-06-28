import { OathkeeperErrorMessage } from './error-message.js'
import { OathkeeperError }        from './oathkeeper.error.js'

export class OathkeeperDecisionRequestError extends OathkeeperError {
  constructor(
    readonly status: number,
    options?: ErrorOptions
  ) {
    super(`${OathkeeperErrorMessage.DECISION_REQUEST_FAILED}: ${status}`, options)
  }
}
