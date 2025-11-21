import type { INestApplication }             from '@nestjs/common'
import type { NestHybridApplicationOptions } from '@nestjs/common'
type MicroserviceOptions = Record<string, unknown>

type RegistryEntry = {
  options: MicroserviceOptions
  hybridOptions: NestHybridApplicationOptions
}

export class MicroservisesRegistry {
  static #instances: Set<RegistryEntry> = new Set()

  public static add(
    options: MicroserviceOptions,
    hybridOptions: NestHybridApplicationOptions
  ): void {
    this.#instances.add({ options, hybridOptions })
  }

  public static connect(
    app: INestApplication,
    hybridAppOptions: NestHybridApplicationOptions = {}
  ): void {
    this.#instances.forEach(({ options, hybridOptions }) =>
      app.connectMicroservice(options, hybridOptions ?? hybridAppOptions))
  }
}
