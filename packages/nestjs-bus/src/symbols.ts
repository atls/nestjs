import { BUS_SYMBOLS as NODE_TS_BUS_SYMBOLS } from '@node-ts/bus-core'

export const APPLICATION_CONTAINER = Symbol.for('@atlantis-lab/nestjs-bus/application-container')
export const BUS_RABBITMQ_CONFIGURATION = Symbol.for(
  '@atlantis-lab/nestjs-bus/bus-rabbitmq-configuration',
)
export const HANDLES_MESSAGE_METADATA = Symbol.for(
  '@atlantis-lab/nestjs-bus/handles-message-metadata',
)

const { ApplicationBootstrap, Bus, HandlerRegistry } = NODE_TS_BUS_SYMBOLS

export const BUS_SYMBOLS = {
  ApplicationBootstrap,
  Bus,
  HandlerRegistry,
}
