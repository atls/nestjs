export class Mutex {
  private mutex = Promise.resolve()

  async lock(): Promise<() => void> {
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    let begin: (unlock: () => void) => void = (unlock) => {}
    this.mutex = this.mutex.then(async () => new Promise(begin))
    return new Promise((resolve) => {
      begin = resolve
    })
  }
}
