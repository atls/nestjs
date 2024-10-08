import type { OnModuleInit }    from '@nestjs/common'

import type { CheckOk }         from '../../batch-queue/index.js'
import type { CheckFail }       from '../../batch-queue/index.js'

import { Injectable }           from '@nestjs/common'
import { SchedulerRegistry }    from '@nestjs/schedule'
import { CronJob }              from 'cron'

import { Checker }              from '../../batch-queue/index.js'
import { InjectBatchChecker }   from '../../module/index.js'
import { MEMORY_CHECK_NAME }    from './memory-checker.constants.js'
import { MemoryCheckerOptions } from './memory-checker.interface.js'

@Injectable()
export class MemoryChecker implements OnModuleInit {
  static jobName = 'MEMORY_CHECKER_JOB'

  private checkOk: CheckOk

  private checkFail: CheckFail

  constructor(
    @InjectBatchChecker() private checker: Checker,
    private memoryCheckerOptions: MemoryCheckerOptions,
    private schedulerRegistry: SchedulerRegistry
  ) {}

  async onModuleInit(): Promise<void> {
    const { checkOk, checkFail } = await this.checker.createCheck(MEMORY_CHECK_NAME, false)
    this.checkOk = checkOk
    this.checkFail = checkFail
    const { intervalSec } = this.memoryCheckerOptions.schedule
    const job = new CronJob(`${intervalSec} * * * * *`, async () => {
      await this.checkMemory()
    })
    this.schedulerRegistry.addCronJob(MemoryChecker.jobName, job)
    this.checker.createCheckOnAdd(
      MEMORY_CHECK_NAME,
      this.check.bind(this),
      this.memoryCheckerOptions.everyAdd.checkEveryItem
    )
    job.start()
  }

  private async check(): Promise<boolean> {
    const memoryUsage = process.memoryUsage()
    const okCheck =
      memoryUsage.rss < this.memoryCheckerOptions.limitMemoryUsage.rss &&
      memoryUsage.heapTotal < this.memoryCheckerOptions.limitMemoryUsage.heapTotal &&
      memoryUsage.heapUsed < this.memoryCheckerOptions.limitMemoryUsage.heapUsed &&
      memoryUsage.external < this.memoryCheckerOptions.limitMemoryUsage.external &&
      memoryUsage.arrayBuffers < this.memoryCheckerOptions.limitMemoryUsage.arrayBuffers
    return okCheck
  }

  private async checkMemory(): Promise<void> {
    const okCheck = await this.check()
    if (okCheck) {
      await this.checkOk()
    } else {
      await this.checkFail()
    }
  }
}
