import type { Request }  from 'express'
import type { Response } from 'express'

export interface Authenticator {
  execute: (req: Request, res: Response) => Promise<string | null>
}
