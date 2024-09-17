import { LoginFlow }                    from '@ory/kratos-client'
import { RecoveryFlow }                 from '@ory/kratos-client'
import { RegistrationFlow }             from '@ory/kratos-client'
import { SettingsFlow }                 from '@ory/kratos-client'
import { VerificationFlow }             from '@ory/kratos-client'
import { RegistrationFlowMethodConfig } from '@ory/kratos-client'
import { LoginFlowMethodConfig }        from '@ory/kratos-client'
import { RecoveryFlowMethodConfig }     from '@ory/kratos-client'
import { SettingsFlowMethodConfig }     from '@ory/kratos-client'
import { VerificationFlowMethodConfig } from '@ory/kratos-client'

export type MethodConfigFlow =
  | LoginFlow
  | RegistrationFlow
  | RecoveryFlow
  | SettingsFlow
  | VerificationFlow

export type MethodConfig =
  | RegistrationFlowMethodConfig
  | LoginFlowMethodConfig
  | RecoveryFlowMethodConfig
  | SettingsFlowMethodConfig
  | VerificationFlowMethodConfig

export const methodConfig = (flow: MethodConfigFlow, key: string): MethodConfig | null => {
  if (flow.active && flow.active !== key) return null

  if (!flow.methods[key]) return null

  const { config } = flow.methods[key]

  return config
}
