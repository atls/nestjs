import type { LoginFlow }        from '@ory/kratos-client'
import type { RecoveryFlow }     from '@ory/kratos-client'
import type { RegistrationFlow } from '@ory/kratos-client'
import type { SettingsFlow }     from '@ory/kratos-client'
import type { VerificationFlow } from '@ory/kratos-client'
import type { UiContainer }      from '@ory/kratos-client'

export type MethodConfigFlow =
  | LoginFlow
  | RecoveryFlow
  | RegistrationFlow
  | SettingsFlow
  | VerificationFlow

export type MethodConfig = UiContainer

export const methodConfig = (flow: MethodConfigFlow, key: string): MethodConfig | null => {
  if (flow.active && flow.active !== key) return null

  return flow.ui
}
