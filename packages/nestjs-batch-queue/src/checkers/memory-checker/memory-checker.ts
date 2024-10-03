import type { OnModuleInit }    from '@nestjs/common'

import type { CheckOk }         from '../../batch-queue/index.js'
import type { CheckFail }       from '../../batch-queue/index.js'

import { Injectable }           from '@nestjs/common'
import { SchedulerRegistry }    from '@nestjs/schedule'
import { CronJob }              from 'cron'

import { BatchQueueI }          from '../../batch-queue/index.js'
import { MEMORY_CHECK_NAME }    from './memory-checker.constants.js'
import { MemoryCheckerOptions } from './memory-checker.interface.js'

@Injectable()
export class MemoryChecker implements OnModuleInit {
  static jobName = 'memory-checker-job'

  private checkOk: CheckOk

  private checkFail: CheckFail

  constructor(
    private batchQueue: BatchQueueI<any>,
    private memoryCheckerOptions: MemoryCheckerOptions,
    private schedulerRegistry: SchedulerRegistry
  ) {}

  async onModuleInit(): Promise<void> {
    const { checkOk, checkFail } = await this.batchQueue.createCheck(MEMORY_CHECK_NAME, false)
    this.checkOk = checkOk
    this.checkFail = checkFail
    const { intervalSec } = this.memoryCheckerOptions.schedule
    const job = new CronJob(`${intervalSec} * * * * *`, async () => {
      await this.checkMemory()
    })
    this.schedulerRegistry.addCronJob(MemoryChecker.jobName, job)
    job.start()
  }

  private async checkMemory(): Promise<void> {
    const memoryUsage = process.memoryUsage()
    const okCheck =
      memoryUsage.rss < this.memoryCheckerOptions.limitMemoryUsage.rss &&
      memoryUsage.heapTotal < this.memoryCheckerOptions.limitMemoryUsage.heapTotal &&
      memoryUsage.heapUsed < this.memoryCheckerOptions.limitMemoryUsage.heapUsed &&
      memoryUsage.external < this.memoryCheckerOptions.limitMemoryUsage.external &&
      memoryUsage.arrayBuffers < this.memoryCheckerOptions.limitMemoryUsage.arrayBuffers
    if (okCheck) {
      await this.checkOk()
    } else {
      await this.checkFail()
    }
  }
}
