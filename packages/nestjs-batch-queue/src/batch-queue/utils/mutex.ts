export class Mutex {
  private mutex = Promise.resolve()

  lock(): Promise<() => void> {
    let begin: (unlock: () => void) => void = (unlock) => {}
    this.mutex = this.mutex.then(() => {
      return new Promise(begin)
    })
    return new Promise((resolve) => {
      begin = resolve
    })
  }
}
