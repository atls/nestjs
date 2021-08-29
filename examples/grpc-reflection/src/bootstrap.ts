import { NestFactory }             from '@nestjs/core'

import { GrpcReflectionAppModule } from './grpc-reflection-app.module'
import { serverOptions }           from './server.options'

declare const module: any

const bootstrap = async () => {
  const app = await NestFactory.create(GrpcReflectionAppModule)

  app.connectMicroservice(serverOptions)

  app.enableShutdownHooks()

  await app.startAllMicroservicesAsync()
  await app.listen(3000)

  if (module.hot) {
    module.hot.accept()
    module.hot.dispose(() => app.close())
  }
}

bootstrap()
