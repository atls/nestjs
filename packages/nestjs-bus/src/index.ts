import { ServiceBus } from '@node-ts/bus-core'

export { ApplicationBootstrap, ServiceBus, HandlerRegistry } from '@node-ts/bus-core'
export { BUS_SYMBOLS } from './symbols'
export * from './bus-module'
export * from './enums'
export { BusModuleOptions } from './interfaces'
export * from './decorators'

/**
 * backward compatibility
 */
export const Bus = ServiceBus
