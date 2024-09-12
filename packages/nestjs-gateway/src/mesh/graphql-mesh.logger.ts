import { Logger }               from '@atls/logger'
// @ts-ignore
import { Logger as MeshLogger } from '@graphql-mesh/types'

export class GraphQLMeshLogger implements MeshLogger {
  private logger: Logger

  constructor(public name: string) {
    this.logger = new Logger(name)
  }

  log(message: string) {
    this.logger.info(message)
  }

  warn(message: string) {
    this.logger.warn(message)
  }

  info(message: string) {
    this.logger.info(message)
  }

  error(message: string) {
    this.logger.error(message)
  }

  debug(message: string) {
    this.logger.debug(message)
  }

  child(name: string): MeshLogger {
    const logger = new GraphQLMeshLogger(name)

    // @ts-ignore
    logger.logger = this.logger.child(name)

    return logger
  }
}
