import type { Logger as MeshLogger } from '@graphql-mesh/types'

import { Logger }                    from '@atls/logger'

type MeshLoggerName = Record<string, number | string> | string

const formatLoggerName = (name: MeshLoggerName): string =>
  typeof name === 'string'
    ? name
    : Object.entries(name)
        .map(([key, value]) => `${key}:${value}`)
        .join(',')

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

  child(name: MeshLoggerName): MeshLogger {
    const loggerName = formatLoggerName(name)
    const logger = new GraphQLMeshLogger(loggerName)

    logger.logger = this.logger.child(loggerName)

    return logger
  }
}
