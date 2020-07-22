import { HandlesMessage as BusCoreHandlesMessage } from '@node-ts/bus-core'

import { HANDLES_MESSAGE_METADATA }                from './constants'

export const HandlesMessage = (event: any) => {
  return (target: any) => {
    BusCoreHandlesMessage(event)(target)
    Reflect.defineMetadata(HANDLES_MESSAGE_METADATA, event, target)
  }
}
