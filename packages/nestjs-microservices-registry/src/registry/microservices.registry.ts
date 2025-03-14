/* eslint-disable @typescript-eslint/explicit-module-boundary-types */

import type { INestApplication }             from '@nestjs/common'
import type { NestHybridApplicationOptions } from '@nestjs/common'

export class MicroservisesRegistry {
  static #instances: Set<any> = new Set()

  public static add(options: any): void {
    this.#instances.add(options)
  }

  public static connect(
    app: INestApplication,
    hybridAppOptions: NestHybridApplicationOptions = {}
  ): void {
    this.#instances.forEach((options) => app.connectMicroservice(options, hybridAppOptions))
  }
}
