import { Inject }                from '@nestjs/common'

import { KRATOS_MODULE_OPTIONS } from './kratos.constants.js'

export const InjectKratosOptions = () => Inject(KRATOS_MODULE_OPTIONS)
