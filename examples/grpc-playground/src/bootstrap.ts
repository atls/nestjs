import { NestFactory }             from '@nestjs/core'

import { GrpcPlaygroundAppModule } from './grpc-playground-app.module.js'
import { serverOptions }           from './server.options.js'

// eslint-disable-next-line @next/next/no-assign-module-variable
declare const module: {
  hot?: {
    accept: () => void
    dispose: (callback: () => Promise<void>) => void
  }
}

const bootstrap = async (): Promise<void> => {
  const app = await NestFactory.create(GrpcPlaygroundAppModule)

  app.connectMicroservice(serverOptions)

  app.enableShutdownHooks()
  app.enableCors()

  await app.startAllMicroservices()
  await app.listen(3000)

  if (module.hot) {
    module.hot.accept()
    module.hot.dispose(async () => {
      await app.close()
    })
  }
}

bootstrap()
