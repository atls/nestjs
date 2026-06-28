import { OathkeeperError }        from './base.js'
import { OathkeeperErrorMessage } from './messages.js'

export class OathkeeperDecisionRequestError extends OathkeeperError {
  constructor(
    readonly status: number,
    options?: ErrorOptions
  ) {
    super(`${OathkeeperErrorMessage.DECISION_REQUEST_FAILED}: ${status}`, options)
  }
}
