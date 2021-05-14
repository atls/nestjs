import { Inject, Injectable } from '@nestjs/common'

import { INNER_LOGGER }       from './logger.constants'

@Injectable()
export class Logger {
  constructor(
    @Inject(INNER_LOGGER)
    private readonly logger: any
  ) {}

  debug(message: any, data?: object): void {
    this.logger.debug(message, data)
  }

  trace(message: any, data?: object): void {
    this.logger.debug(message, data)
  }

  info(message: any, data?: object): void {
    this.logger.info(message, data)
  }

  warn(message: any, data?: object): void {
    this.logger.warn(message, data)
  }

  error(message: any, data?: object): void {
    this.logger.error(message, data)
  }

  fatal(message: any, data?: object): void {
    this.logger.error(message, data)
  }
}
