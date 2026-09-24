import { defineConfig }     from '@graphql-mesh/compose-cli'
import { loadGrpcSubgraph } from '@omnigraph/grpc'

export const composeConfig = defineConfig({
  subgraphs: [
    {
      sourceHandler: loadGrpcSubgraph('Echo', {
        endpoint: 'localhost:50051',
        source: './proto/echo.proto',
        metaData: {
          authorization: ['req', 'headers', 'authorization'],
        },
        requestTimeout: 5000,
      }),
    },
  ],
})
