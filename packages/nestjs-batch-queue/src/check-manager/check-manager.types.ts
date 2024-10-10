export type CheckName = string | symbol
export type ChangeStateCallback = (state: boolean) => Promise<void> | void
