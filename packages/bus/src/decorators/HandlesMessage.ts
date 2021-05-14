import 'reflect-metadata'

import { HandlesMessage as handlesMessage } from '@node-ts/bus-core'

import { HANDLES_MESSAGE_METADATA }         from './constants'

export const HandlesMessage = (event: any): ClassDecorator => {
  return (target: object) => {
    handlesMessage(event)(target as any)

    Reflect.defineMetadata(HANDLES_MESSAGE_METADATA, event, target)
  }
}
