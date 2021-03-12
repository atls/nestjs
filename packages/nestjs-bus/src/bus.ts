import { Injectable } from '@nestjs/common'
import { ServiceBus } from '@node-ts/bus-core'

@Injectable()
export class Bus extends ServiceBus {}
