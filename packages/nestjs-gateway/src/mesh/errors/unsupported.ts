export class GatewayUnsupportedHttpAdapterError extends Error {
  constructor(adapter: string) {
    super(`Gateway HTTP adapter "${adapter}" is not supported`)
    this.name = 'GatewayUnsupportedHttpAdapterError'
  }
}
