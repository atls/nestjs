import { Inject }                    from '@nestjs/common'

import { BATCH_QUEUE_CONSUMER }      from './batch-queue.constants.js'
import { BATCH_QUEUE_PRODUCER }      from './batch-queue.constants.js'
import { BATCH_QUEUE_CHECKER }       from './batch-queue.constants.js'
import { BATCH_QUEUE_STATE_HANDLER } from './batch-queue.constants.js'

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/explicit-function-return-type
export const InjectBatchConsumer = () => Inject(BATCH_QUEUE_CONSUMER)

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/explicit-function-return-type
export const InjectBatchProducer = () => Inject(BATCH_QUEUE_PRODUCER)

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/explicit-function-return-type
export const InjectBatchChecker = () => Inject(BATCH_QUEUE_CHECKER)

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/explicit-function-return-type
export const InjectBatchStateHandler = () => Inject(BATCH_QUEUE_STATE_HANDLER)
