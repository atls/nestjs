import type { RequestHandler }        from 'express'

import type { GatewayUploadsOptions } from '../../module/interfaces.js'

import graphqlUploadExpress           from 'graphql-upload/graphqlUploadExpress.mjs'

export const createUploadMiddleware = (
  uploads: GatewayUploadsOptions | undefined
): Array<RequestHandler> => {
  if (uploads === false) {
    return []
  }

  return [graphqlUploadExpress(uploads) as unknown as RequestHandler]
}
