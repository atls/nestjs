import { Injectable } from '@nestjs/common'
import { ServiceBus } from '@node-ts/bus-core/dist/service-bus'

@Injectable()
export class Bus extends ServiceBus {}
