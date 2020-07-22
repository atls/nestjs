import { ServiceBus } from '@node-ts/bus-core/dist/service-bus'

import { Injectable } from '@nestjs/common'

@Injectable()
export class Bus extends ServiceBus {}
