import { KratosBrowserUrlFlow } from '../urls/index.js'

export class KratosRedirectRequiredException extends Error {
  constructor(public readonly redirectTo: KratosBrowserUrlFlow) {
    super('Kratos redirect required')
  }
}
