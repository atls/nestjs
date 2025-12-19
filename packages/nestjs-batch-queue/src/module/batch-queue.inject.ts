import { Inject }                    from '@nestjs/common'

import { BATCH_QUEUE_CONSUMER }      from '../constants/index.js'
import { BATCH_QUEUE_PRODUCER }      from '../constants/index.js'
import { BATCH_QUEUE_CHECKER }       from '../constants/index.js'
import { BATCH_QUEUE_STATE_HANDLER } from '../constants/index.js'

export const InjectBatchConsumer = () => Inject(BATCH_QUEUE_CONSUMER)

export const InjectBatchProducer = () => Inject(BATCH_QUEUE_PRODUCER)

export const InjectBatchChecker = () => Inject(BATCH_QUEUE_CHECKER)

export const InjectBatchStateHandler = () => Inject(BATCH_QUEUE_STATE_HANDLER)
