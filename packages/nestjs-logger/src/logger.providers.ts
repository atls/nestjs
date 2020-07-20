import { createLogger, transports }          from 'winston'

import { Provider }                          from '@nestjs/common'

import { INNER_LOGGER, INNER_LOGGER_CONFIG } from './logger.constants'
import { getCloudLogginServiceContext }      from './logger.utils'

export const createInnerLoggerConfig = (): {
  level: string
  transports: transports.ConsoleTransportInstance[]
  exceptionHandlers: transports.ConsoleTransportInstance[]
  rejectionHandlers: transports.ConsoleTransportInstance[]
} => {
  const config = {
    level: process.env.LOG_LEVEL || 'info',
    transports: [new transports.Console()],
    exceptionHandlers: [new transports.Console()],
    rejectionHandlers: [new transports.Console()],
  }
  if (process.env.GOOGLE_CLOUD_LOGGING_ENABLED) {
    // eslint-disable-next-line
    const { LoggingWinston } = require('@google-cloud/logging-winston')
    const cloudLogging = new LoggingWinston({
      serviceContext: getCloudLogginServiceContext(),
    })
    config.transports.push(cloudLogging)
    config.exceptionHandlers.push(cloudLogging)
    config.rejectionHandlers.push(cloudLogging)
  }
  return config
}

export const createLoggerProviders = (): Provider<any>[] => {
  return [
    {
      provide: INNER_LOGGER_CONFIG,
      useFactory: () => exports.createInnerLoggerConfig(),
    },
    {
      provide: INNER_LOGGER,
      useFactory: options => createLogger(options),
      inject: [INNER_LOGGER_CONFIG],
    },
  ]
}
