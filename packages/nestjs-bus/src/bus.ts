import { ServiceBus } from '@node-ts/bus-core'

import { Injectable } from '@nestjs/common'

@Injectable()
export class Bus extends ServiceBus {}
