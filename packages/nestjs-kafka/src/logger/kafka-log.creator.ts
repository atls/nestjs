import type { LogEntry } from 'kafkajs'

import { Logger }        from '@atls/logger'
import { logLevel }      from 'kafkajs'
import camelcase         from 'camelcase'

export const kafkaLogCreator = (): ((logEntry: LogEntry) => void) => {
  const kafkaLogger = new Logger('kafka')

  return ({ namespace, level, log: { message, ...extra } }: LogEntry): void => {
    const logger = namespace
      ? kafkaLogger.child(camelcase(namespace, { pascalCase: true }))
      : kafkaLogger

    if (level === logLevel.ERROR || level === logLevel.NOTHING) {
      logger.error(message, extra)
    } else if (level === logLevel.WARN) {
      logger.warn(message, extra)
    } else if (level === logLevel.INFO) {
      logger.info(message, extra)
    } else {
      logger.debug(message, extra)
    }
  }
}
