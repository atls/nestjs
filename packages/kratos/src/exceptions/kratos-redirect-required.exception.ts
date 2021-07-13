import { KratosBrowserUrlFlow } from '../urls'

export class KratosRedirectRequiredException extends Error {
  constructor(public readonly redirectTo: KratosBrowserUrlFlow) {
    super('Kratos redirect required')
  }
}
