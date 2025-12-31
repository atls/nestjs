import type { LoggerService } from '@nestjs/common'

import { Logger }             from '@atls/logger'

export class NestLogger implements LoggerService {
  private logger = new Logger(`nestjs`)

  public error(message: unknown, trace?: string, context?: string): void {
    if (context) {
      this.logger.child(context).error(message)
    } else {
      this.logger.error(message)
    }
  }

  public log(message: unknown, context?: string): void {
    if (context) {
      this.logger.child(context).info(message)
    } else {
      this.logger.info(message)
    }
  }

  public warn(message: unknown, context?: string): void {
    if (context) {
      this.logger.child(context).warn(message)
    } else {
      this.logger.warn(message)
    }
  }

  public debug(message: unknown, context?: string): void {
    if (context) {
      this.logger.child(context).debug(message)
    } else {
      this.logger.debug(message)
    }
  }

  public verbose?(message: unknown, context?: string): void {
    if (context) {
      this.logger.child(context).trace(message)
    } else {
      this.logger.trace(message)
    }
  }
}
