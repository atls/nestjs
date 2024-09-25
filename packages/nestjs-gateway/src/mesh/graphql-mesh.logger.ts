// @ts-expect-error
import type { Logger as MeshLogger } from '@graphql-mesh/types'

import { Logger }                    from '@atls/logger'

export class GraphQLMeshLogger implements MeshLogger {
  private logger: Logger

  constructor(public name: string) {
    this.logger = new Logger(name)
  }

  log(message: string): void {
    this.logger.info(message)
  }

  warn(message: string): void {
    this.logger.warn(message)
  }

  info(message: string): void {
    this.logger.info(message)
  }

  error(message: string): void {
    this.logger.error(message)
  }

  debug(message: string): void {
    this.logger.debug(message)
  }

  child(name: string): MeshLogger {
    const logger = new GraphQLMeshLogger(name)

    logger.logger = this.logger.child(name)

    return logger
  }
}
