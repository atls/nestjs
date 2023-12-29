import { NestFactory }             from '@nestjs/core'

import { GrpcPlaygroundAppModule } from './grpc-playground-app.module'
import { serverOptions }           from './server.options'

declare const module: any

const bootstrap = async () => {
  const app = await NestFactory.create(GrpcPlaygroundAppModule)

  app.connectMicroservice(serverOptions)

  app.enableShutdownHooks()
  app.enableCors()

  await app.startAllMicroservices()
  await app.listen(3000)

  if (module.hot) {
    module.hot.accept()
    module.hot.dispose(() => app.close())
  }
}

bootstrap()
