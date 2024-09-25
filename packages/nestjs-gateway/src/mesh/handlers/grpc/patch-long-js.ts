import Long from 'long'

function patchLongJs(): void {
  const originalLongFromValue = Long.fromValue.bind(Long)
  Long.fromValue = (value: Long | number | string): Long => {
    if (typeof value === 'bigint') {
      return Long.fromValue((value as bigint).toString())
    }
    return originalLongFromValue(value)
  }
}
patchLongJs()
