import { Inject }               from '@nestjs/common'

import { HYDRA_MODULE_OPTIONS } from './hydra.constants.js'

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/explicit-function-return-type
export const InjectHydraOptions = () => Inject(HYDRA_MODULE_OPTIONS)
