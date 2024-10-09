export type CheckName = string | symbol
export type CheckOnAdd = () => Promise<boolean>
export type OnAddConfig = {
  checkOnAdd: CheckOnAdd
  checkEveryItem: number
  currentItemCounter: number
}
export type CheckOk = () => Promise<void>
export type CheckFail = () => Promise<void>
export type Checks = {
  checkOk: CheckOk
  checkFail: CheckFail
}
