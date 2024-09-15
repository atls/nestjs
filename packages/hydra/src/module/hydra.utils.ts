import { Inject }               from '@nestjs/common'

import { HYDRA_MODULE_OPTIONS } from './hydra.constants.js'

export const InjectHydraOptions = () => Inject(HYDRA_MODULE_OPTIONS)
