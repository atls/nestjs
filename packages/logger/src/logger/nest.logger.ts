import { Logger }        from '@atls/logger'
import { LoggerService } from '@nestjs/common'

export class NestLogger implements LoggerService {
  private logger = new Logger('nestjs')

  public log(message: any, context?: string) {
    if (context) {
      this.logger.child(context).info(message)
    } else {
      this.logger.info(message)
    }
  }

  public error(message: any, trace?: string, context?: string) {
    if (context) {
      this.logger.child(context).error(message)
    } else {
      this.logger.error(message)
    }
  }

  public warn(message: any, context?: string) {
    if (context) {
      this.logger.child(context).warn(message)
    } else {
      this.logger.warn(message)
    }
  }

  public debug(message: any, context?: string) {
    if (context) {
      this.logger.child(context).debug(message)
    } else {
      this.logger.debug(message)
    }
  }

  public verbose?(message: any, context?: string) {
    if (context) {
      this.logger.child(context).trace(message)
    } else {
      this.logger.trace(message)
    }
  }
}
