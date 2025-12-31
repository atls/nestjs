export const waitForConsumeCount = async (
  expectedCount: number,
  consumeBatchs: Array<unknown>,
  timeout = 5000
): Promise<void> => {
  const endTime = Date.now() + timeout
  return new Promise((resolve, reject) => {
    const interval = setInterval(() => {
      if (consumeBatchs.length >= expectedCount) {
        clearInterval(interval)
        resolve()
      } else if (Date.now() > endTime) {
        clearInterval(interval)
        reject(new Error('Timeout waiting for messages to be processed'))
      }
    }, 100)
  })
}
