import type { LoggerService } from '@nestjs/common'

import { Logger }             from '@atls/logger'

export class NestLogger implements LoggerService {
  private logger = new Logger(`nestjs`)

  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  public error(message: any, trace?: string, context?: string): void {
    if (context) {
      this.logger.child(context).error(message)
    } else {
      this.logger.error(message)
    }
  }

  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  public log(message: any, context?: string): void {
    if (context) {
      this.logger.child(context).info(message)
    } else {
      this.logger.info(message)
    }
  }

  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  public warn(message: any, context?: string): void {
    if (context) {
      this.logger.child(context).warn(message)
    } else {
      this.logger.warn(message)
    }
  }

  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  public debug(message: any, context?: string): void {
    if (context) {
      this.logger.child(context).debug(message)
    } else {
      this.logger.debug(message)
    }
  }

  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  public verbose?(message: any, context?: string): void {
    if (context) {
      this.logger.child(context).trace(message)
    } else {
      this.logger.trace(message)
    }
  }
}
