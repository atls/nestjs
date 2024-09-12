import { Inject }               from '@nestjs/common'

import { HYDRA_MODULE_OPTIONS } from './hydra.constants'

export const InjectHydraOptions = () => Inject(HYDRA_MODULE_OPTIONS)
