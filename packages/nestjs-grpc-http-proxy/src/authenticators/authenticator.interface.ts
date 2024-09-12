import { Request }  from 'express'
import { Response } from 'express'

export interface Authenticator {
  execute(req: Request, res: Response): Promise<string | null>
}
